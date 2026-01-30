import type { FastifyPluginAsync } from 'fastify'
import { WeatherController } from './weather.controller.js'
import {
  getWeatherSchema,
  getSupportedCitiesSchema,
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
}

export default weatherRoutes
