/**
 * 服务层导出入口
 */

// 数据库核心服务
export {
    closeDatabase,
    getDatabase,
    getDefaultLedgerId, initDatabase
} from './database';

// 账本服务
export {
    createLedger, deleteLedger, getAllLedgers, getDefaultLedger, getLedgerById, updateLedger
} from './ledgerService';

// 分类服务
export {
    cleanupUnusedCategories, createCategory, deleteCategory, getActiveCategories,
    getAllCategories,
    getCategoryById, isCategoryNameExists, reorderCategories, toggleCategoryStatus, updateCategory
} from './categoryService';

// 交易服务
export {
    createTransaction, deleteTransaction, getLatestTransactionMonth, getMonthlyStats, getMonthsWithData, getTransactionById,
    getTransactions,
    getTransactionsByMonth, updateTransaction
} from './transactionService';

// 类型导出
export type {
    MonthlyStats, TransactionFilter,
    TransactionsByDate
} from './transactionService';

