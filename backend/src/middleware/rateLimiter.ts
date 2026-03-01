import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { IAuthRequest, UserPlan } from '../types';
import { IApiResponse } from '../types';

/**
 * Plan-aware rate limiting middleware
 * Applies different limits based on the user's subscription tier.
 */
export const planRateLimiter = rateLimit({
    windowMs: 8 * 60 * 1000, // 8 minutes
    limit: (req: Request) => {
        const authReq = req as IAuthRequest;
        const user = authReq.user;

        if (!user) return 200; // Anonymous or unauthenticated users

        switch (user.plan) {
            case UserPlan.ENTERPRISE:
            case UserPlan.ELITE:
            case UserPlan.PROFESSIONAL:
                return 5000;
            case UserPlan.BASIC:
                return 1000;
            default:
                return 500;
        }
    },
    message: {
        success: false,
        message: 'Rate limit exceeded for your current plan. Please upgrade or wait a few minutes.'
    } as IApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    // Use the user ID or IP as the key
    keyGenerator: (req: Request) => {
        const authReq = req as IAuthRequest;
        return authReq.user?._id?.toString() || req.ip || 'unknown';
    }
});
