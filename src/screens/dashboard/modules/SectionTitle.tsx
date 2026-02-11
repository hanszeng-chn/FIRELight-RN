import { Text, View } from "react-native";

type SectionTitleProps = {
  leftLabel: string;
  expenseLabel: string;
  incomeLabel: string;
};

export function SectionTitle({
  leftLabel,
  expenseLabel,
  incomeLabel,
}: SectionTitleProps) {
  return (
    <View className="flex-row items-center justify-between bg-background-100 px-5 py-2.5">
      <Text className="text-base font-semibold text-typography-900">{leftLabel}</Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-sm font-medium text-typography-500">{expenseLabel}</Text>
        <View className="h-3.5 w-px bg-outline-200" />
        <Text className="text-sm font-medium text-typography-500">{incomeLabel}</Text>
      </View>
    </View>
  );
}
