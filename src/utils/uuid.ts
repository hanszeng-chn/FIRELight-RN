/**
 * UUID 生成工具
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * 生成 UUID v4
 * @returns 唯一标识符字符串
 */
export const generateUUID = (): string => {
  return uuidv4();
};
