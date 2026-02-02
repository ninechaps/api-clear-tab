import type { FastifyRequest, FastifyReply } from 'fastify'
import { WeatherService } from './weather.service.js'

/**
 * Weather Controller
 * 控制器层：处理 HTTP 请求和响应
 */
export class WeatherController {
  private weatherService: WeatherService

  constructor() {
    this.weatherService = new WeatherService()
  }

  /**
   * 查询城市天气
   */
  async getWeather(
    request: FastifyRequest<{ Querystring: { city: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { city } = request.query

      if (!city) {
        return reply.fail(
          'MISSING_CITY',
          '请提供城市名称',
          undefined,
          400
        )
      }

      const weather = await this.weatherService.getWeather({ city })
      return reply.success(weather)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('WEATHER_ERROR', error.message)
      }
      throw error
    }
  }

  /**
   * 获取支持的城市列表
   */
  async getSupportedCities(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const cities = await this.weatherService.getSupportedCities()
    return reply.success({ cities })
  }

  /**
   * 查询城市空气质量
   */
  async getAirQuality(
    request: FastifyRequest<{ Querystring: { city: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { city } = request.query

      if (!city) {
        return reply.fail(
          'MISSING_CITY',
          '请提供城市名称',
          undefined,
          400
        )
      }

      const airQuality = await this.weatherService.getAirQuality({ city })
      return reply.success(airQuality)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('AIR_QUALITY_ERROR', error.message)
      }
      throw error
    }
  }
}
