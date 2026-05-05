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
        throw new AppError('Authentication failed: Cryptographic payload signature missing from origin node.', 400)
    }

    const eventData = await paddle.webhooks.unmarshal(
        req.body.toString(),
        secretKey,
        signature
    )

    if (!eventData) {
        throw new AppError('Protocol violation: Unrecognized event payload structure detected.', 400)
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
        const { userId, planId: newPlan, interval = 'monthly', firmName, isExpansion } = customData
        
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
        const subscriptionId = transactionData.subscriptionId || transactionData.subscription_id || null

        let actualQuantity = 1;
        if (transactionData.items && transactionData.items.length > 0 && transactionData.items[0].quantity) {
            actualQuantity = transactionData.items[0].quantity;
        } else if (transactionData.details?.lineItems && transactionData.details.lineItems.length > 0 && transactionData.details.lineItems[0].quantity) {
            actualQuantity = transactionData.details.lineItems[0].quantity;
        } else if (customData.seats) {
            actualQuantity = parseInt(customData.seats, 10) || 1;
        }

        if (isExpansion === 'true' && plan === UserPlan.ENTERPRISE && user.organizationId) {
            await Organization.findByIdAndUpdate(
                user.organizationId,
                { 
                    $inc: { totalSeats: actualQuantity },
                    ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {})
                },
                { session: isTransactional ? session : undefined }
            )

            const transactionAmount = parseFloat(transactionData.details?.totals?.total || '0') / 100
            await Transaction.create([{ userId, amount: transactionAmount, plan: plan, status: 'succeeded', paymentMethod: 'Paddle Billing', date: new Date() }], isTransactional ? { session } : {})

            webhookLogger.info({ userId, seatIncrement: actualQuantity, orgId: user.organizationId.toString() }, 'Seat expansion completed')
            if (isTransactional) await session.commitTransaction()
            return
        }

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
                totalSeats: actualQuantity,
                usedSeats: 1,
                firmCode,
                isActive: true,
                currentPeriodEnd: nextPeriod,
                ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {})
            }], isTransactional ? { session } : {})

            user.role = UserRole.ORG_ADMIN
            user.isOrgAdmin = true
            user.organizationId = org[0]._id
        } else if (plan === UserPlan.ENTERPRISE && user.organizationId) {
            await Organization.findByIdAndUpdate(user.organizationId, { 
                $inc: { totalSeats: actualQuantity }, 
                isActive: true, 
                currentPeriodEnd: nextPeriod,
                ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {})
            }, { session: isTransactional ? session : undefined })
            await User.updateMany({ organizationId: user.organizationId }, { $set: { plan: UserPlan.ENTERPRISE, planLimit: (config.planLimits as any)[plan]?.maxCases || 0, currentPeriodEnd: nextPeriod, expiredPremium: false } }, { session: isTransactional ? session : undefined })
        }
        
        const casesToCarryOverCount = await Case.countDocuments({ userId, $or: [{ status: CaseStatus.ACTIVE }, { lastActivationPeriodStart: { $gte: oldPeriodStart } }] });
        user.currentCases = casesToCarryOverCount;
        if (casesToCarryOverCount > 0) {
            await Case.updateMany({ userId, $or: [{ status: CaseStatus.ACTIVE }, { lastActivationPeriodStart: { $gte: oldPeriodStart } }] }, { $set: { lastActivationPeriodStart: user.currentPeriodStart } }, { session: isTransactional ? session : undefined });
        }
        
        user.totalTokensConsumed = 0;
        if (subscriptionId) user.paddleSubscriptionId = subscriptionId;
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

    user.paddleSubscriptionId = subscriptionData.id;
    const willCancel = subscriptionData.scheduledChange?.action === 'cancel';
    user.willCancelAtPeriodEnd = willCancel;

    if (subscriptionData.currentBillingPeriod?.endsAt) {
        const nextPeriod = new Date(subscriptionData.currentBillingPeriod.endsAt)
        user.currentPeriodEnd = nextPeriod
        user.expiredPremium = (subscriptionData.status === 'canceled' || subscriptionData.status === 'past_due');
        user.expiredTrial = false
        
        if (user.organizationId && user.isOrgAdmin) {
            const updateData: any = { 
                currentPeriodEnd: nextPeriod, 
                isActive: subscriptionData.status === 'active',
                paddleSubscriptionId: subscriptionData.id,
                willCancelAtPeriodEnd: willCancel
            };
            
            if (subscriptionData.items?.[0]?.quantity) {
                updateData.totalSeats = subscriptionData.items[0].quantity;
            }

            await Organization.findByIdAndUpdate(user.organizationId, updateData)
            await User.updateMany({ organizationId: user.organizationId }, { $set: { currentPeriodEnd: nextPeriod, expiredPremium: user.expiredPremium } })
        }
    }
    await user.save()
}

const handleSubscriptionCanceled = async (subscriptionData: any): Promise<void> => {
    const customData = subscriptionData.customData || {}
    const userId = customData.userId
    if (!userId) return

    const user = await User.findById(userId)
    if (!user) return

    user.expiredPremium = true
    user.willCancelAtPeriodEnd = false
    await user.save()

    if (user.organizationId && user.isOrgAdmin) {
        await Organization.findByIdAndUpdate(user.organizationId, { isActive: false, willCancelAtPeriodEnd: false })
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
