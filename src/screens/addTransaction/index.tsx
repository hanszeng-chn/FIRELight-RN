import { useCategoryStore, useTransactionStore } from "@/src/stores";
import type { Category, TransactionType } from "@/src/types";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryGrid } from "./modules/CategoryGrid";
import { NumberPad } from "./modules/NumberPad";

function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const TABS: { type: TransactionType; label: string }[] = [
  { type: "expense", label: "支出" },
  { type: "income", label: "收入" },
];

export default function AddTransactionScreen() {
  const router = useRouter();

  // Stores
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const expenseCategories = useCategoryStore((s) => s.expenseCategories);
  const incomeCategories = useCategoryStore((s) => s.incomeCategories);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  // Local state
  const [activeType, setActiveType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayISO);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const categories = useMemo(() => {
    const all = activeType === "expense" ? expenseCategories : incomeCategories;
    return all.filter((c) => c.is_active);
  }, [activeType, expenseCategories, incomeCategories]);

  const hasUnsavedInput = amountStr !== "" || note !== "";

  // Handlers
  const handleBack = useCallback(() => {
    if (hasUnsavedInput) {
      Alert.alert("放弃本次输入？", "已输入的内容将不会保存。", [
        { text: "继续编辑", style: "cancel" },
        {
          text: "放弃",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  }, [hasUnsavedInput, router]);

  const handleTabChange = useCallback((type: TransactionType) => {
    setActiveType(type);
    setSelectedCategory(null);
    setIsInputVisible(false);
    setAmountStr("");
    setNote("");
  }, []);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    setIsInputVisible(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedCategory || isSubmitting) return;

    const amount = parseFloat(amountStr);
    if (!(amount > 0)) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type: activeType,
        amount,
        category_id: selectedCategory.id,
        date,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "保存失败",
        error instanceof Error ? error.message : "请重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedCategory,
    isSubmitting,
    amountStr,
    addTransaction,
    activeType,
    date,
    note,
    router,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2.5">
        <Pressable
          className="h-8 w-10 items-start justify-center"
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <ChevronLeft size={24} color="#374151" />
        </Pressable>

        <View className="flex-1 flex-row justify-center gap-6">
          {TABS.map((tab) => {
            const isActive = activeType === tab.type;
            return (
              <Pressable
                key={tab.type}
                className="items-center"
                onPress={() => handleTabChange(tab.type)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <Text
                  className={`text-base leading-7 ${
                    isActive
                      ? "font-semibold text-typography-900"
                      : "font-medium text-typography-400"
                  }`}
                >
                  {tab.label}
                </Text>
                <View
                  className={`mt-0.5 h-0.5 w-8 rounded-full ${isActive ? "bg-primary-600" : "bg-transparent"}`}
                />
              </Pressable>
            );
          })}
        </View>
        {/* Right spacer to balance the back button */}
        <View className="w-10" />
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CategoryGrid
          categories={categories}
          selectedId={selectedCategory?.id ?? null}
          onSelect={handleCategorySelect}
        />
      </ScrollView>

      {/* Number Pad — fixed at bottom, visible after selecting a category */}
      {isInputVisible && selectedCategory ? (
        <NumberPad
          categoryName={selectedCategory.name}
          amountStr={amountStr}
          note={note}
          date={date}
          onAmountChange={setAmountStr}
          onNoteChange={setNote}
          onDateChange={setDate}
          onSubmit={handleSubmit}
        />
      ) : null}
    </SafeAreaView>
  );
}
