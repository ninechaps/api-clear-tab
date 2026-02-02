import { loadEnv, type EnvConfig } from './env.js'

/**
 * 应用配置对象
 * 在应用启动时加载并校验
 * 注意：此时 dotenv-flow 已在 server.ts 中加载完成
 */
export const config: EnvConfig = loadEnv()

/**
 * 导出类型
 */
export type { EnvConfig } from './env.js'
