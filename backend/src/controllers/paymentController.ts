import { Response } from 'express'
import { User, Transaction, Organization, Case, Event } from '../models'
import { IApiResponse, IAuthRequest, UserPlan, UserRole, CaseStatus, EventStatus } from '../types'
import { logAction } from '../utils/auditLogger'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { getPaddleInstance } from '../utils/paddle'
import config from '../config'

const getPaddlePriceId = (plan: UserPlan, interval: 'monthly' | 'annual'): string => {
    return config.paddle.prices[interval][plan as 'basic' | 'professional' | 'elite' | 'enterprise'] || ''
}

export const getTransactionHistory = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const transactions = await Transaction.find({ userId }).sort({ date: -1 })
    res.status(200).json({ success: true, message: 'Transaction history retrieved', data: transactions })
})

export const createCheckoutSession = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { planId, interval = 'monthly', seats = 1, firmName = '' } = req.body
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    if (!planId || !Object.values(UserPlan).includes(planId as UserPlan)) {
        throw new AppError('The selected subscription plan is invalid.', 400)
    }

    const user = await User.findById(userId)
    if (user?.organizationId && !user?.isOrgAdmin) {
        throw new AppError('Your account is managed by your organization administrator.', 403)
    }

    const isPersonalPlan = [UserPlan.BASIC, UserPlan.PROFESSIONAL, UserPlan.ELITE].includes(planId as UserPlan);
    if (isPersonalPlan && (user?.isOrgAdmin || user?.organizationId)) {
        throw new AppError('Enterprise accounts cannot transition to personal plans directly. Please use a separate account.', 403)
    }

    if (planId === UserPlan.ENTERPRISE && user?.organizationId && user?.isOrgAdmin) {
        const org = await Organization.findById(user.organizationId);
        const requestedSeats = parseInt(seats as string) || 1;
        if (org && requestedSeats < org.totalSeats) {
            throw new AppError(`New plan must include at least ${org.totalSeats} seats.`, 400)
        }
    }

    const priceId = getPaddlePriceId(planId as UserPlan, interval as 'monthly' | 'annual')
    const paddle = getPaddleInstance()

    const transaction = await paddle.transactions.create({
        items: [{
            priceId,
            quantity: planId === UserPlan.ENTERPRISE ? Math.max(1, parseInt(seats as string) || 1) : 1
        }],
        customData: {
            userId: userId.toString(),
            planId: planId as string,
            interval: interval as string,
            seats: seats.toString(),
            firmName: firmName as string
        }
    })

    res.status(200).json({
        success: true,
        message: 'Checkout session created',
        data: { transactionId: transaction.id, note: 'Secure payment session initialized' }
    })
})

export const getOrganizationDetails = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const user = await User.findById(userId)
    if (!user || !user.organizationId) {
        res.status(200).json({ success: true, data: null })
        return
    }

    const org = await Organization.findById(user.organizationId)
    if (!org) throw new AppError('Organization not found', 404)

    res.status(200).json({
        success: true,
        data: { id: org._id, name: org.name, firmCode: org.firmCode, totalSeats: org.totalSeats, usedSeats: org.usedSeats, isActive: org.isActive, isOrgAdmin: user.isOrgAdmin }
    })
})

export const removeMember = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { memberId } = req.params
    const adminId = req.user?._id
    if (!adminId) throw new AppError('Unauthorized', 401)

    const admin = await User.findById(adminId)
    if (!admin || !admin.isOrgAdmin || !admin.organizationId) {
        throw new AppError('Unauthorized action', 403)
    }

    const member = await User.findById(memberId)
    if (!member || member.organizationId?.toString() !== admin.organizationId.toString()) {
        throw new AppError('Member not found in organization', 404)
    }

    if (member._id.toString() === adminId.toString()) {
        throw new AppError('You cannot remove yourself.', 400)
    }

    const org = await Organization.findOneAndUpdate(
        { _id: admin.organizationId, usedSeats: { $gt: 0 } },
        { $inc: { usedSeats: -1 } },
        { new: true }
    )
    if (!org) throw new AppError('Could not update seats', 400)

    await Promise.all([
        Case.updateMany({ userId: member._id, status: CaseStatus.ACTIVE }, { $set: { status: CaseStatus.CLOSED, closedAt: new Date() } }),
        Event.updateMany({ userId: member._id, status: EventStatus.ACTIVE }, { $set: { status: EventStatus.CLOSED } })
    ]);

    member.organizationId = undefined
    member.plan = UserPlan.NONE
    member.role = UserRole.LAWYER
    member.isOrgAdmin = false
    member.currentCases = 0 
    await member.save()

    res.status(200).json({ success: true, message: 'Member removed successfully', data: { usedSeats: org.usedSeats } })
})

export const getOrganizationMembers = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const adminId = req.user?._id
    if (!adminId) throw new AppError('Unauthorized', 401)

    const admin = await User.findById(adminId)
    if (!admin || !admin.organizationId) throw new AppError('Organization not found', 404)

    const members = await User.find({ organizationId: admin.organizationId }).select('name email role plan')
    res.status(200).json({ success: true, data: members })
})
