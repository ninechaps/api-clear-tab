import { createApp } from './app.js'
import { config } from './config/index.js'

/**
 * 服务启动入口
 * 负责启动 Fastify 服务器并处理优雅关闭
 */
async function start() {
  let app

  try {
    // 创建 Fastify 应用实例
    app = await createApp()

    // 启动服务器
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    })

    // 输出启动信息
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Backend Forge Server Started Successfully!      ║
║                                                       ║
║   Environment: ${config.NODE_ENV.padEnd(38)} ║
║   Address:     http://${config.HOST}:${config.PORT.toString().padEnd(28)} ║
║   API Prefix:  ${config.API_PREFIX.padEnd(38)} ║
║                                                       ║
${config.SWAGGER_ENABLED && config.NODE_ENV !== 'production'
  ? `║   📚 Swagger UI: http://localhost:${config.PORT}/docs${' '.repeat(15)} ║\n║                                                       ║\n`
  : ''
}╚═══════════════════════════════════════════════════════╝
    `)
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }

  // 优雅关闭
  const signals = ['SIGINT', 'SIGTERM'] as const

  for (const signal of signals) {
    process.on(signal, async () => {
      try {
        await app?.close()
        console.log('Server closed')
        process.exit(0)
      } catch (error) {
        console.error('Server shutdown failed:', error)
        process.exit(1)
      }
    })
  }
}

// 启动服务
start()
