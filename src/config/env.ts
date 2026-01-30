import { z } from 'zod'

/**
 * 环境变量 Schema 定义
 * 使用 Zod 进行运行时校验，启动时 Fail Fast
 */
const envSchema = z.object({
  // 服务配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // API 配置
  API_PREFIX: z.string().default('/api'),

  // 日志配置
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Swagger 配置
  SWAGGER_ENABLED: z.string().transform((val) => val === 'true').default('true'),
})

/**
 * 环境变量类型（从 Schema 推导）
 */
export type EnvConfig = z.infer<typeof envSchema>

/**
 * 加载并校验环境变量
 * @throws {ZodError} 如果环境变量校验失败
 */
export function loadEnv(): EnvConfig {
  try {
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 环境变量校验失败:')
      console.error(error.errors)
      process.exit(1)
    }
    throw error
  }
}
