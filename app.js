
const QUESTION_COUNT = 50;
const MASTERY_STREAK = 3;

const STORAGE_KEYS = {
  progress: "fl-dmv-progress-v1",
  wrong: "fl-dmv-wrong-v1"
};

const state = {
  quiz: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  bilingual: true
};

const el = {
  progressStat: document.querySelector("#progressStat"),
  scoreStat: document.querySelector("#scoreStat"),
  wrongStat: document.querySelector("#wrongStat"),
  masteredStat: document.querySelector("#masteredStat"),
  startPanel: document.querySelector("#startPanel"),
  questionPanel: document.querySelector("#questionPanel"),
  resultPanel: document.querySelector("#resultPanel"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  reviewWrongBtn: document.querySelector("#reviewWrongBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  bilingualToggle: document.querySelector("#bilingualToggle"),
  questionBilingualToggle: document.querySelector("#questionBilingualToggle"),
  categoryBadge: document.querySelector("#categoryBadge"),
  questionCounter: document.querySelector("#questionCounter"),
  questionEn: document.querySelector("#questionEn"),
  questionZh: document.querySelector("#questionZh"),
  optionsContainer: document.querySelector("#optionsContainer"),
  feedbackBox: document.querySelector("#feedbackBox"),
  feedbackTitle: document.querySelector("#feedbackTitle"),
  explanationEn: document.querySelector("#explanationEn"),
  explanationZh: document.querySelector("#explanationZh"),
  keywordsBox: document.querySelector("#keywordsBox"),
  finalScore: document.querySelector("#finalScore"),
  resultMessage: document.querySelector("#resultMessage"),
  wrongList: document.querySelector("#wrongList"),
  masteredList: document.querySelector("#masteredList"),
  clearWrongBtn: document.querySelector("#clearWrongBtn"),
  resetProgressBtn: document.querySelector("#resetProgressBtn"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  views: [...document.querySelectorAll(".view-panel")]
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProgress() {
  return readJson(STORAGE_KEYS.progress, {});
}

function getWrongBook() {
  return readJson(STORAGE_KEYS.wrong, {});
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
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

function startQuiz() {
  const pool = shuffle(window.QUESTIONS);
  if (pool.length < QUESTION_COUNT) {
    alert(`题库目前只有 ${pool.length} 道题，需要至少 ${QUESTION_COUNT} 道才能开始。`);
    return;
  }

  // Prepare a fresh option order for every question in this quiz. The correct
  // marker travels with its option so scoring remains accurate after shuffling.
  state.quiz = pool.slice(0, QUESTION_COUNT).map(shuffleQuestionOptions);
  state.currentIndex = 0;
  state.score = 0;
  state.answered = false;
  state.bilingual = el.bilingualToggle.checked;
  el.questionBilingualToggle.checked = state.bilingual;

  el.startPanel.classList.add("hidden");
  el.resultPanel.classList.add("hidden");
  el.questionPanel.classList.remove("hidden");

  updateStats();
  renderQuestion();
}

function renderQuestion() {
  const q = state.quiz[state.currentIndex];
  state.answered = false;

  el.categoryBadge.textContent = q.category;
  el.questionCounter.textContent = `Question ${state.currentIndex + 1} / ${QUESTION_COUNT}`;
  el.questionEn.textContent = q.question.en;
  el.questionZh.textContent = q.question.zh;
  el.questionZh.classList.toggle("hidden", !state.bilingual);

  el.optionsContainer.innerHTML = "";
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.dataset.index = index;

    button.innerHTML = `
      <span class="option-letter">${String.fromCharCode(65 + index)}</span>
      <span>
        <span class="option-en">${option.en}</span>
        <span class="option-zh ${state.bilingual ? "" : "hidden"}">${option.zh}</span>
      </span>
    `;

    button.addEventListener("click", () => answerQuestion(index));
    el.optionsContainer.appendChild(button);
  });

  el.feedbackBox.className = "feedback hidden";
  el.feedbackTitle.textContent = "";
  el.explanationEn.textContent = "";
  el.explanationZh.textContent = "";
  el.keywordsBox.innerHTML = "";
  el.nextBtn.classList.add("hidden");

  updateStats();
}

function answerQuestion(selectedIndex) {
  if (state.answered) return;
  state.answered = true;

  const q = state.quiz[state.currentIndex];
  const isCorrect = selectedIndex === q.correctIndex;
  const optionButtons = [...el.optionsContainer.querySelectorAll(".option-btn")];

  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correctIndex) btn.classList.add("correct");
    if (index === selectedIndex && !isCorrect) btn.classList.add("wrong");
  });

  if (isCorrect) {
    state.score += 1;
    recordCorrect(q.id);
    showFeedback(true, q);
  } else {
    recordWrong(q.id);
    showFeedback(false, q);
  }

  el.nextBtn.textContent =
    state.currentIndex === QUESTION_COUNT - 1 ? "查看结果" : "下一题";
  el.nextBtn.classList.remove("hidden");
  updateStats();
}

