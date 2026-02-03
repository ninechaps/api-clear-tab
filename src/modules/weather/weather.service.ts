/**
 * Weather Service
 * 业务逻辑层：处理天气相关的业务逻辑
 * 使用和风天气 API 获取实时天气和空气质量数据
 * API 文档：https://dev.qweather.com/docs/api/
 */

import { httpClient, getCachedJwtToken } from '../../utils/index.js'
import { ENDPOINTS, QWEATHER_CITY_IDS } from '../../config/constants.js'

/**
 * 天气数据接口
 */
export interface Weather {
  city: string
  latitude: number
  longitude: number
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
  updatedAt: string
}

/**
 * 查询天气 DTO
 */
export interface QueryWeatherDto {
  city: string
}

/**
 * 空气质量数据接口
 */
export interface AirQuality {
  latitude: number
  longitude: number
  aqi: number
  aqiDisplay: string
  level: string
  category: string
  primaryPollutant: {
    code: string
    name: string
    fullName: string
  }
  healthEffect: string
  healthAdvice: {
    generalPopulation: string
    sensitivePopulation: string
  }
  color: {
    red: number
    green: number
    blue: number
    alpha: number
  }
  pollutants: Array<{
    code: string
    name: string
    fullName: string
    concentration: {
      value: number
      unit: string
    }
  }>
  updateTime: string
}

/**
 * 查询空气质量 DTO
 */
export interface QueryAirQualityDto {
  latitude: number
  longitude: number
}

/**
 * 城市地理位置数据接口
 */
export interface CityLocation {
  name: string
  lat: number
  lon: number
  country: string
  adm1: string
  adm2: string
  timezone: string
  utcOffset: string
  isDst: number
  type: string
  rank: number
  fxLink: string
}

/**
 * 查询城市地理位置 DTO
 */
export interface QueryCityLocationDto {
  city: string
}

/**
 * 和风天气 City Lookup API 响应类型（内部使用）
 */
interface QWeatherCityResponse {
  code: string
  location?: Array<{
    name: string
    id: string
    lat: string
    lon: string
    adm2: string
    adm1: string
    country: string
    tz: string
    utcOffset: string
    isDst: string
    type: string
    rank: string
    fxLink: string
  }>
}

/**
 * 和风天气空气质量 API 响应类型
 */
interface QWeatherAirQualityResponse {
  metadata?: {
    tag: string
  }
  indexes?: Array<{
    code: string
    name: string
    aqi: number
    aqiDisplay: string
    level: string
    category: string
    color: {
      red: number
      green: number
      blue: number
      alpha: number
    }
    primaryPollutant: {
      code: string
      name: string
      fullName: string
    }
    health: {
      effect: string
      advice: {
        generalPopulation: string
        sensitivePopulation: string
      }
    }
  }>
  pollutants?: Array<{
    code: string
    name: string
    fullName: string
    concentration: {
      value: number
      unit: string
    }
    subIndexes?: Array<{
      code: string
      aqi: number
      aqiDisplay: string
    }>
  }>
  stations?: Array<{
    id: string
    name: string
  }>
}

/**
 * 城市坐标映射表
 * 维护主要城市的经纬度
 */
