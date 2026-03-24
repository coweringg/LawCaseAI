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
        user.expiredTrial = true
        await user.save()

        await Case.updateMany(
          { userId: user._id, status: CaseStatus.ACTIVE },
          { $set: { status: CaseStatus.CLOSED } }
        )

        createNotification({
          userId: user._id,
          title: 'Free Trial Ended',
          message: 'Your 24-hour free evaluation has ended. Purchase a plan to continue.',
          type: NotificationType.BILLING,
          priority: NotificationPriority.HIGH,
          link: '/settings?tab=billing'
        }).catch(() => {})
      }
    }

    if (user.organizationId) {
      const org = await Organization.findById(user.organizationId)
      if (org) {
        const now = new Date()
        const isOrgExpired = org.currentPeriodEnd && org.currentPeriodEnd < now
        
        if (isOrgExpired && org.isActive) {
          org.isActive = false
          await org.save()
          
          await User.updateMany(
            { organizationId: user.organizationId },
            { $set: { plan: UserPlan.NONE, currentCases: 0, expiredPremium: true } }
          )
          
          await Case.updateMany(
            { organizationId: user.organizationId, status: CaseStatus.ACTIVE },
            { $set: { status: CaseStatus.CLOSED } }
          )

          if (user.isOrgAdmin) {
            const employees = await User.find({ organizationId: user.organizationId, _id: { $ne: user._id } }).select('_id')
            createNotification({
              userId: user._id,
              title: 'Enterprise Subscription Expired',
              message: `Your Enterprise plan has expired. All ${employees.length} team members have been deactivated. Renew to restore access.`,
              type: NotificationType.BILLING,
              priority: NotificationPriority.HIGH,
              link: '/settings?tab=billing'
            }).catch(() => {})
          }
        }

        if (!org.isActive && user.plan !== UserPlan.NONE) {
          user.plan = UserPlan.NONE
          user.currentCases = 0
          user.expiredPremium = true
          await user.save()
          await Case.updateMany(
            { userId: user._id, status: CaseStatus.ACTIVE },
            { $set: { status: CaseStatus.CLOSED } }
          )
        }
      }
    } 
    else if (user.plan !== UserPlan.NONE && user.plan !== UserPlan.TRIAL && user.currentPeriodEnd && user.currentPeriodEnd < new Date()) {
      const expiredPlan = user.plan
      user.plan = UserPlan.NONE
      user.currentCases = 0
      user.expiredPremium = true
      await user.save()
      
      await Case.updateMany(
        { userId: user._id, status: CaseStatus.ACTIVE },
        { $set: { status: CaseStatus.CLOSED } }
      )

      createNotification({
        userId: user._id,
        title: 'Subscription Expired',
        message: `Your ${expiredPlan} plan has expired. Renew to restore access.`,
        type: NotificationType.BILLING,
        priority: NotificationPriority.HIGH,
        link: '/settings?tab=billing'
      }).catch(() => {})
    }

    if (decoded.version !== undefined && decoded.version !== user.tokenVersion) {
      res.status(401).json({ success: false, message: 'Session invalidated.' })
      return
    }

    if (!req.url.includes('/confirm-purchase')) {
      User.findByIdAndUpdate(user._id, { lastActivity: new Date() }).exec().catch(() => {})
    }

    const configLimit = (config.planLimits as any)[user.plan]?.maxCases
    if (configLimit !== undefined && user.planLimit !== configLimit) {
      user.planLimit = configLimit
      User.findByIdAndUpdate(user._id, { planLimit: configLimit }).exec().catch(() => {})
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
    const user = await User.findById(req.user._id)
    if (user?.isAtPlanLimit) {
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
