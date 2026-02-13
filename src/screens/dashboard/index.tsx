import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { Fab, FabIcon, FabLabel } from "@/src/components/ui/fab";
import { Icon } from "@/src/components/ui/icon";
import { useTransactionStore } from "@/src/stores";
import { FileText, Plus } from "lucide-react-native";
import { IncomeExpenseSummary } from "./modules/IncomeExpenseSummary";
import { MonthSelect } from "./modules/MonthSelect";
import { PageHeader } from "./modules/PageHeader";
import { SectionTitle } from "./modules/SectionTitle";
import { TransactionItem } from "./modules/TransactionItem";

const formatAmount = (amount: number) =>
  amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDateLabel = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }
  return `${String(month).padStart(2, "0")}月${String(day).padStart(2, "0")}日`;
};

export default function DashboardScreen() {
  const router = useRouter();
  const currentYear = useTransactionStore((state) => state.currentYear);
  const currentMonth = useTransactionStore((state) => state.currentMonth);
  const transactionsByDate = useTransactionStore(
    (state) => state.transactionsByDate,
  );
  const monthlyStats = useTransactionStore((state) => state.monthlyStats);
  const isLoading = useTransactionStore((state) => state.isLoading);
  const initialize = useTransactionStore((state) => state.initialize);
  const setMonth = useTransactionStore((state) => state.setMonth);

  const openAddTransaction = () => {
    router.push("/add-transaction");
  };

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const hasTransactions = transactionsByDate.length > 0;
  const incomeText = useMemo(
    () => `+${formatAmount(monthlyStats.totalIncome)}`,
    [monthlyStats.totalIncome],
  );
  const expenseText = useMemo(
    () => `-${formatAmount(monthlyStats.totalExpense)}`,
    [monthlyStats.totalExpense],
  );

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <View className="flex-1 bg-background-100">
        <PageHeader title="FIRELight" />

        <View className="mt-2 flex-1 rounded-tl-lg rounded-tr-lg bg-background-0 shadow-soft-1">
          <MonthSelect
            monthLabel={`${currentYear}年 ${currentMonth}月`}
            onConfirm={(year, month) => {
              void setMonth(year, month);
            }}
          />
          {!isLoading && hasTransactions ? (
            <IncomeExpenseSummary income={incomeText} expense={expenseText} />
          ) : null}

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 112 }}
          >
            {isLoading ? (
              <View className="items-center px-5 py-14">
                <Text className="text-base text-typography-500">加载中...</Text>
              </View>
            ) : null}

            {!isLoading && hasTransactions
              ? transactionsByDate.map((section) => (
                  <View key={section.date}>
                    <SectionTitle
                      leftLabel={formatDateLabel(section.date)}
                      expenseLabel={`支出 ${formatAmount(section.totalExpense)}`}
                      incomeLabel={`收入 ${formatAmount(section.totalIncome)}`}
                    />
                    {section.transactions.map((item, index) => (
                      <TransactionItem
                        key={item.id}
                        title={
                          item.note?.trim() ||
                          (item.type === "income" ? "收入" : "支出")
                        }
                        subtitle={
                          item.type === "income" ? "收入分类" : "支出分类"
                        }
                        amount={`${item.type === "income" ? "+" : "-"}${formatAmount(item.amount)}`}
                        icon={item.type === "income" ? "repeat" : "send"}
                        showDivider={index !== section.transactions.length - 1}
                      />
                    ))}
                  </View>
                ))
              : null}

            {!isLoading && !hasTransactions ? (
              <View className="items-center px-6 py-16">
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                  <Icon as={FileText} size="xl" />
                </View>
                <Text className="text-lg font-semibold text-typography-900">
                  本月暂无账目
                </Text>
                <Text className="mt-1 text-sm text-typography-500">
                  快记一笔吧
                </Text>
                <Button
                  className="mt-6 "
                  variant="solid"
                  size="md"
                  action="primary"
                  onPress={openAddTransaction}
                  accessibilityRole="button"
                  accessibilityLabel="去记一笔"
                >
                  <ButtonIcon as={Plus} />
                  <ButtonText>去记一笔</ButtonText>
                </Button>
              </View>
            ) : null}
          </ScrollView>
        </View>

        {hasTransactions ? (
          <Fab
            size="sm"
            placement="bottom right"
            isHovered={false}
            isDisabled={false}
            isPressed={false}
          >
            <FabIcon as={Plus} />
            <FabLabel>记一笔</FabLabel>
          </Fab>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
