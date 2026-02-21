import { Response } from 'express'
import { Case, User, CaseFile, Event } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import config from '../config'

// Escape special regex characters to prevent ReDoS
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

        // Get user data
        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

        // Reset hoursSavedToday if it's a new day
        const now = new Date()
        const lastReset = new Date(user.lastHoursSavedReset)
        if (now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {
            user.hoursSavedToday = 0
            user.lastHoursSavedReset = now
            await user.save()
        }

        // Parallelized queries for better performance
        const [caseStats, documentCountResult, recentCases, upcomingDeadlines] = await Promise.all([
            // Get case stats
            Case.aggregate([
                { $match: { userId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            // Get total document count
            Case.aggregate([
                { $match: { userId } },
                { $group: { _id: null, totalDocuments: { $sum: '$fileCount' } } }
            ]),
            // Get recent cases (last 3)
            Case.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean(),
            // Get upcoming deadlines (sorted by proximity)
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

        // Build response
        const dashboardData = {
            hoursSaved: {
                total: user.hoursSavedByAI || 0,
                today: user.hoursSavedToday || 0
            },
            cases: {
                active: formattedCaseStats.active,
                closed: formattedCaseStats.closed,
                archived: formattedCaseStats.archived,
                total: formattedCaseStats.total,
                usagePercentage: (config.planLimits as Record<string, number>)[user.plan] > 0 
                    ? Math.round((user.currentCases / (config.planLimits as Record<string, number>)[user.plan]) * 100) 
                    : 0,
                limit: (config.planLimits as Record<string, number>)[user.plan],
                current: user.currentCases
            },
            documents: {
                total: totalDocuments
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
        console.error('[DashboardController] getDashboardStats error:', error)
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

        // Escape regex special characters to prevent ReDoS
        const safeQuery = escapeRegex(q.trim())

        // Parallelized search queries
        const [cases, files] = await Promise.all([
            // Search Cases (Name, Client, Description)
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

            // Search CaseFiles (OriginalName)
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
        console.error('[DashboardController] searchGlobal error:', error)
        res.status(500).json({ success: false, message: 'Search failed' } as IApiResponse)
    }
}
