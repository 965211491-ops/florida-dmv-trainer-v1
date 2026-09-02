(function () {
  "use strict";

  const APP_VERSION = "2.2.0";

  const FL_EXAM_BLUEPRINT = Object.freeze({
    traffic_laws: 17,
    safe_driving: 17,
    traffic_controls: 16,
    roadSignMax: 6
  });

  const STATES = [
    { code: "FL", name: "Florida", nameZh: "佛罗里达州", available: true },
    { code: "CA", name: "California", nameZh: "加利福尼亚州", available: false },
    { code: "TX", name: "Texas", nameZh: "德克萨斯州", available: false },
    { code: "NY", name: "New York", nameZh: "纽约州", available: false }
  ];

  window.DMV_CONFIG = Object.freeze({
    APP_VERSION,
    DEFAULT_STATE: "FL",
    EXAM_QUESTION_COUNT: 50,
    EXAM_PASS_PERCENT: 80,
    FL_EXAM_BLUEPRINT,
    MASTERY_STREAK: 3,
    STATES
  });
})();
