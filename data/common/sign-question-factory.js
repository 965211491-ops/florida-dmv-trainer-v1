(function () {
  "use strict";

  const knowledge = Array.isArray(window.DMV_SIGN_KNOWLEDGE)
    ? window.DMV_SIGN_KNOWLEDGE
    : [];

  function clonePair(value) {
    return { en: value.en, zh: value.zh };
  }

  function sourceFor(sign, sectionOverride) {
    return {
      ...sign.source,
      section: sectionOverride || sign.source.section
    };
  }

  function distractorsFor(sign, field) {
    const categoryPool = knowledge.filter((candidate) =>
      candidate.id !== sign.id
      && candidate.category === sign.category
      && candidate[field]?.en !== sign[field]?.en
    );
    const fallbackPool = knowledge.filter((candidate) =>
      candidate.id !== sign.id
      && candidate[field]?.en !== sign[field]?.en
      && !categoryPool.some((item) => item.id === candidate.id)
    );
    const pool = [...categoryPool, ...fallbackPool];
    const signIndex = Math.max(0, knowledge.findIndex((candidate) => candidate.id === sign.id));
    const start = pool.length ? (signIndex * 3) % pool.length : 0;
    const chosen = [];

    for (let offset = 0; offset < pool.length && chosen.length < 3; offset += 1) {
      const candidate = pool[(start + offset) % pool.length];
      if (!chosen.some((item) => item[field].en === candidate[field].en)) chosen.push(candidate);
    }
    return chosen;
  }

  function keywordsFor(sign) {
    return [
      clonePair(sign.name),
      clonePair(sign.shapeLabel),
      clonePair(sign.colorLabels[0])
    ];
  }

  function visualMemoryFor(sign) {
    return {
      name: clonePair(sign.name),
      shape: clonePair(sign.shapeLabel),
      colors: sign.colorLabels.map(clonePair),
      meaning: clonePair(sign.meaning),
      image: sign.image,
      imageAlt: sign.imageAlt
    };
  }

  function imageQuestion(sign) {
    const distractors = distractorsFor(sign, "answer");
    return {
      id: `${sign.id}-IMG`,
      state: "ALL",
      scope: "federal",
      category: "road_sign",
      subcategory: sign.category,
      type: "image",
      knowledgeId: sign.id,
      question: {
        en: `What does the ${sign.visualDescription.en} mean?`,
        zh: `${sign.visualDescription.zh}表示什么？`
      },
      options: [sign, ...distractors].map((item) => clonePair(item.answer)),
      correctIndex: 0,
      explanation: clonePair(sign.meaning),
      keywords: keywordsFor(sign),
      image: sign.image,
      imageAlt: sign.imageAlt,
      visualMemory: visualMemoryFor(sign),
      source: sourceFor(sign)
    };
  }

  function nameQuestion(sign) {
    const distractors = distractorsFor(sign, "name");
    return {
      id: `${sign.id}-NAME`,
      state: "ALL",
      scope: "federal",
      category: "road_sign",
      subcategory: sign.category,
      type: "text",
      knowledgeId: sign.id,
      question: {
        en: `Which standard sign means: "${sign.answer.en}"?`,
        zh: `哪个标准交通标志表示“${sign.answer.zh}”？`
      },
      options: [sign, ...distractors].map((item) => clonePair(item.name)),
      correctIndex: 0,
      explanation: clonePair(sign.meaning),
      keywords: keywordsFor(sign),
      image: null,
      imageAlt: null,
      visualMemory: visualMemoryFor(sign),
      source: sourceFor(sign)
    };
  }

  function forCategory(category) {
    return knowledge
      .filter((sign) => sign.category === category)
      .flatMap((sign) => [imageQuestion(sign), nameQuestion(sign)]);
  }

  function option(en, zh) {
    return { en, zh };
  }

  function foundation(id, knowledgeId, subcategory, questionEn, questionZh,
    options, explanationEn, explanationZh, keywords) {
    const sign = knowledge.find((candidate) => candidate.id === knowledgeId);
    return {
      id: `US-SIGN-FOUNDATION-${id}`,
      state: "ALL",
      scope: "federal",
      category: "road_sign",
      subcategory,
      type: "text",
      knowledgeId,
      question: { en: questionEn, zh: questionZh },
      options,
      correctIndex: 0,
      explanation: { en: explanationEn, zh: explanationZh },
      keywords,
      image: null,
      imageAlt: null,
      visualMemory: visualMemoryFor(sign),
      source: sourceFor(sign, "2A")
    };
  }

  function buildFoundations() {
    return [
      foundation("SHAPE-OCTAGON", "US-SIGN-STOP", "sign_shapes",
        "Which traffic sign is uniquely associated with an octagonal shape?",
        "哪一种交通标志与八边形外形具有唯一对应关系？",
        [option("STOP", "停车标志"), option("YIELD", "让行标志"), option("School crossing", "学校穿越"), option("No passing zone", "禁止超车区")],
        "The octagon is reserved for the STOP sign, helping drivers recognize it from the back or in poor visibility.",
        "八边形专用于 STOP 停车标志，使驾驶人即使从背面或在低能见度下也能识别。",
        [option("octagon", "八边形"), option("STOP", "停车标志")]),
      foundation("SHAPE-TRIANGLE", "US-SIGN-YIELD", "sign_shapes",
        "Which standard sign uses an inverted equilateral triangle?",
        "哪一种标准标志使用倒置的等边三角形？",
        [option("YIELD", "让行标志"), option("STOP", "停车标志"), option("Railroad crossing ahead", "前方铁路道口"), option("School zone", "学校区域")],
        "The downward-pointing triangle is reserved for the YIELD sign.",
        "尖端向下的三角形专用于 YIELD 让行标志。",
        [option("inverted triangle", "倒三角形"), option("yield", "让行")]),
      foundation("SHAPE-PENNANT", "US-SIGN-NO-PASSING-ZONE", "sign_shapes",
        "What does a pennant-shaped sign placed on the left side of the road identify?",
        "设置在道路左侧的三角旗形标志表示什么？",
        [option("A no-passing zone", "禁止超车区域"), option("A school zone", "学校区域"), option("A railroad crossing", "铁路道口"), option("A work zone", "施工区域")],
        "The pennant shape is reserved for the No Passing Zone warning sign.",
        "三角旗形专用于禁止超车区域警告标志。",
        [option("pennant", "三角旗形"), option("no passing zone", "禁止超车区域")]),
      foundation("SHAPE-CIRCLE", "US-SIGN-RAILROAD-ADVANCE", "sign_shapes",
        "What hazard is uniquely associated with a circular advance-warning sign?",
        "圆形预告警告标志与哪一种危险具有唯一对应关系？",
        [option("A railroad grade crossing", "铁路平交道口"), option("A roundabout", "环岛"), option("A divided highway", "分隔式道路"), option("A pedestrian crossing", "行人穿越")],
        "A circular warning sign is used in advance of a railroad grade crossing.",
        "圆形警告标志用于提前提示铁路平交道口。",
        [option("circle", "圆形"), option("grade crossing", "铁路平交道口")]),
      foundation("SHAPE-PENTAGON", "US-SIGN-SCHOOL", "sign_shapes",
        "Which roadway area is identified by a five-sided pentagon sign?",
        "五边形标志用于表示哪一种道路区域？",
        [option("A school area or crossing", "学校区域或学校穿越"), option("A construction detour", "施工绕行"), option("A no-passing zone", "禁止超车区"), option("A hospital route", "医院路线")],
        "The pentagon is used for school-area and school-crossing warning signs.",
        "五边形用于学校区域和学校穿越警告标志。",
        [option("pentagon", "五边形"), option("school", "学校")]),
      foundation("SHAPE-CROSSBUCK", "US-SIGN-CROSSBUCK", "sign_shapes",
        "What location is identified by two crossed rectangular boards forming a crossbuck?",
        "由两块长方形板交叉组成的十字标志表示什么地点？",
        [option("A railroad grade crossing", "铁路平交道口"), option("A four-way road intersection", "四向道路交叉口"), option("A hospital entrance", "医院入口"), option("A bicycle route", "自行车路线")],
        "The crossbuck identifies the location of a railroad grade crossing.",
        "交叉十字形标志用于表示铁路平交道口的位置。",
        [option("crossbuck", "交叉十字形"), option("railroad crossing", "铁路道口")]),
      foundation("SHAPE-DIAMOND", "US-SIGN-CURVE", "sign_shapes",
        "What type of message is normally shown on a diamond-shaped traffic sign?",
        "菱形交通标志通常传达哪一类信息？",
        [option("A warning about conditions ahead", "对前方路况的警告"), option("A posted legal speed limit", "法定限速"), option("A route number", "路线编号"), option("A mandatory stop", "强制停车")],
        "Diamond-shaped signs are generally used for warning messages.",
        "菱形标志通常用于传达警告信息。",
        [option("diamond", "菱形"), option("warning", "警告")]),
      foundation("SHAPE-RECTANGLE", "US-SIGN-SPEED-LIMIT", "sign_shapes",
        "Which sign family most commonly uses a vertical rectangular shape?",
        "哪一类标志最常使用竖向长方形外形？",
        [option("Regulatory signs", "管制标志"), option("General warning signs", "一般警告标志"), option("School advance signs", "学校预告标志"), option("Railroad advance warnings", "铁路道口预告标志")],
        "Vertical rectangles are commonly used for regulatory signs such as Speed Limit and lane-use controls.",
        "竖向长方形通常用于限速和车道使用控制等管制标志。",
        [option("rectangle", "长方形"), option("regulatory", "管制")]),
      foundation("COLOR-RED", "US-SIGN-STOP", "sign_colors",
        "Which messages are most closely associated with red on standard traffic signs?",
        "标准交通标志中的红色最常与哪些信息相关？",
        [option("Stop, yield, and prohibitions", "停车、让行和禁止"), option("General warnings", "一般警告"), option("Work-zone guidance", "施工区指引"), option("Destination guidance", "目的地方向指引")],
        "Red is reserved primarily for STOP, YIELD, and prohibition messages.",
        "红色主要用于停车、让行和禁止类信息。",
        [option("red", "红色"), option("prohibition", "禁止")]),
      foundation("COLOR-WHITE", "US-SIGN-SPEED-LIMIT", "sign_colors",
        "What type of information is commonly shown with a white background and black legend?",
        "白底黑字通常用于显示哪一类信息？",
        [option("Regulatory information", "管制信息"), option("Work-zone warnings", "施工区警告"), option("Recreation guidance", "休闲景点指引"), option("General services", "一般服务")],
        "White backgrounds with black legends are commonly used for regulatory signs.",
        "白色背景配黑色图文通常用于管制标志。",
        [option("white", "白色"), option("regulatory", "管制")]),
      foundation("COLOR-YELLOW", "US-SIGN-CURVE", "sign_colors",
        "What does a yellow background normally communicate on a traffic sign?",
        "交通标志的黄色背景通常传达什么信息？",
        [option("A general warning", "一般警告"), option("A legal prohibition", "法定禁止"), option("A motorist service", "驾驶人服务"), option("A recreation destination", "休闲目的地")],
        "Yellow is the standard background color for general warning signs.",
        "黄色是一般警告标志的标准背景颜色。",
        [option("yellow", "黄色"), option("warning", "警告")]),
      foundation("COLOR-ORANGE", "US-SIGN-ROAD-WORK", "sign_colors",
        "What does an orange traffic-sign background normally indicate?",
        "橙色交通标志背景通常表示什么？",
        [option("Temporary traffic control or road work", "临时交通管制或道路施工"), option("A school crossing", "学校穿越"), option("A hospital service", "医院服务"), option("A permanent speed limit", "永久限速")],
        "Orange is used for warning and guidance in temporary traffic-control and work zones.",
        "橙色用于临时交通管制和施工区域的警告与指引。",
        [option("orange", "橙色"), option("work zone", "施工区域")]),
      foundation("COLOR-GREEN", "US-SIGN-DESTINATION", "sign_colors",
        "What information is normally provided on a green guide sign?",
        "绿色指路标志通常提供什么信息？",
        [option("Permitted movements, directions, or destinations", "允许的行驶方向、路线或目的地"), option("Road-work hazards", "道路施工危险"), option("School-zone warnings", "学校区域警告"), option("Parking prohibitions", "禁止停车")],
        "Green is commonly used for direction and destination guidance and permitted movements.",
        "绿色通常用于方向、目的地指引和允许的行驶方向。",
        [option("green", "绿色"), option("guidance", "指引")]),
      foundation("COLOR-BLUE", "US-SIGN-GAS", "sign_colors",
        "What does a blue traffic sign most commonly identify?",
        "蓝色交通标志最常表示什么？",
        [option("Road-user services", "道路使用者服务"), option("A sharp road hazard", "急剧道路危险"), option("A regulatory command", "管制命令"), option("A no-passing zone", "禁止超车区域")],
        "Blue backgrounds are commonly used for motorist and road-user services such as gas, food, lodging, and hospitals.",
        "蓝色背景通常用于加油、餐饮、住宿和医院等驾驶人及道路使用者服务。",
        [option("blue", "蓝色"), option("services", "服务")]),
      foundation("COLOR-BROWN", "US-SIGN-RECREATION", "sign_colors",
        "What destination type is normally shown on a brown guide sign?",
        "棕色指路标志通常表示哪一类目的地？",
        [option("Recreational or cultural-interest sites", "休闲或文化景点"), option("Emergency medical services", "紧急医疗服务"), option("Temporary detours", "临时绕行"), option("School speed zones", "学校限速区域")],
        "Brown is used for guidance to recreational and cultural-interest destinations.",
        "棕色用于指引前往休闲和文化景点。",
        [option("brown", "棕色"), option("recreation", "休闲")]),
      foundation("COLOR-FYG", "US-SIGN-PEDESTRIAN", "sign_colors",
        "Which road users or areas are commonly highlighted by fluorescent yellow-green signs?",
        "荧光黄绿色标志通常重点提示哪些道路使用者或区域？",
        [option("Pedestrians, bicyclists, and school areas", "行人、自行车和学校区域"), option("Interstate route numbers", "州际公路编号"), option("Parking restrictions", "停车限制"), option("Fuel and lodging services", "加油和住宿服务")],
        "Fluorescent yellow-green is used to increase conspicuity for pedestrian, bicycle, and school warnings.",
        "荧光黄绿色用于提高行人、自行车和学校区域警告的醒目程度。",
        [option("fluorescent yellow-green", "荧光黄绿色"), option("school", "学校"), option("pedestrian", "行人")])
    ];
  }

  window.DMV_SIGN_FACTORY = Object.freeze({
    forCategory,
    buildFoundations
  });
})();
