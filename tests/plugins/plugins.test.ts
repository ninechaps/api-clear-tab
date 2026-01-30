import { test, describe, expect } from 'vitest'
import { createApp } from '@/app.js'

describe('Response Plugin', () => {
  test('成功响应应该有统一格式', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('timestamp')
    expect(body.success).toBe(true)

    await app.close()
  })

  test('失败响应应该有统一格式', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/999',
    })

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('error')
    expect(body).toHaveProperty('timestamp')
    expect(body.success).toBe(false)
    expect(body.error).toHaveProperty('code')
    expect(body.error).toHaveProperty('message')

    await app.close()
  })
})

describe('Error Handler Plugin', () => {
  test('404 错误应该被正确处理', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/non-existent-route',
    })

    expect(response.statusCode).toBe(404)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('NOT_FOUND')

    await app.close()
  })

  test('参数校验失败应该返回 400', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        // 缺少必需字段
        name: 'Test',
      },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')

    await app.close()
  })
})
