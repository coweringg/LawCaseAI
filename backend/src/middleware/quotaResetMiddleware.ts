import { Response, NextFunction } from 'express'
import { IAuthRequest, CaseStatus } from '../types'
import { User, Case } from '../models'
import logger from '../utils/logger'

const middlewareLogger = logger.child({ module: 'quota-reset-middleware' })

export const checkAndResetQuotas = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      return next()
    }

    const { currentPeriodEnd, _id, billingInterval } = req.user

    if (!currentPeriodEnd || new Date() <= new Date(currentPeriodEnd)) {
      return next()
    }

    middlewareLogger.info({ userId: _id }, 'Billing cycle expired. Resetting quotas.')

    const now = new Date()
    const nextPeriod = new Date(now)
    if (billingInterval === 'annual') {
      nextPeriod.setFullYear(nextPeriod.getFullYear() + 1)
    } else {
      nextPeriod.setMonth(nextPeriod.getMonth() + 1)
    }

    await Case.updateMany(
      { userId: _id, status: CaseStatus.ACTIVE },
      { $set: { status: CaseStatus.CLOSED } }
    )

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: {
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriod,
          totalTokensConsumed: 0,
          currentCases: 0
        }
      },
      { new: true }
    )

    if (updatedUser) {
      req.user = updatedUser
    }

    next()
  } catch (error) {
    middlewareLogger.error({ err: error }, 'Error in checkAndResetQuotas middleware')
    next()
  }
}
