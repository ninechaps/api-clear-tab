/**
 * Quote Controller
 * 控制器层：处理 HTTP 请求和响应
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import { QuoteService } from './quote.service.js'

export class QuoteController {
  private quoteService: QuoteService

  constructor() {
    this.quoteService = new QuoteService()
  }

  /**
   * 获取随机文案
   */
  async getRandomQuote(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const quote = await this.quoteService.getRandomQuote()
      return reply.success(quote)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('QUOTE_ERROR', error.message)
      }
      throw error
    }
  }
}
