import type { FastifyPluginAsync } from 'fastify'

/**
 * 健康检查路由
 */
const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', {
    schema: {
      tags: ['health'],
      description: '健康检查接口',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'number' },
                uptime: { type: 'number' },
              },
            },
            timestamp: { type: 'number' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.success({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    })
  })

  fastify.get('/ping', {
    schema: {
      tags: ['health'],
      description: 'Ping 接口',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'string' },
            timestamp: { type: 'number' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.success('pong')
  })
}

export default healthRoutes
