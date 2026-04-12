import cron from 'node-cron'
import { User, Case, Organization } from '../models'
import { UserPlan, CaseStatus, NotificationType, NotificationPriority } from '../types'
import { createNotification } from '../utils/notification'
import logger from '../utils/logger'

const jobLogger = logger.child({ module: 'expiration-job' })

export const startExpirationJob = () => {
  cron.schedule('0 * * * *', async () => {
    jobLogger.info('Starting subscription and trial expiration check job')
    try {
      const now = new Date()

      const expiredTrials = await User.find({
        plan: UserPlan.TRIAL,
        trialStartedAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      })

      for (const user of expiredTrials) {
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
        
        jobLogger.info(`Trial expired for user ${user._id}`)
      }

      const expiredOrgs = await Organization.find({
        isActive: true,
        currentPeriodEnd: { $lt: now }
      })

      for (const org of expiredOrgs) {
        org.isActive = false
        await org.save()

        await User.updateMany(
          { organizationId: org._id },
          { $set: { plan: UserPlan.NONE, currentCases: 0, expiredPremium: true } }
        )

        await Case.updateMany(
          { organizationId: org._id, status: CaseStatus.ACTIVE },
          { $set: { status: CaseStatus.CLOSED } }
        )

        const admins = await User.find({ organizationId: org._id, isOrgAdmin: true })
        const employeesCount = await User.countDocuments({ organizationId: org._id, _id: { $nin: admins.map(a => a._id) } })
        
        for (const admin of admins) {
          createNotification({
            userId: admin._id,
            title: 'Enterprise Subscription Expired',
            message: `Your Enterprise plan has expired. All ${employeesCount} team members have been deactivated. Renew to restore access.`,
            type: NotificationType.BILLING,
            priority: NotificationPriority.HIGH,
            link: '/settings?tab=billing'
          }).catch(() => {})
        }

        jobLogger.info(`Organization ${org._id} subscription expired`)
      }

      const usersInInactiveOrgs = await User.find({
        organizationId: { $ne: null },
        plan: { $ne: UserPlan.NONE }
      })

      for (const user of usersInInactiveOrgs) {
        const org = await Organization.findById(user.organizationId)
        if (org && !org.isActive) {
          user.plan = UserPlan.NONE
          user.currentCases = 0
          user.expiredPremium = true
          await user.save()

          await Case.updateMany(
            { userId: user._id, status: CaseStatus.ACTIVE },
            { $set: { status: CaseStatus.CLOSED } }
          )
          jobLogger.info(`User ${user._id} downgraded due to inactive organization`)
        }
      }

      const expiredIndividuals = await User.find({
        plan: { $nin: [UserPlan.NONE, UserPlan.TRIAL] },
        organizationId: null,
        currentPeriodEnd: { $lt: now }
      })

      for (const user of expiredIndividuals) {
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
        
        jobLogger.info(`Individual plan expired for user ${user._id}`)
      }

    } catch (error) {
      jobLogger.error({ err: error }, 'Error running expiration job')
    }
  })
}
