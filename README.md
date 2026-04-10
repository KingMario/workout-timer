# 💪 灵动健身 (FlexWorkout)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/KingMario/workout-timer)

一个现代化的办公与锻炼计时器，旨在帮助用户在工作中保持活力，并在居家锻炼时提供专业的引导。

## 🚀 技术栈

- **框架**: [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **表单与校验**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **测试**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **AI 模型集成**: 支持 OpenAI 标准接口 (DeepSeek, ChatGPT, Ollama 等)
- **音频与语音**: Web Audio API (自定义提示音) & Web Speech API (TTS 播报)
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

### 3. AI 智能定制 (Custom Plan Wizard)

- **✨ 自动生成 (AI)**: 支持配置 API Key 和 Base URL，一键调用 AI 模型自动生成专业的 JSON 健身计划。
- **智能助手集成 (手动模式)**: 提供结构化的提示词（Prompt），用户只需将提示词复制到网页版 AI 工具（如 DeepSeek, ChatGPT），然后将 AI 生成的 JSON 粘贴回应用即可一键应用。
- **模型自动发现**: 动态从 API 接口获取并展示可用模型列表，支持本地 Ollama 自动发现。
- **TTS 专项优化**: 为 AI 生成的动作描述增加了自然语言指令，确保语音教练听起来更专业、更具温情。

### 4. 计划管理与持久化 (Storage)

- **收藏库**: 支持保存多个自定义计划，方便快速切换。
- **重命名功能**: 随时修改计划名称，让收藏列表更清晰。
- **本地存储**: 所有计划与 API 配置均安全存储于浏览器的 LocalStorage 中，完全保护个人隐私。

### 5. 极致交互体验 (UX)

- **全平台适配**: 完美支持桌面端与移动端浏览器。
- **深色模式**: 自动适配系统主题。
- **屏幕常亮**: 在锻炼过程中自动锁定屏幕不熄灭。
- **快捷键支持**:
  - `Space`: 开始 / 暂停
  - `Esc`: 重置当前练习 / 关闭弹窗 / 退出全屏

## 🧪 测试与质量

- 拥有超过 **110** 个单元测试与集成测试用例，确保核心流程稳健。
- 采用模块化架构，核心组件（如 `CustomPlanWizard`）覆盖率达到 **90%** 以上。
- 严格遵循 React Hooks 规则与现代前端工程化最佳实践。

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 配置 AI (可选)

在应用内点击“新建计划” -> “⚙️ 设置 AI API”，您可以填入您的 API 配置。

- **DeepSeek**: `https://api.deepseek.com`
- **OpenAI**: `https://api.openai.com/v1`
- **本地 Ollama**: `http://localhost:11434` (程序会自动处理跨域及路径补全)

### 运行开发服务器

```bash
npm run dev
```

### 运行测试

```bash
npm test          # 运行所有测试
npm run coverage  # 查看覆盖率报告
```

## 📄 开源协议

[MIT License](LICENSE) - Copyright (c) 2026-2027 MarioStudio
