import { Request, Response } from 'express'
import { User, AuditLog } from '../models'
import { IAuthRequest } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getUsersWithQuotas = catchAsync(async (req: Request, res: Response) => {
    const { search, plan, customOnly, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    
    const query: any = {}
    if (search) {
        query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }
    if (plan && plan !== 'all') query.plan = plan
    if (customOnly === 'true') query.customLimits = { $exists: true, $ne: null }

    const [users, total] = await Promise.all([
        User.find(query)
            .select('name email plan customLimits currentCases totalTokensConsumed totalStorageUsed')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(query)
    ])

    const formattedUsers = users.map(user => {
        const u = user.toObject({ virtuals: true })
        return {
            _id: u._id,
            name: u.name,
            email: u.email,
            plan: u.plan,
            usage: { cases: u.currentCases, tokens: u.totalTokensConsumed, storage: u.totalStorageUsed },
            limits: { cases: u.maxCases, tokens: u.maxTokens, storage: u.maxTotalStorage, filesPerCase: u.maxFilesPerCase },
            isCustom: !!u.customLimits
        }
    })

    res.status(200).json({ 
        success: true, 
        data: { users: formattedUsers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } 
    })
})

export const updateUserQuotas = catchAsync(async (req: IAuthRequest, res: Response) => {
    const { userId } = req.params
    const { maxCases, maxTokens, maxTotalStorage, maxFilesPerCase } = req.body

    const user = await User.findById(userId)
    if (!user) throw new AppError('Target identity not found', 404)

    const before = user.toObject({ virtuals: true })
    
    user.customLimits = { maxCases, maxTokens, maxTotalStorage, maxFilesPerCase }
    await user.save()
    const after = user.toObject({ virtuals: true })

    AuditLog.create({
        adminId: req.user?._id, adminName: req.user?.name, targetId: user._id, targetName: user.name, targetType: 'user', category: 'user', action: 'quota_adjusted',
        before: { maxCases: before.maxCases, maxTokens: before.maxTokens, maxTotalStorage: before.maxTotalStorage, maxFilesPerCase: before.maxFilesPerCase },
        after: { maxCases: after.maxCases, maxTokens: after.maxTokens, maxTotalStorage: after.maxTotalStorage, maxFilesPerCase: after.maxFilesPerCase },
        description: `Manual resource orchestration for ${user.email}`,
        ipAddress: req.ip, userAgent: req.get('user-agent')
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Quota orchestration finalized' })
})

export const resetUserQuotas = catchAsync(async (req: IAuthRequest, res: Response) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) throw new AppError('Target identity not found', 404)

    const before = user.toObject({ virtuals: true })
    user.customLimits = undefined
    await user.save()
    const after = user.toObject({ virtuals: true })

    AuditLog.create({
        adminId: req.user?._id, adminName: req.user?.name, targetId: user._id, targetName: user.name, targetType: 'user', category: 'user', action: 'quota_reset', before, after,
        description: `Quota synchronization reset to plan defaults for ${user.email}`,
        ipAddress: req.ip, userAgent: req.get('user-agent')
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Quota synchronization reset to plan defaults' })
})
