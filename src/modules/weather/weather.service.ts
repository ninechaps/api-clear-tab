/**
 * Weather Service
 * 业务逻辑层：处理天气相关的业务逻辑
 * 使用 Open-Meteo API 获取实时天气数据（免费，无需API密钥）
 * API 文档：https://open-meteo.com/en/docs
 */

import { httpClient } from '../../utils/index.js'
import { ENDPOINTS } from '../../config/constants.js'

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
 * 默认时区
 */
const TIMEZONE = 'auto'

/**
 * 获取的天气数据字段
 */
const WEATHER_FIELDS = 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'

/**
 * 空气质量数据字段
 */
const AIR_QUALITY_FIELDS = 'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide'

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
 * 天气代码映射
 */
const weatherCodeMap: Record<number, string> = {
  0: 'Sunny',
  1: 'Partly Cloudy',
  2: 'Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Heavy Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Heavy Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Thunderstorm with Hail',
}

/**
 * Weather Service 类
 */
export class WeatherService {
  /**
   * 查询指定城市的天气
   * 调用 Open-Meteo API 获取实时天气数据
   */
  async getWeather(dto: QueryWeatherDto): Promise<Weather> {
    const cityKey = dto.city.toLowerCase()
    const cityData = cityCoordinates[cityKey]

    if (!cityData) {
      const supportedCities = Object.values(cityCoordinates)
        .map((c) => c.name)
        .join(', ')
      throw new Error(`城市 "${dto.city}" 不支持。支持的城市：${supportedCities}`)
    }

    try {
      // 调用 Open-Meteo API
      const response = await httpClient.get<{
        current?: {
          temperature_2m?: number
          relative_humidity_2m?: number
          apparent_temperature?: number
          weather_code?: number
          wind_speed_10m?: number
        }
        latitude?: number
        longitude?: number
      }>(ENDPOINTS.WEATHER_API, {
        params: {
          latitude: cityData.lat,
          longitude: cityData.lon,
          current: WEATHER_FIELDS,
          timezone: TIMEZONE,
        },
      })

      const data = response.data
      const current = data.current

      if (!current) {
        throw new Error('无法获取天气数据')
      }

      const weatherCode = current.weather_code || 0
      const condition = weatherCodeMap[weatherCode] || 'Unknown'

      return {
        city: cityData.name,
        latitude: data.latitude || cityData.lat,
        longitude: data.longitude || cityData.lon,
        temperature: Math.round((current.temperature_2m || 0) * 10) / 10,
        condition,
        humidity: current.relative_humidity_2m || 0,
        windSpeed: Math.round((current.wind_speed_10m || 0) * 10) / 10,
        feelsLike: Math.round((current.apparent_temperature || 0) * 10) / 10,
        updatedAt: new Date().toISOString(),
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
   * 调用 Open-Meteo Air Quality API 获取实时空气质量数据
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
      // 调用 Open-Meteo Air Quality API
      const response = await httpClient.get<{
        current?: {
          us_aqi?: number
          pm2_5?: number
          pm10?: number
          nitrogen_dioxide?: number
          ozone?: number
          carbon_monoxide?: number
        }
        latitude?: number
        longitude?: number
      }>(ENDPOINTS.AIR_QUALITY_API, {
        params: {
          latitude: cityData.lat,
          longitude: cityData.lon,
          current: AIR_QUALITY_FIELDS,
        },
      })

      const data = response.data
      const current = data.current

      if (!current) {
        throw new Error('无法获取空气质量数据')
      }

      const aqi = Math.round(current.us_aqi || 0)
      const aqiCategory = aqi >= 0 && aqi <= 50 ? 0 :
                          aqi >= 51 && aqi <= 100 ? 1 :
                          aqi >= 101 && aqi <= 150 ? 2 :
                          aqi >= 151 && aqi <= 200 ? 3 :
                          aqi >= 201 && aqi <= 300 ? 4 : 5
      const category = aqiCategories[aqiCategory] || 'Unknown'

      return {
        city: cityData.name,
        latitude: data.latitude || cityData.lat,
        longitude: data.longitude || cityData.lon,
        aqi,
        category,
        pm25: Math.round((current.pm2_5 || 0) * 10) / 10,
        pm10: Math.round((current.pm10 || 0) * 10) / 10,
        no2: Math.round((current.nitrogen_dioxide || 0) * 10) / 10,
        o3: Math.round((current.ozone || 0) * 10) / 10,
        co: Math.round((current.carbon_monoxide || 0) * 10) / 10,
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
