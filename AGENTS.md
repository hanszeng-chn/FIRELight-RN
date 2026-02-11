# Repository Guidelines

## 项目定位（SDD）
- 本仓库是一个 SDD（Specification-Driven Development）项目。
- 所有功能规格、交互与设计规范都在 `docs/` 目录下（例如 `docs/PRDS/`、`docs/design-system/firelight-mvp/`、`docs/PLANS/`）。
- 开发前先阅读对应规格，优先以文档为准，再进行实现与调整。

## 项目结构与模块组织
- `app/`: Expo Router 入口与路由文件（例如 `app/index.tsx`, `app/_layout.tsx`）。
- `src/`: 业务代码。
  - `components/`, `hooks/`, `services/`, `stores/`, `utils/`, `types/`, `theme/`, `modules/`, `config/`。
- `docs/`: 规格与设计文档（SDD 核心）。
- 配置：`app.json`, `metro.config.js`, `tsconfig.json`, `eslint.config.js`。

## 构建、测试与开发命令
- `npm run start`: 启动 Expo 开发服务器。
- `npm run android`: 在 Android 模拟器/设备运行。
- `npm run ios`: 在 iOS 模拟器运行。
- `npm run web`: 运行 Web 版本。
- `npm run lint`: 运行 ESLint。
- `npm run reset-project`: 重置脚手架与示例目录。

## 代码风格与命名规范
- 语言：TypeScript + React Native（Expo）。
- 缩进：2 空格，保持与现有代码一致。
- 命名：组件/类型用 `PascalCase`，函数/变量用 `camelCase`；路由文件遵循 Expo Router 约定。
- Lint：使用 `eslint.config.js`（Expo flat config），提交前确保 `npm run lint` 通过。
- NativeWind/Tailwind 配置位于 `tailwind.config.js` 与 `global.css`，新增样式规范请同步维护。

## 组件复用策略
- 新增 UI 时，优先复用 `gluestack-ui` 已有组件，避免重复造轮子。
- 若当前仓库未引入目标组件，先使用 Context7 查询 `gluestack-ui` 官方文档确认是否可直接引入。
- 确认可引入后，先告知用户需要引入的组件与依赖，待用户确认后再继续后续实现。

## 测试规范
- 当前未配置自动化测试框架。
- 若新增测试：建议使用 `__tests__/` 或 `*.test.ts(x)`，并在此文档补充运行方式与覆盖要求。

## 提交与 PR 要求
- 提交信息风格参考历史：`feat: ...`、`refactor: ...`、`chore: ...`，可加 scope（如 `feat(stores): ...`）。
- PR 需包含：变更说明、关联 issue（如有）、UI 变更截图/录屏。
- 保持 PR 聚焦，避免混合无关改动。

## 配置与数据注意事项
- 状态管理：Zustand；本地存储：`expo-sqlite`。
- 进行架构调整前，先核对 `docs/technology-stack-selection.md` 与相关规格。
