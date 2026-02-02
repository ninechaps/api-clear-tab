import type { FastifyPluginAsync } from 'fastify'
import { StockController } from './stock.controller.js'
import {
  getMajorIndicesSchema,
  getQuoteSchema,
} from './stock.schema.js'

/**
 * Stock 模块路由
 */
const stockRoutes: FastifyPluginAsync = async (fastify) => {
  const stockController = new StockController()

  // GET /stock/indices - 获取主要股票指数
  fastify.get('/stock/indices', {
    schema: {
      tags: ['stock'],
      description: '获取主要股票指数列表（包括S&P 500、道琼斯等）',
      ...getMajorIndicesSchema,
    },
  }, stockController.getMajorIndices.bind(stockController))

  // GET /stock/quote - 查询单个股票报价
  fastify.get('/stock/quote', {
    schema: {
      tags: ['stock'],
      description: '查询指定股票代码的实时报价',
      ...getQuoteSchema,
    },
  }, stockController.getQuote.bind(stockController))
}

export default stockRoutes
