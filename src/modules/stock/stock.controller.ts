import type { FastifyRequest, FastifyReply } from 'fastify'
import { StockService } from './stock.service.js'

/**
 * Stock Controller
 * 控制器层：处理 HTTP 请求和响应
 */
export class StockController {
  private stockService: StockService

  constructor() {
    this.stockService = new StockService()
  }

  /**
   * 获取主要股票指数
   */
  async getMajorIndices(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const indices = await this.stockService.getMajorIndices()
      return reply.success(indices)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('INDICES_ERROR', error.message)
      }
      throw error
    }
  }

  /**
   * 查询单个股票报价
   */
  async getQuote(
    request: FastifyRequest<{ Querystring: { symbol: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { symbol } = request.query

      if (!symbol) {
        return reply.fail(
          'MISSING_SYMBOL',
          '请提供股票代码',
          undefined,
          400
        )
      }

      const quote = await this.stockService.getQuote({ symbol })
      return reply.success(quote)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('QUOTE_ERROR', error.message)
      }
      throw error
    }
  }
}
