/**
 * News Service
 * 业务逻辑层：处理新闻相关的业务逻辑
 * 使用 RSS Feed 聚合获取新闻数据（免费，但数据结构不统一）
 * 支持多个新闻源的聚合
 */

import { httpClient } from '../../utils/index.js'
import { RSS_FEEDS } from '../../config/constants.js'
import { XMLParser } from 'fast-xml-parser'

/**
 * 新闻文章数据接口
 */
export interface NewsArticle {
  title: string
  description: string
  source: string
  url: string
  publishedAt: string
  category: string
}

/**
 * 新闻头条列表接口
 */
export interface NewsHeadlines {
  articles: NewsArticle[]
  totalResults: number
  category: string
}

/**
 * 获取新闻头条 DTO
 */
export interface GetHeadlinesDto {
  category: string
}

/**
 * RSS 项数据接口
 */
interface RssItem {
  title?: string
  description?: string
  link?: string
  pubDate?: string
  'content:encoded'?: string
}

/**
 * RSS 频道数据接口
 */
interface RssChannel {
  title?: string
  item?: RssItem | RssItem[]
}

/**
 * RSS 根数据接口
 */
interface RssData {
  rss?: {
    channel?: RssChannel | RssChannel[]
  }
}

/**
 * News Service 类
 */
export class NewsService {
  private xmlParser: XMLParser

  constructor() {
    this.xmlParser = new XMLParser()
  }

  /**
   * 获取指定分类的新闻头条
   */
  async getHeadlines(dto: GetHeadlinesDto): Promise<NewsHeadlines> {
    const category = dto.category.toLowerCase()

    if (!RSS_FEEDS[category as keyof typeof RSS_FEEDS]) {
      const supportedCategories = Object.keys(RSS_FEEDS).join(', ')
      throw new Error(`分类 "${dto.category}" 不支持。支持的分类：${supportedCategories}`)
    }

    const feeds = RSS_FEEDS[category as keyof typeof RSS_FEEDS]
    const articles: NewsArticle[] = []
    const errors: string[] = []

    // 并行获取所有 RSS 源
    const promises = Object.entries(feeds).map(([source, url]) =>
      this.fetchAndParseRss(url, source, category)
        .then((items) => articles.push(...items))
        .catch((error) => {
          if (error instanceof Error) {
            errors.push(`${source}: ${error.message}`)
          }
        })
    )

    await Promise.all(promises)

    // 按发布时间倒序排列
    articles.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime()
      const timeB = new Date(b.publishedAt).getTime()
      return timeB - timeA
    })

    return {
      articles: articles.slice(0, 50), // 限制返回前 50 条
      totalResults: articles.length,
      category,
    }
  }

  /**
   * 获取和解析 RSS 源
   */
  private async fetchAndParseRss(
    url: string,
    source: string,
    category: string
  ): Promise<NewsArticle[]> {
    try {
      const response = await httpClient.get<string>(url)
      const xmlData = response.data

      const rssData = this.xmlParser.parse(xmlData) as RssData
      const articles: NewsArticle[] = []

      // 提取 RSS 频道
      let channels: RssChannel[] = []
      if (rssData.rss?.channel) {
        channels = Array.isArray(rssData.rss.channel)
          ? rssData.rss.channel
          : [rssData.rss.channel]
      }

      // 解析每个频道的项
      for (const channel of channels) {
        if (!channel.item) continue

        const items = Array.isArray(channel.item) ? channel.item : [channel.item]

        for (const item of items) {
          if (!item.title || !item.link) continue

          const article: NewsArticle = {
            title: this.cleanText(item.title),
            description: this.cleanText(
              item.description ||
              item['content:encoded'] ||
              item.title.substring(0, 100)
            ),
            source,
            url: item.link,
            publishedAt: this.parseDate(item.pubDate),
            category,
          }

          articles.push(article)
        }
      }

      return articles
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取 RSS 源失败: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * 清理文本（去除 HTML 标签和实体）
   */
  private cleanText(text: string): string {
    if (!text) return ''

    // 移除 HTML 标签
    let cleaned = text.replace(/<[^>]*>/g, '')

    // 解码 HTML 实体
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    // 移除多余空格
    cleaned = cleaned.replace(/\s+/g, ' ').trim()

    return cleaned
  }

  /**
   * 解析日期字符串
   */
  private parseDate(dateStr?: string): string {
    if (!dateStr) {
      return new Date().toISOString()
    }

    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return new Date().toISOString()
      }
      return date.toISOString()
    } catch {
      return new Date().toISOString()
    }
  }
}