function showFeedback(isCorrect, q) {
  el.feedbackBox.className = `feedback ${isCorrect ? "correct-feedback" : "wrong-feedback"}`;
  el.feedbackTitle.textContent = isCorrect ? "✓ 回答正确" : "✕ 回答错误";
  el.explanationEn.textContent = q.explanation.en;
  el.explanationZh.textContent = state.bilingual ? q.explanation.zh : "";
  el.explanationZh.classList.toggle("hidden", !state.bilingual);

  el.keywordsBox.innerHTML = "";
  q.keywords.forEach((pair) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = state.bilingual ? `${pair.en} = ${pair.zh}` : pair.en;
    el.keywordsBox.appendChild(chip);
  });
}

function nextQuestion() {
  if (!state.answered) return;

  if (state.currentIndex >= QUESTION_COUNT - 1) {
    finishQuiz();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finishQuiz() {
  el.questionPanel.classList.add("hidden");
  el.resultPanel.classList.remove("hidden");
  el.finalScore.textContent = state.score;

  const percent = Math.round((state.score / QUESTION_COUNT) * 100);
  if (percent >= 90) {
    el.resultMessage.textContent = `正确率 ${percent}%。已经很接近真实英文考试训练状态，可以继续提高稳定性。`;
  } else if (percent >= 80) {
    el.resultMessage.textContent = `正确率 ${percent}%。基础不错，建议先把错题重新刷熟。`;
  } else {
    el.resultMessage.textContent = `正确率 ${percent}%。先不用追求速度，优先利用中英对照把题意和关键词记住。`;
  }

  el.progressStat.textContent = `${QUESTION_COUNT} / ${QUESTION_COUNT}`;
  updateStats();
}

function recordCorrect(questionId) {
  const progress = getProgress();
  const current = progress[questionId] ?? { streak: 0, mastered: false, totalCorrect: 0 };

  current.streak = (current.streak || 0) + 1;
  current.totalCorrect = (current.totalCorrect || 0) + 1;

  if (current.streak >= MASTERY_STREAK) {
    current.mastered = true;
  }

  progress[questionId] = current;
  writeJson(STORAGE_KEYS.progress, progress);

  // Once a question is answered correctly, keep it in wrong book history until
  // the learner masters it. This prevents a single lucky answer from erasing it.
  if (current.mastered) {
    const wrong = getWrongBook();
    if (wrong[questionId]) {
      delete wrong[questionId];
      writeJson(STORAGE_KEYS.wrong, wrong);
    }
  }
}

function recordWrong(questionId) {
  const progress = getProgress();
  const current = progress[questionId] ?? { streak: 0, mastered: false, totalCorrect: 0 };

  current.streak = 0;
  current.mastered = false;
  progress[questionId] = current;
  writeJson(STORAGE_KEYS.progress, progress);

  const wrong = getWrongBook();
  wrong[questionId] = {
    count: (wrong[questionId]?.count || 0) + 1,
    lastWrongAt: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.wrong, wrong);
}

function updateStats() {
  const progress = getProgress();
  const wrong = getWrongBook();
  const masteredCount = Object.values(progress).filter((item) => item.mastered).length;

  const answeredCount = state.quiz.length
    ? Math.min(state.currentIndex + (state.answered ? 1 : 0), QUESTION_COUNT)
    : 0;

  el.progressStat.textContent = `${answeredCount} / ${QUESTION_COUNT}`;
  el.scoreStat.textContent = state.score;
  el.wrongStat.textContent = Object.keys(wrong).length;
  el.masteredStat.textContent = `${masteredCount} / ${window.QUESTIONS.length}`;
}

function renderWrongBook() {
  const wrong = getWrongBook();
  const ids = Object.keys(wrong).sort((a, b) => wrong[b].count - wrong[a].count);

  if (!ids.length) {
    el.wrongList.innerHTML = `<div class="empty-state">目前没有错题。继续刷题后，答错的题会自动出现在这里。</div>`;
    return;
  }

  el.wrongList.innerHTML = ids.map((id) => {
    const q = window.QUESTIONS.find((item) => item.id === id);
    if (!q) return "";
    return `
      <article class="review-card">
        <div class="review-meta">${q.category} · 错 ${wrong[id].count} 次</div>
        <h3>${q.question.en}</h3>
        <p>${q.question.zh}</p>
        <p><strong>正确答案：</strong>${q.options[q.correctIndex].en} / ${q.options[q.correctIndex].zh}</p>
      </article>
    `;
  }).join("");
}

function renderMastered() {
  const progress = getProgress();
  const mastered = window.QUESTIONS.filter((q) => progress[q.id]?.mastered);

  if (!mastered.length) {
    el.masteredList.innerHTML = `<div class="empty-state">还没有题目达到“连续答对 3 次”。继续刷题就会慢慢积累。</div>`;
    return;
  }

  el.masteredList.innerHTML = mastered.map((q) => `
    <article class="review-card">
      <div class="review-meta">${q.category} · 已掌握</div>
      <h3>${q.question.en}</h3>
      <p>${q.question.zh}</p>
    </article>
  `).join("");
}

function switchView(viewName) {
  el.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  el.views.forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });

  if (viewName === "wrong") renderWrongBook();
  if (viewName === "mastered") renderMastered();
}

