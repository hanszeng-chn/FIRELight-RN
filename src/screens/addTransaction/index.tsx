import { BackPageHeader } from "@/src/components/page-header/BackPageHeader";
import {
  SwitchTabs,
  type SwitchTabItem,
} from "@/src/components/tabs/SwitchTabs";
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast";
import { getCategoryTransactionCount, getTransactionById } from "@/src/services";
import { appAlert } from "@/src/stores/alertDialogStore";
import { useCategoryStore, useTransactionStore } from "@/src/stores";
import type { Category, TransactionType } from "@/src/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryGrid } from "./modules/CategoryGrid";
import { NumberPad } from "./modules/NumberPad";

function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const TABS: SwitchTabItem<TransactionType>[] = [
  { key: "expense", label: "支出" },
  { key: "income", label: "收入" },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string | string[];
    id?: string | string[];
  }>();
  const toast = useToast();

  // Stores
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const expenseCategories = useCategoryStore((s) => s.expenseCategories);
  const incomeCategories = useCategoryStore((s) => s.incomeCategories);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const normalizeParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const mode = normalizeParam(params.mode);
  const editingTransactionId = normalizeParam(params.id);
  const isEditMode = mode === "edit" && Boolean(editingTransactionId);

  // Local state
  const [activeType, setActiveType] = useState<TransactionType>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayISO);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialForm, setInitialForm] = useState<{
    type: TransactionType;
    categoryId: string | null;
    amountStr: string;
    note: string;
    date: string;
  } | null>(null);

  const showToast = useCallback(
    (message: string, action: "error" | "warning" | "success" = "error") => {
      toast.show({
        placement: "top",
        duration: 1800,
        render: () => (
          <Toast action={action} variant="solid">
            <ToastTitle>{message}</ToastTitle>
          </Toast>
        ),
      });
    },
    [toast],
  );

  // Load categories on mount
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const allCategories = useMemo(
    () => [...expenseCategories, ...incomeCategories],
    [expenseCategories, incomeCategories],
  );

  const selectedCategory = useMemo(
    () =>
      allCategories.find((category) => category.id === selectedCategoryId) ??
      null,
    [allCategories, selectedCategoryId],
  );

  const editingOriginalCategoryId = isEditMode
    ? (initialForm?.categoryId ?? null)
    : null;

  const editingOriginalCategory = useMemo(
    () =>
      allCategories.find((category) => category.id === editingOriginalCategoryId) ??
      null,
    [allCategories, editingOriginalCategoryId],
  );

  const categories = useMemo(() => {
    const all = activeType === "expense" ? expenseCategories : incomeCategories;
    return all
      .filter((category) => {
        if (category.is_active) {
          return true;
        }
        return (
          isEditMode &&
          editingOriginalCategory &&
          editingOriginalCategory.type === activeType &&
          category.id === editingOriginalCategory.id
        );
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [
    activeType,
    editingOriginalCategory,
    expenseCategories,
    incomeCategories,
    isEditMode,
  ]);

  useEffect(() => {
    if (!isEditMode && selectedCategory && !selectedCategory.is_active) {
      setSelectedCategoryId(null);
      setIsInputVisible(false);
    }
  }, [isEditMode, selectedCategory]);

  useEffect(() => {
    if (isEditMode || initialForm) {
      return;
    }
    setInitialForm({
      type: "expense",
      categoryId: null,
      amountStr: "",
      note: "",
      date: getTodayISO(),
    });
  }, [isEditMode, initialForm]);

  useEffect(() => {
    if (!isEditMode || !editingTransactionId) {
      return;
    }

    let cancelled = false;
    const loadEditingTransaction = async () => {
      try {
        const transaction = await getTransactionById(editingTransactionId);
        if (!transaction) {
          showToast("未找到该条目");
          router.back();
          return;
        }

        if (cancelled) {
          return;
        }

        const nextAmountStr = String(transaction.amount);
        setActiveType(transaction.type);
        setSelectedCategoryId(transaction.category_id);
        setAmountStr(nextAmountStr);
        setNote(transaction.note ?? "");
        setDate(transaction.date);
        setIsInputVisible(true);
        setInitialForm({
          type: transaction.type,
          categoryId: transaction.category_id,
          amountStr: nextAmountStr,
          note: transaction.note ?? "",
          date: transaction.date,
        });
      } catch (error) {
        console.error("[AddTransaction] Failed to load transaction:", error);
        showToast("加载失败，请重试");
        router.back();
      }
    };

    void loadEditingTransaction();
    return () => {
      cancelled = true;
    };
  }, [editingTransactionId, isEditMode, router, showToast]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleTabChange = useCallback(
    (type: TransactionType) => {
      setActiveType(type);
      setSelectedCategoryId(null);
      setIsInputVisible(false);
      if (!isEditMode) {
        setAmountStr("");
        setNote("");
      }
    },
    [isEditMode],
  );

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategoryId(category.id);
    setIsInputVisible(true);
  }, []);

  const handleOpenCategoryManagement = useCallback(() => {
    router.push({
      pathname: "/category-management",
      params: { type: activeType },
    });
  }, [activeType, router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedCategoryId || isSubmitting) return;

    const amount = parseFloat(amountStr);
    if (!(amount > 0)) return;

    const submitTransaction = async () => {
      setIsSubmitting(true);
      try {
        if (isEditMode && editingTransactionId) {
          const updated = await updateTransaction(editingTransactionId, {
            type: activeType,
            amount,
            category_id: selectedCategoryId,
            date,
            note: note.trim() || "",
          });
          if (!updated) {
            throw new Error("更新失败，请重试");
          }
        } else {
          await addTransaction({
            type: activeType,
            amount,
            category_id: selectedCategoryId,
            date,
            note: note.trim() || undefined,
          });
        }
        router.back();
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : isEditMode
              ? "更新失败，请重试"
              : "保存失败，请重试",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    if (
      isEditMode &&
      editingOriginalCategoryId &&
      selectedCategoryId !== editingOriginalCategoryId
    ) {
      const previousCategory = allCategories.find(
        (category) => category.id === editingOriginalCategoryId,
      );

      if (previousCategory && !previousCategory.is_system && !previousCategory.is_active) {
        try {
          const count = await getCategoryTransactionCount(previousCategory.id);
          if (count <= 1) {
            const categoryName = previousCategory.name.trim() || "该分类";
            appAlert(
              "确认修改",
              `修改后将删除停用自定义分类「${categoryName}」，是否继续？`,
              [
                { text: "取消", style: "cancel" },
                {
                  text: "确认修改",
                  style: "destructive",
                  onPress: () => {
                    void submitTransaction();
                  },
                },
              ],
            );
            return;
          }
        } catch (error) {
          console.error(
            "[AddTransaction] Failed to check category tx count before update:",
            error,
          );
          showToast("校验分类失败，请重试");
          return;
        }
      }
    }

    await submitTransaction();
  }, [
    selectedCategoryId,
    isSubmitting,
    amountStr,
    isEditMode,
    editingOriginalCategoryId,
    allCategories,
    editingTransactionId,
    updateTransaction,
    activeType,
    date,
    note,
    addTransaction,
    router,
    showToast,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <BackPageHeader
        onBack={handleBack}
        center={
          <SwitchTabs
            tabs={TABS}
            activeKey={activeType}
            onChange={handleTabChange}
            variant="underline"
          />
        }
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CategoryGrid
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
          onOpenSettings={handleOpenCategoryManagement}
        />
      </ScrollView>

      {/* Number Pad — fixed at bottom, visible after selecting a category */}
      {isInputVisible && selectedCategoryId ? (
        <NumberPad
          categoryName={selectedCategory?.name ?? ""}
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
