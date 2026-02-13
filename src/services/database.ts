/**
 * 数据库核心服务
 *
 * 职责：
 * - 初始化 SQLite 数据库
 * - 执行数据库迁移（表结构变更）
 * - 初始化默认账本
 * - 同步系统分类（每次启动）
 */

import { SYSTEM_CATEGORIES } from "@/src/config/systemCategories";
import { generateUUID } from "@/src/utils/uuid";
import * as SQLite from "expo-sqlite";

// 数据库配置
const DATABASE_NAME = "firelight.db";
const SCHEMA_VERSION = 1;

// 数据库实例（通过 globalThis 缓存，防止 Web HMR 重载模块时丢失引用）
const DB_GLOBAL_KEY = "__firelight_db__";
const DB_INIT_KEY = "__firelight_db_init__";
let db: SQLite.SQLiteDatabase | null =
  (globalThis as Record<string, unknown>)[DB_GLOBAL_KEY] as SQLite.SQLiteDatabase | null ?? null;

/**
 * 获取数据库实例
 * @throws 如果数据库未初始化
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

/**
 * 尝试验证已有连接是否可用
 */
const isConnectionAlive = async (conn: SQLite.SQLiteDatabase): Promise<boolean> => {
  try {
    await conn.getFirstAsync("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

/**
 * 初始化数据库
 * App 启动时调用此函数
 *
 * 处理三种场景：
 * 1. 首次打开 — 正常 open + migrate
 * 2. HMR 热更新 — globalThis 恢复旧连接，验证后直接复用
 * 3. 旧连接失效 — 关闭旧连接再重新 open
 */
export const initDatabase = async (): Promise<void> => {
  // 防止并发调用（React StrictMode / HMR 双触发）
  const g = globalThis as Record<string, unknown>;
  if (g[DB_INIT_KEY]) {
    // 已有一个 initDatabase 在跑，等它结束
    await (g[DB_INIT_KEY] as Promise<void>);
    return;
  }

  const doInit = async () => {
    // 1. 如果有缓存连接，尝试复用
    if (db) {
      if (await isConnectionAlive(db)) {
        console.log("[Database] Reusing existing connection");
        return;
      }
      // 连接已失效，尝试关闭释放 OPFS AccessHandle
      console.warn("[Database] Cached connection is stale, closing...");
      try { db.closeSync(); } catch { /* ignore */ }
      db = null;
      g[DB_GLOBAL_KEY] = null;
    }

    console.log("[Database] Initializing...");

    // 2. 打开数据库
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    g[DB_GLOBAL_KEY] = db;
    console.log("[Database] Opened database:", DATABASE_NAME);

    // 3. 执行迁移
    await runMigrations();

    // 4. 初始化默认账本
    await initDefaultLedger();

    // 5. 同步系统分类
    await syncSystemCategories();

    console.log("[Database] Initialization complete");
  };

  const promise = doInit();
  g[DB_INIT_KEY] = promise;
  try {
    await promise;
  } finally {
    g[DB_INIT_KEY] = null;
  }
};

/**
 * 关闭数据库连接
 */
export const closeDatabase = (): void => {
  if (db) {
    db.closeSync();
    db = null;
    (globalThis as Record<string, unknown>)[DB_GLOBAL_KEY] = null;
    console.log("[Database] Closed");
  }
};

/**
 * 数据库迁移
 * 根据版本号执行增量迁移脚本
 */
const runMigrations = async (): Promise<void> => {
  const result = await db!.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = result?.user_version ?? 0;

  console.log(
    `[Database] Current version: ${currentVersion}, target version: ${SCHEMA_VERSION}`,
  );

  // 版本 1：初始表结构
  if (currentVersion < 1) {
    console.log("[Database] Running migration v1: Initial schema");

    await db!.execAsync(`
      -- 账本表
      CREATE TABLE IF NOT EXISTS ledgers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- 分类表
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        is_system INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        deprecated INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- 交易表
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        ledger_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        category_id TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- 索引：提升查询性能
      CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date 
        ON transactions(ledger_id, date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category 
        ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_type_active 
        ON categories(type, is_active);
    `);

    console.log("[Database] Migration v1 complete");
  }

  // 未来版本迁移在这里添加...
  // if (currentVersion < 2) { ... }

  // 更新版本号
  if (currentVersion < SCHEMA_VERSION) {
    await db!.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    console.log(`[Database] Updated to version ${SCHEMA_VERSION}`);
  }
};

/**
 * 初始化默认账本
 * 仅在首次运行时创建
 */
const initDefaultLedger = async (): Promise<void> => {
  const existing = await db!.getFirstAsync<{ id: string }>(
    "SELECT id FROM ledgers WHERE is_default = 1",
  );

  if (existing) {
    console.log("[Database] Default ledger already exists:", existing.id);
    return;
  }

  const now = new Date().toISOString();
  const id = generateUUID();

  await db!.runAsync(
    `INSERT INTO ledgers (id, name, icon, color, is_default, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, "默认账本", "📒", "#6366F1", 1, 0, now, now],
  );

  console.log("[Database] Created default ledger:", id);
};

/**
 * 同步系统分类
 * 每次 App 启动都执行，使用 UPSERT 机制
 *
 * 逻辑：
 * - 新分类 → INSERT
 * - 已有分类 → UPDATE name, icon, sort_order, deprecated
 * - 保留用户的 is_active 设置
 */
const syncSystemCategories = async (): Promise<void> => {
  console.log(
    `[Database] Syncing ${SYSTEM_CATEGORIES.length} system categories...`,
  );

  const now = new Date().toISOString();

  for (const cat of SYSTEM_CATEGORIES) {
    await db!.runAsync(
      `INSERT INTO categories (id, name, icon, type, is_system, is_active, sort_order, deprecated, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET 
         name = excluded.name,
         icon = excluded.icon,
         sort_order = excluded.sort_order,
         deprecated = excluded.deprecated,
         updated_at = excluded.updated_at`,
      [
        cat.id,
        cat.name,
        cat.icon,
        cat.type,
        cat.sort_order,
        cat.deprecated ? 1 : 0,
        now,
        now,
      ],
    );
  }

  console.log("[Database] System categories synced");
};

/**
 * 获取默认账本 ID
 */
export const getDefaultLedgerId = async (): Promise<string> => {
  const result = await db!.getFirstAsync<{ id: string }>(
    "SELECT id FROM ledgers WHERE is_default = 1",
  );

  if (!result) {
    throw new Error("Default ledger not found");
  }

  return result.id;
};
