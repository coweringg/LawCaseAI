import { Request, Response } from 'express'
import { EventName } from '@paddle/paddle-node-sdk'
import { getPaddleInstance, getWebhookSecret } from '../utils/paddle'
import { User, Transaction, Organization, Case } from '../models'
import { UserPlan, UserRole, CaseStatus } from '../types'
import mongoose from 'mongoose'
import crypto from 'crypto'
import logger from '../utils/logger'
import config from '../config'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

const webhookLogger = logger.child({ module: 'paddle-webhook' })

export const handlePaddleWebhook = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['paddle-signature'] as string || ''
    
    const paddle = getPaddleInstance()
    const secretKey = getWebhookSecret()

    if (!signature) {
        throw new AppError('Missing Paddle signature', 400)
    }

    const eventData = await paddle.webhooks.unmarshal(
        req.body.toString(),
        secretKey,
        signature
    )

    if (!eventData) {
        throw new AppError('Invalid event', 400)
    }

    webhookLogger.info({ eventType: eventData.eventType }, 'Received Paddle webhook')

    switch (eventData.eventType) {
        case EventName.TransactionCompleted:
            await handleTransactionCompleted(eventData.data)
            break;
        case EventName.SubscriptionUpdated:
            await handleSubscriptionUpdated(eventData.data)
            break;
        case EventName.SubscriptionCanceled:
            await handleSubscriptionCanceled(eventData.data)
            break;
        case EventName.SubscriptionPastDue:
            await handleSubscriptionPastDue(eventData.data)
            break;
        default:
            webhookLogger.debug({ eventType: eventData.eventType }, 'Unhandled event type')
    }

    res.status(200).send('OK')
})

const handleTransactionCompleted = async (transactionData: any): Promise<void> => {
    const session = await mongoose.startSession()
    let isTransactional = true

    try {
        session.startTransaction()
    } catch (error) {
        isTransactional = false
    }

    try {
        const customData = transactionData.customData || {}
        const { userId, planId: newPlan, interval = 'monthly', seats = '1', firmName } = customData
        
        if (!userId) {
            if (isTransactional) await session.abortTransaction()
            return
        }

        const user = await User.findById(userId).session(isTransactional ? session : null)
        if (!user) {
            if (isTransactional) await session.abortTransaction()
            return
        }

        const validPlans = Object.values(UserPlan)
        const plan = validPlans.includes(newPlan as UserPlan) ? (newPlan as UserPlan) : user.plan

        user.plan = plan
        user.planLimit = (config.planLimits as any)[plan]?.maxCases || 0
        if (interval === 'monthly' || interval === 'annual') {
            user.billingInterval = interval
        }
        
        const now = new Date();
        user.expiredPremium = false;
        user.expiredTrial = false;
        const oldPeriodStart = user.currentPeriodStart || new Date(0);
        user.currentPeriodStart = now;
        
        const nextPeriod = new Date(now);
        if (interval === 'annual') nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
        else nextPeriod.setMonth(nextPeriod.getMonth() + 1);
        user.currentPeriodEnd = nextPeriod;

        if (plan === UserPlan.ENTERPRISE && !user.organizationId) {
            const firmCode = `ENT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
            const org = await Organization.create([{
                name: firmName || user.lawFirm || 'My Premium Firm',
                adminId: userId,
                totalSeats: parseInt(seats, 10) || 1,
                usedSeats: 1,
                firmCode,
                isActive: true,
                currentPeriodEnd: nextPeriod
            }], isTransactional ? { session } : {})

            user.role = UserRole.ORG_ADMIN
            user.isOrgAdmin = true
            user.organizationId = org[0]._id
        } else if (plan === UserPlan.ENTERPRISE && user.organizationId) {
            await Organization.findByIdAndUpdate(user.organizationId, { $inc: { totalSeats: parseInt(seats, 10) || 1 }, isActive: true, currentPeriodEnd: nextPeriod }, { session: isTransactional ? session : undefined })
            await User.updateMany({ organizationId: user.organizationId }, { $set: { plan: UserPlan.ENTERPRISE, planLimit: (config.planLimits as any)[plan]?.maxCases || 0, currentPeriodEnd: nextPeriod, expiredPremium: false } }, { session: isTransactional ? session : undefined })
        }
        
        const casesToCarryOverCount = await Case.countDocuments({ userId, $or: [{ status: CaseStatus.ACTIVE }, { lastActivationPeriodStart: { $gte: oldPeriodStart } }] });
        user.currentCases = casesToCarryOverCount;
        if (casesToCarryOverCount > 0) {
            await Case.updateMany({ userId, $or: [{ status: CaseStatus.ACTIVE }, { lastActivationPeriodStart: { $gte: oldPeriodStart } }] }, { $set: { lastActivationPeriodStart: user.currentPeriodStart } }, { session: isTransactional ? session : undefined });
        }
        
        user.totalTokensConsumed = 0;
        await user.save(isTransactional ? { session } : {})

        const transactionAmount = parseFloat(transactionData.details?.totals?.total || '0') / 100
        await Transaction.create([{ userId, amount: transactionAmount, plan: plan, status: 'succeeded', paymentMethod: 'Paddle Billing', date: new Date() }], isTransactional ? { session } : {})

        if (isTransactional) await session.commitTransaction()
    } catch (error) {
        if (isTransactional) await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

const handleSubscriptionUpdated = async (subscriptionData: any): Promise<void> => {
    const customData = subscriptionData.customData || {}
    const userId = customData.userId
    if (!userId) return

    const user = await User.findById(userId)
    if (!user) return

    if (subscriptionData.currentBillingPeriod?.endsAt) {
        const nextPeriod = new Date(subscriptionData.currentBillingPeriod.endsAt)
        user.currentPeriodEnd = nextPeriod
        user.expiredPremium = false
        user.expiredTrial = false
        await user.save()
        
        if (user.organizationId && user.isOrgAdmin) {
            await Organization.findByIdAndUpdate(user.organizationId, { currentPeriodEnd: nextPeriod, isActive: true })
            await User.updateMany({ organizationId: user.organizationId }, { $set: { currentPeriodEnd: nextPeriod, expiredPremium: false } })
        }
    }
}

const handleSubscriptionCanceled = async (subscriptionData: any): Promise<void> => {
    const customData = subscriptionData.customData || {}
    const userId = customData.userId
    if (!userId) return

    const user = await User.findById(userId)
    if (!user) return

    user.expiredPremium = true
    await user.save()

    if (user.organizationId && user.isOrgAdmin) {
        await Organization.findByIdAndUpdate(user.organizationId, { isActive: false })
        await User.updateMany({ organizationId: user.organizationId }, { $set: { expiredPremium: true } })
    }
}

const handleSubscriptionPastDue = async (subscriptionData: any): Promise<void> => {
    const customData = subscriptionData.customData || {}
    const userId = customData.userId
    if (!userId) return

    const user = await User.findById(userId)
    if (!user) return

    user.expiredPremium = true
    await user.save()

    if (user.organizationId && user.isOrgAdmin) {
        await Organization.findByIdAndUpdate(user.organizationId, { isActive: false })
        await User.updateMany({ organizationId: user.organizationId }, { $set: { expiredPremium: true } })
    }
}
