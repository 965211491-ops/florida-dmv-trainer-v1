(function () {
  "use strict";

  const config = window.DMV_CONFIG;
  const STORAGE_KEYS = Object.freeze({
    // V1 keys are intentionally unchanged so existing learning history remains.
    progress: "fl-dmv-progress-v1",
    wrong: "fl-dmv-wrong-v1",
    metrics: "us-dmv-metrics-v2",
    selectedState: "selectedState"
  });

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getProgress() {
    const progress = readJson(STORAGE_KEYS.progress, {});
    return progress && typeof progress === "object" ? progress : {};
  }

  function getWrongBook() {
    const wrong = readJson(STORAGE_KEYS.wrong, {});
    return wrong && typeof wrong === "object" ? wrong : {};
  }

  function emptyStateMetrics() {
    return { totalAnswered: 0, totalCorrect: 0, sessions: 0 };
  }

  function normalizeMetrics(value) {
    const metrics = value && typeof value === "object" ? value : {};
    metrics.version = 2;
    metrics.byState = metrics.byState && typeof metrics.byState === "object" ? metrics.byState : {};

    Object.keys(metrics.byState).forEach((stateCode) => {
      const item = metrics.byState[stateCode] || {};
      metrics.byState[stateCode] = {
        totalAnswered: Math.max(0, Number(item.totalAnswered) || 0),
        totalCorrect: Math.max(0, Number(item.totalCorrect) || 0),
        sessions: Math.max(0, Number(item.sessions) || 0)
      };
    });

    return metrics;
  }

  function migrateV1Data() {
    const existingMetrics = readJson(STORAGE_KEYS.metrics, null);
    if (existingMetrics) {
      const normalized = normalizeMetrics(existingMetrics);
      writeJson(STORAGE_KEYS.metrics, normalized);
      return normalized;
    }

    const progress = getProgress();
    const wrong = getWrongBook();
    let knownCorrect = 0;
    let knownAnswered = 0;
    let progressChanged = false;

    Object.keys(progress).forEach((questionId) => {
      const item = progress[questionId] || {};
      const totalCorrect = Math.max(0, Number(item.totalCorrect) || 0);
      const knownWrong = Math.max(0, Number(wrong[questionId]?.count) || 0);
      const totalAnswered = Number.isFinite(Number(item.totalAnswered))
        ? Math.max(totalCorrect, Number(item.totalAnswered))
        : totalCorrect + knownWrong;

      knownCorrect += totalCorrect;
      knownAnswered += totalAnswered;

      if (!Number.isFinite(Number(item.totalAnswered))) {
        item.totalAnswered = totalAnswered;
        progress[questionId] = item;
        progressChanged = true;
      }
    });

    if (progressChanged) writeJson(STORAGE_KEYS.progress, progress);

    const metrics = normalizeMetrics({
      version: 2,
      migratedFrom: "v1",
      migratedAt: new Date().toISOString(),
      byState: {
        FL: {
          totalAnswered: knownAnswered,
          totalCorrect: knownCorrect,
          sessions: 0
        }
      }
    });

    writeJson(STORAGE_KEYS.metrics, metrics);
    return metrics;
  }

  function getMetrics() {
    return normalizeMetrics(readJson(STORAGE_KEYS.metrics, null) || migrateV1Data());
  }

  function updateStateMetrics(stateCode, updater) {
    const metrics = getMetrics();
    const current = metrics.byState[stateCode] || emptyStateMetrics();
    metrics.byState[stateCode] = updater({ ...current });
    writeJson(STORAGE_KEYS.metrics, metrics);
  }

  function recordCorrect(questionId, stateCode) {
    const progress = getProgress();
    const current = progress[questionId] || {
      streak: 0,
      mastered: false,
      totalCorrect: 0,
      totalAnswered: 0
    };

    current.streak = (Number(current.streak) || 0) + 1;
    current.totalCorrect = (Number(current.totalCorrect) || 0) + 1;
    current.totalAnswered = Math.max(
      Number(current.totalAnswered) || 0,
      current.totalCorrect - 1
    ) + 1;
    current.mastered = current.streak >= config.MASTERY_STREAK;
    progress[questionId] = current;
    writeJson(STORAGE_KEYS.progress, progress);

    if (current.mastered) {
      const wrong = getWrongBook();
      if (wrong[questionId]) {
        delete wrong[questionId];
        writeJson(STORAGE_KEYS.wrong, wrong);
      }
    }

    updateStateMetrics(stateCode, (metrics) => ({
      ...metrics,
      totalAnswered: metrics.totalAnswered + 1,
      totalCorrect: metrics.totalCorrect + 1
    }));
  }

  function recordWrong(questionId, stateCode) {
    const progress = getProgress();
    const current = progress[questionId] || {
      streak: 0,
      mastered: false,
      totalCorrect: 0,
      totalAnswered: 0
    };

    current.streak = 0;
    current.mastered = false;
    current.totalCorrect = Number(current.totalCorrect) || 0;
    current.totalAnswered = Math.max(
      Number(current.totalAnswered) || 0,
      current.totalCorrect
    ) + 1;
    progress[questionId] = current;
    writeJson(STORAGE_KEYS.progress, progress);

    const wrong = getWrongBook();
    wrong[questionId] = {
      count: (Number(wrong[questionId]?.count) || 0) + 1,
      lastWrongAt: new Date().toISOString()
    };
    writeJson(STORAGE_KEYS.wrong, wrong);

    updateStateMetrics(stateCode, (metrics) => ({
      ...metrics,
      totalAnswered: metrics.totalAnswered + 1
    }));
  }

  function completeSession(stateCode) {
    updateStateMetrics(stateCode, (metrics) => ({
      ...metrics,
      sessions: metrics.sessions + 1
    }));
  }

  function getStats(questionBank, stateCode) {
    const progress = getProgress();
    const wrong = getWrongBook();
    const metrics = getMetrics().byState[stateCode] || emptyStateMetrics();
    const questionIds = new Set(questionBank.map((question) => question.id));
    const mastered = questionBank.filter((question) => progress[question.id]?.mastered).length;
    const wrongCount = Object.keys(wrong).filter((questionId) => questionIds.has(questionId)).length;
    const accuracy = metrics.totalAnswered
      ? Math.round((metrics.totalCorrect / metrics.totalAnswered) * 100)
      : 0;

    return {
      totalQuestions: questionBank.length,
      mastered,
      wrong: wrongCount,
      accuracy,
      practiced: metrics.totalAnswered,
      totalCorrect: metrics.totalCorrect,
      sessions: metrics.sessions,
      masteryPercentage: questionBank.length
        ? Math.round((mastered / questionBank.length) * 100)
        : 0
    };
  }

  function getSelectedState() {
    try {
      return localStorage.getItem(STORAGE_KEYS.selectedState);
    } catch (error) {
      return null;
    }
  }

  function setSelectedState(stateCode) {
    try {
      localStorage.setItem(STORAGE_KEYS.selectedState, stateCode);
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearSelectedState() {
    try {
      localStorage.removeItem(STORAGE_KEYS.selectedState);
    } catch (error) {
      // The state picker still works for this page load if storage is blocked.
    }
  }

  function clearWrongBook() {
    try {
      localStorage.removeItem(STORAGE_KEYS.wrong);
    } catch (error) {
      // No-op when browser storage is unavailable.
    }
  }

  function resetLearningData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.progress);
      localStorage.removeItem(STORAGE_KEYS.wrong);
      localStorage.removeItem(STORAGE_KEYS.metrics);
    } catch (error) {
      // The UI will continue with in-memory defaults if storage is unavailable.
    }
    migrateV1Data();
  }

  window.DMV_STORAGE = Object.freeze({
    STORAGE_KEYS,
    migrateV1Data,
    getProgress,
    getWrongBook,
    getStats,
    getSelectedState,
    setSelectedState,
    clearSelectedState,
    recordCorrect,
    recordWrong,
    completeSession,
    clearWrongBook,
    resetLearningData
  });
})();
