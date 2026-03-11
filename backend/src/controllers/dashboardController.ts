import { Response } from 'express'
import { Case, User, CaseFile, Event } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import config from '../config'
import logger from '../utils/logger'

const controllerLogger = logger.child({ module: 'dashboard-controller' })

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getDashboardStats = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

        const now = new Date()
        const lastReset = new Date(user.lastHoursSavedReset)
        if (now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            user.hoursSavedToday = 0
            user.lastHoursSavedReset = now
            await user.save()
        }

        const [caseStats, documentCountResult, recentCases, upcomingDeadlines] = await Promise.all([
            Case.aggregate([
                { $match: { userId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Case.aggregate([
                { $match: { userId } },
                { $group: { _id: null, totalDocuments: { $sum: '$fileCount' } } }
            ]),
            Case.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean(),
            Event.find({
                userId,
                start: { $gte: now },
                $or: [
                    { type: 'deadline' },
                    { priority: { $in: ['high', 'critical'] } }
                ]
            }).sort({ start: 1 }).limit(5).lean()
        ])

        const formattedCaseStats = { total: 0, active: 0, closed: 0, archived: 0 }
        caseStats.forEach((stat: { _id: string; count: number }) => {
            formattedCaseStats.total += stat.count
            if (stat._id === 'active') formattedCaseStats.active = stat.count
            if (stat._id === 'closed') formattedCaseStats.closed = stat.count
            if (stat._id === 'archived') formattedCaseStats.archived = stat.count
        })

        const totalDocuments = documentCountResult.length > 0 ? documentCountResult[0].totalDocuments : 0

        const dashboardData = {
            hoursSaved: {
                total: Math.round((user.hoursSavedByAI || 0) * 10) / 10,
                today: Math.round((user.hoursSavedToday || 0) * 10) / 10
            },
            cases: {
                active: formattedCaseStats.active,
                closed: formattedCaseStats.closed,
                archived: formattedCaseStats.archived,
                total: formattedCaseStats.total,
                usagePercentage: (config.planLimits as any)[user.plan]?.maxCases > 0 
                    ? Math.round((user.currentCases / (config.planLimits as any)[user.plan].maxCases) * 100) 
                    : 0,
                limit: (config.planLimits as any)[user.plan]?.maxCases || 0,
                current: user.currentCases
            },
            documents: {
                total: totalDocuments
            },
            storage: {
                used: user.totalStorageUsed || 0,
                limit: (config.planLimits as any)[user.plan]?.maxTotalStorage || 0,
                usagePercentage: (config.planLimits as any)[user.plan]?.maxTotalStorage > 0 
                    ? Math.round((user.totalStorageUsed / (config.planLimits as any)[user.plan].maxTotalStorage) * 100) 
                    : 0
            },
            ai: {
                tokensConsumed: user.totalTokensConsumed || 0,
                maxTokens: (config.planLimits as any)[user.plan]?.maxTokens || 0,
                usagePercentage: (config.planLimits as any)[user.plan]?.maxTokens > 0 
                    ? Math.min(100, Math.round((user.totalTokensConsumed / (config.planLimits as any)[user.plan].maxTokens) * 100))
                    : 0
            },
            recentCases: recentCases,
            upcomingDeadlines: upcomingDeadlines.map((d: any) => ({
                id: d._id,
                title: d.title,
                date: d.start,
                priority: d.priority,
                type: d.type
            }))
        }

        res.status(200).json({
            success: true,
            data: dashboardData
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'getDashboardStats error')
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' } as IApiResponse)
    }
}

export const searchGlobal = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        const { q } = req.query

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(200).json({
                success: true,
                data: { cases: [], files: [] }
            } as IApiResponse)
            return
        }

        const safeQuery = escapeRegex(q.trim())

        const [cases, files] = await Promise.all([
            Case.find({
                userId,
                $or: [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { client: { $regex: safeQuery, $options: 'i' } },
                    { description: { $regex: safeQuery, $options: 'i' } }
                ]
            })
                .limit(5)
                .select('name client status updatedAt')
                .lean(),

            CaseFile.find({
                userId,
                originalName: { $regex: safeQuery, $options: 'i' }
            })
                .limit(5)
                .select('name originalName type size caseId uploadedAt')
                .lean()
        ])

        res.status(200).json({
            success: true,
            data: {
                cases: cases.map(c => ({
                    id: c._id,
                    title: c.name,
                    subtitle: c.client,
                    type: 'case',
                    status: c.status,
                    updatedAt: c.updatedAt
                })),
                files: files.map(f => ({
                    id: f._id,
                    title: f.originalName,
                    subtitle: f.type,
                    type: 'file',
                    caseId: f.caseId,
                    updatedAt: f.uploadedAt
                }))
            }
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'searchGlobal error')
        res.status(500).json({ success: false, message: 'Search failed' } as IApiResponse)
    }
}
