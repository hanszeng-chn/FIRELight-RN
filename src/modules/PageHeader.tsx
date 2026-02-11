import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type PageHeaderProps = {
  title: string;
  onProfilePress?: () => void;
};

export function PageHeader({ title, onProfilePress }: PageHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-2.5">
      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-md bg-warning-500">
          <Feather name="activity" size={16} color="white" />
        </View>
        <Text className="text-xl font-bold text-typography-900">{title}</Text>
      </View>
    </View>
  );
}
