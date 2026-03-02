import { Request, Response } from 'express'
import { ChatMessage } from '../models'
import { IApiResponse } from '../types'

export const getAiStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { range = '30d' } = req.query

    const startDate = new Date()
    if (range === '7d') startDate.setDate(startDate.getDate() - 7)
    else if (range === '30d') startDate.setDate(startDate.getDate() - 30)
    else if (range === '90d') startDate.setDate(startDate.getDate() - 90)
    else startDate.setFullYear(startDate.getFullYear() - 1)

    const stats = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalTokens: { $sum: '$metadata.tokens' },
          avgResponseTime: { 
            $avg: { 
              $cond: [{ $eq: ['$sender', 'ai'] }, '$metadata.responseTime', null] 
            } 
          },
          modelDistribution: {
            $push: {
              $cond: [{ $eq: ['$sender', 'ai'] }, '$metadata.model', null]
            }
          }
        }
      }
    ])

    const dailyTrend = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          tokens: { $sum: '$metadata.tokens' },
          messages: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const powerUsers = await ChatMessage.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          sender: 'user'
        }
      },
      {
        $group: {
          _id: '$userId',
          messageCount: { $sum: 1 },
          lastActive: { $max: '$timestamp' }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ['$userInfo.name', 0] },
          email: { $arrayElemAt: ['$userInfo.email', 0] },
          messageCount: 1,
          lastActive: 1
        }
      }
    ])

    const estimatedCost = (stats[0]?.totalTokens || 0) / 1000 * 0.00015

    res.status(200).json({
      success: true,
      data: {
        totals: {
           messages: stats[0]?.totalMessages || 0,
           tokens: stats[0]?.totalTokens || 0,
           cost: estimatedCost,
           avgResponseTime: Math.round(stats[0]?.avgResponseTime || 0)
        },
        dailyTrend,
        powerUsers
      }
    } as IApiResponse)

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics'
    } as IApiResponse)
  }
}
