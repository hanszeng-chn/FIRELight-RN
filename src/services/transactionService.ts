/**
 * 交易服务
 *
 * 管理收支条目的 CRUD 操作
 */

import type {
  CreateTransactionInput,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from '@/src/types';
import { generateUUID } from '@/src/utils/uuid';
import { getDatabase, getDefaultLedgerId } from './database';

/**
 * 交易查询过滤条件
 */
export interface TransactionFilter {
  /** 账本 ID，默认使用当前账本 */
  ledgerId?: string;
  /** 年份 */
  year?: number;
  /** 月份 (1-12) */
  month?: number;
  /** 交易类型 */
  type?: TransactionType;
  /** 分类 ID */
  categoryId?: string;
  /** 日期范围开始 (YYYY-MM-DD) */
  dateFrom?: string;
  /** 日期范围结束 (YYYY-MM-DD) */
  dateTo?: string;
}

/**
 * 按日期分组的交易数据
 */
export interface TransactionsByDate {
  /** 日期 (YYYY-MM-DD) */
  date: string;
  /** 当日交易列表 */
  transactions: Transaction[];
  /** 当日收入总计 */
  totalIncome: number;
  /** 当日支出总计 */
  totalExpense: number;
}

/**
 * 月度统计数据
 */
export interface MonthlyStats {
  /** 月份收入总计 */
  totalIncome: number;
  /** 月份支出总计 */
  totalExpense: number;
  /** 交易总数 */
  transactionCount: number;
}

/**
 * 创建交易
 */
export const createTransaction = (
  input: Omit<CreateTransactionInput, 'ledger_id'> & { ledger_id?: string }
): Transaction => {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateUUID();
  const ledgerId = input.ledger_id || getDefaultLedgerId();

  db.runSync(
    `INSERT INTO transactions (id, ledger_id, type, amount, category_id, date, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      ledgerId,
      input.type,
      input.amount,
      input.category_id,
      input.date,
      input.note || '',
      now,
      now,
    ]
  );

  return {
    id,
    ledger_id: ledgerId,
    type: input.type,
    amount: input.amount,
    category_id: input.category_id,
    date: input.date,
    note: input.note || '',
    created_at: now,
    updated_at: now,
  };
};

/**
 * 根据 ID 获取交易
 */
export const getTransactionById = (id: string): Transaction | null => {
  const db = getDatabase();

  return db.getFirstSync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
};

/**
 * 获取交易列表
 */
export const getTransactions = (filter: TransactionFilter = {}): Transaction[] => {
  const db = getDatabase();
  const ledgerId = filter.ledgerId || getDefaultLedgerId();

  const conditions: string[] = ['ledger_id = ?'];
  const params: (string | number)[] = [ledgerId];

  // 按年月筛选
  if (filter.year !== undefined && filter.month !== undefined) {
    const monthStr = String(filter.month).padStart(2, '0');
    const datePrefix = `${filter.year}-${monthStr}`;
    conditions.push("date LIKE ?");
    params.push(`${datePrefix}%`);
  } else {
    // 按日期范围筛选
    if (filter.dateFrom) {
      conditions.push('date >= ?');
      params.push(filter.dateFrom);
    }
    if (filter.dateTo) {
      conditions.push('date <= ?');
      params.push(filter.dateTo);
    }
  }

  // 按类型筛选
  if (filter.type) {
    conditions.push('type = ?');
    params.push(filter.type);
  }

  // 按分类筛选
  if (filter.categoryId) {
    conditions.push('category_id = ?');
    params.push(filter.categoryId);
  }

  const whereClause = conditions.join(' AND ');

  return db.getAllSync<Transaction>(
    `SELECT * FROM transactions WHERE ${whereClause} ORDER BY date DESC, created_at DESC`,
    params
  );
};

/**
 * 按月份获取交易（按日期分组）
 */
export const getTransactionsByMonth = (
  year: number,
  month: number,
  ledgerId?: string
): TransactionsByDate[] => {
  const transactions = getTransactions({
    ledgerId,
    year,
    month,
  });

  // 按日期分组
  const groupedMap = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const existing = groupedMap.get(tx.date) || [];
    existing.push(tx);
    groupedMap.set(tx.date, existing);
  }

  // 转换为数组并计算统计
  const result: TransactionsByDate[] = [];

  for (const [date, txs] of groupedMap) {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txs) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    }

    result.push({
      date,
      transactions: txs,
      totalIncome,
      totalExpense,
    });
  }

  // 按日期降序排列
  result.sort((a, b) => b.date.localeCompare(a.date));

  return result;
};

/**
 * 获取月度统计
 */
export const getMonthlyStats = (
  year: number,
  month: number,
  ledgerId?: string
): MonthlyStats => {
  const db = getDatabase();
  const actualLedgerId = ledgerId || getDefaultLedgerId();
  const monthStr = String(month).padStart(2, '0');
  const datePrefix = `${year}-${monthStr}`;

  const result = db.getFirstSync<{
    total_income: number | null;
    total_expense: number | null;
    tx_count: number;
  }>(
    `SELECT 
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
       COUNT(*) as tx_count
     FROM transactions 
     WHERE ledger_id = ? AND date LIKE ?`,
    [actualLedgerId, `${datePrefix}%`]
  );

  return {
    totalIncome: result?.total_income || 0,
    totalExpense: result?.total_expense || 0,
    transactionCount: result?.tx_count || 0,
  };
};

/**
 * 更新交易
 */
export const updateTransaction = (
  id: string,
  input: UpdateTransactionInput
): Transaction | null => {
  const db = getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (input.type !== undefined) {
    fields.push('type = ?');
    values.push(input.type);
  }
  if (input.amount !== undefined) {
    fields.push('amount = ?');
    values.push(input.amount);
  }
  if (input.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(input.category_id);
  }
  if (input.date !== undefined) {
    fields.push('date = ?');
    values.push(input.date);
  }
  if (input.note !== undefined) {
    fields.push('note = ?');
    values.push(input.note);
  }

  if (fields.length === 0) {
    return getTransactionById(id);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.runSync(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getTransactionById(id);
};

/**
 * 删除交易
 */
export const deleteTransaction = (id: string): boolean => {
  const db = getDatabase();

  const existing = getTransactionById(id);
  if (!existing) {
    return false;
  }

  db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
  return true;
};

/**
 * 获取有数据的月份列表
 * 返回格式：['2024-01', '2024-02', ...]
 */
export const getMonthsWithData = (ledgerId?: string): string[] => {
  const db = getDatabase();
  const actualLedgerId = ledgerId || getDefaultLedgerId();

  const results = db.getAllSync<{ month: string }>(
    `SELECT DISTINCT substr(date, 1, 7) as month 
     FROM transactions 
     WHERE ledger_id = ?
     ORDER BY month DESC`,
    [actualLedgerId]
  );

  return results.map((r) => r.month);
};

/**
 * 获取最近一条交易的月份
 * 用于首页默认显示最新有数据的月份
 */
export const getLatestTransactionMonth = (
  ledgerId?: string
): { year: number; month: number } | null => {
  const db = getDatabase();
  const actualLedgerId = ledgerId || getDefaultLedgerId();

  const result = db.getFirstSync<{ date: string }>(
    `SELECT date FROM transactions 
     WHERE ledger_id = ?
     ORDER BY date DESC 
     LIMIT 1`,
    [actualLedgerId]
  );

  if (!result) {
    return null;
  }

  const [year, month] = result.date.split('-').map(Number);
  return { year, month };
};
