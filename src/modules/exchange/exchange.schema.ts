/**
 * Exchange Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 汇率对象 Schema
 */
export const exchangeRatesSchema = {
  type: 'object',
  properties: {
    base: { type: 'string', minLength: 3, maxLength: 3 },
    date: { type: 'string', format: 'date' },
    rates: {
      type: 'object',
      additionalProperties: { type: 'number' },
    },
    timestamp: { type: 'number' },
  },
  required: ['base', 'date', 'rates', 'timestamp'],
} as const

/**
 * 货币转换对象 Schema
 */
export const currencyConversionSchema = {
  type: 'object',
  properties: {
    from: { type: 'string', minLength: 3, maxLength: 3 },
    to: { type: 'string', minLength: 3, maxLength: 3 },
    amount: { type: 'number', minimum: 0 },
    result: { type: 'number', minimum: 0 },
    rate: { type: 'number', minimum: 0 },
    date: { type: 'string', format: 'date' },
  },
  required: ['from', 'to', 'amount', 'result', 'rate', 'date'],
} as const

/**
 * 获取最新汇率请求 Schema
 */
export const getLatestRatesSchema = {
  querystring: {
    type: 'object',
    properties: {
      base: { type: 'string', minLength: 3, maxLength: 3 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: exchangeRatesSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 货币转换请求 Schema
 */
export const convertCurrencySchema = {
  querystring: {
    type: 'object',
    properties: {
      from: { type: 'string', minLength: 3, maxLength: 3 },
      to: { type: 'string', minLength: 3, maxLength: 3 },
      amount: { type: 'string' },
    },
    required: ['from', 'to', 'amount'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: currencyConversionSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const