const cityCoordinates: Record<string, { name: string; lat: number; lon: number }> = {
  beijing: { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  shanghai: { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  shenzhen: { name: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
  hangzhou: { name: 'Hangzhou', lat: 30.2741, lon: 120.155 },
  guangzhou: { name: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
}

/**
 * Weather Service 类
 */
export class WeatherService {
  /**
   * 查询指定城市的天气
   * 调用和风天气 API 获取实时天气数据
   * https://dev.qweather.com/docs/api/weather/weather-now/
   */
  async getWeather(dto: QueryWeatherDto): Promise<Weather> {
    const cityKey = dto.city.toLowerCase()
    const cityData = cityCoordinates[cityKey]
    const qweatherId = QWEATHER_CITY_IDS[cityKey]

    if (!cityData || !qweatherId) {
      const supportedCities = Object.values(cityCoordinates)
        .map((c) => c.name)
        .join(', ')
      throw new Error(`城市 "${dto.city}" 不支持。支持的城市：${supportedCities}`)
    }

    try {
      // 获取 JWT Token
      const token = await getCachedJwtToken()

      // 调用和风天气 Weather Now API
      const response = await httpClient.get<{
        code?: string
        now?: {
          temp?: number
          feelsLike?: number
          humidity?: number
          windSpeed?: number
          text?: string
        }
        updateTime?: string
      }>(ENDPOINTS.WEATHER_API, {
        params: {
          location: qweatherId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data
      const current = data.now

      if (!current || data.code !== '200') {
        throw new Error(`获取天气数据失败，状态码: ${data.code}`)
      }

      const temp = typeof current.temp === 'string' ? parseFloat(current.temp) : (current.temp || 0)
      const humidity = typeof current.humidity === 'string' ? parseInt(current.humidity, 10) : (current.humidity || 0)
      const windSpeed = typeof current.windSpeed === 'string' ? parseFloat(current.windSpeed) : (current.windSpeed || 0)
      const feelsLike = typeof current.feelsLike === 'string' ? parseFloat(current.feelsLike) : (current.feelsLike || 0)

      return {
        city: cityData.name,
        latitude: cityData.lat,
        longitude: cityData.lon,
        temperature: Math.round(temp * 10) / 10,
        condition: current.text || 'Unknown',
        humidity,
        windSpeed: Math.round(windSpeed * 10) / 10,
        feelsLike: Math.round(feelsLike * 10) / 10,
        updatedAt: data.updateTime || new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取天气数据失败: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * 获取所有支持的城市列表
   */
  async getSupportedCities(): Promise<string[]> {
    return Object.values(cityCoordinates).map((c) => c.name)
  }

  /**
   * 查询指定城市的空气质量
   * 调用和风天气 API 获取实时空气质量数据（通过经纬度）
   */
  async getAirQuality(dto: QueryAirQualityDto): Promise<AirQuality> {
    try {
      // 获取 JWT Token
      const token = await getCachedJwtToken()

      // 调用和风天气 Air Quality API（使用路径参数：纬度/经度）
      const url = `${ENDPOINTS.AIR_QUALITY_API}/${dto.latitude}/${dto.longitude}`
      const response = await httpClient.get<QWeatherAirQualityResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data

      // 检查响应状态
      if (!data.indexes || data.indexes.length === 0) {
        throw new Error('获取空气质量数据失败：没有找到空气质量指数数据')
      }

      const airQualityIndex = data.indexes[0]!
      const pollutants = data.pollutants || []

      // 构造返回对象
      return {
        latitude: dto.latitude,
        longitude: dto.longitude,
        aqi: airQualityIndex.aqi,
        aqiDisplay: airQualityIndex.aqiDisplay || '',
        level: airQualityIndex.level || '',
        category: airQualityIndex.category || '',
        primaryPollutant: {
          code: airQualityIndex.primaryPollutant?.code || '',
          name: airQualityIndex.primaryPollutant?.name || '',
          fullName: airQualityIndex.primaryPollutant?.fullName || '',
        },
        healthEffect: airQualityIndex.health?.effect || '',
        healthAdvice: {
          generalPopulation: airQualityIndex.health?.advice?.generalPopulation || '',
          sensitivePopulation: airQualityIndex.health?.advice?.sensitivePopulation || '',
        },
        color: {
          red: airQualityIndex.color?.red || 0,
          green: airQualityIndex.color?.green || 0,
          blue: airQualityIndex.color?.blue || 0,
          alpha: airQualityIndex.color?.alpha || 0,
        },
        pollutants: pollutants.map((p) => ({
          code: p.code || '',
          name: p.name || '',
          fullName: p.fullName || '',
          concentration: {
            value: p.concentration?.value || 0,
            unit: p.concentration?.unit || '',
          },
        })),
        updateTime: new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取空气质量数据失败: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * 查询城市地理位置信息
   * 调用和风天气 City Lookup API 获取城市的地理信息（经纬度、时区等）
   * https://dev.qweather.com/docs/api/geoapi/city-lookup/
   */
  async getCityLocation(dto: QueryCityLocationDto): Promise<CityLocation> {
    try {
      // 获取 JWT Token
      const token = await getCachedJwtToken()

      // 调用和风天气 City Lookup API
      const response = await httpClient.get<QWeatherCityResponse>(
        ENDPOINTS.CITY_API,
        {
          params: {
            location: dto.city,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = response.data

      // 检查响应状态
      if (!data.location || data.location.length === 0 || data.code !== '200') {
        throw new Error(`未找到城市 "${dto.city}" 的地理位置信息，状态码: ${data.code}`)
      }

      // 取第一个结果（rank 最高）
      const location = data.location[0]!

      // 类型转换并构造返回对象
      return {
        name: location.name,
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
        country: location.country,
        adm1: location.adm1,
        adm2: location.adm2,
        timezone: location.tz,
        utcOffset: location.utcOffset,
        isDst: parseInt(location.isDst, 10),
        type: location.type,
        rank: parseInt(location.rank, 10),
        fxLink: location.fxLink,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取城市地理位置失败: ${error.message}`)
      }
      throw error
    }
  }
}
