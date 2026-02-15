/**
 * 分类状态管理 - 使用 Zustand
 *
 * 分类是全局共享的，不绑定账本
 */

import {
  cleanupUnusedCategories as cleanupUnusedCategoriesService,
  createCategory as createCategoryService,
  deleteCategory as deleteCategoryService,
  getAllCategories,
  getCategoryTransactionCount,
  isCategoryNameExists,
  reorderCategories as reorderCategoriesService,
  toggleCategoryStatus as toggleCategoryStatusService,
  updateCategory as updateCategoryService,
} from "@/src/services/categoryService";
import type {
  Category,
  TransactionType,
  UpdateCategoryInput,
} from "@/src/types";
import { getAutoCategoryIcon } from "@/src/utils/category";
import { create } from "zustand";

const MAX_CATEGORY_NAME_LENGTH = 4;

const normalizeCategoryNameForCreate = (name: string): string =>
  Array.from(name.trim()).slice(0, MAX_CATEGORY_NAME_LENGTH).join("");

/**
 * 创建分类的输入参数
 */
export interface CreateCategoryParams {
  name: string;
  type: TransactionType;
}

interface CategoryState {
  /** 收入分类列表（包含启用和停用的，用于管理页面） */
  incomeCategories: Category[];
  /** 支出分类列表（包含启用和停用的，用于管理页面） */
  expenseCategories: Category[];
  /** 是否正在加载 */
  isLoading: boolean;

  /**
   * 加载所有分类
   * 同时加载收入和支出分类
   */
  loadCategories: () => Promise<void>;

  /**
   * 获取启用的分类（用于记账页面）
   * @param type 分类类型
   */
  getActiveCategories: (type: TransactionType) => Category[];

  /**
   * 新增自定义分类
   * @param params 分类参数
   * @throws 如果名称为空或重复
   */
  addCategory: (params: CreateCategoryParams) => Promise<Category>;

  /**
   * 更新分类
   * @param id 分类 ID
   * @param input 更新参数
   */
  updateCategory: (
    id: string,
    input: UpdateCategoryInput,
  ) => Promise<Category | null>;

  /**
   * 切换分类启用/停用状态
   * @param id 分类 ID
   */
  toggleCategoryStatus: (id: string) => Promise<Category | null>;

  /**
   * 批量更新分类排序（拖拽排序后调用）
   * @param orderedIds 排序后的分类 ID 数组
   */
  reorderCategories: (orderedIds: string[]) => Promise<void>;

  /**
   * 清理无用的自定义分类
   * 删除已停用且无关联交易的自定义分类
   * @returns 清理的分类数量
   */
  cleanupUnusedCategories: () => Promise<number>;

  /**
   * 检查分类名称是否已存在
   * @param name 分类名称
   * @param type 分类类型
   * @param excludeId 排除的分类 ID（编辑时使用）
   */
  checkNameExists: (
    name: string,
    type: TransactionType,
    excludeId?: string,
  ) => Promise<boolean>;

  /**
   * 删除自定义分类
   */
  deleteCategory: (id: string) => Promise<boolean>;

  /**
   * 按规则停用或删除分类
   * @returns 操作结果：deleted | deactivated | unchanged
   */
  deactivateOrDeleteCategory: (
    category: Category,
  ) => Promise<"deleted" | "deactivated" | "unchanged">;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  incomeCategories: [],
  expenseCategories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });

    try {
      const incomeCategories = await getAllCategories("income");
      const expenseCategories = await getAllCategories("expense");
      set({
        incomeCategories,
        expenseCategories,
        isLoading: false,
      });
    } catch (error) {
      console.error("[CategoryStore] Failed to load categories:", error);
      set({ isLoading: false });
    }
  },

  getActiveCategories: (type: TransactionType) => {
    // 直接从 state 获取并过滤，避免额外的数据库查询
    const categories =
      type === "income" ? get().incomeCategories : get().expenseCategories;
    return categories.filter((c) => c.is_active);
  },

  addCategory: async (params: CreateCategoryParams) => {
    const { name, type } = params;
    const normalizedName = normalizeCategoryNameForCreate(name);

    // 校验名称
    if (!normalizedName) {
      throw new Error("分类名称不能为空");
    }

    // 检查名称重复
    if (await isCategoryNameExists(normalizedName, type)) {
      throw new Error("分类名称已存在");
    }

    // 自动生成图标（取首字符）
    const icon = getAutoCategoryIcon(normalizedName);

    // 创建分类
    const category = await createCategoryService({
      name: normalizedName,
      icon,
      type,
      is_active: true,
      sort_order: 0, // 会在 service 中自动计算
    });

    // 刷新列表
    await get().loadCategories();

    return category;
  },

  updateCategory: async (id: string, input: UpdateCategoryInput) => {
    // 如果更新名称，需要校验
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new Error("分类名称不能为空");
      }

      // 获取当前分类类型来检查重复
      const { incomeCategories, expenseCategories } = get();
      const allCategories = [...incomeCategories, ...expenseCategories];
      const currentCategory = allCategories.find((c) => c.id === id);

      if (
        currentCategory &&
        (await isCategoryNameExists(trimmedName, currentCategory.type, id))
      ) {
        throw new Error("分类名称已存在");
      }

      // 更新图标为新名称首字符
      input.name = trimmedName;
      input.icon = getAutoCategoryIcon(trimmedName);
    }

    const result = await updateCategoryService(id, input);

    // 刷新列表
    await get().loadCategories();

    return result;
  },

  toggleCategoryStatus: async (id: string) => {
    const result = await toggleCategoryStatusService(id);

    // 刷新列表
    await get().loadCategories();

    return result;
  },

  reorderCategories: async (orderedIds: string[]) => {
    await reorderCategoriesService(orderedIds);

    // 刷新列表
    await get().loadCategories();
  },

  cleanupUnusedCategories: async () => {
    const count = await cleanupUnusedCategoriesService();

    if (count > 0) {
      // 刷新列表
      await get().loadCategories();
    }

    return count;
  },

  checkNameExists: async (
    name: string,
    type: TransactionType,
    excludeId?: string,
  ) => {
    return await isCategoryNameExists(name.trim(), type, excludeId);
  },

  deleteCategory: async (id: string) => {
    const result = await deleteCategoryService(id);
    if (result) {
      await get().loadCategories();
    }
    return result;
  },

  deactivateOrDeleteCategory: async (category: Category) => {
    if (!category.is_active) {
      return "unchanged";
    }

    if (category.is_system) {
      await toggleCategoryStatusService(category.id);
      await get().loadCategories();
      return "deactivated";
    }

    const transactionCount = await getCategoryTransactionCount(category.id);
    if (transactionCount > 0) {
      await toggleCategoryStatusService(category.id);
      await get().loadCategories();
      return "deactivated";
    }

    await deleteCategoryService(category.id);
    await get().loadCategories();
    return "deleted";
  },
}));
