(function () {
  "use strict";

  const config = window.DMV_CONFIG;
  const storage = window.DMV_STORAGE;
  const data = window.DMV_DATA;
  const { QuizSession } = window.DMV_QUIZ;

  const appState = {
    selectedState: null,
    questionBank: [],
    session: null,
    currentAnswer: null,
    lastSessionConfig: null,
    toastTimer: null
  };

  const el = {
    views: [...document.querySelectorAll(".view")],
    stateView: document.querySelector("#stateView"),
    dashboardView: document.querySelector("#dashboardView"),
    questionView: document.querySelector("#questionView"),
    resultView: document.querySelector("#resultView"),
    wrongView: document.querySelector("#wrongView"),
    masteredView: document.querySelector("#masteredView"),
    progressView: document.querySelector("#progressView"),
    brandHomeBtn: document.querySelector("#brandHomeBtn"),
    changeStateBtn: document.querySelector("#changeStateBtn"),
    stateCards: document.querySelector("#stateCards"),
    dashboardTitle: document.querySelector("#dashboardTitle"),
    dashboardEnglishName: document.querySelector("#dashboardEnglishName"),
    dashboardMastered: document.querySelector("#dashboardMastered"),
    dashboardWrong: document.querySelector("#dashboardWrong"),
    dashboardAccuracy: document.querySelector("#dashboardAccuracy"),
    dashboardPracticed: document.querySelector("#dashboardPracticed"),
    wrongCardSummary: document.querySelector("#wrongCardSummary"),
    masteredCardSummary: document.querySelector("#masteredCardSummary"),
    roadSignsCardSummary: document.querySelector("#roadSignsCardSummary"),
    practiceCount: document.querySelector("#practiceCount"),
    startPracticeBtn: document.querySelector("#startPracticeBtn"),
    openWrongBtn: document.querySelector("#openWrongBtn"),
    openMasteredBtn: document.querySelector("#openMasteredBtn"),
    startRoadSignsBtn: document.querySelector("#startRoadSignsBtn"),
    startExamBtn: document.querySelector("#startExamBtn"),
    openProgressBtn: document.querySelector("#openProgressBtn"),
    exitQuizBtn: document.querySelector("#exitQuizBtn"),
    quizModeKicker: document.querySelector("#quizModeKicker"),
    quizModeTitle: document.querySelector("#quizModeTitle"),
    liveScore: document.querySelector("#liveScore"),
    liveScoreValue: document.querySelector("#liveScoreValue"),
    questionCounter: document.querySelector("#questionCounter"),
    questionPercent: document.querySelector("#questionPercent"),
    questionProgressBar: document.querySelector("#questionProgressBar"),
    categoryBadge: document.querySelector("#categoryBadge"),
    scopeBadge: document.querySelector("#scopeBadge"),
    questionImageWrap: document.querySelector("#questionImageWrap"),
    questionImage: document.querySelector("#questionImage"),
    questionEn: document.querySelector("#questionEn"),
    questionZh: document.querySelector("#questionZh"),
    optionsContainer: document.querySelector("#optionsContainer"),
    feedbackBox: document.querySelector("#feedbackBox"),
    feedbackTitle: document.querySelector("#feedbackTitle"),
    explanationEn: document.querySelector("#explanationEn"),
    explanationZh: document.querySelector("#explanationZh"),
    keywordsBox: document.querySelector("#keywordsBox"),
    languageControl: document.querySelector("#languageControl"),
    languageButtons: [...document.querySelectorAll(".language-btn")],
    nextBtn: document.querySelector("#nextBtn"),
    examNotice: document.querySelector("#examNotice"),
    resultStatusIcon: document.querySelector("#resultStatusIcon"),
    resultKicker: document.querySelector("#resultKicker"),
    resultTitle: document.querySelector("#resultTitle"),
    finalScore: document.querySelector("#finalScore"),
    finalScoreTotal: document.querySelector("#finalScoreTotal"),
    passStatus: document.querySelector("#passStatus"),
    resultMessage: document.querySelector("#resultMessage"),
    correctResult: document.querySelector("#correctResult"),
    incorrectResult: document.querySelector("#incorrectResult"),
    accuracyResult: document.querySelector("#accuracyResult"),
    restartBtn: document.querySelector("#restartBtn"),
    resultWrongBtn: document.querySelector("#resultWrongBtn"),
    homeActions: [...document.querySelectorAll(".home-action")],
    wrongPageCount: document.querySelector("#wrongPageCount"),
    practiceWrongBtn: document.querySelector("#practiceWrongBtn"),
    clearWrongBtn: document.querySelector("#clearWrongBtn"),
    wrongList: document.querySelector("#wrongList"),
    masteredPageCount: document.querySelector("#masteredPageCount"),
    masteredList: document.querySelector("#masteredList"),
    progressPracticed: document.querySelector("#progressPracticed"),
    progressAccuracy: document.querySelector("#progressAccuracy"),
    progressMastered: document.querySelector("#progressMastered"),
    progressWrong: document.querySelector("#progressWrong"),
    masteryPercentage: document.querySelector("#masteryPercentage"),
    masteryBar: document.querySelector("#masteryBar"),
    masteryDetail: document.querySelector("#masteryDetail"),
    resetProgressBtn: document.querySelector("#resetProgressBtn"),
    versionText: document.querySelector("#versionText"),
    toast: document.querySelector("#toast")
  };

  const MODE_DETAILS = Object.freeze({
    practice: { title: "Random Practice", kicker: "BILINGUAL STUDY", defaultCount: 50 },
    wrong: { title: "Wrong Answer Practice", kicker: "SMART REVIEW", defaultCount: 50 },
    road_sign: { title: "Road Sign Practice", kicker: "FOCUS MODE", defaultCount: 20 },
    exam: { title: "Exam Simulator", kicker: "ENGLISH ONLY", defaultCount: config.EXAM_QUESTION_COUNT }
  });

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    window.clearTimeout(appState.toastTimer);
    el.toast.textContent = message;
    el.toast.classList.remove("hidden");
    appState.toastTimer = window.setTimeout(() => el.toast.classList.add("hidden"), 3000);
  }

  function showView(view) {
    el.views.forEach((candidate) => candidate.classList.toggle("hidden", candidate !== view));
    el.changeStateBtn.classList.toggle("hidden", view === el.stateView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStateCards() {
    el.stateCards.innerHTML = config.STATES.map((state) => `
      <button class="state-card" type="button" data-state="${state.code}" ${state.available ? "" : "disabled"}>
        <span class="state-code">${state.code}</span>
        <span><strong>${escapeHtml(state.nameZh)}</strong><small class="state-english">${escapeHtml(state.name)}</small><small>${state.available ? "英文驾考训练已开放" : "题库正在准备中"}</small></span>
        <span class="state-status" title="${state.available ? "Available" : "Coming Soon"}">${state.available ? "已开放" : "即将上线"}</span>
      </button>
    `).join("");

    el.stateCards.querySelectorAll("[data-state]:not(:disabled)").forEach((button) => {
      button.addEventListener("click", () => selectState(button.dataset.state));
    });
  }

  function selectState(stateCode) {
    const stateConfig = config.STATES.find((state) => state.code === stateCode && state.available);
    if (!stateConfig) {
      showToast("该州题库即将上线 · This state is coming soon.");
      return;
    }

    const bank = data.getQuestionBank(stateCode);
    if (!bank.length) {
      showToast("该州暂时没有可用题目 · No questions are available yet.");
      return;
    }

    appState.selectedState = stateCode;
    appState.questionBank = bank;
    storage.setSelectedState(stateCode);
    renderDashboard();
    showView(el.dashboardView);
  }

  function showStatePicker() {
    appState.session = null;
    storage.clearSelectedState();
    showView(el.stateView);
  }

  function goHome() {
    if (!appState.selectedState) {
      showView(el.stateView);
      return;
    }
    appState.session = null;
    renderDashboard();
    showView(el.dashboardView);
  }

  function getCurrentStats() {
    return storage.getStats(appState.questionBank, appState.selectedState);
  }

  function renderDashboard() {
    const stateConfig = config.STATES.find((state) => state.code === appState.selectedState);
    const stats = getCurrentStats();
    const roadSigns = data.getRoadSignQuestions(appState.questionBank).length;

    el.dashboardTitle.textContent = stateConfig?.nameZh || appState.selectedState;
    el.dashboardEnglishName.textContent = stateConfig?.name || appState.selectedState;
    el.dashboardMastered.textContent = `${stats.mastered} / ${stats.totalQuestions}`;
    el.dashboardWrong.textContent = stats.wrong;
    el.dashboardAccuracy.textContent = `${stats.accuracy}%`;
    el.dashboardPracticed.textContent = stats.practiced;
    el.wrongCardSummary.innerHTML = `${stats.wrong} 道题需要复习<small>${stats.wrong} ${stats.wrong === 1 ? "question" : "questions"} to review</small>`;
    el.masteredCardSummary.innerHTML = `已掌握 ${stats.mastered} / ${stats.totalQuestions}<small>${stats.mastered} of ${stats.totalQuestions} mastered</small>`;
    el.roadSignsCardSummary.innerHTML = `${roadSigns} 道题可练习<small>${roadSigns} questions available</small>`;
  }

  function getQuizPool(mode) {
    if (mode === "wrong") {
      const wrongIds = new Set(Object.keys(storage.getWrongBook()));
      return appState.questionBank.filter((question) => wrongIds.has(question.id));
    }
    if (mode === "road_sign") return data.getRoadSignQuestions(appState.questionBank);
    return appState.questionBank;
  }

  function startQuiz(mode, requestedCount) {
    const details = MODE_DETAILS[mode];
    const pool = getQuizPool(mode);
    const count = mode === "exam"
      ? config.EXAM_QUESTION_COUNT
      : Math.max(1, Number(requestedCount) || details.defaultCount);

    if (!pool.length) {
      showToast(mode === "wrong"
        ? "目前没有需要复习的错题 · No wrong questions to review yet."
        : "该模式暂时没有可用题目 · No questions are available for this mode yet.");
      if (mode === "wrong") openWrongAnswers();
      return;
    }
    if (mode === "exam" && pool.length < config.EXAM_QUESTION_COUNT) {
      showToast(`模拟考试至少需要 ${config.EXAM_QUESTION_COUNT} 道题 · Exam Simulator needs ${config.EXAM_QUESTION_COUNT} questions.`);
      return;
    }

    appState.session = new QuizSession({
      mode,
      questions: pool,
      count,
      bilingual: mode !== "exam"
    });
    appState.currentAnswer = null;
    appState.lastSessionConfig = { mode, count };

    el.quizModeTitle.textContent = details.title;
    el.quizModeKicker.textContent = details.kicker;
    el.liveScore.classList.toggle("hidden", mode === "exam");
    el.examNotice.classList.toggle("hidden", mode !== "exam");
    el.languageButtons.forEach((button) => {
      button.disabled = mode === "exam";
      button.classList.toggle("active", mode === "exam"
        ? button.dataset.language === "english"
        : button.dataset.language === "bilingual");
    });

    showView(el.questionView);
    renderQuestion();
  }

  function getScopeLabel(question) {
    if (question.scope === "federal") return "FEDERAL STANDARD";
    if (question.scope === "multi_state_common") return "COMMON STUDY";
    return question.state === "FL" ? "FLORIDA" : question.state;
  }

  function renderQuestion() {
    const session = appState.session;
    const question = session?.currentQuestion;
    if (!question) {
      goHome();
      return;
    }

    appState.currentAnswer = null;
    const displayIndex = session.currentIndex + 1;
    const percent = Math.round((displayIndex / session.total) * 100);
    el.questionCounter.textContent = `Question ${displayIndex} / ${session.total}`;
    el.questionPercent.textContent = `${percent}%`;
    el.questionProgressBar.style.width = `${percent}%`;
    el.categoryBadge.textContent = question.categoryLabel.toUpperCase();
    el.scopeBadge.textContent = getScopeLabel(question);
    el.questionEn.textContent = question.question.en;
    el.questionZh.textContent = question.question.zh;
    el.liveScoreValue.textContent = session.score;

    if (question.image) {
      el.questionImage.src = question.image;
      el.questionImage.alt = question.imageAlt || `${question.categoryLabel} question image`;
      el.questionImageWrap.classList.remove("hidden");
    } else {
      el.questionImage.removeAttribute("src");
      el.questionImage.alt = "";
      el.questionImageWrap.classList.add("hidden");
    }

    el.optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-btn";
      button.dataset.index = String(index);

      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + index);

      const copy = document.createElement("span");
      const english = document.createElement("span");
      english.className = "option-en";
      english.textContent = option.en;
      const chinese = document.createElement("span");
      chinese.className = "option-zh";
      chinese.textContent = option.zh;
      copy.append(english, chinese);
      button.append(letter, copy);
      button.addEventListener("click", () => answerQuestion(index));
      el.optionsContainer.appendChild(button);
    });

    el.feedbackBox.className = "feedback hidden";
    el.feedbackTitle.textContent = "";
    el.explanationEn.textContent = "";
    el.explanationZh.textContent = "";
    el.keywordsBox.innerHTML = "";
    el.nextBtn.classList.add("hidden");
    applyLanguageMode();
  }

  function answerQuestion(selectedIndex) {
    const session = appState.session;
    const result = session?.submitAnswer(selectedIndex);
    if (!result) return;
    appState.currentAnswer = result;

    const optionButtons = [...el.optionsContainer.querySelectorAll(".option-btn")];
    optionButtons.forEach((button, index) => {
      button.disabled = true;
      if (session.immediateFeedback && index === result.correctIndex) button.classList.add("correct");
      if (session.immediateFeedback && index === result.selectedIndex && !result.isCorrect) button.classList.add("wrong");
      if (!session.immediateFeedback && index === result.selectedIndex) button.classList.add("selected");
    });

    if (session.immediateFeedback) {
      if (result.isCorrect) storage.recordCorrect(result.question.id, appState.selectedState);
      else storage.recordWrong(result.question.id, appState.selectedState);
      renderFeedback(result);
      el.liveScoreValue.textContent = session.score;
    }

    el.nextBtn.textContent = session.isLastQuestion
      ? (session.mode === "exam" ? "View Exam Results" : "View Results")
      : "Next Question";
    el.nextBtn.classList.remove("hidden");
  }

  function renderFeedback(result) {
    const question = result.question;
    el.feedbackBox.className = `feedback ${result.isCorrect ? "correct-feedback" : "wrong-feedback"}`;
    el.feedbackTitle.textContent = result.isCorrect ? "✓ Correct · 回答正确" : "✕ Incorrect · 回答错误";
    el.explanationEn.textContent = question.explanation.en;
    el.explanationZh.textContent = question.explanation.zh;
    renderKeywords(question);
    applyLanguageMode();
  }

  function renderKeywords(question) {
    el.keywordsBox.innerHTML = "";
    question.keywords.forEach((pair) => {
      const chip = document.createElement("span");
      chip.className = "keyword-chip";
      chip.textContent = appState.session.bilingual ? `${pair.en} = ${pair.zh}` : pair.en;
      el.keywordsBox.appendChild(chip);
    });
  }

  function setLanguageMode(language) {
    if (!appState.session || appState.session.mode === "exam") return;
    appState.session.bilingual = language === "bilingual";
    el.languageButtons.forEach((button) => button.classList.toggle("active", button.dataset.language === language));
    applyLanguageMode();
  }

  function applyLanguageMode() {
    const session = appState.session;
    if (!session) return;
    const bilingual = session.bilingual;
    el.questionZh.classList.toggle("hidden", !bilingual);
    el.optionsContainer.querySelectorAll(".option-zh").forEach((node) => node.classList.toggle("hidden", !bilingual));
    el.explanationZh.classList.toggle("hidden", !bilingual);
    if (appState.currentAnswer && session.immediateFeedback) renderKeywords(appState.currentAnswer.question);
  }

  function nextQuestion() {
    const session = appState.session;
    if (!session?.answered) return;
    if (session.isLastQuestion) {
      finishQuiz();
      return;
    }
    session.moveNext();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishQuiz() {
    const session = appState.session;
    if (!session) return;
    const results = session.getResults();

    if (session.mode === "exam") {
      results.answers.forEach((answer) => {
        if (answer.isCorrect) storage.recordCorrect(answer.question.id, appState.selectedState);
        else storage.recordWrong(answer.question.id, appState.selectedState);
      });
    }
    storage.completeSession(appState.selectedState);

    const isExam = session.mode === "exam";
    const passed = isExam && results.percent >= config.EXAM_PASS_PERCENT;
    el.resultKicker.textContent = isExam ? "EXAM COMPLETE" : "SESSION COMPLETE";
    el.resultTitle.textContent = isExam ? "Exam Simulator Results" : "Practice Complete";
    el.finalScore.textContent = results.correct;
    el.finalScoreTotal.textContent = `/ ${results.total}`;
    el.correctResult.textContent = results.correct;
    el.incorrectResult.textContent = results.incorrect;
    el.accuracyResult.textContent = `${results.percent}%`;
    el.passStatus.classList.toggle("hidden", !isExam);
    el.passStatus.classList.toggle("failed", isExam && !passed);
    el.passStatus.textContent = passed ? "PASS" : "NOT PASSED";
    el.resultStatusIcon.classList.toggle("failed", isExam && !passed);
    el.resultStatusIcon.textContent = isExam && !passed ? "!" : "✓";

    if (isExam) {
      el.resultMessage.textContent = passed
        ? `You reached ${results.percent}%, meeting the current Florida practice passing standard of ${config.EXAM_PASS_PERCENT}%.`
        : `You reached ${results.percent}%. Review your wrong answers and try again when you feel ready.`;
      el.restartBtn.textContent = "Retake Exam";
    } else if (results.percent >= 90) {
      el.resultMessage.textContent = `Excellent work — ${results.percent}% correct. Continue building consistency in English-only mode.`;
      el.restartBtn.textContent = "Practice Again";
    } else if (results.percent >= 80) {
      el.resultMessage.textContent = `${results.percent}% correct. Your foundation is strong; review the questions you missed next.`;
      el.restartBtn.textContent = "Practice Again";
    } else {
      el.resultMessage.textContent = `${results.percent}% correct. Use bilingual explanations and your wrong-answer bank before another round.`;
      el.restartBtn.textContent = "Practice Again";
    }

    showView(el.resultView);
  }

  function restartLastSession() {
    if (!appState.lastSessionConfig) {
      goHome();
      return;
    }
    startQuiz(appState.lastSessionConfig.mode, appState.lastSessionConfig.count);
  }

  function openWrongAnswers() {
    const wrong = storage.getWrongBook();
    const questions = appState.questionBank
      .filter((question) => wrong[question.id])
      .sort((first, second) => (wrong[second.id]?.count || 0) - (wrong[first.id]?.count || 0));
    el.wrongPageCount.textContent = questions.length;
    el.practiceWrongBtn.disabled = questions.length === 0;

    if (!questions.length) {
      el.wrongList.innerHTML = '<div class="empty-state">目前还没有错题。答错的题会自动保存在这里。<small>Wrong answers will appear here automatically.</small></div>';
    } else {
      el.wrongList.innerHTML = questions.map((question) => {
        const answer = question.options[question.correctIndex];
        return `
          <article class="review-card">
            <div class="review-meta"><span>${escapeHtml(question.categoryLabelZh)} · ${escapeHtml(question.categoryLabel)}</span><span>答错 ${wrong[question.id].count} 次 · Wrong ${wrong[question.id].count} times</span></div>
            <h2>${escapeHtml(question.question.en)}</h2>
            <p>${escapeHtml(question.question.zh)}</p>
            <p class="answer-line"><strong>正确答案 · Correct Answer:</strong> ${escapeHtml(answer.en)} / ${escapeHtml(answer.zh)}</p>
          </article>`;
      }).join("");
    }
    showView(el.wrongView);
  }

  function openMastered() {
    const progress = storage.getProgress();
    const questions = appState.questionBank.filter((question) => progress[question.id]?.mastered);
    el.masteredPageCount.textContent = questions.length;
    el.masteredList.innerHTML = questions.length
      ? questions.map((question) => `
          <article class="review-card">
            <div class="review-meta"><span>${escapeHtml(question.categoryLabelZh)} · ${escapeHtml(question.categoryLabel)}</span><span>已连续答对 ${config.MASTERY_STREAK} 次 · ${config.MASTERY_STREAK}-answer streak</span></div>
            <h2>${escapeHtml(question.question.en)}</h2>
            <p>${escapeHtml(question.question.zh)}</p>
          </article>`).join("")
      : '<div class="empty-state">目前还没有已掌握题目。连续答对同一道题 3 次后会显示在这里。<small>Questions appear here after three correct answers in a row.</small></div>';
    showView(el.masteredView);
  }

  function openProgress() {
    const stats = getCurrentStats();
    el.progressPracticed.textContent = stats.practiced;
    el.progressAccuracy.textContent = `${stats.accuracy}%`;
    el.progressMastered.textContent = stats.mastered;
    el.progressWrong.textContent = stats.wrong;
    el.masteryPercentage.textContent = `${stats.masteryPercentage}%`;
    el.masteryBar.style.width = `${stats.masteryPercentage}%`;
    el.masteryDetail.innerHTML = `已掌握 ${stats.mastered} / ${stats.totalQuestions} 道题 <small>${stats.mastered} of ${stats.totalQuestions} questions mastered</small>`;
    showView(el.progressView);
  }

  function clearWrongAnswers() {
    if (!window.confirm("确定清空全部错题吗？已掌握记录会保留。\n\nClear all wrong answers? Mastery records will remain.")) return;
    storage.clearWrongBook();
    openWrongAnswers();
    showToast("错题本已清空 · Wrong-answer list cleared.");
  }

  function resetLearningData() {
    if (!window.confirm("确定重置全部分数、错题和掌握记录吗？此操作无法撤销。\n\nReset all learning data? This cannot be undone.")) return;
    storage.resetLearningData();
    openProgress();
    showToast("学习数据已重置 · Learning data reset.");
  }

  function bindEvents() {
    el.brandHomeBtn.addEventListener("click", goHome);
    el.changeStateBtn.addEventListener("click", showStatePicker);
    el.homeActions.forEach((button) => button.addEventListener("click", goHome));
    el.startPracticeBtn.addEventListener("click", () => startQuiz("practice", el.practiceCount.value));
    el.openWrongBtn.addEventListener("click", openWrongAnswers);
    el.openMasteredBtn.addEventListener("click", openMastered);
    el.startRoadSignsBtn.addEventListener("click", () => startQuiz("road_sign", MODE_DETAILS.road_sign.defaultCount));
    el.startExamBtn.addEventListener("click", () => startQuiz("exam", config.EXAM_QUESTION_COUNT));
    el.openProgressBtn.addEventListener("click", openProgress);
    el.exitQuizBtn.addEventListener("click", goHome);
    el.languageButtons.forEach((button) => button.addEventListener("click", () => setLanguageMode(button.dataset.language)));
    el.nextBtn.addEventListener("click", nextQuestion);
    el.restartBtn.addEventListener("click", restartLastSession);
    el.resultWrongBtn.addEventListener("click", openWrongAnswers);
    el.practiceWrongBtn.addEventListener("click", () => startQuiz("wrong", getQuizPool("wrong").length));
    el.clearWrongBtn.addEventListener("click", clearWrongAnswers);
    el.resetProgressBtn.addEventListener("click", resetLearningData);
    el.questionImage.addEventListener("error", () => {
      el.questionImageWrap.classList.add("hidden");
      showToast("This question image could not be loaded · 题目图片加载失败");
    });
  }

  function init() {
    el.versionText.textContent = `V${config.APP_VERSION.replace(/\.0$/, "")}`;
    storage.migrateV1Data();
    renderStateCards();
    bindEvents();

    const savedState = storage.getSelectedState();
    const savedStateAvailable = config.STATES.some((state) => state.code === savedState && state.available);
    if (savedStateAvailable) selectState(savedState);
    else showView(el.stateView);
  }

  window.DMV_APP = Object.freeze({
    selectState,
    showStatePicker,
    goHome,
    startQuiz,
    getSnapshot: () => ({
      selectedState: appState.selectedState,
      questionBankSize: appState.questionBank.length,
      mode: appState.session?.mode || null,
      currentIndex: appState.session?.currentIndex ?? null,
      total: appState.session?.total ?? null,
      score: appState.session?.score ?? null,
      bilingual: appState.session?.bilingual ?? null
    })
  });

  init();
})();
