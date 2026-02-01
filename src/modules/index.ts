import type { FastifyPluginAsync } from 'fastify'
import { weatherRoutes } from './weather/index.js'
import { quoteRoutes } from './quote/index.js'
import { exchangeRoutes } from './exchange/index.js'
import { stockRoutes } from './stock/index.js'
import { newsRoutes } from './news/index.js'

/**
 * 业务模块聚合与注册
 * 自动注册所有业务模块的路由
 */
const registerModules: FastifyPluginAsync = async (fastify) => {
  // 注册天气模块
  await fastify.register(weatherRoutes)

  // 注册文案模块
  await fastify.register(quoteRoutes)

  // 注册汇率模块
  await fastify.register(exchangeRoutes)

  // 注册股票模块
  await fastify.register(stockRoutes)

  // 注册新闻模块
  await fastify.register(newsRoutes)
}

export default registerModules
