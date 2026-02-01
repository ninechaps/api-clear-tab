/**
 * Stock Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 股票报价对象 Schema
 */
export const stockQuoteSchema = {
  type: 'object',
  properties: {
    symbol: { type: 'string' },
    name: { type: 'string' },
    currentPrice: { type: 'number' },
    openPrice: { type: 'number' },
    highPrice: { type: 'number' },
    lowPrice: { type: 'number' },
    previousClose: { type: 'number' },
    change: { type: 'number' },
    changePercent: { type: 'number' },
    timestamp: { type: 'number' },
  },
  required: [
    'symbol',
    'name',
    'currentPrice',
    'openPrice',
    'highPrice',
    'lowPrice',
    'previousClose',
    'change',
    'changePercent',
    'timestamp',
  ],
} as const

/**
 * 市场指数列表 Schema
 */
export const marketIndicesSchema = {
  type: 'object',
  properties: {
    indices: {
      type: 'array',
      items: stockQuoteSchema,
    },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['indices', 'updatedAt'],
} as const

/**
 * 获取主要指数请求 Schema
 */
export const getMajorIndicesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: marketIndicesSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 获取股票报价请求 Schema
 */
export const getQuoteSchema = {
  querystring: {
    type: 'object',
    properties: {
      symbol: { type: 'string', minLength: 1, maxLength: 20 },
    },
    required: ['symbol'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: stockQuoteSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const
