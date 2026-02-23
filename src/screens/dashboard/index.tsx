import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { Fab, FabIcon, FabLabel } from "@/src/components/ui/fab";
import { Icon } from "@/src/components/ui/icon";
import { getCategoryTransactionCount } from "@/src/services";
import { useCategoryStore, useTransactionStore } from "@/src/stores";
import { appAlert } from "@/src/stores/alertDialogStore";
import type { Transaction } from "@/src/types";
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
  const insets = useSafeAreaInsets();
  const currentYear = useTransactionStore((state) => state.currentYear);
  const currentMonth = useTransactionStore((state) => state.currentMonth);
  const transactionsByDate = useTransactionStore(
    (state) => state.transactionsByDate,
  );
  const monthlyStats = useTransactionStore((state) => state.monthlyStats);
  const isLoading = useTransactionStore((state) => state.isLoading);
  const initialize = useTransactionStore((state) => state.initialize);
  const setMonth = useTransactionStore((state) => state.setMonth);
  const incomeCategories = useCategoryStore((state) => state.incomeCategories);
  const expenseCategories = useCategoryStore(
    (state) => state.expenseCategories,
  );
  const loadCategories = useCategoryStore((state) => state.loadCategories);
  const deleteTransaction = useTransactionStore(
    (state) => state.deleteTransaction,
  );
  const categoryMap = useMemo(
    () =>
      new Map(
        [...incomeCategories, ...expenseCategories].map((category) => [
          category.id,
          category,
        ]),
      ),
    [incomeCategories, expenseCategories],
  );

  const openAddTransaction = () => {
    router.push("/add-transaction");
  };

  const openEditTransaction = useCallback(
    (transactionId: string) => {
      router.push({
        pathname: "/add-transaction",
        params: {
          mode: "edit",
          id: transactionId,
        },
      });
    },
    [router],
  );

  const getDeleteConfirmMessage = useCallback(
    async (item: Transaction): Promise<string> => {
      const category = categoryMap.get(item.category_id);
      if (category && !category.is_system && !category.is_active) {
        try {
          const count = await getCategoryTransactionCount(category.id);
          if (count <= 1) {
            return "删除该条目将同时删除停用分类，是否继续？";
          }
        } catch (error) {
          console.error("[Dashboard] Failed to load category tx count:", error);
        }
      }

      return "删除后不可恢复，是否继续？";
    },
    [categoryMap],
  );

  const confirmDeleteTransaction = useCallback(
    async (item: Transaction) => {
      const message = await getDeleteConfirmMessage(item);

      appAlert("删除条目", message, [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                const deleted = await deleteTransaction(item.id);
                if (!deleted) {
                  appAlert("删除失败", "删除失败，请重试");
                }
              } catch (error) {
                console.error(
                  "[Dashboard] Failed to delete transaction:",
                  error,
                );
                appAlert("删除失败", "删除失败，请重试");
              }
            })();
          },
        },
      ]);
    },
    [deleteTransaction, getDeleteConfirmMessage],
  );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (incomeCategories.length === 0 && expenseCategories.length === 0) {
      void loadCategories();
    }
  }, [incomeCategories.length, expenseCategories.length, loadCategories]);

  const hasTransactions = transactionsByDate.length > 0;
  const scrollBottomPadding = hasTransactions
    ? 68 + insets.bottom
    : 12 + insets.bottom;
  const incomeText = useMemo(
    () => `+${formatAmount(monthlyStats.totalIncome)}`,
    [monthlyStats.totalIncome],
  );
  const expenseText = useMemo(
    () => `-${formatAmount(monthlyStats.totalExpense)}`,
    [monthlyStats.totalExpense],
  );

  return (
    <View className="flex-1 bg-background-100">
      <SafeAreaView edges={["top"]} />
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

        <View className="mt-2 flex-1 bg-background-0">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
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
                    {section.transactions.map((item, index) => {
                      const category = categoryMap.get(item.category_id);
                      const note = item.note?.trim();

                      return (
                        <TransactionItem
                          key={item.id}
                          title={
                            category?.name ||
                            (item.type === "income" ? "收入" : "支出")
                          }
                          subtitle={note || undefined}
                          amount={`${item.type === "income" ? "+" : "-"}${formatAmount(item.amount)}`}
                          icon={
                            category?.icon ||
                            (item.type === "income" ? "收" : "支")
                          }
                          showDivider={
                            index !== section.transactions.length - 1
                          }
                          onEdit={() => openEditTransaction(item.id)}
                          onDelete={() => void confirmDeleteTransaction(item)}
                        />
                      );
                    })}
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
          <SafeAreaView edges={["bottom"]} />
        </View>
      </View>

      {hasTransactions ? (
        <Fab
          size="sm"
          placement="bottom right"
          isHovered={false}
          isDisabled={false}
          isPressed={false}
          onPress={openAddTransaction}
        >
          <FabIcon as={Plus} />
          <FabLabel>记一笔</FabLabel>
        </Fab>
      ) : null}
    </View>
  );
}
