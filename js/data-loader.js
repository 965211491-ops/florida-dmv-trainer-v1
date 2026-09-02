(function () {
  "use strict";

  const CATEGORY_MAP = Object.freeze({
    "Traffic Signs": "road_sign",
    "Traffic Sign Colors": "road_sign",
    "Traffic Signals": "traffic_signal",
    "Road Markings": "road_marking",
    "Right-of-Way": "right_of_way",
    Intersections: "intersection",
    Roundabouts: "intersection",
    "Safe Driving": "safe_driving",
    "Seat Belts": "safe_driving",
    "Distracted Driving": "safe_driving",
    "Speed & Conditions": "safe_driving",
    "Lane Use": "lane_use",
    Passing: "lane_use",
    Turning: "lane_use",
    Parking: "parking",
    Headlights: "night_driving",
    "Night Driving": "night_driving",
    Weather: "weather",
    "Vehicle Emergencies": "emergency",
    "Emergency Vehicles": "emergency",
    "Roadside Safety": "emergency",
    Crashes: "emergency",
    "Railroad Crossings": "railroad",
    Pedestrians: "pedestrian",
    Bicycles: "bicycle",
    Motorcycles: "motorcycle",
    "Sharing the Road": "sharing_the_road",
    "Traffic Control": "traffic_signal",
    "School Bus": "florida_school_bus",
    "Move Over Law": "florida_move_over",
    "Alcohol & Driving": "florida_dui"
  });

  const CATEGORY_LABELS = Object.freeze({
    road_sign: "Road Signs",
    traffic_signal: "Traffic Signals",
    road_marking: "Road Markings",
    right_of_way: "Right of Way",
    intersection: "Intersections",
    safe_driving: "Safe Driving",
    lane_use: "Lane Use",
    parking: "Parking",
    night_driving: "Night Driving",
    weather: "Weather",
    emergency: "Emergencies",
    railroad: "Railroad Crossings",
    pedestrian: "Pedestrians",
    bicycle: "Bicycles",
    motorcycle: "Motorcycles",
    sharing_the_road: "Sharing the Road",
    highway: "Highway Driving",
    florida_law: "Florida Law",
    florida_school_bus: "Florida School Bus",
    florida_move_over: "Florida Move Over",
    florida_dui: "Florida DUI",
    florida_insurance: "Florida Insurance",
    florida_license: "Florida License",
    florida_penalties: "Florida Penalties",
    florida_numbers: "Florida Numbers",
    vehicle_safety: "Vehicle Safety",
    vehicle_law: "Vehicle Requirements",
    load_security: "Load Security",
    distracted_driving: "Distracted Driving",
    alcohol_awareness: "Alcohol Awareness",
    occupant_protection: "Occupant Protection",
    occupant_law: "Occupant Laws",
    speed_management: "Speed Management",
    speed_law: "Speed Laws",
    following_distance: "Following Distance",
    lane_change: "Lane Changes",
    roadside_safety: "Roadside Safety",
    turning_law: "Turning Rules",
    lane_law: "Lane Laws",
    passing_law: "Passing Laws",
    parking_law: "Parking Laws",
    crash_law: "Crash Duties",
    lane_signal: "Lane Signals",
    school_zone: "School Zone",
    load_security: "Load Security",
    driving_test: "Driving Test"
  });

  const CATEGORY_LABELS_ZH = Object.freeze({
    road_sign: "交通标志",
    traffic_signal: "交通信号灯",
    road_marking: "道路标线",
    right_of_way: "通行权",
    intersection: "交叉路口",
    safe_driving: "安全驾驶",
    lane_use: "车道使用",
    parking: "停车规则",
    night_driving: "夜间驾驶",
    weather: "天气路况",
    emergency: "紧急情况",
    railroad: "铁路道口",
    pedestrian: "行人安全",
    bicycle: "自行车安全",
    motorcycle: "摩托车安全",
    sharing_the_road: "共享道路",
    highway: "高速公路驾驶",
    florida_law: "佛罗里达州法规",
    florida_school_bus: "佛州校车规则",
    florida_move_over: "佛州让道法",
    florida_dui: "佛州酒驾法规",
    florida_insurance: "佛州保险规定",
    florida_license: "佛州驾照规定",
    florida_penalties: "佛州处罚规定",
    florida_numbers: "佛州数字考点",
    vehicle_safety: "车辆安全",
    vehicle_law: "车辆法规",
    load_security: "货物固定",
    distracted_driving: "分心驾驶",
    alcohol_awareness: "酒精风险",
    occupant_protection: "乘员保护",
    occupant_law: "乘员法规",
    speed_management: "速度管理",
    speed_law: "限速法规",
    following_distance: "跟车距离",
    lane_change: "变更车道",
    roadside_safety: "路边安全",
    turning_law: "转弯规则",
    lane_law: "车道法规",
    passing_law: "超车法规",
    parking_law: "停车法规",
    crash_law: "事故义务",
    lane_signal: "车道信号",
    school_zone: "校区交通",
    driving_test: "路考动作"
  });

  const CONTROL_CATEGORIES = new Set([
    "road_sign", "traffic_signal", "road_marking", "lane_signal", "railroad", "school_zone"
  ]);
  const LAW_CATEGORIES = new Set([
    "vehicle_law", "load_security", "occupant_law", "speed_law", "turning_law", "lane_law",
    "passing_law", "parking_law", "crash_law", "florida_law", "florida_school_bus",
    "florida_move_over", "florida_dui", "florida_insurance", "florida_license",
    "florida_penalties", "florida_numbers"
  ]);

  function toCategorySlug(category) {
    if (!category) return "safe_driving";
    if (CATEGORY_MAP[category]) return CATEGORY_MAP[category];
    return String(category)
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function normalizeSource(source, legacyQuestion) {
    if (source && typeof source === "object") {
      return {
        ...source,
        authority: source.authority || null,
        document: source.document || null,
        edition: source.edition || null,
        chapter: source.chapter || null,
        section: source.section || null,
        page: source.page ?? null,
        pages: source.pages ?? source.page ?? null,
        verifiedDate: source.verifiedDate || null,
        verificationStatus: source.verificationStatus || source.status || null,
        status: source.status || null,
        url: source.url || null
      };
    }

    return {
      authority: "FLHSMV",
      document: source || "Florida Driver License Handbook — practice paraphrase",
      edition: null,
      section: null,
      page: legacyQuestion.sourcePage ?? null,
      pages: legacyQuestion.sourcePage ?? null,
      verifiedDate: null,
      verificationStatus: legacyQuestion.sourceStatus || "practice-paraphrase",
      status: legacyQuestion.sourceStatus || "practice-paraphrase",
      url: null
    };
  }

  function inferExamDomain(category) {
    if (CONTROL_CATEGORIES.has(category)) return "traffic_controls";
    if (LAW_CATEGORIES.has(category)) return "traffic_laws";
    return "safe_driving";
  }

  function normalizeQuestion(question, fallbackState, fallbackScope) {
    const category = toCategorySlug(question.category);
    const state = question.state || fallbackState;
    const image = question.image || null;

    return {
      ...question,
      state,
      scope: question.scope || fallbackScope,
      examDomain: question.examDomain || inferExamDomain(category),
      category,
      categoryLabel: question.categoryLabel || CATEGORY_LABELS[category] || question.category || "Driving Knowledge",
      categoryLabelZh: question.categoryLabelZh || CATEGORY_LABELS_ZH[category] || "驾考知识",
      subcategory: question.subcategory || null,
      type: question.type || (image ? "image_to_meaning" : "text"),
      image,
      question: {
        en: question.question?.en || "",
        zh: question.question?.zh || ""
      },
      options: Array.isArray(question.options) ? question.options : [],
      correctIndex: Number(question.correctIndex),
      explanation: {
        en: question.explanation?.en || "",
        zh: question.explanation?.zh || ""
      },
      keywords: Array.isArray(question.keywords) ? question.keywords : [],
      difficulty: question.difficulty || "basic",
      studyGuideItems: Array.isArray(question.studyGuideItems) ? question.studyGuideItems : [],
      source: normalizeSource(question.source, question)
    };
  }

  function getQuestionBank(stateCode) {
    const common = Array.isArray(window.COMMON_QUESTIONS) ? window.COMMON_QUESTIONS : [];
    const stateQuestions = Array.isArray(window.STATE_QUESTIONS?.[stateCode])
      ? window.STATE_QUESTIONS[stateCode]
      : [];
    const legacy = stateCode === "FL" && Array.isArray(window.QUESTIONS)
      ? window.QUESTIONS
      : [];

    const combined = [
      ...common.map((question) => normalizeQuestion(question, "ALL", question.scope || "multi_state_common")),
      ...stateQuestions.map((question) => normalizeQuestion(question, stateCode, "state")),
      ...legacy.map((question) => normalizeQuestion(question, "FL", "state"))
    ];

    const seen = new Set();
    return combined.filter((question) => {
      if (!question.id || seen.has(question.id)) return false;
      const correctOptionExists = Number.isInteger(question.correctIndex)
        && question.correctIndex >= 0
        && question.correctIndex < question.options.length;
      if (!correctOptionExists || !question.question.en) return false;
      seen.add(question.id);
      return true;
    });
  }

  function getRoadSignQuestions(questionBank) {
    return questionBank.filter((question) => question.category === "road_sign");
  }

  function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || category.replace(/_/g, " ");
  }

  function getCategoryLabelZh(category) {
    return CATEGORY_LABELS_ZH[category] || "驾考知识";
  }

  window.DMV_DATA = Object.freeze({
    CATEGORY_LABELS,
    CATEGORY_LABELS_ZH,
    getQuestionBank,
    getRoadSignQuestions,
    getCategoryLabel,
    getCategoryLabelZh,
    normalizeQuestion
  });
})();
