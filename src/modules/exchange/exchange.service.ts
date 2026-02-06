/**
 * Exchange Service
 * 业务逻辑层：处理汇率相关的业务逻辑
 * 使用 exchangerate-api.com API 获取实时汇率数据（免费，无需API密钥）
 * API 文档：https://www.exchangerate-api.com
 */

import { httpClient } from '../../utils/index.js'

/**
 * 汇率列表数据接口
 */
export interface ExchangeRates {
  base: string
  date?: string
  rates: Record<string, number>
  timestamp: number
}

/**
 * 货币转换数据接口
 */
export interface CurrencyConversion {
  from: string
  to: string
  amount: number
  result: number
  rate: number
  date?: string
}

/**
 * 获取汇率列表 DTO
 */
export interface GetRatesDto {
  base: string
}

/**
 * 货币转换 DTO
 */
export interface ConvertCurrencyDto {
  from: string
  to: string
  amount: number
}

/**
 * Exchange Service 类
 */
export class ExchangeService {
  /**
   * 获取最新汇率
   * 调用 exchangerate-api.com API 获取指定基准货币的汇率
   */
  async getLatestRates(dto: GetRatesDto): Promise<ExchangeRates> {
    const baseCurrency = dto.base.toUpperCase()

    try {
      const response = await httpClient.get<{
        base_code?: string
        rates?: Record<string, number>
        time_last_updated?: number
      }>(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)

      const data = response.data

      if (!data.rates) {
        throw new Error('无法获取汇率数据')
      }

      return {
        base: data.base_code || baseCurrency,
        date: new Date().toISOString().split('T')[0],
        rates: data.rates,
        timestamp: data.time_last_updated || Math.floor(Date.now() / 1000),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取汇率失败: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * 货币转换
   * 将指定金额从源货币转换为目标货币
   */
  async convertCurrency(dto: ConvertCurrencyDto): Promise<CurrencyConversion> {
    const fromCurrency = dto.from.toUpperCase()
    const toCurrency = dto.to.toUpperCase()
    const amount = dto.amount

    if (amount <= 0) {
      throw new Error('金额必须大于 0')
    }

    try {
      const response = await httpClient.get<{
        base_code?: string
        rates?: Record<string, number>
      }>(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)

      const data = response.data

      if (!data.rates || !data.rates[toCurrency]) {
        throw new Error('无法获取转换数据或目标货币不支持')
      }

      const conversionRate = data.rates[toCurrency]
      const result = amount * conversionRate

      return {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: Math.round(result * 100) / 100,
        rate: Math.round(conversionRate * 10000) / 10000,
        date: new Date().toISOString().split('T')[0],
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`货币转换失败: ${error.message}`)
      }
      throw error
    }
  }
}
