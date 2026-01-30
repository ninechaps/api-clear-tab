/**
 * Weather Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 天气对象 Schema
 */
export const weatherSchema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    temperature: { type: 'number' },
    condition: { type: 'string' },
    humidity: { type: 'number' },
    windSpeed: { type: 'number' },
    feelsLike: { type: 'number' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['city', 'latitude', 'longitude', 'temperature', 'condition', 'humidity', 'windSpeed', 'feelsLike', 'updatedAt'],
} as const

/**
 * 查询天气请求 Schema
 */
export const getWeatherSchema = {
  querystring: {
    type: 'object',
    properties: {
      city: { type: 'string', minLength: 1, maxLength: 50 },
    },
    required: ['city'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: weatherSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 获取支持城市列表 Schema
 */
export const getSupportedCitiesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            cities: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        timestamp: { type: 'number' },
      },
    },
  },
} as const
