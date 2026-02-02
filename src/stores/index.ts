/**
 * Zustand Store 统一导出
 */

// 主题管理
export { useThemeStore } from './themeStore';
export type { ThemeMode } from './themeStore';

// 账本管理
export { useLedgerStore } from './ledgerStore';

// 分类管理
export { useCategoryStore } from './categoryStore';
export type { CreateCategoryParams } from './categoryStore';

// 交易管理
export { useTransactionStore } from './transactionStore';
export type { AddTransactionParams } from './transactionStore';

// 从 service 层导出常用类型（方便使用）
export type {
  TransactionsByDate,
  MonthlyStats,
} from '@/src/services/transactionService';
