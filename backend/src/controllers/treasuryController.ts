import { Request, Response } from 'express'
import { Transaction } from '../models'
import { IApiResponse } from '../types'

/**
 * Get Financial Treasury Statistics
 * Aggregates MRR, Total Revenue, and Plan Distribution.
 */
export const getTreasuryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total Revenue (All time)
    const totalRevenueAgg = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = totalRevenueAgg[0]?.total || 0

    // 2. MRR (Monthly Recurring Revenue) - Last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const mrrAgg = await Transaction.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          date: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const mrr = mrrAgg[0]?.total || 0

    // 3. Revenue Trend (Daily for last 30 days)
    const revenueTrend = await Transaction.aggregate([
      {
        $match: {
          status: 'succeeded',
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // 4. Plan Distribution (by Count)
    // Note: ideally we should query 'User' model for active subscriptions, 
    // but here we approximate based on recent transactions or just active users if we import User model.
    // For now, let's use Transaction counts as a proxy for popularity.
    const planDistribution = await Transaction.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          mrr,
          growth: 12 // Mock growth percentage for now
        },
        revenueTrend,
        planDistribution
      }
    } as IApiResponse)

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch treasury stats'
    } as IApiResponse)
  }
}
