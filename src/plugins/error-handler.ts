import type { FastifyPluginAsync, FastifyError } from 'fastify'
import fp from 'fastify-plugin'

/**
 * 全局错误处理插件
 * 捕获所有未处理的错误，转换为统一的响应格式
 */
const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // 处理 404 Not Found
  fastify.setNotFoundHandler((_, reply) => {
    return reply.fail(
      'NOT_FOUND',
      '请求的资源不存在',
      undefined,
      404
    )
  })

  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    // 记录错误日志
    request.log.error(error)

    // Fastify 验证错误（JSON Schema 校验失败）
    if (error.validation) {
      return reply.fail(
        'VALIDATION_ERROR',
        '请求参数校验失败',
        error.validation,
        400
      )
    }

    // 404 Not Found
    if (error.statusCode === 404) {
      return reply.fail(
        'NOT_FOUND',
        '请求的资源不存在',
        undefined,
        404
      )
    }

    // 业务错误（自定义错误）
    if (error.statusCode && error.statusCode < 500) {
      return reply.fail(
        error.code || 'BAD_REQUEST',
        error.message,
        undefined,
        error.statusCode
      )
    }

    // 服务器内部错误（不暴露详细信息给客户端）
    return reply.fail(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : error.message,
      process.env.NODE_ENV === 'production' ? undefined : error.stack,
      500
    )
  })
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
})
