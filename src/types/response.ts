/**
 * 统一响应结构类型定义
 */

/**
 * 成功响应结构
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  timestamp: number
}

/**
 * 失败响应结构
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: number
}

/**
 * 统一响应类型
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
