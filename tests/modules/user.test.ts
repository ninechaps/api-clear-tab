import { test, describe, expect } from 'vitest'
import { createApp } from '@/app.js'

describe('User Module', () => {
  test('GET /api/users 应该返回用户列表', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)

    await app.close()
  })

  test('GET /api/users/:id 应该返回指定用户', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/1',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('1')
    expect(body.data).toHaveProperty('name')
    expect(body.data).toHaveProperty('email')

    await app.close()
  })

  test('GET /api/users/:id 不存在的用户应该返回 404', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/999',
    })

    expect(response.statusCode).toBe(404)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('USER_NOT_FOUND')

    await app.close()
  })

  test('POST /api/users 应该创建新用户', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        name: 'Charlie',
        email: 'charlie@example.com',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Charlie')
    expect(body.data.email).toBe('charlie@example.com')
    expect(body.data).toHaveProperty('id')

    await app.close()
  })

  test('POST /api/users 重复邮箱应该返回错误', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        name: 'Alice Clone',
        email: 'alice@example.com', // 已存在的邮箱
      },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('CREATE_USER_FAILED')

    await app.close()
  })
})
