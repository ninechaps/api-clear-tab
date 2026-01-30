import { loadEnv, type EnvConfig } from './env.js'

/**
 * 应用配置对象
 * 在应用启动时加载并校验
 */
export const config: EnvConfig = loadEnv()

/**
 * 导出类型
 */
export type { EnvConfig } from './env.js'
