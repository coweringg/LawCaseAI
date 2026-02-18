import { Request, Response } from 'express'
import { User, Transaction } from '../models'
import { IApiResponse, UserPlan } from '../types'

export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        let transactions = await Transaction.find({ userId }).sort({ date: -1 })

        // Seed mock data if none exists for demo purposes
        if (transactions.length === 0) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            await Transaction.create([
                {
                    userId,
                    amount: 149,
                    plan: UserPlan.PROFESSIONAL,
                    status: 'succeeded',
                    date: yesterday,
                    invoiceUrl: '#'
                },
                {
                    userId,
                    amount: 0,
                    plan: UserPlan.BASIC,
                    status: 'succeeded',
                    date: new Date(yesterday.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                    invoiceUrl: '#'
                }
            ])
            transactions = await Transaction.find({ userId }).sort({ date: -1 })
        }

        res.status(200).json({
            success: true,
            message: 'Transaction history retrieved',
            data: transactions
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve history'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.body
        const userId = (req as any).user?._id

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
        const userId = (req as any).user?._id

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

        // Record the transaction
        await Transaction.create({
            userId,
            amount: planId === UserPlan.BASIC ? 0 : 149,
            plan: planId as UserPlan,
            status: 'succeeded',
            date: new Date(),
            invoiceUrl: '#'
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
        const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}
