# 💪 灵动健身 (FlexWorkout)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/KingMario/workout-timer)

一个现代化的办公与锻炼计时器，旨在帮助用户在工作中保持活力，并在居家锻炼时提供专业的引导。

## 🚀 技术栈

- **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **表单与校验**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **音频与语音**: Web Audio API (自定义提示音) & Web Speech API (TTS 播报)
- **测试**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **其他**: NoSleep.js (保持屏幕常亮)

## ✨ 详细功能

### 1. 专注锻炼模式 (Workout Mode)

- **科学分段**: 包含热身、力量训练、有氧、放松四个完整阶段。
- **动态循环**: 支持对特定训练阶段进行循环次数调整（如力量训练进行 2 组）。
- **语音引导**: 全程 TTS 语音播报动作名称与要领，无需时刻盯着屏幕。
- **交互控制**: 支持点击动作列表直接跳转，支持键盘空格键即时启停。

### 2. 办公间歇拉伸 (Periodic Mode)

- **自动化循环**: 可设置 15、30、45、60 分钟提醒频率。
- **智能推荐**: 每次提醒从 31 个精选拉伸动作池中随机抽取 3 个动作。
- **无感运行**: 计时器在后台持续运行，即使切换到锻炼模式也不会中断。
- **沉浸式体验**: 锁屏状态下依然可以通过 Media Session 查看当前动作进度。

### 3. AI 定制计划 (Custom Plan)

- **智能助手集成**: 提供结构化的提示词（Prompt），用户只需将 AI 生成的 JSON 粘贴回应用即可一键应用。
- **计划管理**: 支持保存多个自定义计划，支持重命名、删除及一键恢复系统默认计划。
- **数据持久化**: 所有自定义计划均存储于本地 LocalStorage，无隐私泄露风险。

### 4. 极致交互体验 (User Experience)

- **深色模式**: 自动适配系统主题，保护视力。
- **屏幕常亮**: 在锻炼过程中自动锁定屏幕不熄灭。
- **快捷键支持**:
  - `Space`: 开始 / 暂停
  - `Esc`: 重置当前练习 / 关闭弹窗
- **全平台适配**: 完美支持移动端浏览器，修复了非安全环境下 `crypto` 随机数的兼容性问题。

## 🧪 测试与质量

- 拥有超过 40 个单元测试与集成测试用例。
- 核心业务逻辑覆盖率达到 **84%** 以上。
- 严格遵循 React Hooks 规则与 ESLint 规范。

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

### 运行测试

```bash
npm test          # 基础测试
npm run test:ui   # 交互式测试界面
npm run coverage  # 查看覆盖率报告
```

## 📄 开源协议

[MIT License](LICENSE) - Copyright (c) 2026-2027 MarioStudio
