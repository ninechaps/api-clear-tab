/**
 * HTTP 客户端封装
 * 基于 axios 的通用 HTTP 请求库
 * 提供统一的请求接口和错误处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { logger } from './logger.js'

/**
 * HTTP 客户端配置
 */
export interface HttpClientConfig extends AxiosRequestConfig {
  baseURL?: string
  timeout?: number
  retries?: number
}

/**
 * HTTP 请求响应泛型
 */
export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
}

/**
 * HTTP 客户端类
 */
export class HttpClient {
  private client: AxiosInstance

  constructor(config?: HttpClientConfig) {
    this.client = axios.create({
      timeout: config?.timeout || 30000,
      ...config,
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (requestConfig) => {
        logger.debug('HTTP Request:', {
          method: requestConfig.method?.toUpperCase(),
          url: requestConfig.url,
          params: requestConfig.params,
        })
        return requestConfig
      },
      (error) => {
        logger.error('Request error:', error.message)
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('HTTP Response:', {
          status: response.status,
          url: response.config.url,
        })
        return response
      },
      (error: AxiosError) => {
        logger.error('Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        })
        return Promise.reject(error)
      },
    )
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.client.get<T>(url, config)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.post<T>(url, data, config)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * PUT 请求
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.put<T>(url, data, config)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.client.delete<T>(url, config)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.patch<T>(url, data, config)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * 获取 axios 实例（高级用法）
   */
  getAxiosInstance(): AxiosInstance {
    return this.client
  }
}

/**
 * 创建默认 HTTP 客户端实例
 */
export const httpClient = new HttpClient()
