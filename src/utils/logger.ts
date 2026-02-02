import pino, { Logger as PinoLogger, LoggerOptions } from 'pino'
import { config } from '@/config/index.js'
import process from 'process'

/**
 * 获取日志级别
 */
function getLogLevel(): string {
  return config.LOG_LEVEL?.toLowerCase() || 'info'
}

/**
 * 创建自定义的 pino 日志格式化器
 * 输出格式: [HH:MM:ss] LEVEL (PID): message data
 */
function createTransport() {
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev) {
    return pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss',
        ignore: 'hostname',
        hideObject: false,
      },
    })
  }

  return undefined
}

const loggerOptions: LoggerOptions = {
  level: getLogLevel(),
  timestamp: pino.stdTimeFunctions.isoTime,
}

const pinoLogger = pino(loggerOptions, createTransport())

/**
 * 包装的 Logger 类
 * 保持与原 API 兼容，支持灵活的多参数传入
 *
 * @example
 * logger.info('消息', { userId: 123 })
 * logger.error('消息', { userId: 123 }, { action: 'login' })
 * logger.info('消息', [{ a: 1 }, { b: 2 }])
 */
class EnhancedLogger {
  private pinoLogger: PinoLogger

  constructor(pinoLogger: PinoLogger) {
    this.pinoLogger = pinoLogger
  }

  /**
   * 解析参数并提取消息和数据
   */
  private parseArgs(args: unknown[]): { message: string; data: unknown } {
    if (args.length === 0) {
      return { message: '', data: undefined }
    }

    let message: string
    let data: unknown

    const firstArg = args[0]
    const isFirstArgString = typeof firstArg === 'string'

    if (isFirstArgString) {
      // 格式: message, ...data
      message = firstArg
      if (args.length === 1) {
        data = undefined
      } else if (args.length === 2) {
        data = args[1]
      } else {
        // 多个对象时，合并为单一对象
        data = Object.assign({}, ...args.slice(1).filter((arg) => typeof arg === 'object'))
      }
    } else if (args.length > 1 && typeof args[args.length - 1] === 'string') {
      // 格式: data..., message (对象在前，消息在后)
      message = args[args.length - 1] as string
      if (args.length === 2) {
        data = args[0]
      } else {
        // 多个对象时，合并为单一对象
        data = Object.assign({}, ...args.slice(0, -1).filter((arg) => typeof arg === 'object'))
      }
    } else if (args.length === 1 && typeof firstArg === 'object' && firstArg !== null) {
      // 只有一个对象参数
      message = ''
      data = firstArg
    } else {
      // 只有消息
      message = String(firstArg)
      data = undefined
    }

    return { message, data }
  }

  trace(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.trace(data, message)
    } else {
      this.pinoLogger.trace(message)
    }
  }

  debug(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.debug(data, message)
    } else {
      this.pinoLogger.debug(message)
    }
  }

  info(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.info(data, message)
    } else {
      this.pinoLogger.info(message)
    }
  }

  warn(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.warn(data, message)
    } else {
      this.pinoLogger.warn(message)
    }
  }

  error(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.error(data, message)
    } else {
      this.pinoLogger.error(message)
    }
  }

  fatal(...args: unknown[]) {
    const { message, data } = this.parseArgs(args)
    if (data !== undefined) {
      this.pinoLogger.fatal(data, message)
    } else {
      this.pinoLogger.fatal(message)
    }
  }
}

/**
 * 全局 Logger 实例
 *
 * @example
 * import { logger } from '@/utils/logger'
 *
 * logger.info('用户登录成功', { userId: 123 })
 * logger.error('数据库连接失败', { error: err })
 */
export const logger = new EnhancedLogger(pinoLogger)

/**
 * 导出 logger 的类型，方便 TypeScript 使用
 */
export type Logger = EnhancedLogger
