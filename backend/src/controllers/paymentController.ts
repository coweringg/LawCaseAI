import { Request, Response } from 'express'
import { User } from '../models'
import { IApiResponse, UserPlan } from '../types'

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.body
        const userId = (req as any).user?.userId

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        // Mocking a successful checkout session creation
        // In a real app, this would call Stripe
        res.status(200).json({
            success: true,
            message: 'Checkout session created',
            data: {
                sessionId: 'mock_session_' + Math.random().toString(36).substr(2, 9),
                url: `/checkout?plan=${planId}&session=mock`
            }
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}

export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.body
        const userId = (req as any).user?.userId

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const validPlans: UserPlan[] = [UserPlan.BASIC, UserPlan.PROFESSIONAL, UserPlan.ENTERPRISE]
        if (!validPlans.includes(planId as UserPlan)) {
            res.status(400).json({ success: false, message: 'Invalid plan selected' } as IApiResponse)
            return
        }

        // Update user plan in DB
        const user = await User.findByIdAndUpdate(
            userId,
            { plan: planId },
            { new: true }
        )

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
            return
        }

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
        const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}
