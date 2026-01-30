import { test, describe, expect } from 'vitest'
import { createApp } from '@/app.js'

describe('Health Routes', () => {
  test('GET /health 应该返回健康状态', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('ok')
    expect(body.data).toHaveProperty('uptime')
    expect(body.data).toHaveProperty('timestamp')

    await app.close()
  })

  test('GET /ping 应该返回 pong', async () => {
    const app = await createApp()

    const response = await app.inject({
      method: 'GET',
      url: '/ping',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data).toBe('pong')

    await app.close()
  })
})
