import * as express from 'express'
import { AiLog } from '../models'
import { IApiResponse, IAiHealthData, IAiHealthProvider } from '../types'
import mongoose from 'mongoose'

export const getAiHealthMetrics = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { logPage = 1, logLimit = 10 } = req.query
    const skip = (Number(logPage) - 1) * Number(logLimit)

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [providerMetrics, logs, generalMetrics, totalLogs] = await Promise.all([
      AiLog.aggregate([
        { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
        {
          $group: {
            _id: '$provider',
            avgLatency: { $avg: '$responseTime' },
            totalRequests: { $sum: 1 },
            successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
            rateLimitCount: { $sum: { $cond: [{ $eq: ['$status', 'rate_limit'] }, 1, 0] } },
            totalTokens: { $sum: '$tokens' }
          }
        }
      ]),
      AiLog.find({})
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(logLimit))
        .populate('userId', 'email')
        .lean(),
      AiLog.aggregate([
        {
          $facet: {
            last24h: [
              { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
              { $group: { _id: null, count: { $sum: 1 }, tokens: { $sum: '$tokens' } } }
            ],
            last7d: [
              { $match: { timestamp: { $gte: sevenDaysAgo } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            last30d: [
              { $match: { timestamp: { $gte: thirtyDaysAgo } } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ],
            dailyUsage: [
              { $match: { timestamp: { $gte: sevenDaysAgo } } },
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                  requests: { $sum: 1 },
                  provider: { $first: '$provider' }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),
      AiLog.countDocuments({})
    ])

    const providers = providerMetrics.map(p => {
      const successRate = p.totalRequests > 0 ? (p.successCount / p.totalRequests) * 100 : 0
      let status: 'operational' | 'degraded' | 'down' = 'operational'
      if (successRate < 80) status = 'down'
      else if (successRate < 95) status = 'degraded'

      const costPerMillion = p._id === 'openai' ? 0.40 : 0.10
      const estimatedCost = (p.totalTokens / 1000000) * costPerMillion

      return {
        provider: p._id,
        status,
        latency: Math.round(p.avgLatency),
        successRate: Math.round(successRate),
        rateLimits: p.rateLimitCount,
        estimatedCost: estimatedCost.toFixed(4)
      }
    })

    const facet = generalMetrics[0]
    
    res.status(200).json({
      success: true,
      data: {
        providers,
        recentLogs: {
          logs,
          total: totalLogs,
          page: Number(logPage),
          pages: Math.ceil(totalLogs / Number(logLimit))
        },
        stats: {
          requests24h: facet.last24h[0]?.count || 0,
          requests7d: facet.last7d[0]?.count || 0,
          requests30d: facet.last30d[0]?.count || 0,
          tokens24h: facet.last24h[0]?.tokens || 0,
          dailyTrend: facet.dailyUsage
        }
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch AI health metrics'
    } as IApiResponse)
  }
}

export const resolveAiError = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params
    await AiLog.findByIdAndUpdate(id, { resolved: true })
    res.status(200).json({ success: true, message: 'Status updated' } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
