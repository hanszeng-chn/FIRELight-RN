'use client';
import { vars } from 'nativewind';

import { colors } from '@/src/theme';

const COLOR_SCALE = [
  0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;
  const intValue = Number.parseInt(value, 16);
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  return { r, g, b };
};

const rgbToString = (rgb: { r: number; g: number; b: number }) =>
  `${rgb.r} ${rgb.g} ${rgb.b}`;

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
};

const hslToRgb = ({ h, s, l }: { h: number; s: number; l: number }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const LIGHTNESS_SCALE = [
  0.98, 0.95, 0.9, 0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.24, 0.18, 0.12,
];

const createScale = (name: string, hex: string, mode: 'light' | 'dark') => {
  const baseHsl = rgbToHsl(hexToRgb(hex));
  const lightness = mode === 'light' ? LIGHTNESS_SCALE : [...LIGHTNESS_SCALE].reverse();

  return COLOR_SCALE.reduce<Record<string, string>>((acc, level, index) => {
    const rgb = hslToRgb({ h: baseHsl.h, s: baseHsl.s, l: lightness[index] });
    acc[`--color-${name}-${level}`] = rgbToString(rgb);
    return acc;
  }, {});
};

const createTypographyScale = (primary: string, secondary: string, tertiary: string) => {
  const primaryRgb = rgbToString(hexToRgb(primary));
  const secondaryRgb = rgbToString(hexToRgb(secondary));
  const tertiaryRgb = rgbToString(hexToRgb(tertiary));

  return {
    '--color-typography-0': primaryRgb,
    '--color-typography-50': primaryRgb,
    '--color-typography-100': primaryRgb,
    '--color-typography-200': primaryRgb,
    '--color-typography-300': secondaryRgb,
    '--color-typography-400': secondaryRgb,
    '--color-typography-500': secondaryRgb,
    '--color-typography-600': secondaryRgb,
    '--color-typography-700': tertiaryRgb,
    '--color-typography-800': tertiaryRgb,
    '--color-typography-900': tertiaryRgb,
    '--color-typography-950': tertiaryRgb,
  };
};

const createBackgroundScale = (
  background: string,
  backgroundSecondary: string,
  backgroundTertiary: string
) => {
  const backgroundRgb = rgbToString(hexToRgb(background));
  const backgroundSecondaryRgb = rgbToString(hexToRgb(backgroundSecondary));
  const backgroundTertiaryRgb = rgbToString(hexToRgb(backgroundTertiary));

  return {
    '--color-background-0': backgroundRgb,
    '--color-background-50': backgroundSecondaryRgb,
    '--color-background-100': backgroundSecondaryRgb,
    '--color-background-200': backgroundTertiaryRgb,
    '--color-background-300': backgroundTertiaryRgb,
    '--color-background-400': backgroundTertiaryRgb,
    '--color-background-500': backgroundTertiaryRgb,
    '--color-background-600': backgroundTertiaryRgb,
    '--color-background-700': backgroundTertiaryRgb,
    '--color-background-800': backgroundTertiaryRgb,
    '--color-background-900': backgroundTertiaryRgb,
    '--color-background-950': backgroundTertiaryRgb,
  };
};

const createOutlineScale = (outline: string) => {
  const outlineRgb = rgbToString(hexToRgb(outline));
  return COLOR_SCALE.reduce<Record<string, string>>((acc, level) => {
    acc[`--color-outline-${level}`] = outlineRgb;
    return acc;
  }, {});
};

export const config = {
  light: vars({
    ...createScale('primary', colors.primary, 'light'),
    ...createScale('secondary', colors.secondary, 'light'),
    ...createScale('tertiary', colors.info, 'light'),
    ...createScale('error', colors.danger, 'light'),
    ...createScale('success', colors.success, 'light'),
    ...createScale('warning', colors.warning, 'light'),
    ...createScale('info', colors.info, 'light'),

    ...createTypographyScale(
      colors.light.textPrimary,
      colors.light.textSecondary,
      colors.light.textTertiary
    ),

    ...createOutlineScale(colors.light.backgroundTertiary),

    ...createBackgroundScale(
      colors.light.background,
      colors.light.backgroundSecondary,
      colors.light.backgroundTertiary
    ),

    /* Background Special */
    '--color-background-error': rgbToString(hexToRgb(colors.danger)),
    '--color-background-warning': rgbToString(hexToRgb(colors.warning)),
    '--color-background-success': rgbToString(hexToRgb(colors.success)),
    '--color-background-muted': rgbToString(hexToRgb(colors.light.backgroundSecondary)),
    '--color-background-info': rgbToString(hexToRgb(colors.info)),

    /* Focus Ring Indicator  */
    '--color-indicator-primary': rgbToString(hexToRgb(colors.primary)),
    '--color-indicator-info': rgbToString(hexToRgb(colors.info)),
    '--color-indicator-error': rgbToString(hexToRgb(colors.danger)),
  }),
  dark: vars({
    ...createScale('primary', colors.primary, 'dark'),
    ...createScale('secondary', colors.secondary, 'dark'),
    ...createScale('tertiary', colors.info, 'dark'),
    ...createScale('error', colors.danger, 'dark'),
    ...createScale('success', colors.success, 'dark'),
    ...createScale('warning', colors.warning, 'dark'),
    ...createScale('info', colors.info, 'dark'),

    ...createTypographyScale(
      colors.dark.textPrimary,
      colors.dark.textSecondary,
      colors.dark.textTertiary
    ),

    ...createOutlineScale(colors.dark.backgroundTertiary),

    ...createBackgroundScale(
      colors.dark.background,
      colors.dark.backgroundSecondary,
      colors.dark.backgroundTertiary
    ),

    /* Background Special */
    '--color-background-error': rgbToString(hexToRgb(colors.danger)),
    '--color-background-warning': rgbToString(hexToRgb(colors.warning)),
    '--color-background-success': rgbToString(hexToRgb(colors.success)),
    '--color-background-muted': rgbToString(hexToRgb(colors.dark.backgroundSecondary)),
    '--color-background-info': rgbToString(hexToRgb(colors.info)),

    /* Focus Ring Indicator  */
    '--color-indicator-primary': rgbToString(hexToRgb(colors.primary)),
    '--color-indicator-info': rgbToString(hexToRgb(colors.info)),
    '--color-indicator-error': rgbToString(hexToRgb(colors.danger)),
  }),
};
