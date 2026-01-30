import type { FastifyPluginAsync } from 'fastify'
import healthRoutes from './health.js'

/**
 * 全局路由注册
 * 用于注册非业务路由（健康检查、监控等）
 */
const globalRoutes: FastifyPluginAsync = async (fastify) => {
  // 注册健康检查路由
  await fastify.register(healthRoutes)
}

export default globalRoutes
