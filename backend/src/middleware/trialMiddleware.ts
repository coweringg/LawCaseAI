import { Response, NextFunction } from 'express'
import { IAuthRequest, UserPlan, IApiResponse, CaseStatus } from '../types'
import { Case } from '../models'
import logger from '../utils/logger'

const trialLogger = logger.child({ module: 'trial-middleware' })

export const checkTrialStatus = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      return next()
    }

    if (user.plan !== UserPlan.TRIAL) {
      return next()
    }

    if (user.trialStartedAt) {
      const now = new Date()
      const startTime = new Date(user.trialStartedAt)
      const diffInHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      if (diffInHours >= 24) {
        res.status(403).json({
          success: false,
          message: 'Your 24-hour evaluation has expired. Please subscribe to a premium plan to unlock your cases and continue using LawCaseAI.',
          error: 'TRIAL_EXPIRED',
          data: {
            startedAt: user.trialStartedAt,
            expiredAt: new Date(startTime.getTime() + 24 * 60 * 60 * 1000)
          }
        } as IApiResponse)
        return
      }
    }

    const caseId = req.params.caseId || req.body.caseId
    if (caseId && user.trialCaseId && caseId !== user.trialCaseId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Your free trial is restricted to your initial evaluation case. Please upgrade to access other workspaces.',
        error: 'TRIAL_RESTRICTION'
      } as IApiResponse)
      return
    }

    next()
  } catch (error) {
    trialLogger.error({ err: error, userId: req.user?._id }, 'Error checking trial status')
    next()
  }
}

export const enforceTrialChatLock = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user
    const caseId = req.params.caseId || req.body.caseId

    if (!user || !caseId) return next()

    const lawyerCase = await Case.findById(caseId)
    if (!lawyerCase) return next()

    if (lawyerCase.isTrialCase && user.plan === UserPlan.NONE) {
        res.status(403).json({
            success: false,
            message: 'This evaluation case is locked. Subscribe to a premium plan to reactivate it and recover your data.',
            error: 'TRIAL_LOCKED'
        } as IApiResponse)
        return
    }

    next()
  } catch (error) {
    next()
  }
}
