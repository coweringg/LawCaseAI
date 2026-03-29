import { Request, Response } from 'express'
import { EventName } from '@paddle/paddle-node-sdk'
import { getPaddleInstance, getWebhookSecret } from '../utils/paddle'
import { User, Transaction, Organization, Case } from '../models'
import { UserPlan, UserRole, CaseStatus } from '../types'
import { logAction } from '../utils/auditLogger'
import mongoose from 'mongoose'
import crypto from 'crypto'
import logger from '../utils/logger'
import config from '../config'

const webhookLogger = logger.child({ module: 'paddle-webhook' })

export const handlePaddleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['paddle-signature'] as string || ''
  
  try {
    const paddle = getPaddleInstance()
    const secretKey = getWebhookSecret()

    if (!signature) {
      webhookLogger.warn('Missing Paddle signature')
      res.status(400).send('Missing signature')
      return;
    }

    const eventData = await paddle.webhooks.unmarshal(
      req.body.toString(),
      secretKey,
      signature
    )

    if (!eventData) {
      webhookLogger.warn('Failed to unmarshal Paddle event')
      res.status(400).send('Invalid event')
      return;
    }

    webhookLogger.info({ eventType: eventData.eventType }, 'Received Paddle webhook')

    switch (eventData.eventType) {
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(eventData.data)
        break;
      default:
        webhookLogger.debug({ eventType: eventData.eventType }, 'Unhandled event type')
    }

    res.status(200).send('OK')
  } catch (error) {

    webhookLogger.error({ err: error }, 'Webhook processing error')
    res.status(400).send('Webhook Error')
  }
}

const handleTransactionCompleted = async (transactionData: any): Promise<void> => {
  const session = await mongoose.startSession()
  let isTransactional = true

  try {
    session.startTransaction()
  } catch (error) {
    webhookLogger.warn('Transactions not supported. Proceeding without atomicity.')
    isTransactional = false
  }

  try {
    const customData = transactionData.customData || {}
    const { userId, planId: newPlan, interval = 'monthly', seats = '1', firmName } = customData
    
    if (!userId) {
      webhookLogger.warn('Transaction completed without userId in customData')
      await session.abortTransaction()
      session.endSession()
      return
    }

    const user = await User.findById(userId).session(isTransactional ? session : null)
    if (!user) {
      webhookLogger.error({ userId }, 'User not found for transaction')
      await session.abortTransaction()
      session.endSession()
      return
    }

    const validPlans = Object.values(UserPlan)
    const plan = validPlans.includes(newPlan as UserPlan) ? (newPlan as UserPlan) : user.plan

    let organizationId = user.organizationId
    let orgFirmCode: string | undefined = undefined
    const requestedSeats = parseInt(seats, 10) || 1

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
    if (interval === 'annual') {
        nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
    } else {
        nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    }
    user.currentPeriodEnd = nextPeriod;

    if (plan === UserPlan.ENTERPRISE && !user.organizationId) {
        const firmCode = `ENT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
        orgFirmCode = firmCode;

        const org = await Organization.create([{
            name: firmName || user.lawFirm || 'My Premium Firm',
            adminId: userId,
            totalSeats: requestedSeats,
            usedSeats: 1,
            firmCode,
            isActive: true,
            currentPeriodEnd: nextPeriod
        }], isTransactional ? { session } : {})

        organizationId = org[0]._id
        user.role = UserRole.ORG_ADMIN
        user.isOrgAdmin = true
        user.organizationId = organizationId
     } else if (plan === UserPlan.ENTERPRISE && user.organizationId) {
        await Organization.findByIdAndUpdate(
            user.organizationId,
            { $inc: { totalSeats: requestedSeats }, isActive: true, currentPeriodEnd: nextPeriod },
            { session: isTransactional ? session : undefined }
        )
        await User.updateMany(
            { organizationId: user.organizationId },
            { $set: { plan: UserPlan.ENTERPRISE, planLimit: (config.planLimits as any)[plan]?.maxCases || 0, currentPeriodEnd: nextPeriod, expiredPremium: false } },
            { session: isTransactional ? session : undefined }
        )
     }
    
    const casesToCarryOverCount = await Case.countDocuments({
        userId,
        $or: [
            { status: CaseStatus.ACTIVE },
            { lastActivationPeriodStart: { $gte: oldPeriodStart } }
        ]
    });
    
    user.currentCases = casesToCarryOverCount;
    if (casesToCarryOverCount > 0) {
        await Case.updateMany(
            {
                userId,
                $or: [
                    { status: CaseStatus.ACTIVE },
                    { lastActivationPeriodStart: { $gte: oldPeriodStart } }
                ]
            },
            { $set: { lastActivationPeriodStart: user.currentPeriodStart } }
        );
    }
    
    user.totalTokensConsumed = 0;
    await user.save(isTransactional ? { session } : {})

    console.log('\n[PADDLE WEBHOOK] raw total received:', transactionData.details?.totals?.total, '| type:', typeof transactionData.details?.totals?.total, '\n');
    const transactionAmount = parseFloat(transactionData.details?.totals?.total || '0') / 100

    await Transaction.create([{
        userId,
        amount: transactionAmount,
        plan: plan,
        status: 'succeeded',
        paymentMethod: 'Paddle Billing',
        date: new Date()
    }], isTransactional ? { session } : {})

    if (isTransactional) {
        await session.commitTransaction()
    }
    webhookLogger.info({ userId, plan }, 'Successfully fulfilled Paddle transaction')
  } catch (error) {
    if (isTransactional) {
        await session.abortTransaction()
    }
    webhookLogger.error({ err: error }, 'Failed to process transaction.completed event')
    throw error
  } finally {
    session.endSession()
  }
}
