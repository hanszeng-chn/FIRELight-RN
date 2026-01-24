import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { useThemeStore } from '@/src/stores/themeStore';
import { darkTheme, lightTheme } from '@/src/theme';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { mode, isDark, syncWithSystem } = useThemeStore();

  // 监听系统主题变化
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      syncWithSystem();
    });

    return () => subscription.remove();
  }, [syncWithSystem]);

  // 当系统主题变化时同步 (for useColorScheme hook)
  useEffect(() => {
    if (mode === 'system') {
      syncWithSystem();
    }
  }, [systemColorScheme, mode, syncWithSystem]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
    </PaperProvider>
  );
}
