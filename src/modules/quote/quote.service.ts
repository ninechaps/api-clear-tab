/**
 * Quote Service
 * 业务逻辑层：处理文案相关的业务逻辑
 * 使用 ZenQuotes API 获取随机文案（免费，无需API密钥）
 * API 文档：https://zenquotes.io/
 */

import { httpClient } from '../../utils/index.js'
import { ENDPOINTS } from '../../config/constants.js'

/**
 * 文案对象
 */
export interface Quote {
  text: string
  author: string
}

/**
 * Quote Service 类
 */
export class QuoteService {
  /**
   * 获取随机文案
   * 调用 ZenQuotes API 获取随机文案数据
   */
  async getRandomQuote(): Promise<Quote> {
    try {
      const response = await httpClient.get<
        Array<{
          q: string
          a: string
        }>
      >(ENDPOINTS.QUOTA_API)

      const data = response.data

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('无效的 API 响应')
      }

      const quoteData = data[0]
      if (!quoteData || !quoteData.q || !quoteData.a) {
        throw new Error('文案数据格式错误')
      }

      // 处理作者名称（移除 ZenQuotes API 中的特殊字符）
      const author = quoteData.a.replace(/^,\s*/, '').trim()

      return {
        text: quoteData.q,
        author: author || 'Unknown',
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取文案失败: ${error.message}`)
      }
      throw error
    }
  }
}
