import { Response } from 'express'
import { User, Transaction } from '../models'
import { IApiResponse, IAuthRequest, UserPlan } from '../types'
// Plan pricing lookup
const PLAN_PRICES: Record<string, number> = {
  [UserPlan.BASIC]: 0,
  [UserPlan.PROFESSIONAL]: 149,
  [UserPlan.ENTERPRISE]: 499
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
            res.status(400).json({ success: false, message: 'Invalid plan selected' } as IApiResponse)
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
            res.status(400).json({ success: false, message: 'Invalid plan selected' } as IApiResponse)
            return
        }

        // Use .save() instead of findByIdAndUpdate to trigger pre('save') hook
        // which automatically updates planLimit based on plan
        const user = await User.findById(userId)

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

        user.plan = planId as UserPlan
        await user.save() // Triggers pre('save') → updates planLimit correctly

        // Record the transaction
        await Transaction.create({
            userId,
            amount: PLAN_PRICES[planId] || 0,
            plan: planId as UserPlan,
            status: 'succeeded',
            date: new Date()
        })

        res.status(200).json({
            success: true,
            message: `Plan upgraded to ${planId} successfully`,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    planLimit: user.planLimit
                }
            }
        } as IApiResponse)
    } catch (error: unknown) {
        console.error('[PaymentController] confirmPayment error:', error)
        res.status(500).json({ success: false, message: 'Payment confirmation failed' } as IApiResponse)
    }
}
