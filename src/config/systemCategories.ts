/**
 * 系统预设分类配置
 *
 * ⚠️ 重要规则：
 * 1. ID 一旦发布就不能修改（会影响已有数据关联）
 * 2. 可以随时添加新分类
 * 3. 可以修改 name、icon、sort_order
 * 4. 如需"删除"，设置 deprecated: true（保留 ID 兼容性）
 */

import type { TransactionType } from '@/src/types';

/**
 * 系统分类配置项
 */
export interface SystemCategoryConfig {
  /** 固定 ID，格式：sys_{type}_{key}，一旦发布不可修改 */
  id: string;
  /** 显示名称（可改） */
  name: string;
  /** 图标（可改） */
  icon: string;
  /** 分类类型 */
  type: TransactionType;
  /** 排序顺序（可改） */
  sort_order: number;
  /** 标记废弃（不再显示，但保留数据兼容） */
  deprecated?: boolean;
}

/**
 * 系统预设分类列表
 * App 启动时会自动同步到数据库（UPSERT 机制）
 */
export const SYSTEM_CATEGORIES: SystemCategoryConfig[] = [
  // ========== 支出分类 ==========
  {
    id: 'sys_expense_food',
    name: '餐饮',
    icon: '餐',
    type: 'expense',
    sort_order: 0,
  },
  {
    id: 'sys_expense_transport',
    name: '交通',
    icon: '交',
    type: 'expense',
    sort_order: 1,
  },
  {
    id: 'sys_expense_shopping',
    name: '购物',
    icon: '购',
    type: 'expense',
    sort_order: 2,
  },
  {
    id: 'sys_expense_housing',
    name: '居住',
    icon: '居',
    type: 'expense',
    sort_order: 3,
  },
  {
    id: 'sys_expense_entertain',
    name: '娱乐',
    icon: '娱',
    type: 'expense',
    sort_order: 4,
  },
  {
    id: 'sys_expense_medical',
    name: '医疗',
    icon: '医',
    type: 'expense',
    sort_order: 5,
  },
  {
    id: 'sys_expense_education',
    name: '教育',
    icon: '教',
    type: 'expense',
    sort_order: 6,
  },
  {
    id: 'sys_expense_social',
    name: '人情',
    icon: '人',
    type: 'expense',
    sort_order: 7,
  },

  // ========== 收入分类 ==========
  {
    id: 'sys_income_salary',
    name: '工资',
    icon: '工',
    type: 'income',
    sort_order: 0,
  },
  {
    id: 'sys_income_bonus',
    name: '奖金',
    icon: '奖',
    type: 'income',
    sort_order: 1,
  },
  {
    id: 'sys_income_investment',
    name: '投资收益',
    icon: '投',
    type: 'income',
    sort_order: 2,
  },
  {
    id: 'sys_income_other',
    name: '其他',
    icon: '其',
    type: 'income',
    sort_order: 3,
  },
];
