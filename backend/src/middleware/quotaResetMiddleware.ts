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

    // If no period end is set, or the period hasn't ended yet, continue normally
    if (!currentPeriodEnd || new Date() <= new Date(currentPeriodEnd)) {
      return next()
    }

    // Billing cycle has ended! We need to reset quotas and set the new cycle
    middlewareLogger.info({ userId: _id }, 'Billing cycle expired. Resetting quotas.')

    // 1. Calculate the next period end based on the interval
    const now = new Date()
    const nextPeriod = new Date(now)
    if (billingInterval === 'annual') {
      nextPeriod.setFullYear(nextPeriod.getFullYear() + 1)
    } else {
      nextPeriod.setMonth(nextPeriod.getMonth() + 1)
    }

    // 2. Deactivate all currently active cases
    // This forces the user to choose which cases to 'reactivate' under the new cycle's limits
    await Case.updateMany(
      { userId: _id, status: CaseStatus.ACTIVE },
      { $set: { status: CaseStatus.CLOSED } }
    )

    // 3. Update the user record with fresh quotas and new dates
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
      // Update the request object so downstream handlers see the fresh quotas
      req.user = updatedUser
    }

    next()
  } catch (error) {
    middlewareLogger.error({ err: error }, 'Error in checkAndResetQuotas middleware')
    // Continue even on error so we don't block requests, log it heavily
    next()
  }
}
