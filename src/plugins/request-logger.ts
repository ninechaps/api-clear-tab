import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

/**
 * 请求日志插件
 * 输出类似 Nginx access log 的简洁格式
 *
 * 格式：METHOD /path HTTP/version STATUS size "user-agent" rt=0.015
 */
const requestLoggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onResponse', async (request, reply) => {
    const url = request.url

    // 过滤掉不需要记录的路径
    const ignorePaths = [
      '/docs',           // Swagger UI 主页
      '/docs/',          // Swagger UI 主页（带斜杠）
      '/health',         // 健康检查
      '/ping',           // Ping 接口
    ]

    // 过滤掉 Swagger 静态资源路径
    if (
      ignorePaths.includes(url) ||
      url.startsWith('/docs/') ||           // Swagger 静态资源
      url.startsWith('/documentation/')     // 备用 Swagger 路径
    ) {
      return
    }

    const method = request.method
    const httpVersion = `HTTP/${request.raw.httpVersion}`
    const statusCode = reply.statusCode
    const responseTime = (reply.elapsedTime / 1000).toFixed(3) // 转换为秒
    const userAgent = request.headers['user-agent'] || '-'
    const contentLength = reply.getHeader('content-length') || '-'

    // 构建日志消息
    const logMessage = `${method} ${url} ${httpVersion} ${statusCode} ${contentLength} "${userAgent}" rt=${responseTime}`

    // 根据状态码选择日志级别
    if (statusCode >= 500) {
      request.log.error(logMessage)
    } else if (statusCode >= 400) {
      request.log.warn(logMessage)
    } else {
      request.log.info(logMessage)
    }
  })
}

export default fp(requestLoggerPlugin, {
  name: 'request-logger',
})
