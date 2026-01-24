/**
 * FIRELight 核心类型定义
 * 数据模型预留多账本支持，MVP 阶段使用默认账本
 */

/**
 * 账本类型 - 为多账本功能预留
 */
export interface Ledger {
  /** UUID */
  id: string;
  /** 账本名称 */
  name: string;
  /** 图标标识 (emoji 或首字符) */
  icon: string;
  /** 主题色 (hex) */
  color: string;
  /** 是否为默认账本 */
  is_default: boolean;
  /** 排序顺序 */
  sort_order: number;
  /** 创建时间 (ISO string) */
  created_at: string;
  /** 更新时间 (ISO string) */
  updated_at: string;
}

/**
 * 交易类型：收入或支出
 */
export type TransactionType = 'income' | 'expense';

/**
 * 收支条目类型
 */
export interface Transaction {
  /** UUID */
  id: string;
  /** 所属账本 ID (外键) */
  ledger_id: string;
  /** 交易类型 */
  type: TransactionType;
  /** 金额 (正数) */
  amount: number;
  /** 分类 ID (外键) */
  category_id: string;
  /** 交易日期 (ISO date string, YYYY-MM-DD) */
  date: string;
  /** 备注 */
  note: string;
  /** 创建时间 (ISO string) */
  created_at: string;
  /** 更新时间 (ISO string) */
  updated_at: string;
}

/**
 * 分类类型 - 全局共享，不绑定账本
 */
export interface Category {
  /** UUID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 图标 (首字符自动生成) */
  icon: string;
  /** 分类类型：收入或支出 */
  type: TransactionType;
  /** 是否为系统预设分类 */
  is_system: boolean;
  /** 是否启用 */
  is_active: boolean;
  /** 排序顺序 */
  sort_order: number;
  /** 是否已废弃（隐藏但保留兼容） */
  deprecated: boolean;
  /** 创建时间 (ISO string) */
  created_at: string;
  /** 更新时间 (ISO string) */
  updated_at: string;
}

/**
 * 创建账本时的输入类型 (省略自动生成的字段)
 */
export type CreateLedgerInput = Omit<Ledger, 'id' | 'created_at' | 'updated_at'>;

/**
 * 创建交易时的输入类型 (省略自动生成的字段)
 */
export type CreateTransactionInput = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

/**
 * 创建分类时的输入类型 (省略自动生成的字段)
 */
export type CreateCategoryInput = Omit<Category, 'id' | 'created_at' | 'updated_at'>;

/**
 * 更新账本时的输入类型 (所有字段可选)
 */
export type UpdateLedgerInput = Partial<Omit<Ledger, 'id' | 'created_at' | 'updated_at'>>;

/**
 * 更新交易时的输入类型 (所有字段可选)
 */
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;

/**
 * 更新分类时的输入类型 (所有字段可选)
 */
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
