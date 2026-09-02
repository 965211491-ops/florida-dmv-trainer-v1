# US DMV English Trainer V2.2

一个面向英语能力有限学习者的美国驾照知识考试训练器：先用中文理解规则，再通过中英对照和纯英文练习建立考试能力。

> 当前完整支持 Florida。California、Texas、New York 已预留为 Coming Soon。项目是独立学习工具，不是 DMV 或 FLHSMV 官方网站，练习题也不是官方考试原题。

## 技术栈

- HTML
- CSS
- Vanilla JavaScript
- localStorage
- GitHub Pages
- 无 npm、无后端、无第三方运行时依赖

## V2.2 功能

- Home Dashboard 与州选择，使用 `selectedState` 记住已选州
- Florida Class E 2026 学习主页
- 10 / 20 / 30 / 50 道随机练习
- 每道题的答案选项独立随机排列
- Bilingual 与 English Only 显示模式
- 错题本与 Wrong Answer Practice
- 连续答对 3 次的 Mastery 机制
- Road Sign Visual Practice 图片优先专项
  - 每轮默认约 80% 图片识别、20% 文字巩固
  - 图片题集中在第一阶段，文字题在后续阶段复习刚看过的标志
  - 答题后显示颜色、形状、含义和标志图片组成的视觉记忆卡
- 106 个美国及佛州手册道路标志 Knowledge Objects
- 228 道 FHWA / MUTCD / FLHSMV 道路标志训练题
  - 106 道图片识别题
  - 106 道含义 → 标志名称题
  - 16 道形状与颜色基础题
- 106 个独立 SVG 学习图，覆盖 regulatory、warning、school、railroad、guide、work zone
- 浏览器启动时自动执行道路标志题库完整性校验
- 50 道纯英文 Exam Simulator
  - 固定使用均衡学习蓝图：Traffic Laws 17、Safe Driving 17、Traffic Controls 16
  - Traffic Controls 内部继续平衡标志、标线、信号灯、车道信号和铁路/学校控制
  - 道路标志默认 4 道，硬上限 6 道，不再被大型标志题库挤占
  - 答题时不显示对错
  - 完成后统一评分
  - 当前练习通过线为 80%
- Florida Class E Core Expansion
  - 150 道新增 Florida 专属题：Traffic Laws 50、Safe Driving 55、Traffic Controls 45
  - 84 / 84 个 Chapter 11 Study Guide 考点均有题目映射
  - “官方 84 考点”页面显示题量、正确率、Not Practiced / Learning / Mastered
  - Topic Mastered 要求完成该考点全部核心题、正确率至少 80%、且没有未解决错题
- 27 个 Florida 交通控制原创 SVG
  - 15 个道路标线图
  - 9 个交通信号图
  - 3 个车道控制信号图
- `image_to_meaning`、`meaning_to_image`、`scenario_image`、`text` 四类题目
- 选项对象可包含图片与替代文字；道路标线题图像比例不低于 70%
- Progress 页面：累计答题、正确率、错题、已掌握和掌握百分比
- V1 localStorage 数据兼容迁移
- `image` / `scenario` 题型的响应式图片渲染支持
- mobile-first 布局，按钮触控高度不低于 44px

## 项目结构

```text
.
├── index.html
├── style.css
├── README.md
├── assets/
│   ├── icons/
│   ├── florida/
│   │   ├── markings/               # 15 个原创道路标线 SVG
│   │   ├── signals/                # 9 个原创交通信号 SVG
│   │   └── lane-signals/           # 3 个原创车道信号 SVG
│   └── signs/
│       ├── stop.svg
│       ├── yield.svg
│       └── ...                      # 106 个独立 SVG 学习图
├── data/
│   ├── questions.js                 # V1 Florida 题库，继续保留
│   ├── coverage/
│   │   └── florida-study-guide-84.js # 官方 84 考点覆盖矩阵
│   ├── knowledge/
│   │   └── signs.js                 # 106 个道路标志知识对象
│   ├── common/
│   │   ├── questions.js
│   │   ├── sign-question-factory.js
│   │   ├── signs-regulatory.js
│   │   ├── signs-warning.js
│   │   ├── signs-school.js
│   │   ├── signs-railroad.js
│   │   ├── signs-guide.js
│   │   ├── signs-work-zone.js
│   │   └── signs-foundations.js
│   └── states/
│       └── florida/
│           ├── questions.js         # Florida 题目 factory 与来源字段
│           ├── questions-laws.js    # Traffic Laws 50
│           ├── questions-safe-driving.js # Safe Driving 55
│           └── questions-controls.js # Traffic Controls 45
└── js/
    ├── config.js                     # 版本、州配置、考试参数
    ├── storage.js                    # localStorage、迁移、统计
    ├── data-loader.js                # 题库合并与 schema 归一化
    ├── data-validator.js             # ID、翻译、来源、选项等自动校验
    ├── quiz.js                       # 抽题、选项洗牌、答题 session
    └── app.js                        # 页面导航与 UI 渲染
└── scripts/
    ├── generate-sign-assets.rb       # 从知识库元数据生成 SVG 学习图
    └── sign-gallery.html             # 维护用 SVG 图库预览
```

