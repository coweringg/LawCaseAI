import { Response } from 'express'
import config from '../config'
import { Case, CaseFile, Event, User } from '../models'
import { IAuthRequest } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getDashboardStats = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const user = await User.findById(userId)
    if (!user) throw new AppError('User not found', 404)

    const now = new Date()
    const lastReset = new Date(user.lastHoursSavedReset)
    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
        user.hoursSavedToday = 0
        user.lastHoursSavedReset = now
        await user.save()
    }

    const [caseStats, documentCountResult, recentCases, closedCases] = await Promise.all([
        Case.aggregate([
            { $match: { userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Case.aggregate([
            { $match: { userId } },
            { $group: { _id: null, totalDocuments: { $sum: '$fileCount' } } }
        ]),
        Case.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean(),
        Case.find({ userId, status: 'closed' }).select('_id').lean()
    ])

    const closedCaseIds = closedCases.map((c: any) => c._id)
    const eventQuery: any = {
        userId,
        status: { $ne: 'closed' },
        start: { $gte: now },
        $or: [{ type: 'deadline' }, { priority: { $in: ['high', 'critical'] } }]
    }

    if (closedCaseIds.length > 0) {
        eventQuery.$and = [
            {
                $or: [
                    { caseId: { $exists: false } },
                    { caseId: null },
                    { caseId: { $nin: closedCaseIds } }
                ]
            }
        ]
    }

    const upcomingDeadlines = await Event.find(eventQuery).sort({ start: 1 }).limit(5).lean()

    const formattedCaseStats = { total: 0, active: 0, closed: 0, archived: 0 }
    caseStats.forEach((stat: { _id: string; count: number }) => {
        formattedCaseStats.total += stat.count
        if (stat._id === 'active') formattedCaseStats.active = stat.count
        if (stat._id === 'closed') formattedCaseStats.closed = stat.count
        if (stat._id === 'archived') formattedCaseStats.archived = stat.count
    })

    const totalDocuments = documentCountResult.length > 0 ? documentCountResult[0].totalDocuments : 0
    const planLimits = (config.planLimits as any)[user.plan] || config.planLimits.basic

    const dashboardData = {
        hoursSaved: { total: Math.round((user.hoursSavedByAI || 0) * 10) / 10, today: Math.round((user.hoursSavedToday || 0) * 10) / 10 },
        cases: {
            active: formattedCaseStats.active, closed: formattedCaseStats.closed, archived: formattedCaseStats.archived, total: formattedCaseStats.total,
            usagePercentage: planLimits.maxCases > 0 ? Math.round((formattedCaseStats.active / planLimits.maxCases) * 100) : 0,
            limit: planLimits.maxCases, current: formattedCaseStats.active
        },
        documents: { total: totalDocuments },
        storage: {
            used: user.totalStorageUsed || 0, limit: planLimits.maxTotalStorage || 0,
            usagePercentage: planLimits.maxTotalStorage > 0 ? Math.round((user.totalStorageUsed / planLimits.maxTotalStorage) * 100) : 0
        },
        ai: {
            tokensConsumed: user.totalTokensConsumed || 0, maxTokens: planLimits.maxTokens || 0,
            usagePercentage: planLimits.maxTokens > 0 ? Math.min(100, Math.round((user.totalTokensConsumed / planLimits.maxTokens) * 100)) : 0
        },
        recentCases: recentCases,
        upcomingDeadlines: upcomingDeadlines.map((d: any) => ({ id: d._id, title: d.title, date: d.start, priority: d.priority, type: d.type }))
    }

    res.status(200).json({ success: true, data: dashboardData })
})

export const searchGlobal = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    const { q } = req.query
    if (!userId) throw new AppError('Unauthorized', 401)

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(200).json({ success: true, data: { cases: [], files: [] } })
        return
    }

    const safeQuery = escapeRegex(q.trim())
    const [cases, files] = await Promise.all([
        Case.find({
            userId,
            $or: [{ name: { $regex: safeQuery, $options: 'i' } }, { client: { $regex: safeQuery, $options: 'i' } }, { description: { $regex: safeQuery, $options: 'i' } }]
        }).limit(5).select('name client status updatedAt').lean(),
        CaseFile.find({ userId, originalName: { $regex: safeQuery, $options: 'i' } }).limit(5).select('name originalName type size caseId uploadedAt').lean()
    ])

    res.status(200).json({
        success: true,
        data: {
            cases: cases.map(c => ({ id: c._id, title: c.name, subtitle: c.client, type: 'case', status: c.status, updatedAt: c.updatedAt })),
            files: files.map(f => ({ id: f._id, title: f.originalName, subtitle: f.type, type: 'file', caseId: f.caseId, updatedAt: f.uploadedAt }))
        }
    })
})
