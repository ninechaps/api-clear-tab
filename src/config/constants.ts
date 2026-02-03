/**
 * 常量定义
 */

/**
 * 公共 API 地址
 */
export const ENDPOINTS = {
  WEATHER_API: 'https://jt3md9j763.re.qweatherapi.com/v7/weather/now',
  AIR_QUALITY_API: 'https://jt3md9j763.re.qweatherapi.com/airquality/v1/current',
  CITY_API: 'https://jt3md9j763.re.qweatherapi.com/geo/v2/city/lookup',
  QUOTA_API: 'https://zenquotes.io/api/random',
  EXCHANGE_RATE_API: 'https://api.exchangerate.host',
  YAHOO_FINANCE_API: 'https://query1.finance.yahoo.com/v8/finance/chart',
}

/**
 * 和风天气城市位置 ID 映射
 * 用于空气质量查询
 * https://dev.qweather.com/docs/api/geoapi/
 */
export const QWEATHER_CITY_IDS: Record<string, string> = {
  beijing: '101010100',
  shanghai: '101020100',
  shenzhen: '101280101',
  hangzhou: '101210101',
  guangzhou: '101280101',
}

/**
 * 主要股票指数配置
 */
export const MAJOR_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '000001.SS', name: 'Shanghai Composite' },
  { symbol: '399001.SZ', name: 'Shenzhen Component' },
]

/**
 * RSS 源配置
 */
export const RSS_FEEDS = {
  technology: {
    'Hacker News': 'https://news.ycombinator.com/rss',
    'TechCrunch': 'https://techcrunch.com/feed/',
  },
  general: {
    'BBC News': 'http://feeds.bbci.co.uk/news/rss.xml',
    'CNN Top Stories': 'http://rss.cnn.com/rss/cnn_topstories.rss',
  },
}
