/**
 * 分类服务
 *
 * 分类是全局共享的，不绑定账本
 * 系统分类通过 JSON 配置，每次启动同步到数据库
 */

import type {
  Category,
  CreateCategoryInput,
  TransactionType,
  UpdateCategoryInput,
} from '@/src/types';
import { generateUUID } from '@/src/utils/uuid';
import { getDatabase } from './database';

/**
 * SQLite 返回的原始分类数据（布尔值为 0/1）
 */
interface RawCategory {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  is_system: number;
  is_active: number;
  sort_order: number;
  deprecated: number;
  created_at: string;
  updated_at: string;
}

/**
 * 转换 SQLite 原始数据为 Category 类型
 */
const toCategory = (raw: RawCategory): Category => ({
  ...raw,
  is_system: Boolean(raw.is_system),
  is_active: Boolean(raw.is_active),
  deprecated: Boolean(raw.deprecated),
});

/**
 * 获取可用分类（排除已废弃和已停用的）
 * 用于记账页面的分类选择
 */
export const getActiveCategories = (type: TransactionType): Category[] => {
  const db = getDatabase();

  const results = db.getAllSync<RawCategory>(
    `SELECT * FROM categories 
     WHERE type = ? 
       AND is_active = 1 
       AND deprecated = 0
     ORDER BY sort_order ASC`,
    [type]
  );

  return results.map(toCategory);
};

/**
 * 获取所有分类（包括停用的，排除废弃的）
 * 用于分类管理页面
 */
export const getAllCategories = (type: TransactionType): Category[] => {
  const db = getDatabase();

  const results = db.getAllSync<RawCategory>(
    `SELECT * FROM categories 
     WHERE type = ? AND deprecated = 0
     ORDER BY is_active DESC, sort_order ASC`,
    [type]
  );

  return results.map(toCategory);
};

/**
 * 根据 ID 获取分类
 * 即使是 deprecated 的也要能查到（用于显示历史交易的分类名）
 */
export const getCategoryById = (id: string): Category | null => {
  const db = getDatabase();

  const result = db.getFirstSync<RawCategory>(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );

  return result ? toCategory(result) : null;
};

/**
 * 创建自定义分类
 */
export const createCategory = (
  input: Omit<CreateCategoryInput, 'is_system' | 'deprecated'>
): Category => {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateUUID();

  // 获取当前最大 sort_order
  const maxSort = db.getFirstSync<{ max_sort: number | null }>(
    'SELECT MAX(sort_order) as max_sort FROM categories WHERE type = ?',
    [input.type]
  );
  const sortOrder = (maxSort?.max_sort ?? -1) + 1;

  db.runSync(
    `INSERT INTO categories (id, name, icon, type, is_system, is_active, sort_order, deprecated, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?, 0, ?, ?)`,
    [
      id,
      input.name,
      input.icon,
      input.type,
      input.is_active ? 1 : 0,
      sortOrder,
      now,
      now,
    ]
  );

  return {
    id,
    name: input.name,
    icon: input.icon,
    type: input.type,
    is_system: false,
    is_active: input.is_active,
    sort_order: sortOrder,
    deprecated: false,
    created_at: now,
    updated_at: now,
  };
};

/**
 * 更新分类
 * 注意：系统分类只能更新 is_active 和 sort_order
 */
export const updateCategory = (
  id: string,
  input: UpdateCategoryInput
): Category | null => {
  const db = getDatabase();
  const now = new Date().toISOString();

  const category = getCategoryById(id);
  if (!category) {
    return null;
  }

  // 系统分类限制可更新的字段
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (!category.is_system) {
    // 自定义分类可以更新 name 和 icon
    if (input.name !== undefined) {
      fields.push('name = ?');
      values.push(input.name);
    }
    if (input.icon !== undefined) {
      fields.push('icon = ?');
      values.push(input.icon);
    }
  }

  // 所有分类都可以更新 is_active 和 sort_order
  if (input.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(input.is_active ? 1 : 0);
  }
  if (input.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(input.sort_order);
  }

  if (fields.length === 0) {
    return category;
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.runSync(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getCategoryById(id);
};

/**
 * 切换分类启用状态
 */
export const toggleCategoryStatus = (id: string): Category | null => {
  const category = getCategoryById(id);
  if (!category) {
    return null;
  }

  return updateCategory(id, { is_active: !category.is_active });
};

/**
 * 批量更新分类排序
 */
export const reorderCategories = (
  orderedIds: string[]
): void => {
  const db = getDatabase();
  const now = new Date().toISOString();

  orderedIds.forEach((id, index) => {
    db.runSync(
      'UPDATE categories SET sort_order = ?, updated_at = ? WHERE id = ?',
      [index, now, id]
    );
  });
};

/**
 * 删除自定义分类
 * 注意：系统分类不能删除，有关联交易的分类不能删除
 */
export const deleteCategory = (id: string): boolean => {
  const db = getDatabase();

  const category = getCategoryById(id);
  if (!category) {
    return false;
  }

  if (category.is_system) {
    throw new Error('Cannot delete system category');
  }

  // 检查是否有关联的交易
  const transactionCount = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
    [id]
  );

  if (transactionCount && transactionCount.count > 0) {
    throw new Error(
      `Cannot delete category with ${transactionCount.count} transactions. Deactivate it instead.`
    );
  }

  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
  return true;
};

/**
 * 清理无用的自定义分类
 * 删除已停用且无关联交易的自定义分类
 */
export const cleanupUnusedCategories = (): number => {
  const db = getDatabase();

  // 查找可清理的分类
  const unusedCategories = db.getAllSync<{ id: string }>(
    `SELECT c.id FROM categories c
     LEFT JOIN transactions t ON c.id = t.category_id
     WHERE c.is_system = 0 
       AND c.is_active = 0
     GROUP BY c.id
     HAVING COUNT(t.id) = 0`
  );

  if (unusedCategories.length === 0) {
    return 0;
  }

  const ids = unusedCategories.map((c) => c.id);
  const placeholders = ids.map(() => '?').join(',');

  db.runSync(
    `DELETE FROM categories WHERE id IN (${placeholders})`,
    ids
  );

  console.log(`[CategoryService] Cleaned up ${ids.length} unused categories`);
  return ids.length;
};

/**
 * 检查分类名称是否重复
 */
export const isCategoryNameExists = (
  name: string,
  type: TransactionType,
  excludeId?: string
): boolean => {
  const db = getDatabase();

  const query = excludeId
    ? 'SELECT id FROM categories WHERE name = ? AND type = ? AND id != ? AND deprecated = 0'
    : 'SELECT id FROM categories WHERE name = ? AND type = ? AND deprecated = 0';

  const params = excludeId ? [name, type, excludeId] : [name, type];

  const result = db.getFirstSync<{ id: string }>(query, params);
  return result !== null;
};
