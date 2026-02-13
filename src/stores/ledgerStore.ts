/**
 * 账本状态管理 - 使用 Zustand
 *
 * 设计思路：初始化时加载所有账本，currentLedgerId 默认指向默认账本
 * MVP 阶段使用默认账本，预留多账本扩展能力
 */

import { getAllLedgers } from '@/src/services/ledgerService';
import type { Ledger } from '@/src/types';
import { create } from 'zustand';

interface LedgerState {
  /** 所有账本列表 */
  ledgers: Ledger[];
  /** 当前账本 ID（初始化时自动设为默认账本） */
  currentLedgerId: string | null;

  /**
   * 初始化：加载所有账本，currentLedgerId 指向默认账本
   */
  initialize: () => Promise<void>;

  /**
   * 获取当前账本对象（从内存计算）
   */
  getCurrentLedger: () => Ledger | null;

  /**
   * 切换当前账本（为多账本预留）
   */
  setCurrentLedger: (id: string) => void;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  ledgers: [],
  currentLedgerId: null,

  initialize: async () => {
    try {
      const ledgers = await getAllLedgers();
      const defaultLedger = ledgers.find((l) => l.is_default);

      set({
        ledgers,
        currentLedgerId: defaultLedger?.id ?? null,
      });
    } catch (error) {
      console.error("[LedgerStore] Failed to initialize:", error);
    }
  },

  getCurrentLedger: () => {
    const { ledgers, currentLedgerId } = get();
    if (!currentLedgerId) return null;
    return ledgers.find((l) => l.id === currentLedgerId) ?? null;
  },

  setCurrentLedger: (id: string) => {
    const { ledgers } = get();
    if (ledgers.some((l) => l.id === id)) {
      set({ currentLedgerId: id });
    }
  },
}));
