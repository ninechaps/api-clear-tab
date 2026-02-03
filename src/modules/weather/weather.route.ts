import type { FastifyPluginAsync } from 'fastify'
import { WeatherController } from './weather.controller.js'
import {
  getWeatherSchema,
  getSupportedCitiesSchema,
  getAirQualitySchema,
  getCityLocationSchema,
} from './weather.schema.js'

/**
 * Weather 模块路由
 */
const weatherRoutes: FastifyPluginAsync = async (fastify) => {
  const weatherController = new WeatherController()

  // GET /weather - 查询城市天气
  fastify.get('/weather', {
    schema: {
      tags: ['weather'],
      description: '查询指定城市的天气信息',
      ...getWeatherSchema,
    },
  }, weatherController.getWeather.bind(weatherController))

  // GET /weather/cities - 获取支持的城市列表
  fastify.get('/weather/cities', {
    schema: {
      tags: ['weather'],
      description: '获取支持的城市列表',
      ...getSupportedCitiesSchema,
    },
  }, weatherController.getSupportedCities.bind(weatherController))

  // GET /weather/air-quality - 查询城市空气质量
  fastify.get('/weather/air-quality', {
    schema: {
      tags: ['weather'],
      description: '查询指定城市的空气质量信息',
      ...getAirQualitySchema,
    },
  }, weatherController.getAirQuality.bind(weatherController))

  // GET /weather/city - 查询城市地理位置
  fastify.get('/weather/city', {
    schema: {
      tags: ['weather'],
      description: '查询城市地理位置信息',
      ...getCityLocationSchema,
    },
  }, weatherController.getCityLocation.bind(weatherController))
}

export default weatherRoutes
