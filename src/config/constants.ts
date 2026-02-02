/**
 * 常量定义
 */

/**
 * 公共 API 地址
 */
export const ENDPOINTS = {
  WEATHER_API: 'https://api.open-meteo.com/v1/forecast',
  AIR_QUALITY_API: 'https://air-quality.open-meteo.com/v1/air-quality',
  QUOTA_API: 'https://zenquotes.io/api/random',
  EXCHANGE_RATE_API: 'https://api.exchangerate.host',
  YAHOO_FINANCE_API: 'https://query1.finance.yahoo.com/v8/finance/chart',
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
