import type { FastifyPluginAsync } from 'fastify'
import { ExchangeController } from './exchange.controller.js'
import {
  getLatestRatesSchema,
  convertCurrencySchema,
} from './exchange.schema.js'

/**
 * Exchange 模块路由
 */
const exchangeRoutes: FastifyPluginAsync = async (fastify) => {
  const exchangeController = new ExchangeController()

  // GET /exchange/latest - 获取最新汇率
  fastify.get('/exchange/latest', {
    schema: {
      tags: ['exchange'],
      description: '获取指定基准货币的最新汇率',
      ...getLatestRatesSchema,
    },
  }, exchangeController.getLatestRates.bind(exchangeController))

  // GET /exchange/convert - 货币转换
  fastify.get('/exchange/convert', {
    schema: {
      tags: ['exchange'],
      description: '进行货币转换计算',
      ...convertCurrencySchema,
    },
  }, exchangeController.convertCurrency.bind(exchangeController))
}

export default exchangeRoutes
