import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = globalThis;

const dataFiles = [
  "data/questions.js",
  "data/common/questions.js",
  "data/knowledge/signs.js",
  "data/common/sign-question-factory.js",
  "data/common/signs-regulatory.js",
  "data/common/signs-warning.js",
  "data/common/signs-school.js",
  "data/common/signs-railroad.js",
  "data/common/signs-guide.js",
  "data/common/signs-work-zone.js",
  "data/common/signs-foundations.js",
  "data/coverage/florida-study-guide-84.js",
  "data/states/florida/questions.js",
  "data/states/florida/questions-safe-driving.js",
  "data/states/florida/questions-laws.js",
  "data/states/florida/questions-controls.js",
  "js/config.js",
  "js/data-loader.js",
  "js/quiz.js"
];

for (const relativePath of dataFiles) {
  vm.runInThisContext(fs.readFileSync(path.join(root, relativePath), "utf8"), { filename: relativePath });
}

const errors = [];
const warnings = [];
const raw = globalThis.STATE_QUESTIONS.FL.filter((question) => question.id.startsWith("FL-V22-"));
const bank = globalThis.DMV_DATA.getQuestionBank("FL");
const topics = globalThis.FLORIDA_STUDY_GUIDE_84;

function repeated(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const value = selector(item);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1);
}

function stemWords(stem) {
  return new Set(String(stem).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 2));
}

function similarity(first, second) {
  const a = stemWords(first);
  const b = stemWords(second);
  const intersection = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

repeated(bank, (question) => question.id).forEach(([id]) => errors.push(`Duplicate ID: ${id}`));
repeated(bank, (question) => question.question.en.trim().toLowerCase()).forEach(([stem]) => errors.push(`Duplicate stem: ${stem}`));

for (let first = 0; first < raw.length; first += 1) {
  for (let second = first + 1; second < raw.length; second += 1) {
    const score = similarity(raw[first].question.en, raw[second].question.en);
    if (score >= 0.9) warnings.push(`Near-duplicate stems (${score.toFixed(2)}): ${raw[first].id} / ${raw[second].id}`);
  }
}

for (const question of raw) {
  if (question.options.length !== 4) errors.push(`Options != 4: ${question.id}`);
  if (question.correctIndex !== 0) errors.push(`Invalid raw correctIndex: ${question.id}`);
  if (new Set(question.options.map((option) => option.en.toLowerCase())).size !== 4) errors.push(`Repeated option: ${question.id}`);
  if (!question.source.page || !question.source.chapter || !question.source.section) errors.push(`Missing source location: ${question.id}`);
  if (!question.source.verifiedDate || !question.source.verificationStatus) errors.push(`Missing verification metadata: ${question.id}`);
  if (question.source.verificationStatus === "verified_current" && !question.source.currentOfficialSource?.url) errors.push(`Missing current URL: ${question.id}`);
  for (const image of [question.image, ...question.options.map((option) => option.image)].filter(Boolean)) {
    if (!fs.existsSync(path.join(root, image))) errors.push(`Broken image: ${question.id} -> ${image}`);
  }
}

const domains = raw.reduce((counts, question) => {
  counts[question.examDomain] = (counts[question.examDomain] || 0) + 1;
  return counts;
}, {});
if (raw.length !== 150) errors.push(`Florida V2.2 count: ${raw.length}`);
if (domains.traffic_laws !== 50 || domains.safe_driving !== 55 || domains.traffic_controls !== 45) errors.push(`Domain counts: ${JSON.stringify(domains)}`);

const covered = new Set(raw.flatMap((question) => question.studyGuideItems));
if (topics.length !== 84 || covered.size !== 84) errors.push(`Study Guide coverage: ${covered.size}/${topics.length}`);
for (const topic of topics) {
  if (!covered.has(topic.id)) errors.push(`Uncovered topic: ${topic.id}`);
}

const roadMarkings = raw.filter((question) => question.category === "road_marking");
const visualRoadMarkings = roadMarkings.filter((question) => question.image || question.options.some((option) => option.image));
const roadMarkingVisualRatio = Math.round((visualRoadMarkings.length / roadMarkings.length) * 100);
if (roadMarkingVisualRatio < 70) errors.push(`Road marking visual ratio: ${roadMarkingVisualRatio}%`);

let observedExam = null;
for (let run = 0; run < 25; run += 1) {
  const exam = globalThis.DMV_QUIZ.buildBalancedExamSet(bank);
  const distribution = exam.reduce((counts, question) => {
    counts[question.examDomain] = (counts[question.examDomain] || 0) + 1;
    if (question.category === "road_sign") counts.road_signs = (counts.road_signs || 0) + 1;
    return counts;
  }, {});
  observedExam = distribution;
  if (exam.length !== 50
    || distribution.traffic_laws !== 17
    || distribution.safe_driving !== 17
    || distribution.traffic_controls !== 16
    || distribution.road_signs > 6) errors.push(`Invalid exam run ${run + 1}: ${JSON.stringify(distribution)}`);
}

const verification = raw.reduce((counts, question) => {
  const status = question.source.verificationStatus;
  counts[status] = (counts[status] || 0) + 1;
  return counts;
}, {});

const assetCounts = {
  markings: fs.readdirSync(path.join(root, "assets/florida/markings")).filter((file) => file.endsWith(".svg")).length,
  signals: fs.readdirSync(path.join(root, "assets/florida/signals")).filter((file) => file.endsWith(".svg")).length,
  laneSignals: fs.readdirSync(path.join(root, "assets/florida/lane-signals")).filter((file) => file.endsWith(".svg")).length
};

console.log(JSON.stringify({
  valid: errors.length === 0,
  errors,
  warnings,
  summary: {
    totalBank: bank.length,
    newFloridaQuestions: raw.length,
    domains,
    studyGuideCoverage: `${covered.size}/${topics.length}`,
    roadMarkingVisualRatio,
    verification,
    assetCounts,
    observedExam
  }
}, null, 2));

if (errors.length) process.exitCode = 1;
