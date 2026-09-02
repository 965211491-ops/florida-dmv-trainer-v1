(function () {
  "use strict";

  const covered = new Set([10, 18, 19, 20, 21, 23, 31, 38, 41, 42, 46, 47, 48, 54, 55, 57, 58, 60, 61, 62, 64, 66, 68]);
  const partial = new Set([9, 12, 15, 16, 22, 33, 36, 37, 39, 52, 53, 63, 71, 77]);
  const twoSafe = new Set([1, 6, 7, 8, 9, 10, 11, 12, 25, 29, 33, 36, 37, 38, 40, 41, 42, 57, 59, 60]);
  const twoLaws = new Set([2, 4, 5, 13, 14, 26, 27, 28, 39, 45, 54, 55, 58, 77, 81]);

  const rows = [
    [1, "Pre-drive vehicle adjustments", "启动车辆前的调整", "3", "59", "safe_driving"],
    [2, "Windshield and side-window requirements", "挡风玻璃与侧窗要求", "3", "38", "traffic_laws"],
    [3, "Bumper-height requirements", "保险杠高度要求", "3", "41", "traffic_laws"],
    [4, "Securing a load", "货物装载与固定", "3", "42", "traffic_laws"],
    [5, "Marking a projecting load", "超出车身货物的标记", "3", "42", "traffic_laws"],
    [6, "Drowsy-driving danger", "疲劳驾驶的危险", "5", "35", "safe_driving"],
    [7, "Responding to an aggressive driver", "应对威胁或攻击性驾驶者", "5", "36", "safe_driving"],
    [8, "Three categories of distracted driving", "分心驾驶的三种类型", "5", "34", "safe_driving"],
    [9, "Why texting is especially dangerous", "短信驾驶为何特别危险", "5", "34", "safe_driving"],
    [10, "Alcohol and safe driving", "饮酒与安全驾驶", "5", "35", "safe_driving"],
    [11, "Alcohol affects judgment first", "酒精最先影响判断力", "5", "35", "safe_driving"],
    [12, "Crash risk without a safety belt", "未系安全带的碰撞风险", "4", "27", "safe_driving"],
    [13, "Child-restraint age requirements", "儿童安全座椅年龄要求", "4", "27–28", "traffic_laws"],
    [14, "Responsibility for an unbelted minor", "未成年乘客未系安全带的责任", "4", "28", "traffic_laws"],
    [15, "Single broken white line", "单条白色虚线", "6", "43", "traffic_controls"],
    [16, "Double solid yellow and white lines", "双实黄线与双实白线", "6", "43–44", "traffic_controls"],
    [17, "Yellow line on the right", "右侧出现黄线", "6", "44", "traffic_controls"],
    [18, "Traffic-sign colors", "交通标志颜色", "6", "46", "traffic_controls"],
    [19, "Four-way-stop order", "四向停车通行顺序", "7", "47", "traffic_controls"],
    [20, "Steady and flashing red signals", "红灯与闪烁红灯", "7", "51–52", "traffic_controls"],
    [21, "Right turn on red", "红灯右转", "7", "51", "traffic_controls"],
    [22, "Green arrow with a red light", "红灯同时亮绿箭头", "7", "52", "traffic_controls"],
    [23, "Flashing yellow signal", "闪烁黄灯", "7", "52", "traffic_controls"],
    [24, "Railroad crossing without gates or lights", "无栏杆或信号灯的铁路道口", "7", "56–57", "traffic_controls"],
    [25, "Speed and force of impact", "车速与撞击力", "9", "60", "safe_driving"],
    [26, "Residential speed limit", "住宅区限速", "9", "68", "traffic_laws"],
    [27, "Limited-access-highway maximum speed", "受控高速公路最高限速", "9", "68", "traffic_laws"],
    [28, "Driving too slowly", "行驶过慢", "9", "68", "traffic_laws"],
    [29, "Making a smooth stop", "平稳停车步骤", "9", "68", "safe_driving"],
    [30, "Arm signals", "手势信号", "9", "69", "traffic_controls"],
    [31, "Turn-signal distance", "转弯信号距离", "9", "69", "traffic_controls"],
    [32, "Three-point turns", "三点掉头", "9", "70", "traffic_laws"],
    [33, "Open intersections and yielding", "开放式路口与让行", "9", "62", "safe_driving"],
    [34, "Proper use of the left lane", "左车道的正确使用", "9", "68–69", "traffic_laws"],
    [35, "Red reflectors facing you", "迎面看到红色反光标记", "9", "69", "traffic_controls"],
    [36, "Safe following distance", "安全跟车距离", "9", "61–62", "safe_driving"],
    [37, "When to increase following distance", "何时增加跟车距离", "9", "61–62", "safe_driving"],
    [38, "Blind spots", "盲区", "9", "60", "safe_driving"],
    [39, "Where passing is unlawful", "禁止超车的地点", "9", "67", "traffic_laws"],
    [40, "Stopping in an acceleration lane", "在加速车道停车", "9", "63", "safe_driving"],
    [41, "Missing an expressway exit", "错过高速公路出口", "9", "64–65", "safe_driving"],
    [42, "Highway breakdown position", "高速公路故障停车位置", "9", "64, 78", "safe_driving"],
    [43, "Parking distance from a curb", "距路缘的停车距离", "9", "65", "traffic_laws"],
    [44, "Transmission gear when parked", "停车时的挡位", "9", "65–66", "traffic_laws"],
    [45, "Where parking is prohibited", "禁止停车地点", "9", "66", "traffic_laws"],
    [46, "Wheel direction when parked uphill", "上坡停车车轮方向", "9", "65–66", "traffic_laws"],
    [47, "Wheel direction when parked downhill", "下坡停车车轮方向", "9", "65–66", "traffic_laws"],
    [48, "Yielding to pedestrians", "向行人停车或让行", "11", "87–88", "safe_driving"],
    [49, "Pedestrian with a white cane", "持白手杖的行人", "11", "88", "safe_driving"],
    [50, "Minimum clearance when passing a cyclist", "超越自行车的最小间距", "11", "81", "safe_driving"],
    [51, "Turning right across a bike lane", "穿越自行车道右转", "11", "81", "safe_driving"],
    [52, "Motorcyclists' rights and duties", "摩托车驾驶者的权利与责任", "11", "85", "safe_driving"],
    [53, "Sharing a lane with a motorcycle", "与摩托车共用车道", "11", "85", "safe_driving"],
    [54, "School bus on a divided highway", "分隔道路上的校车", "11", "89", "traffic_laws"],
    [55, "School bus traveling in your direction", "同方向行驶时遇校车", "11", "89", "traffic_laws"],
    [56, "Children and crossing guards", "儿童与校区过街协管员", "11", "89", "traffic_controls"],
    [57, "Emergency vehicle approaching from behind", "紧急车辆从后方接近", "11", "84", "safe_driving"],
    [58, "Florida Move Over Law", "佛州让道法", "9", "65", "traffic_laws"],
    [59, "Large-vehicle No Zones", "大型车辆盲区", "11", "82, 84", "safe_driving"],
    [60, "When headlights are required", "何时必须使用前照灯", "10", "71–73", "safe_driving"],
    [61, "Dimming for a vehicle ahead", "跟随车辆时调低远光灯", "10", "72–73", "safe_driving"],
    [62, "Dimming for oncoming traffic", "会车时调低远光灯", "10", "72–73", "safe_driving"],
    [63, "Lights for rain, fog, or smoke", "雨雾烟天气的灯光", "10", "71–72", "safe_driving"],
    [64, "Driving on wet roads", "湿滑路面驾驶", "10", "72", "safe_driving"],
    [65, "Right wheels leave the pavement", "右侧车轮驶离路面", "10", "79", "safe_driving"],
    [66, "Recovering from a skid", "车辆打滑时的处理", "10", "79", "safe_driving"],
    [67, "Emergency braking with ABS and conventional brakes", "ABS 与普通制动器紧急制动", "10", "40–41, 78", "safe_driving"],
    [68, "Tire blowout response", "爆胎处理", "10", "80", "safe_driving"],
    [69, "Minor crash blocking traffic", "轻微事故阻塞交通", "10", "77", "traffic_laws"],
    [70, "Hitting an unattended vehicle", "碰撞无人看管车辆", "10", "77", "traffic_laws"],
    [71, "Leaving a crash involving injury or death", "涉及伤亡事故后逃逸", "10", "77", "traffic_laws"],
    [72, "Florida No-Fault Law", "佛州无过错保险法", "4", "23–24", "traffic_laws"],
    [73, "Reinstatement after an insurance suspension", "保险违规停牌后的恢复", "4", "24", "traffic_laws"],
    [74, "Financial Responsibility Law penalties", "财务责任法处罚", "4", "24", "traffic_laws"],
    [75, "Learner-license time restrictions", "学习驾照时间限制", "3", "1, 25", "traffic_laws"],
    [76, "Time restrictions for drivers under 18", "18 岁以下驾驶时间限制", "3", "1, 25", "traffic_laws"],
    [77, "When a driver can be charged with DUI", "何时构成酒驾", "4", "25–26", "traffic_laws"],
    [78, "Refusing an implied-consent test", "拒绝默示同意检测", "4", "26", "traffic_laws"],
    [79, "Racing on a highway", "公路竞速", "4", "28–29", "traffic_laws"],
    [80, "Driving experience for a Class E license", "取得 E 类驾照所需驾驶经验", "3", "1, 8", "traffic_laws"],
    [81, "Required learner-license education", "学习驾照所需驾驶教育", "3", "8, 17", "traffic_laws"],
    [82, "Reporting health conditions", "报告影响驾驶的健康状况", "3", "9", "traffic_laws"],
    [83, "Basic Driver Improvement course", "基础驾驶改进课程", "3", "17–18", "traffic_laws"],
    [84, "Class E driving-test maneuvers", "E 类路考动作", "3", "20–21", "safe_driving"]
  ];

  const controlTargets = new Map([[15, 5], [16, 5], [17, 4], [18, 3], [19, 3], [20, 4], [21, 3], [22, 4], [23, 3], [24, 3], [30, 2], [31, 2], [35, 3], [56, 1]]);

  const topics = rows.map(([id, titleEn, titleZh, chapter, pages, examDomain]) => ({
    id,
    code: `FL-SG-${String(id).padStart(2, "0")}`,
    title: { en: titleEn, zh: titleZh },
    source: {
      authority: "FLHSMV",
      document: "Official Florida Driver License Handbook",
      edition: "08/2023",
      chapter,
      pages
    },
    examDomain,
    baseline: covered.has(id) ? "covered" : partial.has(id) ? "partial" : "missing",
    targetQuestionCount: controlTargets.get(id)
      || (examDomain === "safe_driving" ? (twoSafe.has(id) ? 2 : 1) : (twoLaws.has(id) ? 2 : 1))
  }));

  window.FLORIDA_STUDY_GUIDE_84 = Object.freeze(topics.map(Object.freeze));
})();
