import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ButtonIcon } from "@/src/components/ui/button";

export default function AddTransactionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <View className="flex-row items-center px-5 py-3">
        <Button
          action="default"
          variant="solid"
          size="sm"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <ButtonIcon as={ChevronLeft} size="lg" />
        </Button>
        <Text className="text-xl font-bold text-typography-900">记一笔</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-lg font-semibold text-typography-900">
          记一笔页面开发中
        </Text>
        <Text className="mt-2 text-center text-sm text-typography-500">
          已打通首页入口，后续可在此补充分类与金额输入流程。
        </Text>
      </View>
    </SafeAreaView>
  );
}
