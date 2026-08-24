(function () {
  "use strict";

  function duplicates(items, selector) {
    const counts = new Map();
    items.forEach((item) => {
      const key = selector(item);
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([value, count]) => ({ value, count }));
  }

  function validate() {
    const errors = [];
    const warnings = [];
    const knowledge = Array.isArray(window.DMV_SIGN_KNOWLEDGE)
      ? window.DMV_SIGN_KNOWLEDGE
      : [];
    const common = Array.isArray(window.COMMON_QUESTIONS)
      ? window.COMMON_QUESTIONS
      : [];
    const stateQuestions = Array.isArray(window.STATE_QUESTIONS?.FL)
      ? window.STATE_QUESTIONS.FL
      : [];
    const legacyQuestions = Array.isArray(window.QUESTIONS)
      ? window.QUESTIONS
      : [];
    const allRawQuestions = [...common, ...stateQuestions, ...legacyQuestions];
    const signQuestions = common.filter((question) =>
      String(question.id || "").startsWith("US-SIGN-")
    );
    const knowledgeIds = new Set(knowledge.map((item) => item.id));

    duplicates(knowledge, (item) => item.id)
      .forEach((item) => errors.push(`Duplicate knowledge id: ${item.value}`));
    duplicates(knowledge, (item) => item.image)
      .forEach((item) => errors.push(`Duplicate knowledge image path: ${item.value}`));
    duplicates(allRawQuestions, (item) => item.id)
      .forEach((item) => errors.push(`Duplicate question id: ${item.value}`));
    duplicates(allRawQuestions, (item) => item.question?.en?.trim().toLowerCase())
      .forEach((item) => errors.push(`Duplicate English question: ${item.value}`));
    duplicates(signQuestions.filter((item) => item.image), (item) => item.image)
      .forEach((item) => errors.push(`Duplicate question image path: ${item.value}`));

    knowledge.forEach((item) => {
      if (!item.id || !item.name?.en || !item.name?.zh) errors.push(`Incomplete knowledge name: ${item.id || "unknown"}`);
      if (!item.category || !item.shape || !Array.isArray(item.colors) || !item.colors.length) errors.push(`Incomplete knowledge classification: ${item.id}`);
      if (!item.meaning?.en || !item.meaning?.zh) errors.push(`Missing knowledge meaning: ${item.id}`);
      if (!item.image) errors.push(`Missing knowledge image: ${item.id}`);
      if (!item.source?.authority || !item.source?.document || !item.source?.edition) errors.push(`Missing knowledge source: ${item.id}`);
      if (item.source?.authority === "FLHSMV"
        && (!Number.isInteger(item.source.page) || item.source.page < 43 || item.source.page > 59)) errors.push(`Invalid FLHSMV handbook page: ${item.id}`);
      if (!item.source?.verifiedDate) warnings.push(`Source date needs review: ${item.id}`);
    });

    signQuestions.forEach((question) => {
      if (!question.id) errors.push("Question missing id");
      if (!question.category) errors.push(`Missing category: ${question.id}`);
      if (!question.knowledgeId) errors.push(`Missing knowledgeId: ${question.id}`);
      else if (!knowledgeIds.has(question.knowledgeId)) errors.push(`Unknown knowledgeId: ${question.id}`);
      if (!question.question?.en || !question.question?.zh) errors.push(`Missing bilingual question: ${question.id}`);
      if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`Options length is not 4: ${question.id}`);
      else {
        if (question.options.some((option) => !option.en || !option.zh)) errors.push(`Missing bilingual option: ${question.id}`);
        if (new Set(question.options.map((option) => option.en.trim().toLowerCase())).size !== 4) errors.push(`Duplicate answer option: ${question.id}`);
      }
      if (!Number.isInteger(question.correctIndex)
        || question.correctIndex < 0
        || question.correctIndex >= (question.options?.length || 0)) errors.push(`Invalid correctIndex: ${question.id}`);
      if (!question.explanation?.en || !question.explanation?.zh) errors.push(`Missing bilingual explanation: ${question.id}`);
      if (!Array.isArray(question.keywords) || question.keywords.length < 1 || question.keywords.length > 3) errors.push(`Keywords must contain 1-3 items: ${question.id}`);
      if (!question.visualMemory?.shape?.en
        || !Array.isArray(question.visualMemory?.colors)
        || !question.visualMemory.colors.length
        || !question.visualMemory?.meaning?.en
        || !question.visualMemory?.image) errors.push(`Missing visual-memory data: ${question.id}`);
      if (!question.source?.authority || !question.source?.document || !question.source?.edition) errors.push(`Missing source: ${question.id}`);
    });

    if (knowledge.length < 80) errors.push(`Knowledge bank below target: ${knowledge.length}`);
    if (signQuestions.length < 150) errors.push(`Question bank below target: ${signQuestions.length}`);
    if (signQuestions.length > 250) warnings.push(`Question bank exceeds first-batch target: ${signQuestions.length}`);

    const categories = knowledge.reduce((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {});
    const sources = knowledge.reduce((counts, item) => {
      const authority = item.source?.authority || "unknown";
      counts[authority] = (counts[authority] || 0) + 1;
      return counts;
    }, {});
    const imageQuestions = signQuestions.filter((question) => question.type === "image").length;
    const visualMemoryQuestions = signQuestions.filter((question) => question.visualMemory?.image).length;

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
      summary: Object.freeze({
        knowledgeObjects: knowledge.length,
        signQuestions: signQuestions.length,
        imageQuestions,
        visualMemoryQuestions,
        categories: Object.freeze(categories),
        sources: Object.freeze(sources)
      })
    });
  }

  window.DMV_DATA_VALIDATION = validate();
  document.documentElement.dataset.validation = JSON.stringify(window.DMV_DATA_VALIDATION);
  window.DMV_VALIDATE_DATA = validate;
})();
