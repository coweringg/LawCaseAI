import { Request, Response } from 'express'
import { AiLog } from '../models'
import { IApiResponse } from '../types'
import catchAsync from '../utils/catchAsync'

export const getAiStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { range = '30d', powerPage = 1, powerLimit = 10 } = req.query
    const pLimit = Number(powerLimit)
    const pPage = Number(powerPage) || 1
    const pSkip = (pPage - 1) * pLimit

    let timeThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (range === '24h') timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000)
    else if (range === '7d') timeThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    else if (range === '90d') timeThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    else if (range === 'all') timeThreshold = new Date(0)

    const activityCount = await AiLog.countDocuments({ timestamp: { $gte: timeThreshold } })
    
    if (activityCount === 0 && range === '24h') {
        timeThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const [stats, dailyTrend, powerUsers, totalCountAgg] = await Promise.all([
      AiLog.aggregate([
        { $match: { timestamp: { $gte: timeThreshold } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalTokens: { $sum: '$tokens' },
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ]),
      AiLog.aggregate([
        { $match: { timestamp: { $gte: timeThreshold } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            tokens: { $sum: '$tokens' },
            messages: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AiLog.aggregate([
        { $match: { timestamp: { $gte: timeThreshold } } },
        {
          $group: {
            _id: '$userId',
            totalSignals: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            _id: 1,
            totalSignals: 1,
            lastActivity: 1,
            name: '$userDetails.name',
            email: '$userDetails.email'
          }
        },
        { $sort: { totalSignals: -1 } },
        { $skip: pSkip },
        { $limit: pLimit }
      ]),
      AiLog.aggregate([
        { $match: { timestamp: { $gte: timeThreshold } } },
        { $group: { _id: '$userId' } },
        { $count: 'total' }
      ])
    ])

    const totalPowerUsers = totalCountAgg[0]?.total || 0
    const estimatedCost = (stats[0]?.totalTokens || 0) / 1000 * 0.00015

    res.status(200).json({
      success: true,
      data: {
        totals: {
          messages: stats[0]?.totalRequests || 0,
          tokens: stats[0]?.totalTokens || 0,
          cost: estimatedCost,
          avgResponseTime: Math.round(stats[0]?.avgResponseTime || 0)
        },
        dailyTrend,
        powerUsers: {
          users: powerUsers,
          total: totalPowerUsers,
          pages: Math.ceil(totalPowerUsers / pLimit),
          page: pPage
        }
      }
    } as IApiResponse)
})
