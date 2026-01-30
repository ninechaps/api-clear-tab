import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { config } from '@/config/index.js'

/**
 * Swagger/OpenAPI 插件
 * 自动生成 API 文档
 */
const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  // 只在非生产环境且配置启用时加载 Swagger
  if (config.NODE_ENV === 'production' || !config.SWAGGER_ENABLED) {
    fastify.log.info('Swagger 已禁用')
    return
  }

  // 注册 Swagger 生成器
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Backend Forge API',
        description: '基于 Fastify + TypeScript 的后端 API 文档',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${config.HOST}:${config.PORT}`,
          description: '开发环境',
        },
      ],
      tags: [
        { name: 'health', description: '健康检查相关接口' },
        { name: 'user', description: '用户管理相关接口' },
      ],
    },
  })

  // 注册 Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  })

  fastify.log.info('Swagger UI is Start: http://localhost:' + config.PORT + '/docs')
}

export default fp(swaggerPlugin, {
  name: 'swagger',
})
