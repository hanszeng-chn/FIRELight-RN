import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Appearance, useColorScheme } from 'react-native';

import { initDatabase } from '@/src/services/database';
import { useThemeStore } from '@/src/stores/themeStore';
import { colors } from '@/src/theme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '../global.css';

// 保持启动页可见，直到我们通知它隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const systemColorScheme = useColorScheme();
  const { mode, isDark, syncWithSystem } = useThemeStore();

  // App 初始化流程
  useEffect(() => {
    async function prepare() {
      try {
        // 使用 Promise.all 并行处理所有异步初始化任务
        // 未来可以在数组中加入 loadFonts(), checkAuth() 等
        await Promise.all([
          initDatabase(),
          // new Promise(resolve => setTimeout(resolve, 2000)) // 模拟耗时操作测试 Splash Screen
        ]);
      } catch (e) {
        console.error('Initialization failed:', e);
        // 生产环境建议：在这里上报错误日志监控
        Alert.alert(
          "启动失败",
          "数据库初始化遇到问题，请尝试重启应用。",
          [{ text: "OK" }]
        );
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

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

  const palette = isDark ? colors.dark : colors.light;

  // 在 App 准备好之前，不渲染任何组件（此时用户看到的是 Splash Screen）
  if (!appIsReady) {
    return null;
  }

  return (
    <GluestackUIProvider mode={isDark ? 'dark' : 'light'}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: palette.backgroundSecondary,
          },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: palette.background,
          },
        }}
      />
    </GluestackUIProvider>
  );
}
