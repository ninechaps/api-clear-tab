/**
 * Stock Service
 * 业务逻辑层：处理股票指数相关的业务逻辑
 * 使用 Yahoo Finance 非官方 API 获取股票数据（免费，但稳定性无保证）
 * API 文档：https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
 */

import { httpClient } from '../../utils/index.js'
import { ENDPOINTS, MAJOR_INDICES } from '../../config/constants.js'

/**
 * 股票报价数据接口
 */
export interface StockQuote {
  symbol: string
  name: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  previousClose: number
  change: number
  changePercent: number
  timestamp: number
}

/**
 * 市场指数列表接口
 */
export interface MarketIndices {
  indices: StockQuote[]
  updatedAt: string
}

/**
 * 获取单个股票报价 DTO
 */
export interface GetQuoteDto {
  symbol: string
}

/**
 * Stock Service 类
 */
export class StockService {
  /**
   * 获取预设的主要指数
   */
  async getMajorIndices(): Promise<MarketIndices> {
    const indices: StockQuote[] = []
    const errors: string[] = []

    // 并行获取所有指数数据
    const promises = MAJOR_INDICES.map((index) =>
      this.getQuote({ symbol: index.symbol })
        .then((quote) => indices.push(quote))
        .catch((error) => {
          if (error instanceof Error) {
            errors.push(`${index.symbol}: ${error.message}`)
          }
        })
    )

    await Promise.all(promises)

    if (indices.length === 0 && errors.length > 0) {
      throw new Error(`无法获取指数数据: ${errors.join('; ')}`)
    }

    return {
      indices: indices.sort((a, b) => b.timestamp - a.timestamp),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * 获取单个股票报价
   */
  async getQuote(dto: GetQuoteDto): Promise<StockQuote> {
    const symbol = dto.symbol.toUpperCase()

    try {
      const response = await httpClient.get<{
        chart?: {
          result?: Array<{
            meta?: {
              symbol?: string
              currency?: string
              regularMarketPrice?: number
              previousClose?: number
            }
            timestamp?: number[]
            open?: number[]
            high?: number[]
            low?: number[]
            close?: number[]
          }>
          error?: {
            code?: string
            description?: string
          }
        }
      }>(`${ENDPOINTS.YAHOO_FINANCE_API}/${symbol}`, {
        params: {
          interval: '1d',
          range: '1d',
        },
      })

      const result = response.data.chart?.result?.[0]
      const error = response.data.chart?.error

      if (error) {
        throw new Error(`Yahoo Finance API 错误: ${error.description || error.code}`)
      }

      if (!result || !result.meta) {
        throw new Error('无法获取股票数据')
      }

      const meta = result.meta
      const timestamps = result.timestamp || []
      const closes = result.close || []
      const opens = result.open || []
      const highs = result.high || []
      const lows = result.low || []

      const lastIndex = closes.length - 1
      const currentPrice = closes[lastIndex] || meta.regularMarketPrice || 0
      const openPrice = opens[lastIndex] || 0
      const highPrice = highs[lastIndex] || 0
      const lowPrice = lows[lastIndex] || 0
      const previousClose = meta.previousClose || openPrice || 0

      const change = currentPrice - previousClose
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

      // 查找指数名称
      const indexData = MAJOR_INDICES.find((idx) => idx.symbol === symbol)

      return {
        symbol,
        name: indexData?.name || meta.symbol || symbol,
        currentPrice: Math.round(currentPrice * 100) / 100,
        openPrice: Math.round(openPrice * 100) / 100,
        highPrice: Math.round(highPrice * 100) / 100,
        lowPrice: Math.round(lowPrice * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        timestamp: timestamps[lastIndex] || Math.floor(Date.now() / 1000),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取股票数据失败: ${error.message}`)
      }
      throw error
    }
  }
}
