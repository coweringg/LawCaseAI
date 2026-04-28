import { Response } from 'express'
import { User, Transaction, Organization, Case, Event } from '../models'
import { IApiResponse, IAuthRequest, UserPlan, UserRole, CaseStatus, EventStatus } from '../types'
import { logAction } from '../utils/auditLogger'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { getPaddleInstance } from '../utils/paddle'
import config from '../config'

const getPaddlePriceId = (plan: UserPlan, interval: 'monthly' | 'annual'): string => {
    return config.paddle.prices[interval][plan as 'basic' | 'professional' | 'elite' | 'enterprise'] || ''
}

export const getTransactionHistory = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const transactions = await Transaction.find({ userId }).sort({ date: -1 })
    res.status(200).json({ success: true, message: 'Transaction history retrieved', data: transactions })
})

export const createCheckoutSession = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { planId, interval = 'monthly', seats = 1, firmName = '' } = req.body
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    if (!planId || !Object.values(UserPlan).includes(planId as UserPlan)) {
        throw new AppError('The selected subscription plan is invalid.', 400)
    }

    const user = await User.findById(userId)
    if (user?.organizationId && !user?.isOrgAdmin) {
        throw new AppError('Your account is managed by your organization administrator.', 403)
    }

    const isPersonalPlan = [UserPlan.BASIC, UserPlan.PROFESSIONAL, UserPlan.ELITE].includes(planId as UserPlan);
    if (isPersonalPlan && (user?.isOrgAdmin || user?.organizationId)) {
        throw new AppError('Enterprise accounts cannot transition to personal plans directly. Please use a separate account.', 403)
    }

    const isExpansion = planId === UserPlan.ENTERPRISE && !!user?.organizationId && !!user?.isOrgAdmin;
    const seatCount = Math.max(1, parseInt(seats as string) || 1);

    if (planId === UserPlan.ENTERPRISE && !isExpansion && seatCount < 5) {
        throw new AppError('Enterprise plans require a minimum of 5 seats.', 400)
    }

    const priceId = getPaddlePriceId(planId as UserPlan, interval as 'monthly' | 'annual')
    const paddle = getPaddleInstance()

    const transaction = await paddle.transactions.create({
        items: [{
            priceId,
            quantity: planId === UserPlan.ENTERPRISE ? seatCount : 1
        }],
        customData: {
            userId: userId.toString(),
            planId: planId as string,
            interval: interval as string,
            seats: seatCount.toString(),
            firmName: firmName as string,
            isExpansion: isExpansion ? 'true' : 'false'
        }
    })

    res.status(200).json({
        success: true,
        message: 'Checkout session created',
        data: { transactionId: transaction.id, note: 'Secure payment session initialized' }
    })
})

export const getOrganizationDetails = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) throw new AppError('Unauthorized', 401)

    const user = await User.findById(userId)
    if (!user || !user.organizationId) {
        res.status(200).json({ success: true, data: null })
        return
    }

    const org = await Organization.findById(user.organizationId)
    if (!org) throw new AppError('Organization not found', 404)

    res.status(200).json({
        success: true,
        data: { 
            id: org._id, 
            name: org.name, 
            firmCode: org.firmCode, 
            totalSeats: org.totalSeats, 
            usedSeats: org.usedSeats, 
            isActive: org.isActive, 
            isOrgAdmin: user.isOrgAdmin,
            willCancelAtPeriodEnd: org.willCancelAtPeriodEnd || false,
            status: org.isActive ? 'active' : 'canceled',
            currentPeriodEnd: org.currentPeriodEnd
        }
    })

    if (org.willCancelAtPeriodEnd && !org.currentPeriodEnd && org.paddleSubscriptionId) {
        (async () => {
            try {
                const paddle = getPaddleInstance();
                const sub = await paddle.subscriptions.get(org.paddleSubscriptionId as string);
                const isScheduledCancel = sub.scheduledChange?.action === 'cancel';
                
                if (isScheduledCancel || sub.status === 'canceled') {
                    const endDate = sub.nextBilledAt || sub.currentBillingPeriod?.endsAt;
                    await Organization.findByIdAndUpdate(org._id, { 
                        willCancelAtPeriodEnd: true,
                        currentPeriodEnd: endDate ? new Date(endDate) : org.currentPeriodEnd
                    });
                }
            } catch (e) {
                console.error('[Auto-Repair Org] Failed:', e);
            }
        })();
    }
})

