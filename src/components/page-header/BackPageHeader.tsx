import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type BackPageHeaderProps = {
  onBack: () => void;
  title?: string;
  center?: ReactNode;
  right?: ReactNode;
  backLabel?: string;
};

export function BackPageHeader({
  onBack,
  title,
  center,
  right,
  backLabel = "返回",
}: BackPageHeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-2.5">
      <Pressable
        className="h-8 w-10 items-start justify-center"
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
      >
        <ChevronLeft size={24} color="#374151" />
      </Pressable>

      <View className="flex-1">
        {center ? (
          center
        ) : (
          <Text className="text-center text-lg font-semibold text-typography-900">
            {title}
          </Text>
        )}
      </View>

      {right ? <View className="w-10 items-end">{right}</View> : <View className="w-10" />}
    </View>
  );
}
