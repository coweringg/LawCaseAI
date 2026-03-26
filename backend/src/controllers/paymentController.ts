import { Response } from 'express'
import { User, Transaction, Organization, Case, Event } from '../models'
import { IApiResponse, IAuthRequest, UserPlan, UserRole, CaseStatus, EventStatus } from '../types'
import { logAction } from '../utils/auditLogger'
import mongoose from 'mongoose'
import crypto from 'crypto'
import logger from '../utils/logger'
import { getPaddleInstance } from '../utils/paddle'
import config from '../config'

const controllerLogger = logger.child({ module: 'payment-controller' })

const PLAN_PRICES: Record<string, number> = {
  [UserPlan.BASIC]: 99,
  [UserPlan.PROFESSIONAL]: 199,
  [UserPlan.ELITE]: 300,
  [UserPlan.ENTERPRISE]: 300
}

const ANNUAL_PRICES: Record<string, number> = {
  [UserPlan.BASIC]: 79,
  [UserPlan.PROFESSIONAL]: 159,
  [UserPlan.ELITE]: 240,
  [UserPlan.ENTERPRISE]: 240
}

export const getTransactionHistory = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const transactions = await Transaction.find({ userId }).sort({ date: -1 })

        res.status(200).json({
            success: true,
            message: 'Transaction history retrieved',
            data: transactions
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'getTransactionHistory error')
        res.status(500).json({ success: false, message: 'Failed to retrieve history' } as IApiResponse)
    }
}

const getPaddlePriceId = (plan: UserPlan, interval: 'monthly' | 'annual'): string => {
    const prices: any = {
        monthly: {
            [UserPlan.BASIC]: process.env.PADDLE_PRICE_BASIC_MONTHLY || 'pri_basic_monthly',
            [UserPlan.PROFESSIONAL]: process.env.PADDLE_PRICE_PRO_MONTHLY || 'pri_pro_monthly',
            [UserPlan.ELITE]: process.env.PADDLE_PRICE_ELITE_MONTHLY || 'pri_elite_monthly',
            [UserPlan.ENTERPRISE]: process.env.PADDLE_PRICE_ENT_MONTHLY || 'pri_ent_monthly'
        },
        annual: {
            [UserPlan.BASIC]: process.env.PADDLE_PRICE_BASIC_ANNUAL || 'pri_basic_annual',
            [UserPlan.PROFESSIONAL]: process.env.PADDLE_PRICE_PRO_ANNUAL || 'pri_pro_annual',
            [UserPlan.ELITE]: process.env.PADDLE_PRICE_ELITE_ANNUAL || 'pri_elite_annual',
            [UserPlan.ENTERPRISE]: process.env.PADDLE_PRICE_ENT_ANNUAL || 'pri_ent_annual'
        }
    }
    return prices[interval][plan]
}

export const createCheckoutSession = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { planId, interval = 'monthly', seats = 1 } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans = Object.values(UserPlan)
        if (!planId || !validPlans.includes(planId as UserPlan)) {
            res.status(400).json({ success: false, message: 'The selected subscription plan is invalid.' } as IApiResponse)
            return
        }

        const user = await User.findById(userId)
        if (user?.organizationId && !user?.isOrgAdmin) {
            res.status(403).json({ success: false, message: 'Your account is managed by your organization administrator. Please contact them for plan changes.' } as IApiResponse)
            return
        }

        const isPersonalPlan = [UserPlan.BASIC, UserPlan.PROFESSIONAL, UserPlan.ELITE].includes(planId as UserPlan);
        if (isPersonalPlan && (user?.isOrgAdmin || user?.organizationId)) {
            res.status(403).json({ 
                success: false, 
                message: 'Your account is currently registered as an Enterprise Administrator with active licenses associated. To preserve billing integrity for your team, you cannot transition to a personal plan with this account. If you wish to use a personal plan, please register a new, separate account.' 
            } as IApiResponse)
            return
        }

        if (planId === UserPlan.ENTERPRISE && user?.organizationId && user?.isOrgAdmin) {
            const org = await (await import('../models/Organization')).default.findById(user.organizationId);
            const requestedSeats = parseInt(seats as string) || 1;
            if (org && requestedSeats < org.totalSeats) {
                res.status(400).json({ 
                    success: false, 
                    message: `Your organization currently has ${org.totalSeats} seats. Your new plan must include at least ${org.totalSeats} seats to maintain your infrastructure.` 
                } as IApiResponse)
                return
            }
        }

        const priceId = getPaddlePriceId(planId as UserPlan, interval)

        const paddle = getPaddleInstance()
        
        const transaction = await paddle.transactions.create({
            items: [{
                priceId,
                quantity: Math.max(1, parseInt(seats))
            }],
            customData: {
                userId: userId.toString(),
                planId,
                interval,
                seats: seats.toString()
            }
        })

        res.status(200).json({
            success: true,
            message: 'Checkout session created',
            data: {
                transactionId: transaction.id,
                note: 'Secure payment session initialized via Paddle'
            }
        } as IApiResponse)
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'createCheckoutSession error')
        res.status(500).json({ success: false, message: 'Failed to connect to payment gateway' } as IApiResponse)
    }
}

