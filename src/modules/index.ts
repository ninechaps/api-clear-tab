import type { FastifyPluginAsync } from 'fastify'
import { weatherRoutes } from './weather/index.js'
import { quoteRoutes } from './quote/index.js'

/**
 * 业务模块聚合与注册
 * 自动注册所有业务模块的路由
 */
const registerModules: FastifyPluginAsync = async (fastify) => {
  // 注册天气模块
  await fastify.register(weatherRoutes)

  // 注册文案模块
  await fastify.register(quoteRoutes)

  // 未来可以在此继续注册其他模块
  // await fastify.register(orderRoutes)
  // await fastify.register(productRoutes)
}

export default registerModules
