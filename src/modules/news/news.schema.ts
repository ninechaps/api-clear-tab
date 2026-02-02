/**
 * News Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 新闻文章对象 Schema
 */
export const newsArticleSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    source: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    publishedAt: { type: 'string', format: 'date-time' },
    category: { type: 'string' },
  },
  required: ['title', 'description', 'source', 'url', 'publishedAt', 'category'],
} as const

/**
 * 新闻头条列表 Schema
 */
export const newsHeadlinesSchema = {
  type: 'object',
  properties: {
    articles: {
      type: 'array',
      items: newsArticleSchema,
    },
    totalResults: { type: 'number' },
    category: { type: 'string' },
  },
  required: ['articles', 'totalResults', 'category'],
} as const

/**
 * 获取新闻头条请求 Schema
 */
export const getHeadlinesSchema = {
  querystring: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['technology', 'general'],
        default: 'general',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: newsHeadlinesSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const