## Florida Official Study Guide Coverage

V2.2 以 FLHSMV《Official Florida Driver License Handbook》rev. 08/2023 第 11 章的 84 个学习考点作为覆盖架构，并对照第 3–11 章定位答案页码。覆盖矩阵保存在 `data/coverage/florida-study-guide-84.js`，每个考点记录：

- 中英文自定义 topic title
- 手册章号与页码
- V2.2 前的 `covered` / `partial` / `missing` 审计结果
- `traffic_laws` / `safe_driving` / `traffic_controls` 考试域
- V2.2 目标题量

84 考点是内容覆盖框架，不代表本站复制了官方问题，也不代表模拟考试蓝图是 FLHSMV 公布的正式抽题比例。

## 来源核验与图片说明

道路标志名称、编号、类别、形状、颜色和含义优先依据：

- FHWA《Manual on Uniform Traffic Control Devices》，11th Edition with Revision 1，December 2025
- FHWA Standard Highway Signs 2024 phased releases（截至 2026-08-24）
- FLHSMV《The Official Florida Driver License Handbook》，rev. 08/2023，第 43–59 页；重点对照第 46–58 页交通标志、施工、铁路和学校标志图

Florida V2.2 题目还记录 `studyGuideItems`、`examDomain`、`difficulty`、章、节、页码、核验日期和 `verificationStatus`。时效性法规另附 Florida Legislature 或 FLHSMV 当前官方页面：

- `verified_2023_handbook_only`：已对照 08/2023 手册，但不冒充 2026 版手册
- `verified_current`：除手册外，已于记录日期对照当前官方法规或页面
- `needs_current_verification`：数字或规则可能变化，发布前仍需再次核验

特别注意：2025 年佛州法律修改了未成年人学习驾照的驾驶教育课程要求。因此 V2.2 将未成年人 learner-license 课程与成年首次申请者的 TLSAE 要求分开处理，不沿用 2023 手册的旧概括。

`assets/signs/` 内 SVG 是依据上述规范重新绘制的学习图，不是用于标志制造的工程图。每个知识对象均保留 `authority`、`document`、`edition`、`section`、`page`、`verifiedDate`、`status` 和官方 URL。

页面加载后可以在浏览器控制台查看：

```js
window.DMV_DATA_VALIDATION
```

正常结果应为 `valid: true`，并额外报告 150 道 V2.2 Florida 题、84 / 84 覆盖、三大域题量、道路标线图像比例和来源核验状态。

项目使用普通 `<script>` 按顺序加载，因此可以直接双击 `index.html`，也可以通过本地静态服务器运行。

## 本地运行

在项目目录中运行：

```bash
python3 -m http.server 8000
```

打开：

```text
http://localhost:8000
```

测试手机时，让手机与电脑连接同一个 Wi-Fi，再访问：

```text
http://电脑的局域网IP:8000
```

## localStorage 与 V1 迁移

V1 的两个 key 保持不变：

```text
fl-dmv-progress-v1
fl-dmv-wrong-v1
```

V2 新增：

```text
us-dmv-metrics-v2
selectedState
```

首次进入 V2 时，`storage.js` 会读取旧进度与错题记录：

- 保留 streak、mastered、totalCorrect 和错题次数
- 使用现有可确认的数据计算一个保守的历史答题数
- 后续每次答题准确记录 totalAnswered / totalCorrect
- 只有在没有 V2 metrics 时才执行迁移

由于 V1 没有完整记录历史答错总数，被掌握后已从错题本删除的早期错误无法追溯，因此旧用户首次看到的累计答题数可能略低于真实值，但不会丢失现有错题和掌握状态。

## Question schema

新题建议使用：