function setBilingual(value) {
  state.bilingual = value;
  el.bilingualToggle.checked = value;
  el.questionBilingualToggle.checked = value;

  if (!el.questionPanel.classList.contains("hidden")) {
    el.questionZh.classList.toggle("hidden", !value);
    el.optionsContainer.querySelectorAll(".option-zh").forEach((node) => {
      node.classList.toggle("hidden", !value);
    });

    if (state.answered) {
      const q = state.quiz[state.currentIndex];
      el.explanationZh.classList.toggle("hidden", !value);
      el.explanationZh.textContent = value ? q.explanation.zh : "";

      el.keywordsBox.innerHTML = "";
      q.keywords.forEach((pair) => {
        const chip = document.createElement("span");
        chip.className = "keyword-chip";
        chip.textContent = value ? `${pair.en} = ${pair.zh}` : pair.en;
        el.keywordsBox.appendChild(chip);
      });
    }
  }
}

el.startQuizBtn.addEventListener("click", startQuiz);
el.restartBtn.addEventListener("click", startQuiz);
el.nextBtn.addEventListener("click", nextQuestion);
el.reviewWrongBtn.addEventListener("click", () => switchView("wrong"));

el.bilingualToggle.addEventListener("change", (event) => setBilingual(event.target.checked));
el.questionBilingualToggle.addEventListener("change", (event) => setBilingual(event.target.checked));

el.navButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

el.clearWrongBtn.addEventListener("click", () => {
  if (!confirm("确定要清空错题本吗？这不会清除“已掌握”记录。")) return;
  localStorage.removeItem(STORAGE_KEYS.wrong);
  renderWrongBook();
  updateStats();
});

el.resetProgressBtn.addEventListener("click", () => {
  if (!confirm("确定要清空全部学习记录吗？错题本和掌握进度都会删除。")) return;
  localStorage.removeItem(STORAGE_KEYS.progress);
  localStorage.removeItem(STORAGE_KEYS.wrong);
  state.score = 0;
  updateStats();
  renderWrongBook();
  renderMastered();
});

updateStats();
