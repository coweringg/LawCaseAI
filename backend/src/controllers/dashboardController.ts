import { Response } from 'express'
import { Case, User, CaseFile } from '../models'
import { IApiResponse, IAuthRequest } from '../types'

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

        // Get case stats
        const caseStats = await Case.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        const formattedCaseStats = {
            total: 0,
            active: 0,
            closed: 0,
            archived: 0
        }

        caseStats.forEach((stat: { _id: string; count: number }) => {
            formattedCaseStats.total += stat.count
            if (stat._id === 'active') formattedCaseStats.active = stat.count
            if (stat._id === 'closed') formattedCaseStats.closed = stat.count
            if (stat._id === 'archived') formattedCaseStats.archived = stat.count
        })

        // Get total document count
        const documentCountResult = await Case.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalDocuments: { $sum: '$fileCount' }
                }
            }
        ])

        const totalDocuments = documentCountResult.length > 0 ? documentCountResult[0].totalDocuments : 0

        // Get recent cases (last 3)
        const recentCases = await Case.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(3)
            .lean()

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
                usagePercentage: Math.round((user.currentCases / user.planLimit) * 100),
                limit: user.planLimit,
                current: user.currentCases
            },
            documents: {
                total: totalDocuments
            },
            recentCases: recentCases,
            upcomingDeadlines: [] // Placeholder for future deadline feature
        }

        res.status(200).json({
            success: true,
            data: dashboardData
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
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

        const query = q.trim()

        // Search Cases (Name, Client, Description)
        const cases = await Case.find({
            userId,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { client: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
            .limit(5)
            .select('name client status updatedAt')
            .lean()

        // Search CaseFiles (OriginalName)
        const files = await CaseFile.find({
            userId,
            originalName: { $regex: query, $options: 'i' }
        })
            .limit(5)
            .select('name originalName type size caseId uploadedAt')
            .lean()

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
        const errorMessage = error instanceof Error ? error.message : 'Search failed'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}
