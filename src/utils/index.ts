/**
 * 工具函数库
 * 存放纯函数工具，与业务逻辑无关
 */

// 导出 logger
export { logger } from './logger.js'

// 导出 HTTP 客户端
export { HttpClient, httpClient } from './http-client.js'
export type { HttpClientConfig, HttpResponse } from './http-client.js'

/**
 * 示例：延迟函数
 * @param ms 延迟毫秒数
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 示例：生成随机字符串
 * @param length 字符串长度
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
