import { Text, View } from "react-native";

type IncomeExpenseSummaryProps = {
  income: string;
  expense: string;
};

function MetricItem({ label, value }: { label: string; value: string }) {
  const normalizedValue = value.trim();
  const valueTextClassName = normalizedValue.startsWith("-")
    ? "text-error-700"
    : normalizedValue.startsWith("+")
      ? "text-success-700"
      : "text-typography-900";

  return (
    <View className="flex-1 px-5 py-3">
      <Text className={`text-xl font-semibold ${valueTextClassName}`}>{value}</Text>
      <Text className="text-sm text-typography-500">{label}</Text>
    </View>
  );
}

export function IncomeExpenseSummary({
  income,
  expense,
}: IncomeExpenseSummaryProps) {
  return (
    <View className="flex-row bg-background-0">
      <MetricItem label="收入" value={income} />
      <View className="my-4 w-px bg-outline-100" />
      <MetricItem label="支出" value={expense} />
    </View>
  );
}
