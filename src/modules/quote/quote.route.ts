/**
 * Quote 模块路由
 */

import type { FastifyPluginAsync } from 'fastify'
import { QuoteController } from './quote.controller.js'
import { getRandomQuoteSchema } from './quote.schema.js'

const quoteRoutes: FastifyPluginAsync = async (fastify) => {
  const quoteController = new QuoteController()

  // GET /quote - 获取随机文案
  fastify.get('/quote', {
    schema: {
      tags: ['quote'],
      description: '获取一条随机文案',
      ...getRandomQuoteSchema,
    },
  }, quoteController.getRandomQuote.bind(quoteController))
}

export default quoteRoutes
