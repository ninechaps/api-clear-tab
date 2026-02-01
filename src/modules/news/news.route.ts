import type { FastifyPluginAsync } from 'fastify'
import { NewsController } from './news.controller.js'
import { getHeadlinesSchema } from './news.schema.js'

/**
 * News 模块路由
 */
const newsRoutes: FastifyPluginAsync = async (fastify) => {
  const newsController = new NewsController()

  // GET /news/headlines - 获取新闻头条
  fastify.get('/news/headlines', {
    schema: {
      tags: ['news'],
      description: '获取指定分类的新闻头条（支持 technology、general）',
      ...getHeadlinesSchema,
    },
  }, newsController.getHeadlines.bind(newsController))
}

export default newsRoutes
