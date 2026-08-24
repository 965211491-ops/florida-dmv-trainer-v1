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

  class QuizSession {
    constructor({ mode, questions, count, bilingual = true }) {
      this.mode = mode;
      this.immediateFeedback = mode !== "exam";
      this.bilingual = mode === "exam" ? false : bilingual;
      this.questions = shuffle(questions)
        .slice(0, Math.min(count, questions.length))
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

  window.DMV_QUIZ = Object.freeze({ QuizSession, shuffle, shuffleQuestionOptions });
})();
