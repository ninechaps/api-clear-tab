/**
 * Quote Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 文案对象 Schema
 */
export const quoteSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    author: { type: 'string' },
  },
  required: ['text', 'author'],
} as const

/**
 * 获取随机文案 Schema
 */
export const getRandomQuoteSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: quoteSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const
