# FIRELight MVP 开发计划

> 基于 PRD-MVP.md 和 DESIGN-SYSTEM.md 制定的详细开发任务清单

## 📊 项目概览

- **目标**: 实现纯客户端记账系统，满足收支条目管理
- **技术栈**: React Native + Expo + TypeScript + Zustand + SQLite + React Native Paper
- **目标平台**: Android (首发) + Web

---

## 🏗️ Phase 1: 项目基础设施 (Foundation)

### 1.1 依赖安装
- [x] 安装 Zustand 状态管理库
- [x] 安装 expo-sqlite 本地数据库
- [x] 安装 React Native Paper UI 组件库
- [x] 安装 react-native-safe-area-context (Paper 依赖)
- [x] 安装 uuid 生成唯一 ID

### 1.2 主题配置
- [x] 根据 DESIGN-SYSTEM.md 配置 Design Tokens
  - [x] 颜色系统 (Primary, Success, Danger 等)
  - [x] 排版系统 (Typography)
  - [x] 间距系统 (Spacing)
  - [x] 圆角系统 (Radius)
  - [x] 阴影系统 (Shadows)
- [x] 配置 React Native Paper 主题
- [x] 创建 Light/Dark 主题切换支持

### 1.3 项目结构
- [x] 创建 `src/services/` 目录 (数据库服务)
- [x] 创建 `src/types/` 目录 (TypeScript 类型定义)
- [x] 创建 `src/utils/` 目录 (工具函数)
- [x] 创建 `src/components/` 目录 (可复用组件)
- [x] 创建 `src/hooks/` 目录 (自定义 Hooks)

---

## 💾 Phase 2: 数据层 (Data Layer)

> 📝 **设计说明**: 数据模型预留多账本支持，MVP 阶段使用默认账本，后续可无缝扩展

### 2.1 类型定义
- [x] 定义 `Ledger` 类型 (账本 - 为多账本预留)
  ```typescript
  interface Ledger {
    id: string;           // UUID
    name: string;         // 账本名称
    icon: string;         // 图标标识 (emoji 或首字符)
    color: string;        // 主题色 (hex)
    is_default: boolean;  // 是否为默认账本
    sort_order: number;   // 排序
    created_at: string;
    updated_at: string;
  }
  ```
- [x] 定义 `Transaction` 类型 (收支条目)
  ```typescript
  interface Transaction {
    id: string;           // UUID
    ledger_id: string;    // 所属账本 ID (外键)
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
    date: string;         // ISO date string
    note: string;
    created_at: string;
    updated_at: string;
  }
  ```
- [x] 定义 `Category` 类型 (分类 - 全局共享)
  ```typescript
  interface Category {
    id: string;
    name: string;
    icon: string;         // 首字符自动生成
    type: 'income' | 'expense';
    is_system: boolean;   // 系统预设 vs 自定义
    is_active: boolean;   // 启用/停用
    sort_order: number;
    created_at: string;
    updated_at: string;
  }
  ```

### 2.2 数据库服务
- [x] 初始化 SQLite 数据库
- [x] 创建 `ledgers` 表 (预留多账本)
- [x] 创建 `transactions` 表 (含 `ledger_id` 外键)
- [x] 创建 `categories` 表 (全局共享，不绑定账本)
- [x] 实现数据库迁移机制
- [x] 初始化默认账本 ("默认账本", is_default=true)
- [x] 预置系统默认分类数据 (采用 JSON 配置 + 启动同步方案)
  - 支出: 餐饮、交通、购物、居住、娱乐、医疗、教育、人情
  - 收入: 工资、奖金、投资收益、其他

### 2.3 Zustand Store
- [ ] 创建 `ledgerStore` (账本管理 - MVP 简化版)
  - [ ] `currentLedgerId` - 当前账本 ID
  - [ ] `getDefaultLedger()` - 获取默认账本
- [ ] 创建 `transactionStore` (条目管理)
  - [ ] `addTransaction()` - 添加条目 (自动关联当前账本)
  - [ ] `updateTransaction()` - 更新条目
  - [ ] `deleteTransaction()` - 删除条目
  - [ ] `getTransactionsByMonth()` - 按月查询 (当前账本)
- [ ] 创建 `categoryStore` (分类管理 - 全局)
  - [ ] `getActiveCategories()` - 获取启用分类
  - [ ] `addCategory()` - 新增分类
  - [ ] `updateCategory()` - 更新分类
  - [ ] `toggleCategoryStatus()` - 启用/停用
  - [ ] `reorderCategories()` - 排序
  - [ ] `cleanupUnusedCategories()` - 自动清理

---

## 🎨 Phase 3: 核心功能 - 首页概览 (Dashboard)

### 3.1 页面布局
- [ ] 实现页面 Header (FIRELight 标题)
- [ ] 实现月份选择器组件
  - [ ] 年月下拉选择 UI
  - [ ] 月收入/支出汇总显示
