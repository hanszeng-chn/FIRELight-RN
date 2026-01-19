# FIRELight MVP 开发任务清单 (TODO List)

## 📦 Phase 0: 基础设施搭建 (Infrastructure)
- [ ] **项目初始化**
    - [ ] 清理默认模板代码 (HelloWave, ParallaxScrollView 等)
    - [ ] 配置基本的 Navigation 结构 (Stack/Tabs)
- [ ] **设计系统 (Design System)**
    - [ ] 创建 `docs/DESIGN-SYSTEM.md` 定义 Design Tokens (Colors, Typography, Spacing, Radius)
    - [ ] 集成 `react-native-paper` 组件库
    - [ ] 配置 Paper Theme (Light/Dark Mode) 以匹配 Design Tokens
- [ ] **数据层 (Data Layer)**
    - [ ] 安装并配置 `expo-sqlite` (或 `typeorm` / `drizzle`)
    - [ ] 定义 `Transaction` (收支条目) 表结构
    - [ ] 定义 `Category` (分类) 表结构
    - [ ] 初始化数据库迁移脚本 (含预置系统分类数据)
    - [ ] 封装基础 DAO 层 (CRUD 操作)

## 🏠 Phase 1: 首页概览 (Dashboard)
- [ ] **UI 搭建**
    - [ ] 实现顶部年份月份选择器 (MonthPicker)
    - [ ] 实现日期分组列表 (SectionList)
    - [ ] 实现收支条目 Item 组件
    - [ ] 实现悬浮记账按钮 (FAB)
- [ ] **逻辑实现**
    - [ ] 状态管理：当前选中月份
    - [ ] 数据加载：按月查询 `Transaction` 数据
    - [ ] 统计计算：计算当月总收入/总支出
    - [ ] 空状态处理

## ✏️ Phase 2: 记一笔 (Add Transaction)
- [ ] **UI 搭建**
    - [ ] 实现分类选择网格 (CategoryGrid)
    - [ ] 实现自定义数字键盘 (含日期键)
    - [ ] 实现金额显示 & 备注输入区
    - [ ] 实现 Bottom Sheet 容器
- [ ] **逻辑实现**
    - [ ] 收入/支出类型切换
    - [ ] 选中分类状态管理
    - [ ] 金额输入逻辑 (小数点处理)
    - [ ] 日期选择逻辑 (DatePicker)
    - [ ] 提交保存逻辑 (写入数据库)

## 🗂️ Phase 3: 分类管理 (Category Management)
- [ ] **UI 搭建**
    - [ ] 实现分类列表 (启用中/已停用)
    - [ ] 实现拖拽排序功能 (DraggableList)
    - [ ] 实现新增/编辑分类弹窗 (Popup)
- [ ] **逻辑实现**
    - [ ] 区分系统/自定义分类逻辑
    - [ ] 停用/启用逻辑 (软删除)
    - [ ] 自动清理逻辑 (Garbage Collection)
    - [ ] 新增/编辑保存逻辑
    - [ ] 排序持久化逻辑

## 🧪 Phase 4: 测试与优化 (Testing & Polish)
- [ ] **功能测试**
    - [ ] 验证记账 -> 首页刷新流程
    - [ ] 验证分类停用 -> 记账页隐藏流程
    - [ ] 验证数据持久化 (重启 App 数据不丢失)
- [ ] **UI/UX 优化**
    - [ ] 优化键盘弹出/收起动画
    - [ ] 优化列表滚动性能
    - [ ] 适配深色模式 (Dark Mode)