export const mockCheckout = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { planId, interval = 'monthly', seats = 1, firmName } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans = Object.values(UserPlan)
        if (!planId || !validPlans.includes(planId as UserPlan)) {
            res.status(400).json({ success: false, message: 'The selected plan is invalid.' } as IApiResponse)
            return
        }

        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

        if (user.organizationId && !user.isOrgAdmin) {
            res.status(403).json({ success: false, message: 'Your account is managed by your organization administrator. Please contact them for plan changes.' } as IApiResponse)
            return
        }

        const isPersonalPlan = [UserPlan.BASIC, UserPlan.PROFESSIONAL, UserPlan.ELITE].includes(planId as any);
        if (isPersonalPlan && (user.isOrgAdmin || user.organizationId)) {
            res.status(403).json({ 
                success: false, 
                message: 'Your account is associated with an Enterprise organization. You cannot purchase personal plans with this account.' 
            } as IApiResponse)
            return
        }

        if (planId === UserPlan.ENTERPRISE && user.organizationId && user.isOrgAdmin) {
            const org = await (await import('../models/Organization')).default.findById(user.organizationId);
            const requestedSeats = parseInt(seats as string) || 1;
            if (org && requestedSeats < org.usedSeats) {
                res.status(400).json({ 
                    success: false, 
                    message: `Your organization currently has ${org.usedSeats} seats in use. Your new plan must include at least ${org.usedSeats} seats.` 
                } as IApiResponse)
                return
            }
        }

        user.plan = planId as UserPlan
        user.planLimit = (config.planLimits as any)[planId]?.maxCases || 0
        user.billingInterval = interval
        user.isTrialUsed = true

        const now = new Date()
        user.currentPeriodStart = now
        const nextPeriod = new Date(now)
        if (interval === 'annual') {
            nextPeriod.setFullYear(nextPeriod.getFullYear() + 1)
        } else {
            nextPeriod.setMonth(nextPeriod.getMonth() + 1)
        }
        user.currentPeriodEnd = nextPeriod

        const activeCaseCount = await Case.countDocuments({ userId, status: CaseStatus.ACTIVE })
        user.currentCases = activeCaseCount
        user.expiredPremium = false
        user.expiredTrial = false

        if (planId === UserPlan.ENTERPRISE) {
            const requestedSeats = parseInt(seats as string) || 5;
            if (!user.organizationId) {
                const org = new Organization({
                    name: firmName || `${user.name}'s Firm`,
                    adminId: user._id,
                    firmCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
                    totalSeats: Math.max(5, requestedSeats),
                    usedSeats: 1,
                    isActive: true,
                    currentPeriodEnd: user.currentPeriodEnd
                })
                await org.save()
                user.organizationId = org._id as any
                user.isOrgAdmin = true
                user.role = UserRole.ORG_ADMIN
            } else if (user.isOrgAdmin) {
                await Organization.findByIdAndUpdate(user.organizationId, {
                    $max: { totalSeats: Math.max(5, requestedSeats) },
                    isActive: true,
                    currentPeriodEnd: user.currentPeriodEnd
                })
                await User.updateMany(
                    { organizationId: user.organizationId },
                    { $set: { plan: UserPlan.ENTERPRISE, planLimit: config.planLimits.enterprise.maxCases, currentPeriodEnd: user.currentPeriodEnd } }
                )
            }
        }

        const basePrice = interval === 'annual' ? ANNUAL_PRICES[planId as string] : PLAN_PRICES[planId as string];
        const multiplier = planId === UserPlan.ENTERPRISE ? (parseInt(seats as string) || 5) : 1;
        const totalAmount = (basePrice || 0) * multiplier;

        if (totalAmount > 0) {
            await Transaction.create({
                userId,
                amount: totalAmount,
                plan: planId as UserPlan,
                status: 'succeeded',
                paymentMethod: 'Mock/Development Checkout',
                date: new Date()
            });
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: 'Mock Checkout Successful! Plan has been upgraded.',
            data: { redirectUrl: '/dashboard?status=success' }
        } as IApiResponse)

    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'mockCheckout error')
        res.status(500).json({ success: false, message: 'Development mock checkout failed' } as IApiResponse)
    }
}