export const removeMember = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { memberId } = req.params
    const adminId = req.user?._id
    if (!adminId) throw new AppError('Unauthorized', 401)

    const admin = await User.findById(adminId)
    if (!admin || !admin.isOrgAdmin || !admin.organizationId) {
        throw new AppError('Unauthorized action', 403)
    }

    const member = await User.findById(memberId)
    if (!member || member.organizationId?.toString() !== admin.organizationId.toString()) {
        throw new AppError('Member not found in organization', 404)
    }

    if (member._id.toString() === adminId.toString()) {
        throw new AppError('You cannot remove yourself.', 400)
    }

    const org = await Organization.findOneAndUpdate(
        { _id: admin.organizationId, usedSeats: { $gt: 0 } },
        { $inc: { usedSeats: -1 } },
        { new: true }
    )
    if (!org) throw new AppError('Could not update seats', 400)

    await Promise.all([
        Case.updateMany({ userId: member._id, status: CaseStatus.ACTIVE }, { $set: { status: CaseStatus.CLOSED, closedAt: new Date() } }),
        Event.updateMany({ userId: member._id, status: EventStatus.ACTIVE }, { $set: { status: EventStatus.CLOSED } })
    ]);

    member.organizationId = undefined
    member.plan = UserPlan.NONE
    member.role = UserRole.LAWYER
    member.isOrgAdmin = false
    member.currentCases = 0 
    await member.save()

    res.status(200).json({ success: true, message: 'Member removed successfully', data: { usedSeats: org.usedSeats } })
})

export const getOrganizationMembers = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const adminId = req.user?._id
    if (!adminId) throw new AppError('Unauthorized', 401)

    const admin = await User.findById(adminId)
    if (!admin || !admin.organizationId) throw new AppError('Organization not found', 404)

    const members = await User.find({ organizationId: admin.organizationId }).select('name email role plan')
    res.status(200).json({ success: true, data: members })
})

export const cancelSubscription = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    let paddleSubscriptionId = user.paddleSubscriptionId;

    if (user.isOrgAdmin && user.organizationId) {
        const org = await Organization.findById(user.organizationId);
        if (org && org.paddleSubscriptionId) {
            paddleSubscriptionId = org.paddleSubscriptionId;
            org.willCancelAtPeriodEnd = true;
            await org.save();
        }
    } else {
        user.willCancelAtPeriodEnd = true;
        await user.save();
    }

    let subscriptionId = paddleSubscriptionId;

    if (!subscriptionId) {
        console.log('[Cancel] No ID found in DB, searching Paddle for email:', user.email);
        try {
            const paddle = getPaddleInstance();
            const customerCollection = paddle.customers.list({ email: [user.email] });
            const customers = await customerCollection.next();
            
            console.log('[Cancel] Paddle customer search returned:', customers?.length || 0, 'customers');
            
            if (customers && customers.length > 0) {
                const customer = customers[0];
                console.log('[Cancel] Found customer:', customer.id, 'searching for subscriptions...');
                const subCollection = paddle.subscriptions.list({ 
                    customerId: [customer.id], 
                    status: ['active', 'past_due', 'trialing'] 
                });
                const subs = await subCollection.next();
                
                console.log('[Cancel] Paddle subscription search returned:', subs?.length || 0, 'subscriptions');
                
                if (subs && subs.length > 0) {
                    const sub = subs[0];
                    subscriptionId = sub.id;
                    console.log('[Cancel] Auto-synced subscription ID:', subscriptionId);
                    
                    user.paddleSubscriptionId = subscriptionId;
                    await user.save();
                    
                    const orgId = user.organizationId;
                    if (orgId) {
                        await Organization.findByIdAndUpdate(orgId, { paddleSubscriptionId: subscriptionId });
                    }
                }
            }
        } catch (syncError: any) {
            console.error('[Cancel] Auto-sync encountered an error:', syncError.message);
        }
    }

    if (!subscriptionId) {
        throw new AppError('No active Paddle subscription found. If you just subscribed, please wait a moment or refresh. If the problem persists, please re-subscribe.', 400);
    }

    try {
        const paddle = getPaddleInstance();
        const updatedSub = await paddle.subscriptions.cancel(subscriptionId, {
            effectiveFrom: 'next_billing_period'
        });

        const nextBillDate = updatedSub.nextBilledAt ? new Date(updatedSub.nextBilledAt) : undefined;
        
        if (user.isOrgAdmin && user.organizationId) {
            await Organization.findByIdAndUpdate(user.organizationId, { 
                willCancelAtPeriodEnd: true,
                currentPeriodEnd: nextBillDate,
                canceledAt: new Date()
            });
        } else {
            user.willCancelAtPeriodEnd = true;
            user.currentPeriodEnd = nextBillDate;
            (user as any).canceledAt = new Date();
            await user.save();
        }

    } catch (error: any) {
        if (error.message.includes('scheduled_change') || error.message.includes('pending scheduled changes')) {
            try {
                const paddle = getPaddleInstance();
                const sub = await paddle.subscriptions.get(subscriptionId);
                const nextBillDate = sub.nextBilledAt ? new Date(sub.nextBilledAt) : undefined;
                
                if (user.isOrgAdmin && user.organizationId) {
                    await Organization.findByIdAndUpdate(user.organizationId, { 
                        willCancelAtPeriodEnd: true,
                        currentPeriodEnd: nextBillDate,
                        canceledAt: new Date()
                    });
                } else {
                    user.willCancelAtPeriodEnd = true;
                    user.currentPeriodEnd = nextBillDate;
                    (user as any).canceledAt = new Date();
                    await user.save();
                }
                
                res.status(200).json({
                    success: true,
                    message: 'Subscription sync successful. Cancellation is already pending.'
                });
                return;
            } catch (syncError) {
                console.error('[Cancel Sync] Failed:', syncError);
            }
        }
        
        console.error('[Cancel] Paddle API Error:', error.message);
        throw new AppError(`Failed to cancel subscription: ${error.message}`, 400);
    }

    res.status(200).json({
        success: true,
        message: 'Subscription will be canceled at the end of the current billing period.'
    });
});

