# FIRELight Design System

## 🎨 Design Tokens

### 1. Colors (颜色)

#### Palette (基础色板)
- **Primary (主色)**: `#007AFF` (iOS Blue) - 用于强调、按钮、选中状态
- **Secondary (次色)**: `#5856D6` (Purple) - 用于辅助标识
- **Success (成功)**: `#34C759` (Green) - 用于收入、完成状态
- **Danger (危险)**: `#FF3B30` (Red) - 用于支出、删除、错误
- **Warning (警告)**: `#FF9500` (Orange) - 用于提示
- **Info (信息)**: `#AF52DE` (Indigo)

#### Backgrounds (背景)
- **Background**: `#FFFFFF` (Light) / `#000000` (Dark)
- **Secondary Background**: `#F2F2F7` (Light) / `#1C1C1E` (Dark) - 用于卡片、列表项
- **Tertiary Background**: `#E5E5EA` (Light) / `#2C2C2E` (Dark) - 用于分割线、输入框背景

#### Text (文本)
- **Text Primary**: `#000000` (Light) / `#FFFFFF` (Dark)
- **Text Secondary**: `#8E8E93` (Gray) - 用于次要信息、备注
- **Text Tertiary**: `#C7C7CC` (Light Gray) - 用于占位符

### 2. Typography (排版)

基于 iOS Human Interface Guidelines。

- **Large Title**: 34px / Bold
- **Title 1**: 28px / Bold
- **Title 2**: 22px / Bold (用于 Section Header)
- **Title 3**: 20px / Semibold (用于卡片标题)
- **Headline**: 17px / Semibold (用于列表主要信息)
- **Body**: 17px / Regular (用于正文)
- **Callout**: 16px / Regular
- **Subhead**: 15px / Regular
- **Footnote**: 13px / Regular (用于辅助说明)
- **Caption 1**: 12px / Regular
- **Caption 2**: 11px / Regular

### 3. Spacing (间距)

使用 4px 网格系统。

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px (标准内边距)
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px

### 4. Radius (圆角)

- **sm**: 4px
- **md**: 8px
- **lg**: 12px (卡片标准圆角)
- **xl**: 16px
- **full**: 9999px (圆形按钮/头像)

### 5. Shadows (阴影)

- **sm**: `0 1px 2px rgba(0,0,0,0.05)`
- **md**: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`
- **lg**: `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`

---

## 🧩 Components (组件库)

本项目基于 **React Native Paper** 组件库开发。
需要通过自定义 Theme 来覆盖 Paper 的默认样式，以匹配上述 Design Tokens。

### 核心组件映射
- **Button**: 使用 `Paper.Button`，定制 `roundness` 和 `colors`。
- **Input**: 使用 `Paper.TextInput`，定制 `colors.background` 和 `roundness`。
- **Card**: 使用 `Paper.Card`。
- **Text**: 使用 `Paper.Text`，对应 Typography 变体。
- **Icon**: 使用 `Paper.IconButton` 或 `Vector Icons`。

---

## 📐 Layout Rules (布局规则)

- **Safe Area**: 所有页面内容必须包含在 Safe Area 内。
- **Container Padding**: 页面水平标准内边距为 `spacing.lg (16px)`。
- **Grid**: 分类选择使用网格布局，每行 4 个 Item。
