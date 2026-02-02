/**
 * 交易状态管理 - 使用 Zustand
 *
 * 管理收支条目的状态和操作
 */

import {
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
  getLatestTransactionMonth,
  getTransactionsByMonth as getTransactionsByMonthService,
  updateTransaction as updateTransactionService,
  type MonthlyStats,
  type TransactionsByDate,
} from "@/src/services/transactionService";
import type {
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from "@/src/types";
import { create } from "zustand";

/**
 * 添加交易的输入参数
 */
export interface AddTransactionParams {
  type: TransactionType;
  amount: number;
  category_id: string;
  date: string;
  note?: string;
}

interface TransactionState {
  /** 当前选中的年份 */
  currentYear: number;
  /** 当前选中的月份 (1-12) */
  currentMonth: number;
  /** 按日期分组的交易列表 */
  transactionsByDate: TransactionsByDate[];
  /** 当前月份的统计数据 */
  monthlyStats: MonthlyStats;
  /** 是否正在加载 */
  isLoading: boolean;

  /**
   * 初始化：加载最新有数据的月份，如果没有数据则使用当前月份
   */
  initialize: () => Promise<void>;

  /**
   * 设置当前月份并加载数据
   * @param year 年份
   * @param month 月份 (1-12)
   */
  setMonth: (year: number, month: number) => Promise<void>;

  /**
   * 加载当前月份的交易数据
   */
  loadTransactions: () => Promise<void>;

  /**
   * 添加交易（自动关联当前账本）
   * @param params 交易参数
   * @returns 创建的交易
   */
  addTransaction: (params: AddTransactionParams) => Promise<Transaction>;

  /**
   * 更新交易
   * @param id 交易 ID
   * @param input 更新参数
   * @returns 更新后的交易，如果不存在则返回 null
   */
  updateTransaction: (
    id: string,
    input: UpdateTransactionInput,
  ) => Promise<Transaction | null>;

  /**
   * 删除交易
   * @param id 交易 ID
   * @returns 是否删除成功
   */
  deleteTransaction: (id: string) => Promise<boolean>;

  /**
   * 按月份获取交易（直接从数据库查询，不更新 store 状态）
   * @param year 年份
   * @param month 月份 (1-12)
   * @returns 按日期分组的交易列表
   */
  getTransactionsByMonth: (
    year: number,
    month: number,
  ) => Promise<TransactionsByDate[]>;
}

/**
 * 获取当前日期的年月
 */
const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // JS 月份从 0 开始
  };
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  currentYear: getCurrentYearMonth().year,
  currentMonth: getCurrentYearMonth().month,
  transactionsByDate: [],
  monthlyStats: {
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  },
  isLoading: false,

  initialize: async () => {
    // 获取最新有数据的月份
    const latestMonth = await getLatestTransactionMonth();

    if (latestMonth) {
      // 有数据，使用最新的月份
      set({
        currentYear: latestMonth.year,
        currentMonth: latestMonth.month,
      });
    } else {
      // 没有数据，使用当前月份
      const { year, month } = getCurrentYearMonth();
      set({
        currentYear: year,
        currentMonth: month,
      });
    }

    // 加载数据
    await get().loadTransactions();
  },

  setMonth: async (year: number, month: number) => {
    set({
      currentYear: year,
      currentMonth: month,
    });

    // 加载新月份的数据
    await get().loadTransactions();
  },

  loadTransactions: async () => {
    const { currentYear, currentMonth } = get();

    set({ isLoading: true });

    try {
      // 加载按日期分组的交易
      const transactionsByDate = await getTransactionsByMonthService(
        currentYear,
        currentMonth,
      );

      // 在内存中计算月度统计，减少一次数据库查询
      const monthlyStats = transactionsByDate.reduce(
        (acc, day) => ({
          totalIncome: acc.totalIncome + day.totalIncome,
          totalExpense: acc.totalExpense + day.totalExpense,
          transactionCount: acc.transactionCount + day.transactions.length,
        }),
        { totalIncome: 0, totalExpense: 0, transactionCount: 0 },
      );

      set({
        transactionsByDate,
        monthlyStats,
        isLoading: false,
      });
    } catch (error) {
      console.error("[TransactionStore] Failed to load transactions:", error);
      set({ isLoading: false });
    }
  },

  addTransaction: async (params: AddTransactionParams) => {
    const { type, amount, category_id, date, note } = params;

    // 校验金额
    if (amount <= 0) {
      throw new Error("金额必须大于 0");
    }

    // 校验分类
    if (!category_id) {
      throw new Error("请选择分类");
    }

    // 创建交易（service 会自动使用默认账本）
    const transaction = await createTransactionService({
      type,
      amount,
      category_id,
      date,
      note: note || "",
    });

    // 检查新交易是否在当前显示的月份内
    const [txYear, txMonth] = date.split("-").map(Number);
    const { currentYear, currentMonth } = get();

    if (txYear === currentYear && txMonth === currentMonth) {
      // 在当前月份，刷新列表
      await get().loadTransactions();
    }

    return transaction;
  },

  updateTransaction: async (id: string, input: UpdateTransactionInput) => {
    // 校验金额（如果有更新）
    if (input.amount !== undefined && input.amount <= 0) {
      throw new Error("金额必须大于 0");
    }

    const result = await updateTransactionService(id, input);

    // 刷新列表
    await get().loadTransactions();

    return result;
  },

  deleteTransaction: async (id: string) => {
    const result = await deleteTransactionService(id);

    if (result) {
      // 删除成功，刷新列表
      await get().loadTransactions();
    }

    return result;
  },

  getTransactionsByMonth: async (year: number, month: number) => {
    // 如果请求的是当前已加载的月份，直接返回内存数据
    const { currentYear, currentMonth, transactionsByDate } = get();
    if (year === currentYear && month === currentMonth) {
      return transactionsByDate;
    }
    return await getTransactionsByMonthService(year, month);
  },
}));
