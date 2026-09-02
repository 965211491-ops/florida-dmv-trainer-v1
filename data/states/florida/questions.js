(function () {
  "use strict";

  window.STATE_QUESTIONS = window.STATE_QUESTIONS || {};
  window.STATE_QUESTIONS.FL = window.STATE_QUESTIONS.FL || [];

  const topics = new Map((window.FLORIDA_STUDY_GUIDE_84 || []).map((topic) => [topic.id, topic]));
  const handbookUrl = "https://www.flhsmv.gov/pdf/handbooks/englishdriverhandbook.pdf";

  function keywordPairs(keywords) {
    return (keywords || []).map(([en, zh]) => ({ en, zh }));
  }

  function createQuestion(domain, seed) {
    const primaryTopic = topics.get(seed.studyGuideItems[0]);
    const source = primaryTopic?.source || {};
    const verificationStatus = seed.verificationStatus || "verified_2023_handbook_only";

    return {
      id: `FL-V22-${domain === "traffic_laws" ? "TL" : domain === "safe_driving" ? "SD" : "TC"}-${String(seed.id).padStart(3, "0")}`,
      state: "FL",
      scope: "state",
      examDomain: domain,
      category: seed.category,
      difficulty: seed.difficulty || "basic",
      studyGuideItems: seed.studyGuideItems,
      type: seed.type || (seed.image ? "image_to_meaning" : "text"),
      image: seed.image || null,
      imageAlt: seed.imageAlt || null,
      question: { en: seed.prompt[0], zh: seed.prompt[1] },
      options: seed.options.map(([en, zh, image, imageAlt]) => ({
        en,
        zh,
        ...(image ? { image, imageAlt: imageAlt || `${en} diagram` } : {})
      })),
      correctIndex: Number.isInteger(seed.correctIndex) ? seed.correctIndex : 0,
      explanation: { en: seed.explanation[0], zh: seed.explanation[1] },
      keywords: keywordPairs(seed.keywords),
      source: {
        authority: "FLHSMV",
        document: source.document || "Official Florida Driver License Handbook",
        edition: source.edition || "08/2023",
        chapter: source.chapter || null,
        section: primaryTopic?.title?.en || null,
        page: source.pages || null,
        pages: source.pages || null,
        verifiedDate: "2026-08-24",
        verificationStatus,
        status: verificationStatus,
        url: handbookUrl,
        ...(seed.currentOfficialSource ? { currentOfficialSource: seed.currentOfficialSource } : {})
      }
    };
  }

  function addQuestions(domain, seeds) {
    const questions = seeds.map((seed) => createQuestion(domain, seed));
    window.STATE_QUESTIONS.FL.push(...questions);
    return questions;
  }

  window.DMV_FL_QUESTION_FACTORY = Object.freeze({ addQuestions });
})();
