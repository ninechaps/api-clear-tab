import pino from 'pino'
import { config } from '@/config/index.js'

/**
 * 全局 Logger 实例
 * 可在任何地方直接导入使用
 *
 * @example
 * import { logger } from '@/utils/logger'
 *
 * logger.info('用户登录成功', { userId: 123 })
 * logger.error('数据库连接失败', { error: err })
 */
export const logger = pino({
  level: config.LOG_LEVEL,
  transport:
    config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true,
          },
        }
      : undefined,
})

/**
 * 导出 logger 的类型，方便 TypeScript 使用
 */
export type Logger = typeof logger
