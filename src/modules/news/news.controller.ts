import type { FastifyRequest, FastifyReply } from 'fastify'
import { NewsService } from './news.service.js'

/**
 * News Controller
 * 控制器层：处理 HTTP 请求和响应
 */
export class NewsController {
  private newsService: NewsService

  constructor() {
    this.newsService = new NewsService()
  }

  /**
   * 获取新闻头条
   */
  async getHeadlines(
    request: FastifyRequest<{ Querystring: { category?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const category = request.query.category || 'general'

      if (!category || typeof category !== 'string') {
        return reply.fail(
          'INVALID_CATEGORY',
          '请提供有效的新闻分类',
          undefined,
          400
        )
      }

      const headlines = await this.newsService.getHeadlines({ category })
      return reply.success(headlines)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('NEWS_ERROR', error.message)
      }
      throw error
    }
  }
}