- [ ] 实现按日期分组的条目列表
  - [ ] SectionList 组件
  - [ ] 日期 Header (日期 + 当日收支统计)
  - [ ] 条目 Item (图标 + 分类名 + 金额)

### 3.2 交互逻辑
- [ ] 默认加载最新有数据的月份
- [ ] 月份切换时刷新数据
- [ ] 实现空状态 UI ("本月暂无账目，快记一笔吧")

### 3.3 FAB 悬浮按钮
- [ ] 实现右下角悬浮按钮 (+ 记一笔)
- [ ] 点击跳转至记账页面

---

## ✏️ Phase 4: 核心功能 - 记一笔 (Add Transaction)

### 4.1 页面结构
- [ ] 实现页面 Header (返回按钮 + Tab 切换)
- [ ] 实现收入/支出 Tab 切换
- [ ] 实现分类网格 (4列布局)
  - [ ] 分类图标 + 名称
  - [ ] 最后一项为 "设置" 入口

### 4.2 数字键盘 (Bottom Sheet)
- [ ] 实现弹出式输入模块
- [ ] 金额显示区域 (大字号)
- [ ] 备注输入框
- [ ] 数字键盘布局
  - [ ] 数字键 0-9 和小数点
  - [ ] 回退键 (Backspace)
  - [ ] 完成键 (OK)
  - [ ] 日期选择键 (今天 / 具体日期)
- [ ] 日期选择器 (DatePicker)

### 4.3 业务逻辑
- [ ] 点击分类触发弹出键盘
- [ ] 金额校验 (> 0)
- [ ] 提交后保存数据
- [ ] 提交成功后返回首页并刷新

---

## 🗂️ Phase 5: 核心功能 - 分类管理 (Category Management)

### 5.1 页面结构
- [ ] 实现页面 Header (返回 + 标题)
- [ ] 实现收入/支出 Tab 切换
- [ ] 实现启用中列表 (可拖拽排序)
  - [ ] 拖拽排序 Handle
  - [ ] 分类图标 + 名称
  - [ ] 编辑按钮 (仅自定义)
  - [ ] 停用/删除按钮
- [ ] 实现已停用列表 (置灰)
  - [ ] 恢复按钮

### 5.2 新增/编辑弹窗
- [ ] 实现 Bottom Sheet 弹窗
- [ ] 名称输入框
- [ ] 图标预览 (首字符自动生成)
- [ ] 确认按钮
- [ ] 名称校验 (不为空、不重复)

### 5.3 业务逻辑
- [ ] 拖拽排序保存
- [ ] 停用逻辑 (系统分类 / 有数据的自定义分类)
- [ ] 删除逻辑 (无数据的自定义分类)
- [ ] 恢复分类
- [ ] 进入页面时自动清理无用分类 (GC)

---

## 🧹 Phase 6: 收尾完善 (Polish)

### 6.1 导航配置
- [ ] 配置路由结构 (Expo Router file-based routing)
- [ ] 添加 `app/add-transaction.tsx` 记账页面路由
- [ ] 添加 `app/category-management.tsx` 分类管理页面路由

### 6.2 用户体验
- [ ] 添加 Haptic 反馈 (按钮点击、拖拽等)
- [ ] 添加加载状态 (Loading Spinner)
- [ ] 添加 Toast 提示 (操作成功/失败)
- [ ] 添加确认对话框 (删除操作)

### 6.3 代码质量
- [ ] TypeScript 严格类型检查
- [ ] ESLint 代码规范
- [ ] 移除未使用的代码和依赖

### 6.4 测试
- [ ] 真机/模拟器 Android 测试
- [ ] Web 平台测试
- [ ] 数据持久化测试 (应用重启后数据保留)

---

## 📋 优先级排序 (建议开发顺序)

| 阶段 | 预估时间 | 优先级 |
|------|----------|--------|
| Phase 1: 项目基础设施 | 0.5 天 | P0 |
| Phase 2: 数据层 | 1 天 | P0 |
| Phase 3: 首页概览 | 1.5 天 | P0 |
| Phase 4: 记一笔 | 1.5 天 | P0 |
| Phase 5: 分类管理 | 1.5 天 | P0 |
| Phase 6: 收尾完善 | 1 天 | P1 |

**预估总时间**: 7 天

---

## 🚀 后续迭代 (Post-MVP)

> 以下功能在 MVP 完成后考虑

- [ ] 条目编辑功能
- [ ] 条目删除功能
- [ ] 条目搜索/筛选功能
- [ ] 数据导出 (JSON 备份)
- [ ] 数据导入 (从 JSON 恢复)
- [ ] 表格导入 (PRD-IMPORT.md)
- [ ] 多账本管理 (PRD-MUL-LEDGER.md)
- [ ] iOS 平台支持
