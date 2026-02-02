import Fastify from 'fastify'
import { config } from '@/config/index.js'
import responsePlugin from '@/plugins/response.js'
import errorHandlerPlugin from '@/plugins/error-handler.js'
import swaggerPlugin from '@/plugins/swagger.js'
import requestLoggerPlugin from '@/plugins/request-logger.js'
import globalRoutes from '@/routes/index.js'
import registerModules from '@/modules/index.js'

/**
 * 创建 Fastify 应用实例
 * 这是一个工厂函数，用于创建和配置 Fastify 实例
 */
export async function createApp() {
  // 创建 Fastify 实例
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss',
                ignore: 'hostname,reqId,req,res',
                colorize: true,
                singleLine: true,
              },
            }
          : undefined,
    },
    // 禁用 Fastify 默认的请求日志（我们使用自定义的）
    disableRequestLogging: true,
  })

  // 1. 注册核心插件（必须最先注册）
  await app.register(responsePlugin)
  await app.register(errorHandlerPlugin)
  await app.register(requestLoggerPlugin)

  // 2. 注册 Swagger（非生产环境）
  await app.register(swaggerPlugin)

  // 3. 注册全局路由（健康检查等）
  await app.register(globalRoutes)

  // 4. 注册业务模块路由（带 API 前缀）
  await app.register(registerModules, { prefix: config.API_PREFIX })

  return app
}