```js
{
  id: "US-SIGN-001",
  state: "ALL",
  scope: "federal", // federal | multi_state_common | state
  category: "road_sign",
  subcategory: "regulatory",
  examDomain: "traffic_controls", // traffic_laws | safe_driving | traffic_controls
  difficulty: "basic", // basic | intermediate | application
  studyGuideItems: [20],
  type: "image_to_meaning", // image_to_meaning | meaning_to_image | scenario_image | text
  question: {
    en: "What does this sign mean?",
    zh: "这个交通标志是什么意思？"
  },
  options: [
    { en: "Stop", zh: "停车", image: "assets/florida/signals/steady-red.svg", imageAlt: "Steady red traffic signal" },
    { en: "Yield", zh: "让行" },
    { en: "No entry", zh: "禁止进入" },
    { en: "School zone", zh: "学校区域" }
  ],
  correctIndex: 0,
  explanation: {
    en: "...",
    zh: "..."
  },
  keywords: [
    { en: "yield", zh: "让行" }
  ],
  image: null,
  source: {
    authority: "FHWA",
    document: "MUTCD",
    edition: "11th Edition",
    section: null,
    page: null,
    verifiedDate: "2026-08-24",
    verificationStatus: "verified_2023_handbook_only"
  }
}
```

Scope 使用原则：

- `federal`：确有联邦标准依据，例如经核验的 MUTCD 标准内容
- `multi_state_common`：多个州普遍相同，但不是全国统一法律
- `state`：州法规、州考试要求或州专属数字

不要因为一条规则“很常见”就把它标成 `federal`。

## 添加普通题目

1. 通用题加入 `data/common/questions.js` 的 `window.COMMON_QUESTIONS`。
2. Florida 专属题加入 `data/states/florida/questions.js` 的 `window.STATE_QUESTIONS.FL`。
3. 使用全局唯一 ID，例如 `US-SIGN-001` 或 `FL-LAW-001`。
4. 保留中英文题目、选项、解释和 keywords。
5. 填写可核验的官方 source；未经核验的内容不要标记为 verified。
6. 在浏览器中确认题目、随机选项、正确答案和错题记录。

## 添加图片题

把可合法使用的 SVG 或图片放入 `assets/signs/` 或 `assets/illustrations/`，然后设置：

```js
{
  type: "image",
  image: "assets/signs/stop.svg",
  imageAlt: "Red octagonal STOP sign"
}
```

道路情景题可以使用：

```js
{
  type: "scenario",
  image: "assets/illustrations/right-of-way-001.svg"
}
```

Renderer 支持题干图片和四个答案选项分别带图；没有图片时保持普通文字题布局。

## 添加新州

1. 在 `js/config.js` 的 `STATES` 增加州配置。
2. 创建 `data/states/<state>/questions.js`。
3. 在该文件中建立 `window.STATE_QUESTIONS.XX` 数组。
4. 在 `index.html` 中、`data-loader.js` 之前加载新题库脚本。
5. 题目使用州代码和 `scope: "state"`。
6. 题库和功能验证完成后，把 `available` 改为 `true`。

Loader 会组合：

```text
COMMON_QUESTIONS + STATE_QUESTIONS[selectedState]
```

Florida 目前还会额外加载原有 `data/questions.js`，用于兼容 V1 的 79 道题与历史 ID。

## Git workflow

V2.2 在长期保留分支中开发：

```bash
git switch v2.2-florida-complete
```

完成并通过测试后提交和推送该分支，再合并到 `main`。合并完成后仍保留 `v2.2-florida-complete`，用于版本回溯：

```bash
git add .
git commit -m "Expand Florida Class E coverage for V2.2"
git push origin v2.2-florida-complete
```

## GitHub Pages

项目不需要构建步骤。仓库中选择：

```text
Settings → Pages → Deploy from a branch → main → / (root)
```

脚本和资源都使用相对路径，因此可部署在 `https://username.github.io/repository-name/` 这样的项目子路径中。

## 发布前测试清单

- 州选择与 Change State
- selectedState 刷新后保留
- 10 / 20 / 30 / 50 随机练习
- 答案随机排列和 score
- Bilingual / English Only
- Wrong Answers 与错题专项
- Mastered 连续 3 次与答错退出
- Road Sign Practice 真实进入题目
- Exam Simulator 延迟反馈、50 题、80% 判定
- Exam Simulator 实际抽题为 17 / 17 / 16，道路标志不超过 6
- 官方 84 考点页面与单考点练习
- Topic Mastered 的完成度、80% 正确率和 unresolved wrong 条件
- 题干图片、选项图片及替代文字
- 15 / 9 / 3 个 Florida SVG 均能加载
- 150 道新增题、84 / 84 覆盖、来源页码和核验状态校验
- Progress 统计
- V1 数据迁移
- 375px、390px、430px、iPad 和桌面布局
- 浏览器 console 无错误
- GitHub Pages 子路径下资源正常加载

## 后续建议

- 在 V2.2 覆盖与均衡抽题稳定后，再考虑 Weak Vocabulary、薄弱主题循环和更多州。
