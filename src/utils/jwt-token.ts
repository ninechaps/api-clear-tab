import { SignJWT, importPKCS8, jwtVerify, importSPKI } from 'jose'
import { readFile } from 'fs/promises'
import { config } from '@/config/index.js'

/**
 * JWT Token 生成器
 * 用于和风天气 API 认证
 * https://dev.qweather.com/docs/api/
 *
 * 使用 jose 库进行 EdDSA 签名
 */

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  [key: string]: string | number | undefined
  sub: string // Subject（主题，客户端 ID）
  iat: number // Issued At（签发时间）
  exp: number // Expiration Time（过期时间）
}

/**
 * 生成 JWT Token
 * @param expiresIn 过期时间（秒），默认 86400 秒（24小时）
 * @returns JWT Token 字符串
 */
export async function generateJwtToken(expiresIn: number = 86400): Promise<string> {
  // 1. 读取私钥文件
  const privateKeyPem = await readFile(config.QWEATHER_PRIVATE_KEY_PATH, 'utf8')


  // 2. 导入私钥为 EdDSA 格式
  const privateKey = await importPKCS8(privateKeyPem, 'EdDSA')

  // 3. 设置 Header
  const customHeader = {
    alg: 'EdDSA',
    kid: config.QWEATHER_CREDENTIAL,
  }

  // 4. 计算时间戳
  const iat = Math.floor(Date.now() / 1000) - 30
  const exp = iat + expiresIn

  // 5. 设置 Payload
  const customPayload: JwtPayload = {
    sub: config.QWEATHER_PROJECT_ID,
    iat,
    exp,
  }

  // 6. 使用 jose 库生成 JWT Token
  return await new SignJWT(customPayload)
    .setProtectedHeader(customHeader)
    .sign(privateKey)
      .then(t=>{
        return t
      })
}

/**
 * 验证 JWT Token
 * @param token JWT Token 字符串
 * @param publicKeyPem 公钥 (PEM 格式)
 * @returns 解析后的 Payload，如果验证失败返回 null
 */
export async function verifyJwtToken(
  token: string,
  publicKeyPem: string
): Promise<JwtPayload | null> {
  try {
    const publicKey = await importSPKI(publicKeyPem, 'EdDSA')
    const { payload } = await jwtVerify(token, publicKey)
    return payload as JwtPayload
  } catch (error) {
    return null
  }
}
//
/**
 * 获取有效的 JWT Token（带缓存）
 * 如果已存在的 token 还有效，返回已存在的；否则生成新的
 * 减少频繁生成 token 的开销
 */
let cachedToken: string | null = null
let cachedTokenExpiry: number = 0

export async function getCachedJwtToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  // 如果缓存的 token 还有 5 分钟以上的有效期，直接返回
  if (cachedToken && cachedTokenExpiry - now > 300) {
    return cachedToken
  }

  // 否则生成新的 token（有效期 86400 秒 = 24小时）
  cachedToken = await generateJwtToken(86400)
  cachedTokenExpiry = now + 86400

  return cachedToken
}
