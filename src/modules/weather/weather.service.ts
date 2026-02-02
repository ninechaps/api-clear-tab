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
  city: string
  latitude: number
  longitude: number
  aqi: number
  category: string
  pm25: number
  pm10: number
  no2: number
  o3: number
  co: number
  updatedAt: string
}

/**
 * 查询空气质量 DTO
 */
export interface QueryAirQualityDto {
  city: string
}

/**
 * AQI 分类标准 (美国 EPA)
 */
const aqiCategories: Record<number, string> = {
  0: 'Good',
  1: 'Moderate',
  2: 'Unhealthy for Sensitive Groups',
  3: 'Unhealthy',
  4: 'Very Unhealthy',
  5: 'Hazardous',
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
   * https://dev.qweather.com/docs/api/air-quality/air-quality-now/
   */
  async getAirQuality(dto: QueryAirQualityDto): Promise<AirQuality> {
    const cityKey = dto.city.toLowerCase()
    const cityData = cityCoordinates[cityKey]

    if (!cityData) {
      const supportedCities = Object.values(cityCoordinates)
        .map((c) => c.name)
        .join(', ')
      throw new Error(`城市 "${dto.city}" 不支持。支持的城市：${supportedCities}`)
    }

    try {
      // 获取 JWT Token
      const token = await getCachedJwtToken()

      // 调用和风天气 Air Quality API（使用路径参数：纬度/经度）
      const url = `${ENDPOINTS.AIR_QUALITY_API}/${cityData.lat}/${cityData.lon}`
      const response = await httpClient.get<{
        code?: string
        now?: {
          aqi?: number
          category?: string
          categoryEn?: string
          primary?: string
          primaryEn?: string
          pm10?: number
          pm2p5?: number
          no2?: number
          so2?: number
          co?: number
          o3?: number
        }
        fxLink?: string
        updateTime?: string
      }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data
      const current = data.now

      if (!current || data.code !== '200') {
        throw new Error(`获取空气质量数据失败，状态码: ${data.code}`)
      }

      const aqi = Math.round(current.aqi || 0)
      const aqiCategory = aqi >= 0 && aqi <= 50 ? 0 :
                          aqi >= 51 && aqi <= 100 ? 1 :
                          aqi >= 101 && aqi <= 150 ? 2 :
                          aqi >= 151 && aqi <= 200 ? 3 :
                          aqi >= 201 && aqi <= 300 ? 4 : 5
      const category = aqiCategories[aqiCategory] || current.category || 'Unknown'

      return {
        city: cityData.name,
        latitude: cityData.lat,
        longitude: cityData.lon,
        aqi,
        category,
        pm25: Math.round((current.pm2p5 || 0) * 10) / 10,
        pm10: Math.round((current.pm10 || 0) * 10) / 10,
        no2: Math.round((current.no2 || 0) * 10) / 10,
        o3: Math.round((current.o3 || 0) * 10) / 10,
        co: Math.round((current.co || 0) * 10) / 10,
        updatedAt: new Date().toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取空气质量数据失败: ${error.message}`)
      }
      throw error
    }
  }
}
