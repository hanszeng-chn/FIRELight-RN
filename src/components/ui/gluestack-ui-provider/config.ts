'use client';

import { vars } from 'nativewind';

type ColorTokenScale = Record<string, string>;
type ColorTokenGroup = Record<string, ColorTokenScale>;
type Mode = 'light' | 'dark';

type ThemeTokens = {
  colors: Record<Mode, ColorTokenGroup>;
};

const tokens = require('../../../theme/tokens.json') as ThemeTokens;

const toCssVars = (mode: Mode): Record<string, string> => {
  const groups = tokens.colors[mode];
  const entries: ([string, string])[] = [];

  for (const [groupName, scale] of Object.entries(groups)) {
    for (const [token, value] of Object.entries(scale)) {
      entries.push([`--color-${groupName}-${token}`, value]);
    }
  }

  return Object.fromEntries(entries);
};

export const config = {
  light: vars(toCssVars('light')),
  dark: vars(toCssVars('dark')),
};
