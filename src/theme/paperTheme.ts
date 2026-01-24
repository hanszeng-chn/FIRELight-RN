/**
 * React Native Paper 主题配置
 * 将 Design Tokens 映射到 Paper MD3 主题
 */

import {
  MD3LightTheme,
  MD3DarkTheme,
  type MD3Theme,
} from 'react-native-paper';
import { colors, radius } from './tokens';

// 扩展 Paper 主题类型以包含自定义颜色
type CustomColors = {
  success: string;
  warning: string;
  info: string;
  textSecondary: string;
  textTertiary: string;
};

export type AppTheme = MD3Theme & {
  colors: MD3Theme['colors'] & CustomColors;
};

/**
 * Light 主题
 */
export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    // Primary
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primary + '20', // 20% opacity
    onPrimaryContainer: colors.primary,

    // Secondary
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.secondary + '20',
    onSecondaryContainer: colors.secondary,

    // Background & Surface
    background: colors.light.background,
    onBackground: colors.light.textPrimary,
    surface: colors.light.background,
    onSurface: colors.light.textPrimary,
    surfaceVariant: colors.light.backgroundSecondary,
    onSurfaceVariant: colors.light.textSecondary,
    surfaceDisabled: colors.light.backgroundTertiary,

    // Error (danger)
    error: colors.danger,
    onError: '#FFFFFF',
    errorContainer: colors.danger + '20',
    onErrorContainer: colors.danger,

    // Outline
    outline: colors.light.backgroundTertiary,
    outlineVariant: colors.light.backgroundTertiary,

    // Custom colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.light.textSecondary,
    textTertiary: colors.light.textTertiary,
  },
};

/**
 * Dark 主题
 */
export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primary + '30',
    onPrimaryContainer: colors.primary,

    // Secondary
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.secondary + '30',
    onSecondaryContainer: colors.secondary,

    // Background & Surface
    background: colors.dark.background,
    onBackground: colors.dark.textPrimary,
    surface: colors.dark.background,
    onSurface: colors.dark.textPrimary,
    surfaceVariant: colors.dark.backgroundSecondary,
    onSurfaceVariant: colors.dark.textSecondary,
    surfaceDisabled: colors.dark.backgroundTertiary,

    // Error (danger)
    error: colors.danger,
    onError: '#FFFFFF',
    errorContainer: colors.danger + '30',
    onErrorContainer: colors.danger,

    // Outline
    outline: colors.dark.backgroundTertiary,
    outlineVariant: colors.dark.backgroundTertiary,

    // Custom colors
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.dark.textSecondary,
    textTertiary: colors.dark.textTertiary,
  },
};
