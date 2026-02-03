/**
 * Weather Schema 定义
 * 用于请求参数校验和 Swagger 文档生成
 */

/**
 * 天气对象 Schema
 */
export const weatherSchema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    temperature: { type: 'number' },
    condition: { type: 'string' },
    humidity: { type: 'number' },
    windSpeed: { type: 'number' },
    feelsLike: { type: 'number' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['city', 'latitude', 'longitude', 'temperature', 'condition', 'humidity', 'windSpeed', 'feelsLike', 'updatedAt'],
} as const

/**
 * 查询天气请求 Schema
 */
export const getWeatherSchema = {
  querystring: {
    type: 'object',
    properties: {
      city: { type: 'string', minLength: 1, maxLength: 50 },
    },
    required: ['city'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: weatherSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 获取支持城市列表 Schema
 */
export const getSupportedCitiesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            cities: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 空气质量对象 Schema
 */
export const airQualitySchema = {
  type: 'object',
  properties: {
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    aqi: { type: 'number' },
    aqiDisplay: { type: 'string' },
    level: { type: 'string' },
    category: { type: 'string' },
    primaryPollutant: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name: { type: 'string' },
        fullName: { type: 'string' },
      },
    },
    healthEffect: { type: 'string' },
    healthAdvice: {
      type: 'object',
      properties: {
        generalPopulation: { type: 'string' },
        sensitivePopulation: { type: 'string' },
      },
    },
    color: {
      type: 'object',
      properties: {
        red: { type: 'number' },
        green: { type: 'number' },
        blue: { type: 'number' },
        alpha: { type: 'number' },
      },
    },
    pollutants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          fullName: { type: 'string' },
          concentration: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              unit: { type: 'string' },
            },
          },
        },
      },
    },
    updateTime: { type: 'string', format: 'date-time' },
  },
  required: ['latitude', 'longitude', 'aqi', 'aqiDisplay', 'level', 'category', 'updateTime'],
} as const

/**
 * 查询空气质量请求 Schema
 */
export const getAirQualitySchema = {
  querystring: {
    type: 'object',
    properties: {
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
    },
    required: ['latitude', 'longitude'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: airQualitySchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const

/**
 * 城市地理位置对象 Schema
 */
export const cityLocationSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    lat: { type: 'number' },
    lon: { type: 'number' },
    country: { type: 'string' },
    adm1: { type: 'string' },
    adm2: { type: 'string' },
    timezone: { type: 'string' },
    utcOffset: { type: 'string' },
    isDst: { type: 'number' },
    type: { type: 'string' },
    rank: { type: 'number' },
    fxLink: { type: 'string' },
  },
  required: ['name', 'lat', 'lon', 'country', 'adm1', 'adm2', 'timezone', 'utcOffset', 'isDst', 'type', 'rank', 'fxLink'],
} as const

/**
 * 查询城市地理位置请求 Schema
 */
export const getCityLocationSchema = {
  querystring: {
    type: 'object',
    properties: {
      city: { type: 'string', minLength: 1, maxLength: 100 },
    },
    required: ['city'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: cityLocationSchema,
        timestamp: { type: 'number' },
      },
    },
  },
} as const
