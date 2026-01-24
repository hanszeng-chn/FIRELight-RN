/**
 * 账本服务
 *
 * MVP 阶段使用单一默认账本，预留多账本扩展能力
 */

import type { CreateLedgerInput, Ledger, UpdateLedgerInput } from '@/src/types';
import { generateUUID } from '@/src/utils/uuid';
import { getDatabase, getDefaultLedgerId } from './database';

/**
 * 获取默认账本
 */
export const getDefaultLedger = (): Ledger | null => {
  const db = getDatabase();

  const result = db.getFirstSync<Ledger>(
    'SELECT * FROM ledgers WHERE is_default = 1'
  );

  if (!result) {
    return null;
  }

  // 转换布尔字段
  return {
    ...result,
    is_default: Boolean(result.is_default),
  };
};

/**
 * 获取所有账本
 */
export const getAllLedgers = (): Ledger[] => {
  const db = getDatabase();

  const results = db.getAllSync<Ledger>(
    'SELECT * FROM ledgers ORDER BY sort_order ASC'
  );

  // 转换布尔字段
  return results.map((ledger) => ({
    ...ledger,
    is_default: Boolean(ledger.is_default),
  }));
};

/**
 * 根据 ID 获取账本
 */
export const getLedgerById = (id: string): Ledger | null => {
  const db = getDatabase();

  const result = db.getFirstSync<Ledger>(
    'SELECT * FROM ledgers WHERE id = ?',
    [id]
  );

  if (!result) {
    return null;
  }

  return {
    ...result,
    is_default: Boolean(result.is_default),
  };
};

/**
 * 创建账本
 */
export const createLedger = (input: CreateLedgerInput): Ledger => {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateUUID();

  db.runSync(
    `INSERT INTO ledgers (id, name, icon, color, is_default, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.icon,
      input.color,
      input.is_default ? 1 : 0,
      input.sort_order,
      now,
      now,
    ]
  );

  return {
    id,
    ...input,
    created_at: now,
    updated_at: now,
  };
};

/**
 * 更新账本
 */
export const updateLedger = (
  id: string,
  input: UpdateLedgerInput
): Ledger | null => {
  const db = getDatabase();
  const now = new Date().toISOString();

  // 构建动态 UPDATE 语句
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.icon !== undefined) {
    fields.push('icon = ?');
    values.push(input.icon);
  }
  if (input.color !== undefined) {
    fields.push('color = ?');
    values.push(input.color);
  }
  if (input.is_default !== undefined) {
    fields.push('is_default = ?');
    values.push(input.is_default ? 1 : 0);
  }
  if (input.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(input.sort_order);
  }

  if (fields.length === 0) {
    return getLedgerById(id);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.runSync(
    `UPDATE ledgers SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getLedgerById(id);
};

/**
 * 删除账本
 * 注意：不能删除默认账本
 */
export const deleteLedger = (id: string): boolean => {
  const db = getDatabase();

  // 检查是否为默认账本
  const ledger = getLedgerById(id);
  if (!ledger) {
    return false;
  }
  if (ledger.is_default) {
    throw new Error('Cannot delete default ledger');
  }

  // 检查是否有关联的交易
  const transactionCount = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions WHERE ledger_id = ?',
    [id]
  );

  if (transactionCount && transactionCount.count > 0) {
    throw new Error(
      `Cannot delete ledger with ${transactionCount.count} transactions`
    );
  }

  db.runSync('DELETE FROM ledgers WHERE id = ?', [id]);
  return true;
};

// 导出默认账本 ID 获取函数
export { getDefaultLedgerId };
