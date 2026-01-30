import type { FastifyPluginAsync, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import type { SuccessResponse, ErrorResponse } from '@/types/response.js'

/**
 * 统一响应格式插件
 * 为 FastifyReply 添加 success() 和 fail() 方法
 */
const responsePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateReply('success', function <T>(this: FastifyReply, data: T, message?: string) {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      message,
      timestamp: Date.now(),
    }
    return this.code(200).send(response)
  })

  fastify.decorateReply('fail', function (
    this: FastifyReply,
    code: string,
    message: string,
    details?: unknown,
    statusCode = 400
  ) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: Date.now(),
    }
    return this.code(statusCode).send(response)
  })
}

export default fp(responsePlugin, {
  name: 'response-formatter',
})
