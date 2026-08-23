# Florida DMV 英文刷题训练器 V1

这是一个适合刚开始学习 VS Code、Git、GitHub 的纯前端小项目。

## 技术栈

- HTML
- CSS
- JavaScript
- 不用 React
- 不用数据库
- 不用 npm
- 不用服务器
- 可以部署到 GitHub Pages

## V1 已完成功能

1. **中英对照**
   - 英文题目
   - 中文翻译
   - 英文 + 中文选项
   - 答题后中英解释与关键词
   - 可以随时切换成纯英文

2. **随机 50 题**
   - 当前练习题库共 79 题
   - 每一轮随机抽取 50 题
   - 同一轮不会重复
   - 每道题的 A/B/C/D 选项会随机排列，正确答案会同步更新

3. **分数**
   - 顶部实时显示当前得分
   - 50 题完成后显示最终成绩和正确率建议

4. **错题本**
   - 答错自动加入错题本
   - 显示累计错误次数
   - 使用浏览器 localStorage 保存
   - 刷新网页、关闭后重新打开仍然保留
   - 一道错题达到“已掌握”后自动从错题本移除

5. **掌握题数量**
   - 同一道题连续答对 3 次 → 已掌握
   - 一旦答错 → 连续正确次数归零，并退出已掌握
   - 顶部显示：已掌握数量 / 总题数

## 文件结构

```text
florida-dmv-trainer-v1/
├── index.html
├── style.css
├── app.js
├── README.md
└── data/
    └── questions.js
```

## 最简单的打开方法

### 方法 1：直接打开

1. 解压 ZIP
2. 用 VS Code 打开 `florida-dmv-trainer-v1` 文件夹
3. 找到 `index.html`
4. 在 Finder 中双击 `index.html`

V1 的题库使用普通 JavaScript 文件，所以直接打开也可以工作。

### 方法 2：Live Server（以后推荐）

在 VS Code Extensions 中搜索：

```text
Live Server
```

安装后：

1. 右键 `index.html`
2. 选择 `Open with Live Server`

## 第一次用 Git 保存项目

在 VS Code Terminal 中运行：

```bash
git init
git add .
git commit -m "Build Florida DMV trainer v1"
```

然后在 GitHub 创建一个空仓库，再把 GitHub 给你的 remote / push 命令复制到 Terminal。

## 部署到 GitHub Pages

Push 到 GitHub 后：

1. 打开 GitHub 仓库
2. Settings
3. Pages
4. Source 选择 `Deploy from a branch`
5. Branch 选择 `main`
6. Folder 选择 `/ (root)`
7. Save

之后 GitHub 会提供一个网页地址，手机也可以直接打开刷题。

## 题库重要说明

当前 `data/questions.js` 中的题目属于 **练习版改写题**。

它们用来先完成：

- 网站功能
- 中英学习流程
- 随机抽题
- 错题记录
- 掌握算法

**不声称这些题是 FLHSMV 考试后台原题。**

每道题已经预留：

```text
source
sourcePage
sourceStatus
```

下一步可以把题库逐题根据 2026 FLHSMV 官方 Driver Handbook / Study Guide 做严格核对，并补充页码与来源状态。

## 下一版推荐功能

- 逐题核对并扩充 2026 官方知识点题库
- 只刷错题
- 按章节刷题
- 英文高频词统计
- 薄弱词专项训练
- 真正考试模式：50 题全英文、答完统一出结果
- 学习记录导出 / 导入
