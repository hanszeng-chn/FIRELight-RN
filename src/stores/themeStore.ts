/**
 * 主题状态管理 - 使用 Zustand
 */

import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 是否为深色主题 (计算值) */
  isDark: boolean;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 根据系统主题更新 isDark */
  syncWithSystem: () => void;
}

/**
 * 计算是否应该使用深色主题
 */
const computeIsDark = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark';
  }
  return mode === 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  isDark: computeIsDark('system'),

  setMode: (mode) => {
    set({
      mode,
      isDark: computeIsDark(mode),
    });
  },

  syncWithSystem: () => {
    const { mode } = get();
    if (mode === 'system') {
      set({
        isDark: Appearance.getColorScheme() === 'dark',
      });
    }
  },
}));
