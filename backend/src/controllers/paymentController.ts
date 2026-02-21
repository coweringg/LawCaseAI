import { Response } from 'express'
import { User, Transaction, Organization } from '../models'
import { IApiResponse, IAuthRequest, UserPlan, UserRole } from '../types'
import { logAction } from '../utils/auditLogger'
import { validateLuhn } from '../utils/cardValidator'
import mongoose from 'mongoose'
import crypto from 'crypto'

// Plan pricing lookup
const PLAN_PRICES: Record<string, number> = {
  [UserPlan.BASIC]: 99,
  [UserPlan.PROFESSIONAL]: 199,
  [UserPlan.ELITE]: 300,
  [UserPlan.ENTERPRISE]: 300 // Price per seat
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
    const session = await mongoose.startSession()
    let isTransactional = true

    try {
        session.startTransaction()
    } catch (error) {
        console.warn('[PaymentController] Transactions not supported by this MongoDB deployment. Proceeding without atomicity.')
        isTransactional = false
    }

    try {
        const { plan, seats, cardNumber, firmName } = req.body
        const userId = req.user?._id

        if (!userId) {
            await session.abortTransaction()
            session.endSession()
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        // Validate plan
        const validPlans = Object.values(UserPlan)
        if (!plan || !validPlans.includes(plan as UserPlan)) {
            await session.abortTransaction()
            session.endSession()
            res.status(400).json({ success: false, message: 'Invalid subscription plan' } as IApiResponse)
            return
        }

        // Validate card using Luhn algorithm
        if (!cardNumber || !validateLuhn(cardNumber)) {
            await session.abortTransaction()
            session.endSession()
            res.status(400).json({ success: false, message: 'Invalid card details. Please check your card number.' } as IApiResponse)
            return
        }

        const user = await User.findById(userId).session(isTransactional ? session : null)
        if (!user) {
            await session.abortTransaction()
            session.endSession()
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

        let transactionAmount = PLAN_PRICES[plan] || 0
        let organizationId = user.organizationId
        let orgFirmCode: string | undefined = undefined

        // Handle Enterprise Plan
        if (plan === UserPlan.ENTERPRISE) {
            const requestedSeats = parseInt(seats) || 1
            if (requestedSeats < 1) {
                await session.abortTransaction()
                session.endSession()
                res.status(400).json({ success: false, message: 'Enterprise plan requires at least 1 seat.' } as IApiResponse)
                return
            }

            transactionAmount = requestedSeats * 300 // Price per seat for Enterprise
            
            // Generate firm code
            const firmCode = `ENT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
            orgFirmCode = firmCode; // Capture for response

            // Create Organization
            const org = await Organization.create([{
                name: firmName || user.lawFirm || 'My Trial Firm',
                adminId: userId,
                totalSeats: requestedSeats,
                usedSeats: 1,
                firmCode,
                isActive: true
            }], isTransactional ? { session } : {})

            organizationId = org[0]._id
            user.role = UserRole.ORG_ADMIN
            user.isOrgAdmin = true
            user.organizationId = organizationId
        }

        // Update user plan
        user.plan = plan
        await user.save(isTransactional ? { session } : {})

        // Record Transaction
        await Transaction.create([{
            userId,
            amount: transactionAmount,
            plan: plan,
            status: 'succeeded',
            date: new Date()
        }], isTransactional ? { session } : {})

        // Log action
        await logAction({
            adminId: userId,
            adminName: user.name,
            targetId: userId,
            targetName: user.name,
            targetType: 'user',
            category: 'platform',
            action: 'PLAN_CHANGE',
            after: { plan: user.plan },
            description: `User upgraded to ${plan} plan.`
        })

        if (isTransactional) {
            await session.commitTransaction()
        }
        session.endSession()

        res.status(200).json({
            success: true,
            message: 'Purchase completed successfully',
            data: {
                transactionId: 'mock_tx_' + crypto.randomBytes(4).toString('hex'),
                plan: user.plan,
                organizationId,
                firmCode: plan === UserPlan.ENTERPRISE ? orgFirmCode : undefined,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    lawFirm: user.lawFirm,
                    role: user.role,
                    plan: user.plan,
                    planLimit: user.planLimit,
                    currentCases: user.currentCases,
                    isOrgAdmin: user.isOrgAdmin,
                    organizationId: user.organizationId
                }
            }
        } as IApiResponse)

    } catch (error: unknown) {
        if (isTransactional) {
            await session.abortTransaction()
        }
        session.endSession()
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[PaymentController] confirmPurchase error:', error)
        
        res.status(500).json({ 
            success: false, 
            message: 'Transaction failed',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        } as IApiResponse)
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
        console.error('[PaymentController] getOrganizationDetails error:', error)
        res.status(500).json({ success: false, message: 'Failed to retrieve organization details' } as IApiResponse)
    }
}

export const increaseSeats = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { additionalSeats, cardNumber } = req.body
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        if (!additionalSeats || additionalSeats < 1) {
            res.status(400).json({ success: false, message: 'Must add at least 1 seat.' } as IApiResponse)
            return
        }

        if (!cardNumber || !validateLuhn(cardNumber)) {
            res.status(400).json({ success: false, message: 'Invalid card details.' } as IApiResponse)
            return
        }

        const user = await User.findById(userId)
        if (!user || !user.isOrgAdmin || !user.organizationId) {
            res.status(403).json({ success: false, message: 'Only organization admins can increase capacity.' } as IApiResponse)
            return
        }

        const org = await Organization.findByIdAndUpdate(
            user.organizationId,
            { $inc: { totalSeats: additionalSeats } },
            { new: true }
        )

        // Record transaction
        await Transaction.create({
            userId,
            amount: additionalSeats * 300,
            plan: UserPlan.ENTERPRISE,
            status: 'succeeded',
            date: new Date()
        })

        res.status(200).json({
            success: true,
            message: `Capacity increased by ${additionalSeats} seats.`,
            data: { totalSeats: org?.totalSeats }
        } as IApiResponse)

    } catch (error) {
        console.error('[PaymentController] increaseSeats error:', error)
        res.status(500).json({ success: false, message: 'Failed to increase capacity' } as IApiResponse)
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

        // Atomically decrement usedSeats and unlink member
        const org = await Organization.findOneAndUpdate(
            { _id: admin.organizationId, usedSeats: { $gt: 0 } },
            { $inc: { usedSeats: -1 } },
            { new: true }
        )

        if (!org) {
            res.status(400).json({ success: false, message: 'Could not update organization seats' } as IApiResponse)
            return
        }

        member.organizationId = undefined
        member.plan = UserPlan.NONE
        member.role = UserRole.LAWYER
        await member.save()

        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            data: { usedSeats: org.usedSeats }
        } as IApiResponse)

    } catch (error) {
        console.error('[PaymentController] removeMember error:', error)
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
