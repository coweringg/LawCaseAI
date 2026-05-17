import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { IApiResponse, IAuthRequest, UserPlan } from '../types';

export const planRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: (req: Request) => {
        const authReq = req as IAuthRequest;
        const user = authReq.user;

        if (!user) return 2000;

        switch (user.plan) {
            case UserPlan.ENTERPRISE:
            case UserPlan.ELITE:
            case UserPlan.PROFESSIONAL:
                return 10000;
            case UserPlan.BASIC:
                return 5000;
            default:
                return 2000;
        }
    },
    message: {
        success: false,
        message: 'Rate limit exceeded for your current plan. Please upgrade or wait a few minutes.'
    } as IApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const authReq = req as IAuthRequest;
        return authReq.user?._id?.toString() || req.ip || 'unknown';
    }
});
