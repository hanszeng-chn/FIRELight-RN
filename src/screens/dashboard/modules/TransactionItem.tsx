import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export type TransactionItemProps = {
  title: string;
  subtitle: string;
  amount: string;
  status?: string;
  icon: "send" | "repeat";
  showDivider?: boolean;
};

export function TransactionItem({
  title,
  subtitle,
  amount,
  status,
  icon,
  showDivider = true,
}: TransactionItemProps) {
  const normalizedAmount = amount.trim();
  const amountTextClassName = normalizedAmount.startsWith("-")
    ? "text-error-700"
    : normalizedAmount.startsWith("+")
      ? "text-success-700"
      : "text-typography-900";

  return (
    <View className="bg-background-0 px-5">
      <View className="flex-row items-center gap-3 py-3.5">
        <View className="h-10 w-10 items-center justify-center rounded-full border border-outline-200">
          <Feather name={icon} size={18} color="#374151" />
        </View>

        <View className="flex-1 pr-2">
          <Text numberOfLines={1} className="text-base font-medium text-typography-900">
            {title}
          </Text>
          <Text className="mt-0.5 text-sm leading-5 text-typography-500">{subtitle}</Text>
        </View>

        <View className="items-end">
          <Text className={`text-lg font-semibold ${amountTextClassName}`}>{amount}</Text>
          {status ? <Text className="mt-0.5 text-sm text-warning-600">{status}</Text> : null}
        </View>
      </View>

      {showDivider ? <View className="h-px bg-outline-100" /> : null}
    </View>
  );
}