export const confirmPurchase = async (req: IAuthRequest, res: Response): Promise<void> => {
    res.status(403).json({
        success: false,
        message: 'Endpoint deprecated. Fulfillments are now handled securely via Paddle Webhooks.'
    } as IApiResponse)
}

export const purchaseBusinessPlan = async (req: IAuthRequest, res: Response): Promise<void> => {
    res.status(403).json({
        success: false,
        message: 'Endpoint deprecated. Fulfillments are now handled securely via Paddle Webhooks.'
    } as IApiResponse)
}

export const getOrganizationDetails = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const user = await User.findById(userId)
        if (!user || !user.organizationId) {
            res.status(200).json({ success: false, message: 'No organization found', data: null } as IApiResponse)
            return
        }

        const org = await Organization.findById(user.organizationId)

        if (!org) {
            res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
            return
        }

        res.status(200).json({
            success: true,
            message: 'Organization details retrieved',
            data: {
                id: org._id,
                name: org.name,
                firmCode: org.firmCode,
                totalSeats: org.totalSeats,
                usedSeats: org.usedSeats,
                isActive: org.isActive,
                isOrgAdmin: user.isOrgAdmin
            }
        } as IApiResponse)

    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'getOrganizationDetails error')
        res.status(500).json({ success: false, message: 'Failed to retrieve organization details' } as IApiResponse)
    }
}

export const increaseSeats = async (req: IAuthRequest, res: Response): Promise<void> => {
    res.status(403).json({
        success: false,
        message: 'Endpoint deprecated. Fulfillments are now handled securely via Paddle Webhooks.'
    } as IApiResponse)
}

export const removeMember = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { memberId } = req.params
        const adminId = req.user?._id

        if (!adminId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const admin = await User.findById(adminId)
        if (!admin || !admin.isOrgAdmin || !admin.organizationId) {
            res.status(403).json({ success: false, message: 'Unauthorized action' } as IApiResponse)
            return
        }

        const member = await User.findById(memberId)
        if (!member || member.organizationId?.toString() !== admin.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Member not found in your organization' } as IApiResponse)
            return
        }

        if (member._id.toString() === adminId.toString()) {
            res.status(400).json({ success: false, message: 'You cannot remove yourself from your own organization.' } as IApiResponse)
            return
        }

        const org = await Organization.findOneAndUpdate(
            { _id: admin.organizationId, usedSeats: { $gt: 0 } },
            { $inc: { usedSeats: -1 } },
            { new: true }
        )

        if (!org) {
            res.status(400).json({ success: false, message: 'Could not update organization seats' } as IApiResponse)
            return
        }

        await Case.updateMany(
            { userId: member._id, status: CaseStatus.ACTIVE },
            { $set: { status: CaseStatus.CLOSED, closedAt: new Date() } }
        )

        await Event.updateMany(
            { userId: member._id, status: EventStatus.ACTIVE },
            { $set: { status: EventStatus.CLOSED } }
        )

        member.organizationId = undefined
        member.plan = UserPlan.NONE
        member.role = UserRole.LAWYER
        member.isOrgAdmin = false
        member.currentCases = 0 
        
        await member.save()

        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            data: { usedSeats: org.usedSeats }
        } as IApiResponse)

    } catch (error) {
        controllerLogger.error({ err: error }, 'removeMember error')
        res.status(500).json({ success: false, message: 'Failed to remove member' } as IApiResponse)
    }
}

export const getOrganizationMembers = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const adminId = req.user?._id
        if (!adminId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const admin = await User.findById(adminId)
        if (!admin || !admin.organizationId) {
            res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
            return
        }

        const members = await User.find({ organizationId: admin.organizationId }).select('name email role plan')
        
        res.status(200).json({
            success: true,
            message: 'Members retrieved',
            data: members
        } as IApiResponse)

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve members' } as IApiResponse)
    }
}
