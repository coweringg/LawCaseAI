import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, Case } from '../models'
import { IAuthRequest, IJWTPayload, UserRole, UserStatus, UserPlan, CaseStatus } from '../types'
import config from '../config'
import logger from '../utils/logger'

const authLogger = logger.child({ module: 'auth' })

export const authenticate = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    const cookieToken = req.cookies?.auth_token;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      authLogger.warn(
        { method: req.method, url: req.url, hasHeader: !!authHeader, hasCookie: !!cookieToken },
        'No token provided'
      )
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload

    const user = await User.findById(decoded.userId)

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
      return
    }

    if (user.status !== UserStatus.ACTIVE) {
      res.status(401).json({
        success: false,
        message: 'Account is not active.'
      })
      return
    }

    if (user.plan === UserPlan.TRIAL && user.trialStartedAt) {
      const trialEnd = new Date(user.trialStartedAt.getTime() + 24 * 60 * 60 * 1000)
      if (new Date() > trialEnd) {
        user.plan = UserPlan.NONE
        user.currentCases = 0
        await user.save()

        await Case.updateMany(
          { userId: user._id, status: CaseStatus.ACTIVE },
          { $set: { status: CaseStatus.CLOSED } }
        )
      }
    }

    if (user.plan !== UserPlan.NONE && user.plan !== UserPlan.TRIAL && user.currentPeriodEnd && user.currentPeriodEnd < new Date()) {
      user.plan = UserPlan.NONE
      user.currentCases = 0
      await user.save()
      
      await Case.updateMany(
        { userId: user._id, status: CaseStatus.ACTIVE },
        { $set: { status: CaseStatus.CLOSED } }
      )
    }

    if (decoded.version !== undefined && decoded.version !== user.tokenVersion) {
      res.status(401).json({
        success: false,
        message: 'Session invalidated. Please log in again.'
      })
      return
    }

    if (!req.url.includes('/confirm-purchase')) {
      User.findByIdAndUpdate(user._id, { lastActivity: new Date() }).exec().catch(err =>
        authLogger.error({ err, userId: user._id }, 'Failed to update lastActivity')
      )
    }

    const configLimit = (config.planLimits as any)[user.plan]?.maxCases
    if (configLimit !== undefined && user.planLimit !== configLimit) {
      user.planLimit = configLimit
      User.findByIdAndUpdate(user._id, { planLimit: configLimit }).exec().catch(err =>
        authLogger.error({ err, userId: user._id }, 'Failed to sync planLimit')
      )
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
      return
    }

    next()
  }
}

export const checkPlanLimit = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied.'
      })
      return
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found.'
      })
      return
    }

    if (user.isAtPlanLimit) {
      res.status(403).json({
        success: false,
        message: `Plan limit reached for ${user.plan} plan. Please upgrade your plan or wait for the next billing cycle.`,
        data: {
          plan: user.plan,
          usage: user.planUsagePercentage
        }
      })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while checking plan limit.'
    })
  }
}

export const optionalAuth = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.auth_token

    if (!token) {
      next()
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
    const user = await User.findById(decoded.userId)

    if (user && user.status === UserStatus.ACTIVE) {
      req.user = user
    }

    next()
  } catch (error) {
    next()
  }
}
