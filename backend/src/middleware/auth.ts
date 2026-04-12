import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, Case, Organization } from '../models'
import { IAuthRequest, IJWTPayload, UserRole, UserStatus, UserPlan, CaseStatus, NotificationType, NotificationPriority } from '../types'
import config from '../config'
import logger from '../utils/logger'
import { createNotification } from '../utils/notification'

const authLogger = logger.child({ module: 'auth' })

export const authenticate = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    const cookieToken = req.cookies?.auth_token;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
    const user = await User.findById(decoded.userId)

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid token. User not found.' })
      return
    }

    if (user.status !== UserStatus.ACTIVE) {
      res.status(401).json({ success: false, message: 'Account is not active.' })
      return
    }

    if (decoded.version !== undefined && decoded.version !== user.tokenVersion) {
      res.status(401).json({ success: false, message: 'Session invalidated.' })
      return
    }

    const updates: any = {}
    
    if (!req.url.includes('/confirm-purchase')) {
      updates.lastActivity = new Date()
    }

    const configLimit = (config.planLimits as any)[user.plan]?.maxCases
    if (configLimit !== undefined && user.planLimit !== configLimit) {
      user.planLimit = configLimit
      updates.planLimit = configLimit
    }

    if (Object.keys(updates).length > 0) {
      User.updateOne({ _id: user._id }, { $set: updates }).exec().catch(() => {})
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied.' })
      return
    }
    next()
  }
}

export const checkPlanLimit = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Access denied.' })
      return
    }
    
    if (req.user.isAtPlanLimit) {
      res.status(403).json({ success: false, message: 'Plan limit reached.' })
      return
    }
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checkPlanLimit.' })
  }
}

export const optionalAuth = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.auth_token
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
      const user = await User.findById(decoded.userId)
      if (user && user.status === UserStatus.ACTIVE) {
        req.user = user
      }
    }
    next()
  } catch (error) {
    next()
  }
}
