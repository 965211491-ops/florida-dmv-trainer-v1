(function () {
  "use strict";

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function shuffleQuestionOptions(question) {
    const shuffledOptions = shuffle(
      question.options.map((option, originalIndex) => ({
        option,
        isCorrect: originalIndex === question.correctIndex
      }))
    );

    return {
      ...question,
      options: shuffledOptions.map((item) => item.option),
      correctIndex: shuffledOptions.findIndex((item) => item.isCorrect)
    };
  }

  function buildVisualFirstRoadSignSet(questions, count) {
    const total = Math.min(count, questions.length);
    const imagePool = shuffle(questions.filter((question) => question.type === "image" && question.image));
    const textPool = shuffle(questions.filter((question) => question.type !== "image" || !question.image));
    const imageTarget = Math.min(imagePool.length, Math.ceil(total * 0.8));
    const selectedImages = imagePool.slice(0, imageTarget);
    const selectedKnowledgeIds = new Set(selectedImages.map((question) => question.knowledgeId));
    const linkedText = textPool.filter((question) => selectedKnowledgeIds.has(question.knowledgeId));
    const otherText = textPool.filter((question) => !selectedKnowledgeIds.has(question.knowledgeId));
    const selectedText = [...linkedText, ...otherText].slice(0, total - selectedImages.length);
    const selectedIds = new Set([...selectedImages, ...selectedText].map((question) => question.id));
    const fallback = shuffle(questions)
      .filter((question) => !selectedIds.has(question.id))
      .slice(0, total - selectedImages.length - selectedText.length);

    return [
      ...selectedImages.map((question) => ({ ...question, studyPhase: "visual" })),
      ...selectedText.map((question) => ({ ...question, studyPhase: "reinforcement" })),
      ...fallback.map((question) => ({
        ...question,
        studyPhase: question.image ? "visual" : "reinforcement"
      }))
    ];
  }

  function takeUnique(pool, count, usedIds) {
    const selected = shuffle(pool).filter((question) => !usedIds.has(question.id)).slice(0, count);
    selected.forEach((question) => usedIds.add(question.id));
    return selected;
  }

  function buildBalancedTrafficControls(questions, count, roadSignMax) {
    const usedIds = new Set();
    const selected = [];
    const targets = [
      ["road_sign", Math.min(4, roadSignMax)],
      ["road_marking", 4],
      ["traffic_signal", 4],
      ["lane_signal", 2]
    ];

    targets.forEach(([category, target]) => {
      selected.push(...takeUnique(questions.filter((question) => question.category === category), target, usedIds));
    });

    const contextual = questions.filter((question) =>
      ["railroad", "school_zone", "pedestrian"].includes(question.category)
    );
    selected.push(...takeUnique(contextual, Math.max(0, count - selected.length), usedIds));

    if (selected.length < count) {
      const currentSignCount = selected.filter((question) => question.category === "road_sign").length;
      const allowedExtraSigns = Math.max(0, roadSignMax - currentSignCount);
      const nonSigns = questions.filter((question) => question.category !== "road_sign");
      selected.push(...takeUnique(nonSigns, count - selected.length, usedIds));
      if (selected.length < count && allowedExtraSigns) {
        selected.push(...takeUnique(
          questions.filter((question) => question.category === "road_sign"),
          Math.min(allowedExtraSigns, count - selected.length),
          usedIds
        ));
      }
    }

    return selected.slice(0, count);
  }

  function buildBalancedExamSet(questions, blueprint = window.DMV_CONFIG?.FL_EXAM_BLUEPRINT) {
    const plan = blueprint || { traffic_laws: 17, safe_driving: 17, traffic_controls: 16, roadSignMax: 6 };
    const usedIds = new Set();
    const laws = takeUnique(
      questions.filter((question) => question.examDomain === "traffic_laws"),
      plan.traffic_laws,
      usedIds
    );
    const safeDriving = takeUnique(
      questions.filter((question) => question.examDomain === "safe_driving"),
      plan.safe_driving,
      usedIds
    );
    const controls = buildBalancedTrafficControls(
      questions.filter((question) => question.examDomain === "traffic_controls" && !usedIds.has(question.id)),
      plan.traffic_controls,
      plan.roadSignMax
    );
    controls.forEach((question) => usedIds.add(question.id));

    const selected = [...laws, ...safeDriving, ...controls];
    const expected = plan.traffic_laws + plan.safe_driving + plan.traffic_controls;
    if (selected.length < expected) {
      selected.push(...takeUnique(questions, expected - selected.length, usedIds));
    }
    return shuffle(selected.slice(0, expected));
  }

  class QuizSession {
    constructor({ mode, questions, count, bilingual = true }) {
      this.mode = mode;
      this.immediateFeedback = mode !== "exam";
      this.bilingual = mode === "exam" ? false : bilingual;
      const selectedQuestions = mode === "road_sign"
        ? buildVisualFirstRoadSignSet(questions, Math.min(count, questions.length))
        : mode === "exam"
          ? buildBalancedExamSet(questions)
          : shuffle(questions).slice(0, Math.min(count, questions.length));
      this.questions = selectedQuestions
        .map(shuffleQuestionOptions);
      this.currentIndex = 0;
      this.score = 0;
      this.answered = false;
      this.selections = new Array(this.questions.length).fill(null);
    }

    get currentQuestion() {
      return this.questions[this.currentIndex] || null;
    }

    get total() {
      return this.questions.length;
    }

    get isLastQuestion() {
      return this.currentIndex === this.total - 1;
    }

    submitAnswer(selectedIndex) {
      if (this.answered || !this.currentQuestion) return null;
      const isCorrect = selectedIndex === this.currentQuestion.correctIndex;
      this.selections[this.currentIndex] = selectedIndex;
      this.answered = true;
      if (isCorrect) this.score += 1;

      return {
        question: this.currentQuestion,
        selectedIndex,
        correctIndex: this.currentQuestion.correctIndex,
        isCorrect
      };
    }

    moveNext() {
      if (!this.answered || this.isLastQuestion) return false;
      this.currentIndex += 1;
      this.answered = false;
      return true;
    }

    getResults() {
      const answers = this.questions.map((question, index) => ({
        question,
        selectedIndex: this.selections[index],
        correctIndex: question.correctIndex,
        isCorrect: this.selections[index] === question.correctIndex
      }));
      const correct = answers.filter((answer) => answer.isCorrect).length;
      return {
        answers,
        correct,
        incorrect: this.total - correct,
        total: this.total,
        percent: this.total ? Math.round((correct / this.total) * 100) : 0
      };
    }
  }

  window.DMV_QUIZ = Object.freeze({
    QuizSession,
    shuffle,
    shuffleQuestionOptions,
    buildVisualFirstRoadSignSet,
    buildBalancedExamSet,
    buildBalancedTrafficControls
  });
})();
