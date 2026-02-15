import { BackPageHeader } from "@/src/components/page-header/BackPageHeader";
import {
  SwitchTabs,
  type SwitchTabItem,
} from "@/src/components/tabs/SwitchTabs";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Input, InputField } from "@/src/components/ui/input";
import { Toast, ToastTitle, useToast } from "@/src/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipText,
} from "@/src/components/ui/tooltip";
import { getCategoryTransactionCount } from "@/src/services/categoryService";
import { useCategoryStore } from "@/src/stores";
import { appAlert } from "@/src/stores/alertDialogStore";
import type { Category, TransactionType } from "@/src/types";
import { getAutoCategoryIcon } from "@/src/utils/category";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bolt, GripHorizontal, Info, Minus, Plus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS: SwitchTabItem<TransactionType>[] = [
  { key: "expense", label: "支出" },
  { key: "income", label: "收入" },
];

const parseTypeParam = (
  type: string | string[] | undefined,
): TransactionType => {
  return type === "income" ? "income" : "expense";
};

export default function CategoryManagementScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string | string[] }>();
  const toast = useToast();

  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const cleanupUnusedCategories = useCategoryStore(
    (s) => s.cleanupUnusedCategories,
  );
  const expenseCategories = useCategoryStore((s) => s.expenseCategories);
  const incomeCategories = useCategoryStore((s) => s.incomeCategories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const toggleCategoryStatus = useCategoryStore((s) => s.toggleCategoryStatus);
  const reorderCategories = useCategoryStore((s) => s.reorderCategories);
  const deactivateOrDeleteCategory = useCategoryStore(
    (s) => s.deactivateOrDeleteCategory,
  );
  const isLoading = useCategoryStore((s) => s.isLoading);

  const [activeType, setActiveType] = useState<TransactionType>(() =>
    parseTypeParam(type),
  );
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorName, setEditorName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [inactiveCategoryTxCountMap, setInactiveCategoryTxCountMap] = useState<
    Record<string, number>
  >({});
  const [activeInfoTooltipCategoryId, setActiveInfoTooltipCategoryId] =
    useState<string | null>(null);
  const isSaveDisabled = isSaving || editorName.trim().length === 0;

  useEffect(() => {
    const bootstrap = async () => {
      await cleanupUnusedCategories();
      await loadCategories();
    };
    void bootstrap();
  }, [cleanupUnusedCategories, loadCategories]);

  useEffect(() => {
    setActiveType(parseTypeParam(type));
  }, [type]);

  const currentCategories = useMemo(() => {
    const list =
      activeType === "expense" ? expenseCategories : incomeCategories;
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  }, [activeType, expenseCategories, incomeCategories]);

  const activeCategories = useMemo(
    () => currentCategories.filter((item) => item.is_active),
    [currentCategories],
  );

  const inactiveCategories = useMemo(
    () => currentCategories.filter((item) => !item.is_active),
    [currentCategories],
  );

  useEffect(() => {
    const customInactiveCategories = inactiveCategories.filter(
      (item) => !item.is_system,
    );
    if (customInactiveCategories.length === 0) {
      setInactiveCategoryTxCountMap({});
      return;
    }

    let cancelled = false;
    const fetchTransactionCounts = async () => {
      try {
        const entries = await Promise.all(
          customInactiveCategories.map(async (item) => {
            const count = await getCategoryTransactionCount(item.id);
            return [item.id, count] as const;
          }),
        );
        if (cancelled) {
          return;
        }
        setInactiveCategoryTxCountMap(Object.fromEntries(entries));
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[CategoryManagement] Failed to load inactive category transaction count:",
            error,
          );
          setInactiveCategoryTxCountMap({});
        }
      }
    };

    void fetchTransactionCounts();
    return () => {
      cancelled = true;
    };
  }, [inactiveCategories]);

  const showToast = useCallback(
    (message: string, action: "success" | "warning" | "error" = "success") => {
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

  const closeEditor = useCallback(() => {
    setEditorVisible(false);
    setIsSaving(false);
  }, []);

  const openCreateEditor = useCallback(() => {
    setEditingCategory(null);
    setEditorName("");
    setEditorVisible(true);
  }, []);

  const openEditEditor = useCallback((category: Category) => {
    if (category.is_system) {
      return;
    }
    setEditingCategory(category);
    setEditorName(category.name);
    setEditorVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmed = editorName.trim();
    if (!trimmed) {
      showToast("分类名称不能为空", "warning");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: trimmed });
      } else {
        await addCategory({ name: trimmed, type: activeType });
      }
      closeEditor();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "保存失败，请重试";
      showToast(message, "error");
      setIsSaving(false);
    }
  }, [
    activeType,
    addCategory,
    closeEditor,
    editingCategory,
    editorName,
    showToast,
    updateCategory,
  ]);

  const handleDeactivateOrDelete = useCallback(
    async (category: Category) => {
      const transactionCount = await getCategoryTransactionCount(category.id);
      const willDelete = !category.is_system && transactionCount === 0;

      const executeAction = async () => {
        try {
          const result = await deactivateOrDeleteCategory(category);
          if (result === "deleted") {
            showToast("已删除分类", "success");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "操作失败，请重试";
          showToast(errorMessage, "error");
        }
      };

      if (!willDelete) {
        await executeAction();
        return;
      }

      appAlert("删除分类", "该分类无历史数据，将被永久删除。是否继续？", [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => {
            void executeAction();
          },
        },
      ]);
    },
    [deactivateOrDeleteCategory, showToast],
  );

  const handleRestore = useCallback(
    async (category: Category) => {
      try {
        await toggleCategoryStatus(category.id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "恢复失败，请重试";
        showToast(errorMessage, "error");
      }
    },
    [showToast, toggleCategoryStatus],
  );

  const reorderByDirection = useCallback(
    async (categoryId: string, direction: "up" | "down") => {
      const index = activeCategories.findIndex(
        (item) => item.id === categoryId,
      );
      if (index < 0) {
        return;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= activeCategories.length) {
        return;
      }

      const reordered = [...activeCategories];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, moved);

      try {
        await reorderCategories(reordered.map((item) => item.id));
        showToast("排序已更新", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "排序失败，请重试";
        showToast(errorMessage, "error");
      }
    },
    [activeCategories, reorderCategories, showToast],
  );

  const handleScrollStart = useCallback(() => {
    setActiveInfoTooltipCategoryId((currentId) =>
      currentId === null ? currentId : null,
    );
  }, []);

  const handleOpenReorderMenu = useCallback(
    (categoryId: string) => {
      const index = activeCategories.findIndex(
        (item) => item.id === categoryId,
      );
      if (index < 0) {
        return;
      }

      const actions: {
        text: string;
        onPress?: () => void;
        style?: "cancel";
      }[] = [];

      if (index > 0) {
        actions.push({
          text: "上移",
          onPress: () => {
            void reorderByDirection(categoryId, "up");
          },
        });
      }

      if (index < activeCategories.length - 1) {
        actions.push({
          text: "下移",
          onPress: () => {
            void reorderByDirection(categoryId, "down");
          },
        });
      }

      actions.push({ text: "取消", style: "cancel" });

      appAlert("调整顺序", "选择移动方向", actions);
    },
    [activeCategories, reorderByDirection],
  );

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      <BackPageHeader onBack={() => router.back()} title="类别设置" />

      <View className="px-4 pb-2">
        <View className="mt-2 px-12">
          <SwitchTabs
            tabs={TABS}
            activeKey={activeType}
            onChange={setActiveType}
            variant="segmented"
          />
        </View>
      </View>

      <View className="h-[1px] bg-outline-100" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        // onTouchStart={handleScrollStart}
        onScroll={handleScrollStart}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollBegin={handleScrollStart}
      >
        <View>
          {isLoading && currentCategories.length === 0 ? (
            <Text className="py-12 text-center text-base text-typography-500">
              加载中...
            </Text>
          ) : null}

          {activeCategories.map((category) => (
            <View
              key={category.id}
              className="flex-row items-center border-b border-outline-100 bg-background-0 px-4 py-2.5"
            >
              <Pressable
                className="h-5 w-5 items-center justify-center rounded-full bg-error-500"
                onPress={() => void handleDeactivateOrDelete(category)}
                accessibilityRole="button"
                accessibilityLabel={`停用 ${category.name}`}
              >
                <Minus size={16} color="#FFFFFF" />
              </Pressable>

              <View className="ml-4 flex-1 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-background-200">
                  <Text className="text-sm font-semibold text-typography-800">
                    {category.icon}
                  </Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base text-typography-900">
                    {category.name}
                  </Text>
                  {!category.is_system ? (
                    <Text className="mt-0.5 text-xs text-typography-500">
                      自定义
                    </Text>
                  ) : null}
                </View>
              </View>

              {!category.is_system ? (
                <Pressable
                  className="ml-1 h-9 w-9 items-center justify-center"
                  onPress={() => openEditEditor(category)}
                  accessibilityRole="button"
                  accessibilityLabel={`编辑 ${category.name}`}
                >
                  <Bolt size={18} color="#6B7280" />
                </Pressable>
              ) : null}

              <Pressable
                className="ml-1 h-9 w-9 items-center justify-center"
                onPress={() => handleOpenReorderMenu(category.id)}
                accessibilityRole="button"
                accessibilityLabel={`调整 ${category.name} 排序`}
              >
                <GripHorizontal size={22} color="#9CA3AF" />
              </Pressable>
            </View>
          ))}

          {inactiveCategories.length > 0 ? (
            <>
              <View className="flex-row items-center justify-between border-b border-outline-100 bg-transparent px-4 py-3">
                <Text className="text-sm font-medium text-typography-600">
                  更多类别（{inactiveCategories.length}）
                </Text>
              </View>

              {inactiveCategories.map((category) => (
                <View
                  key={category.id}
                  className="flex-row items-center border-b border-outline-100 bg-background-0 px-4 py-2.5"
                >
                  <Pressable
                    className="h-5 w-5 items-center justify-center rounded-full bg-success-500"
                    onPress={() => void handleRestore(category)}
                    accessibilityRole="button"
                    accessibilityLabel={`恢复 ${category.name}`}
                  >
                    <Plus size={16} color="#FFFFFF" />
                  </Pressable>
                  <View className="ml-4 h-8 w-8 items-center justify-center rounded-full bg-background-200">
                    <Text className="text-sm font-semibold text-typography-700">
                      {category.icon}
                    </Text>
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-base text-typography-700">
                      {category.name}
                    </Text>
                    {!category.is_system ? (
                      <Text className="mt-0.5 text-xs text-typography-500">
                        自定义
                      </Text>
                    ) : null}
                  </View>
                  {!category.is_system &&
                  (inactiveCategoryTxCountMap[category.id] ?? 0) > 0 ? (
                    <Tooltip
                      placement="top"
                      offset={6}
                      isOpen={activeInfoTooltipCategoryId === category.id}
                      trigger={(triggerProps) => (
                        <Pressable
                          {...triggerProps}
                          className="ml-2 h-8 w-8 items-center justify-center"
                          onPress={() => {
                            setActiveInfoTooltipCategoryId((currentId) =>
                              currentId === category.id ? null : category.id,
                            );
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`查看 ${category.name} 保留原因`}
                        >
                          <Info size={16} color="#6B7280" />
                        </Pressable>
                      )}
                    >
                      <TooltipContent className="max-w-[220px]">
                        <TooltipText size="xs">
                          {`还有 ${inactiveCategoryTxCountMap[category.id] ?? 0} 条关联记录，删完后该分类会自动消失。`}
                        </TooltipText>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </View>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      <View className="border-t border-outline-100 bg-background-0 px-4 py-2 shadow-soft-1">
        <Pressable
          className="items-center justify-center py-1"
          onPress={openCreateEditor}
          accessibilityRole="button"
          accessibilityLabel="添加类别"
        >
          <View className="flex-row items-center">
            <Plus size={18} color="#111827" />
            <Text className="ml-1.5 text-base font-medium text-typography-900">
              添加类别
            </Text>
          </View>
        </Pressable>
      </View>

      <Actionsheet isOpen={editorVisible} onClose={closeEditor}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-4 pb-8 pt-2">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="mt-1 w-full flex-row items-center">
            <View className="w-20 items-start">
              <Button
                size="md"
                variant="link"
                action="secondary"
                onPress={closeEditor}
              >
                <ButtonText>取消</ButtonText>
              </Button>
            </View>
            <Text className="flex-1 text-center text-base font-semibold text-typography-900">
              {editingCategory ? "编辑类别" : "新增类别"}
            </Text>
            <View className="w-20 items-end">
              <Button
                size="md"
                variant="link"
                action="primary"
                onPress={() => void handleSave()}
                isDisabled={isSaveDisabled}
              >
                <ButtonText>{isSaving ? "保存中..." : "保存"}</ButtonText>
              </Button>
            </View>
          </View>

          <View className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-background-200">
            <Text className="text-base font-semibold text-typography-800">
              {getAutoCategoryIcon(editorName)}
            </Text>
          </View>

          <View className="mt-4 w-full">
            <Input>
              <InputField
                key={editingCategory ? `edit-${editingCategory.id}` : "create"}
                placeholder="请输入类别名称（最多4字）"
                defaultValue={editorName}
                onChangeText={setEditorName}
                autoFocus
                maxLength={4}
                returnKeyType="done"
              />
            </Input>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
