import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Appearance, Text, View, useColorScheme } from "react-native";

import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";
import { initDatabase } from "@/src/services/database";
import { useThemeStore } from "@/src/stores/themeStore";

import { Button, ButtonText } from "@/src/components/ui/button";
import "../global.css";

// 保持启动页可见，直到我们通知它隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const systemColorScheme = useColorScheme();
  const { mode, isDark, syncWithSystem } = useThemeStore();

  // App 初始化流程
  const bootstrap = useCallback(async () => {
    try {
      setInitFailed(false);
      // 使用 Promise.all 并行处理所有异步初始化任务
      // 未来可以在数组中加入 loadFonts(), checkAuth() 等
      await Promise.all([initDatabase()]);
      setAppIsReady(true);
    } catch (e) {
      console.error("Initialization failed:", e);
      setInitFailed(true);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // 监听系统主题变化
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      syncWithSystem();
    });

    return () => subscription.remove();
  }, [syncWithSystem]);

  // 当系统主题变化时同步 (for useColorScheme hook)
  useEffect(() => {
    if (mode === "system") {
      syncWithSystem();
    }
  }, [systemColorScheme, mode, syncWithSystem]);

  // 在 App 准备好之前，不渲染任何组件（此时用户看到的是 Splash Screen）
  if (!appIsReady && !initFailed) {
    return null;
  }

  // 数据库初始化失败时，显示错误页面而非空数据
  if (initFailed) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          启动失败
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          数据库初始化遇到问题，请尝试重启应用。
        </Text>
        <Button
          variant="link"
          // style={{ fontSize: 14, color: "#2563EB" }}
          onPress={() => void bootstrap()}
        >
          <ButtonText>点击重试</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <GluestackUIProvider mode={isDark ? "dark" : "light"}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
