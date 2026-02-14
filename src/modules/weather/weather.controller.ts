import type { FastifyRequest, FastifyReply } from 'fastify'
import { WeatherService } from './weather.service.js'
import { logger } from "@/utils/logger.js";

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
      logger.info("--------------------------------", {city})

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
   * 查询空气质量
   */
  async getAirQuality(
    request: FastifyRequest<{ Querystring: { latitude: string; longitude: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { latitude, longitude } = request.query

      if (!latitude || !longitude) {
        return reply.fail(
          'MISSING_COORDINATES',
          '请提供纬度和经度',
          undefined,
          400
        )
      }

      const lat = parseFloat(latitude)
      const lon = parseFloat(longitude)

      if (isNaN(lat) || isNaN(lon)) {
        return reply.fail(
          'INVALID_COORDINATES',
          '纬度和经度必须是有效的数字',
          undefined,
          400
        )
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return reply.fail(
          'OUT_OF_RANGE_COORDINATES',
          '纬度范围应为 -90 到 90，经度范围应为 -180 到 180',
          undefined,
          400
        )
      }

      const airQuality = await this.weatherService.getAirQuality({ latitude: lat, longitude: lon })
      return reply.success(airQuality)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('AIR_QUALITY_ERROR', error.message)
      }
      throw error
    }
  }

  /**
   * 查询城市地理位置
   */
  async getCityLocation(
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

      const location = await this.weatherService.getCityLocation({ city })
      return reply.success(location)
    } catch (error) {
      if (error instanceof Error) {
        return reply.fail('CITY_LOCATION_ERROR', error.message)
      }
      throw error
    }
  }
}
