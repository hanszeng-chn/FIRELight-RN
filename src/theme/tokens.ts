/**
 * Design Tokens - 基于 DESIGN-SYSTEM.md
 */

// ============================================
// 颜色系统
// ============================================
export const colors = {
  // Palette (基础色板)
  primary: '#007AFF', // iOS Blue - 用于强调、按钮、选中状态
  secondary: '#5856D6', // Purple - 用于辅助标识
  success: '#34C759', // Green - 用于收入、完成状态
  danger: '#FF3B30', // Red - 用于支出、删除、错误
  warning: '#FF9500', // Orange - 用于提示
  info: '#AF52DE', // Indigo

  // Light Mode
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7', // 用于卡片、列表项
    backgroundTertiary: '#E5E5EA', // 用于分割线、输入框背景
    textPrimary: '#000000',
    textSecondary: '#8E8E93', // 用于次要信息、备注
    textTertiary: '#C7C7CC', // 用于占位符
  },

  // Dark Mode
  dark: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
  },
} as const;

// ============================================
// 排版系统 - 基于 iOS Human Interface Guidelines
// ============================================
export const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const },
  title1: { fontSize: 28, fontWeight: '700' as const },
  title2: { fontSize: 22, fontWeight: '700' as const }, // 用于 Section Header
  title3: { fontSize: 20, fontWeight: '600' as const }, // 用于卡片标题
  headline: { fontSize: 17, fontWeight: '600' as const }, // 用于列表主要信息
  body: { fontSize: 17, fontWeight: '400' as const }, // 用于正文
  callout: { fontSize: 16, fontWeight: '400' as const },
  subhead: { fontSize: 15, fontWeight: '400' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const }, // 用于辅助说明
  caption1: { fontSize: 12, fontWeight: '400' as const },
  caption2: { fontSize: 11, fontWeight: '400' as const },
} as const;

// ============================================
// 间距系统 - 4px 网格
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // 标准内边距
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

// ============================================
// 圆角系统
// ============================================
export const radius = {
  sm: 4,
  md: 8,
  lg: 12, // 卡片标准圆角
  xl: 16,
  full: 9999, // 圆形按钮/头像
} as const;

// ============================================
// 阴影系统
// ============================================
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
} as const;
