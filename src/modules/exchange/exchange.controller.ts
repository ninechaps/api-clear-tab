import type { FastifyRequest, FastifyReply } from 'fastify'
import { ExchangeService } from './exchange.service.js'

/**
 * Exchange Controller
 * 控制器层：处理 HTTP 请求和响应
 */
export class ExchangeController {
  private exchangeService: ExchangeService

  constructor() {
    this.exchangeService = new ExchangeService()
  }

  /**
   * 获取最新汇率
   */
  async getLatestRates(
    request: FastifyRequest<{ Querystring: { base?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const base = (request.query.base || 'USD').toUpperCase()

      if (!base || base.length !== 3) {
        return reply.fail(
          'INVALID_CURRENCY',
          '请提供有效的货币代码（3个字符）',
          undefined,
          400
        )
      }

      const rates = await this.exchangeService.getLatestRates({ base })
      return reply.success(rates)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('EXCHANGE_ERROR', error.message)
      }
      throw error
    }
  }

  /**
   * 货币转换
   */
  async convertCurrency(
    request: FastifyRequest<{
      Querystring: { from?: string; to?: string; amount?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { from, to, amount } = request.query

      if (!from || !to || !amount) {
        return reply.fail(
          'MISSING_PARAMS',
          '请提供 from、to 和 amount 参数',
          undefined,
          400
        )
      }

      if (from.length !== 3 || to.length !== 3) {
        return reply.fail(
          'INVALID_CURRENCY',
          '货币代码必须为 3 个字符',
          undefined,
          400
        )
      }

      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return reply.fail(
          'INVALID_AMOUNT',
          '金额必须为有效的正数',
          undefined,
          400
        )
      }

      const conversion = await this.exchangeService.convertCurrency({
        from,
        to,
        amount: numAmount,
      })
      return reply.success(conversion)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('CONVERSION_ERROR', error.message)
      }
      throw error
    }
  }
}
