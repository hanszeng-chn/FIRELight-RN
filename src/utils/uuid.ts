/**
 * UUID 生成工具
 */

import * as Crypto from "expo-crypto";

/**
 * 生成 UUID v4
 * @returns 唯一标识符字符串
 */
export const generateUUID = (): string => {
  return Crypto.randomUUID();
};