export const downgradeSeats = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);
    const { seatsToRemove } = req.body;

    if (!user || !user.isOrgAdmin || !user.organizationId) {
        throw new AppError('Only organization admins can downgrade seats', 403);
    }

    if (!seatsToRemove || typeof seatsToRemove !== 'number' || seatsToRemove <= 0) {
        throw new AppError('Invalid number of seats to remove.', 400);
    }

    const org = await Organization.findById(user.organizationId);
    if (!org) throw new AppError('Organization not found', 404);

    let subscriptionId = org.paddleSubscriptionId || user.paddleSubscriptionId;
    console.log('[Downgrade] subscriptionId:', subscriptionId, 'orgId:', org.paddleSubscriptionId, 'userId:', user.paddleSubscriptionId);
    
    if (!subscriptionId) {
        console.log('[Downgrade] No ID found in DB, searching Paddle for email:', user.email);
        try {
            const paddle = getPaddleInstance();
            const customerCollection = paddle.customers.list({ email: [user.email] });
            const customers = await customerCollection.next();
            
            console.log('[Downgrade] Paddle customer search returned:', customers?.length || 0, 'customers');
            
            if (customers && customers.length > 0) {
                const customer = customers[0];
                console.log('[Downgrade] Found customer:', customer.id, 'searching for subscriptions...');
                const subCollection = paddle.subscriptions.list({ 
                    customerId: [customer.id], 
                    status: ['active', 'past_due', 'trialing'] 
                });
                const subs = await subCollection.next();
                
                console.log('[Downgrade] Paddle subscription search returned:', subs?.length || 0, 'subscriptions');
                
                if (subs && subs.length > 0) {
                    const sub = subs[0];
                    subscriptionId = sub.id;
                    console.log('[Downgrade] Auto-synced subscription ID:', subscriptionId);
                    
                    user.paddleSubscriptionId = subscriptionId;
                    await user.save();
                    
                    org.paddleSubscriptionId = subscriptionId;
                    await org.save();
                }
            }
        } catch (syncError: any) {
            console.error('[Downgrade] Auto-sync encountered an error:', syncError.message);
        }
    }

    if (!subscriptionId) {
        throw new AppError('No active Paddle subscription found. If you just subscribed, please wait a moment or refresh. If the problem persists, please re-subscribe.', 400);
    }

    const unusedSeats = org.totalSeats - org.usedSeats;
    console.log('[Downgrade] total:', org.totalSeats, 'used:', org.usedSeats, 'unused:', unusedSeats, 'requested:', seatsToRemove);
    if (seatsToRemove > unusedSeats) {
        throw new AppError(`Cannot remove more seats than are currently unused (${unusedSeats}).`, 400);
    }

    const newTotalSeats = org.totalSeats - seatsToRemove;
    if (newTotalSeats < 1) {
       throw new AppError('Must have at least 1 seat.', 400);
    }

    try {
        const paddle = getPaddleInstance();
        const subscription = await paddle.subscriptions.get(subscriptionId);
        if (!subscription.items || subscription.items.length === 0) {
            throw new AppError('Could not fetch subscription items from Paddle.', 400);
        }
        const mainItem = subscription.items[0];
        const priceId = mainItem.price?.id;

        if (!priceId) {
            throw new AppError('Could not identify price ID for the subscription.', 400);
        }

        console.log('[Downgrade] Updating Paddle subscription', subscriptionId, 'priceId:', priceId, 'to quantity', newTotalSeats);
        await paddle.subscriptions.update(subscriptionId, {
            items: [
                {
                    priceId: priceId,
                    quantity: newTotalSeats
                }
            ],
            prorationBillingMode: 'prorated_next_billing_period'
        });
    } catch (paddleError: any) {
        console.error('[Downgrade] Paddle API Error:', paddleError.message, paddleError.response?.data);
        throw new AppError(`Paddle Error: ${paddleError.message}`, 400);
    }

    org.totalSeats = newTotalSeats;
    await org.save();

    res.status(200).json({
        success: true,
        message: `Successfully removed ${seatsToRemove} unused seats. Your next bill will reflect ${newTotalSeats} seats.`,
        data: { totalSeats: newTotalSeats }
    });
});
