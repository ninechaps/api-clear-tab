import 'fastify'

/**
 * 扩展 Fastify 的 FastifyReply 类型
 * 添加统一响应方法
 */
declare module 'fastify' {
  interface FastifyReply {
    /**
     * 发送成功响应
     * @param data 响应数据
     * @param message 可选的成功消息
     */
    success<T = unknown>(data: T, message?: string): FastifyReply

    /**
     * 发送失败响应
     * @param code 错误代码
     * @param message 错误消息
     * @param details 可选的错误详情
     * @param statusCode HTTP 状态码，默认 400
     */
    fail(code: string, message: string, details?: unknown, statusCode?: number): FastifyReply
  }
}
