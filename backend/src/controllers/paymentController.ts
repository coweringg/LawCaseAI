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
    return config.paddle.prices[interval][plan as 'basic' | 'professional' | 'elite' | 'enterprise'] || ''
}

export const createCheckoutSession = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {

        const { planId, interval = 'monthly', seats = 1, firmName = '' } = req.body
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
