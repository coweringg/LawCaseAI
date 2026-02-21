import { Response } from 'express'
import { User, Transaction } from '../models'
import { IApiResponse, IAuthRequest, UserPlan } from '../types'
import { logAction } from '../utils/auditLogger'

// Plan pricing lookup
const PLAN_PRICES: Record<string, number> = {
  [UserPlan.BASIC]: 99,
  [UserPlan.PROFESSIONAL]: 199,
  [UserPlan.ELITE]: 300,
  [UserPlan.ENTERPRISE]: 999
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
        console.error('[PaymentController] getTransactionHistory error:', error)
        res.status(500).json({ success: false, message: 'Failed to retrieve history' } as IApiResponse)
    }
}

export const createCheckoutSession = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { planId } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans = Object.values(UserPlan)
        if (!planId || !validPlans.includes(planId as UserPlan)) {
            res.status(400).json({ success: false, message: 'The selected subscription plan is invalid. Please choose from our available tiers.' } as IApiResponse)
            return
        }

        // TODO: Replace with real Stripe integration
        // const session = await stripe.checkout.sessions.create({ ... })
        res.status(200).json({
            success: true,
            message: 'Checkout session created',
            data: {
                sessionId: 'mock_session_' + Math.random().toString(36).substr(2, 9),
                url: `/checkout?plan=${planId}&session=mock`,
                note: 'Payment integration pending — this is a placeholder'
            }
        } as IApiResponse)
    } catch (error: unknown) {
        console.error('[PaymentController] createCheckoutSession error:', error)
        res.status(500).json({ success: false, message: 'Checkout failed' } as IApiResponse)
    }
}

export const confirmPayment = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { planId } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans = Object.values(UserPlan)
        if (!planId || !validPlans.includes(planId as UserPlan)) {
            res.status(400).json({ success: false, message: 'The selected subscription plan is invalid. Please choose from our available tiers.' } as IApiResponse)
            return
        }

        const amount = PLAN_PRICES[planId] || 0
        if (amount <= 0) {
            res.status(400).json({ success: false, message: 'Invalid payment amount' } as IApiResponse)
            return
        }

        res.status(200).json({
            success: true,
            message: 'Checkout initialized',
            data: {
                sessionId: 'mock_session_' + Math.random().toString(36).substr(2, 9),
                url: `/checkout?plan=${planId}&session=mock`,
                note: 'Payment integration pending — this is a placeholder'
            }
        } as IApiResponse)
    } catch (error: unknown) {
        console.error('[PaymentController] confirmPayment error:', error)
        res.status(500).json({ success: false, message: 'Payment initialization failed' } as IApiResponse)
    }
}

export const confirmPurchase = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { plan, seats, isBusiness } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans = Object.values(UserPlan)
        if (!plan || !validPlans.includes(plan as UserPlan)) {
            res.status(400).json({ success: false, message: 'The selected subscription plan is invalid. Please choose from our available tiers.' } as IApiResponse)
            return
        }

        // Calculate amount
        const transactionAmount = isBusiness ? ((seats || 5) * 300) : (PLAN_PRICES[plan] || 0)
        
        if (transactionAmount <= 0) {
            res.status(400).json({ success: false, message: 'Invalid purchase amount' } as IApiResponse)
            return
        }

        res.status(200).json({
            success: true,
            message: 'Purchase transaction created',
            data: {
                transactionId: 'mock_tx_' + Math.random().toString(36).substr(2, 9),
            }
        } as IApiResponse)

    } catch (error: unknown) {
        console.error('[PaymentController] confirmPurchase error:', error)
        res.status(500).json({ success: false, message: 'Transaction initialization failed' } as IApiResponse)
    }
}

export const purchaseBusinessPlan = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { firmName, seats } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        if (!firmName || !seats || seats < 5) {
            res.status(400).json({ success: false, message: 'Firm registration requires a valid name and a minimum of 5 seats.' } as IApiResponse)
            return
        }

        const { default: Organization } = await import('../models/Organization')
        
        // Generate unique 8-character code
        const crypto = await import('crypto')
        const firmCode = `ELITE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

        // Create Organization
        const org = await Organization.create({
            name: firmName,
            adminId: userId,
            totalSeats: seats,
            usedSeats: 1, // The admin takes the first seat
            firmCode,
            isActive: true
        })

        // Upgrade user to Org Admin
        const user = await User.findById(userId)
        if (user) {
            user.organizationId = org._id
            user.isOrgAdmin = true
            user.plan = UserPlan.ELITE
            user.lawFirm = firmName
            await user.save()
        }

        // Record the transaction
        await Transaction.create({
            userId,
            amount: seats * 300,
            plan: UserPlan.ELITE,
            status: 'succeeded',
            date: new Date()
        })

        // Log action
        await logAction({
            adminId: user?._id || userId,
            adminName: user?.name || 'User',
            targetId: org._id,
            targetName: org.name,
            targetType: 'user',
            category: 'platform',
            action: 'CREATE',
            description: `Organization ${firmName} created with ${seats} seats. Code: ${firmCode}`
        })

        res.status(200).json({
            success: true,
            message: 'Business plan purchased successfully',
            data: {
                organizationId: org._id,
                firmCode,
                seatsPurchased: seats
            }
        } as IApiResponse)

    } catch (error: unknown) {
        console.error('[PaymentController] purchaseBusinessPlan error:', error)
        res.status(500).json({ success: false, message: 'Failed to purchase business plan' } as IApiResponse)
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
            res.status(200).json({ success: false, message: 'No organization found' } as IApiResponse)
            return
        }

        const { default: Organization } = await import('../models/Organization')
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
        console.error('[PaymentController] getOrganizationDetails error:', error)
        res.status(500).json({ success: false, message: 'Failed to retrieve organization details' } as IApiResponse)
    }
}
