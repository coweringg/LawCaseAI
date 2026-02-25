import { Request, Response } from 'express'
import { Transaction } from '../models'
import { IApiResponse } from '../types'

/**
 * Get Financial Treasury Statistics
 */
export const getTreasuryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { range = 'month' } = req.query
    const now = new Date()
    let startDate: Date

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    // 1. Total Revenue (All time or filtered)
    const totalRevenueAgg = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = totalRevenueAgg[0]?.total || 0

    // 2. MRR / Selected Range Revenue
    const rangeRevenueAgg = await Transaction.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          date: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const mrr = rangeRevenueAgg[0]?.total || 0

    // 3. Revenue Trend
    const revenueTrend = await Transaction.aggregate([
      {
        $match: {
          status: 'succeeded',
          date: { $gte: startDate }
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

    // 4. Plan Distribution
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
          growth: 12
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

/**
 * Export Treasury Ledger as CSV
 */
export const exportTreasuryCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ status: 'succeeded' })
      .sort({ date: -1 })
      .populate('userId', 'name email')

    let csv = 'Date,Operator,Email,Plan,Amount,Payment Method\n'

    transactions.forEach((tx: any) => {
      const date = tx.date.toISOString().split('T')[0]
      const name = tx.userId?.name || 'Unknown'
      const email = tx.userId?.email || 'N/A'
      csv += `${date},"${name}",${email},${tx.plan},${tx.amount},"${tx.paymentMethod}"\n`
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=treasury_ledger.csv')
    res.status(200).send(csv)

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export CSV'
    } as IApiResponse)
  }
}
