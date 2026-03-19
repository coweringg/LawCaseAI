import { Response } from 'express'
import { Case, User, CaseFile, ChatMessage, Event } from '../models'
import { IApiResponse, CaseStatus, IAuthRequest, UserPlan, EventPriority, NotificationType, NotificationPriority } from '../types'
import { logAction } from '../utils/auditLogger'
import { createNotification } from '../utils/notification'
import { deleteFromStorage } from '../utils/fileUpload'
import logger from '../utils/logger'

const controllerLogger = logger.child({ module: 'case-controller' })

export const createCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { name, client, description, practiceArea, status, complexity, keyDates } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    if (user.plan === UserPlan.NONE) {
      res.status(403).json({
        success: false,
        message: 'You do not have an active plan. Please subscribe to a plan to start creating cases.'
      } as IApiResponse)
      return
    }

    const isTrial = user.plan === UserPlan.TRIAL

    if (isTrial && user.trialCaseId) {
      res.status(403).json({
        success: false,
        message: 'Your free trial is limited to one single case/matter. Please upgrade to a paid plan to create more cases.'
      } as IApiResponse)
      return
    }

    const validStatuses = Object.values(CaseStatus)
    const finalStatus = status && validStatuses.includes(status) ? status : CaseStatus.ACTIVE

    const newCase = new Case({
      name,
      client,
      description,
      practiceArea,
      status: finalStatus,
      complexity: complexity || '2',
      userId,
      lastActivationPeriodStart: user.currentPeriodStart || new Date(),
      isTrialCase: isTrial
    })

    await newCase.save()

    if (keyDates && Array.isArray(keyDates) && keyDates.length > 0) {
      const eventPromises = keyDates
        .filter((kd: any) => kd.date && kd.title)
        .map((kd: any) => Event.create({
          title: kd.title,
          start: new Date(kd.date),
          type: kd.type || 'other',
          priority: 'medium',
          caseId: newCase._id,
          userId,
          status: 'active'
        }))
      await Promise.allSettled(eventPromises)
      controllerLogger.info({ caseId: newCase._id, count: eventPromises.length }, 'Auto-created calendar events from key dates')
    }

    const userUpdate: any = { $inc: { currentCases: 1 } }
    if (isTrial) {
      userUpdate.$set = { trialCaseId: newCase._id }
    }

    await User.updateOne({ _id: userId }, userUpdate)

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: newCase._id,
      targetName: newCase.name,
      targetType: 'case',
      category: 'platform',
      action: 'CASE_CREATED',
      after: { name: newCase.name, client: newCase.client, status: newCase.status },
      description: `User ${user.email} created a new case: ${newCase.name}`
    })

    await createNotification({
      userId,
      title: 'New Case Initialized',
      message: `Case "${newCase.name}" has been successfully created.`,
      type: NotificationType.CASE_UPDATE,
      priority: NotificationPriority.MEDIUM,
      link: `/cases/${newCase._id}`
    })

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'createCase error')
    res.status(500).json({ success: false, message: 'Failed to create case' } as IApiResponse)
  }
}

export const getCases = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 100)
    const skip = (page - 1) * limit
    const status = req.query.status as string | undefined

    const user = await User.findById(userId)
    if (user && user.plan === UserPlan.TRIAL && user.trialStartedAt) {
      const startTime = new Date(user.trialStartedAt)
      const diffInHours = (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60)
      if (diffInHours >= 24) {
        await Case.updateMany(
          { userId, isTrialCase: true, status: CaseStatus.ACTIVE },
          { $set: { status: CaseStatus.CLOSED } }
        )
      }
    }

    const filter: Record<string, unknown> = { 
      userId,
      status: { $ne: CaseStatus.DELETED }
    }
    if (status && Object.values(CaseStatus).includes(status as CaseStatus)) {
      filter.status = status
    }

    const [cases, total] = await Promise.all([
      Case.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Case.countDocuments(filter)
    ])

    res.status(200).json({
      success: true,
      message: 'Cases retrieved successfully',
      data: cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'getCases error')
    res.status(500).json({ success: false, message: 'Failed to fetch cases' } as IApiResponse)
  }
}

export const getCaseStats = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const stats = await Case.aggregate([
      { $match: { userId, status: { $ne: CaseStatus.DELETED } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const formattedStats = {
      total: 0,
      active: 0,
      closed: 0,
      archived: 0
    }

    stats.forEach((stat: { _id: string; count: number }) => {
      formattedStats.total += stat.count
      if (stat._id === 'active') formattedStats.active = stat.count
      if (stat._id === 'closed') formattedStats.closed = stat.count
      if (stat._id === 'archived') formattedStats.archived = stat.count
    })

    res.status(200).json({
      success: true,
      data: formattedStats
    } as IApiResponse)
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' } as IApiResponse)
  }
}

export const getCaseById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const caseData = await Case.findOne({ _id: id, userId })

    if (caseData && caseData.isTrialCase && caseData.status === CaseStatus.ACTIVE) {
      const user = await User.findById(userId)
      if (user && user.plan === UserPlan.TRIAL && user.trialStartedAt) {
        const startTime = new Date(user.trialStartedAt)
        const diffInHours = (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60)
        if (diffInHours >= 24) {
          caseData.status = CaseStatus.CLOSED
          await caseData.save()
        }
      }
    }

    if (!caseData) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      data: caseData
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'getCaseById error')
    res.status(500).json({ success: false, message: 'Failed to fetch case' } as IApiResponse)
  }
}

export const updateCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const currentCase = await Case.findOne({ _id: id, userId })
    if (!currentCase) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const { name, client, description, status, practiceArea } = req.body
    const allowedUpdates: Record<string, unknown> = {}
    
    const beforeState: any = { status: currentCase.status, email: user.email }
    
    if (name !== undefined) allowedUpdates.name = name
    if (client !== undefined) allowedUpdates.client = client
    if (description !== undefined) allowedUpdates.description = description
    if (practiceArea !== undefined) allowedUpdates.practiceArea = practiceArea
    if (status !== undefined && Object.values(CaseStatus).includes(status)) {
      allowedUpdates.status = status
      if (status === CaseStatus.CLOSED) {
        allowedUpdates.closedAt = new Date()
        allowedUpdates.closedByUser = true
        if (currentCase.status === CaseStatus.ACTIVE) {
          await User.updateOne({ _id: userId }, { $inc: { currentCases: -1 } })
        }
        const archiveResult = await Event.updateMany(
          { caseId: id, userId, status: 'active' },
          { $set: { status: 'closed' } }
        )
        controllerLogger.info({ caseId: id, archived: archiveResult.modifiedCount }, 'Archived events on user case closure')
        
        await createNotification({
          userId,
          title: 'Case Closed',
          message: `Workspace for "${currentCase.name}" has been sealed. ${archiveResult.modifiedCount} calendar events were archived.`,
          type: NotificationType.CASE_UPDATE,
          priority: NotificationPriority.LOW,
          link: '/cases'
        })
      } else if (status === CaseStatus.ACTIVE) {
        allowedUpdates.closedAt = null
        allowedUpdates.closedByUser = false
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      res.status(400).json({ success: false, message: 'No valid fields to update' } as IApiResponse)
      return
    }

    const updatedCase = await Case.findOneAndUpdate(
      { _id: id, userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )

    if (!updatedCase) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    if (status === CaseStatus.ACTIVE && currentCase.status !== CaseStatus.ACTIVE) {
      const periodStart = user.currentPeriodStart ? new Date(user.currentPeriodStart) : new Date(0)
      const lastActivation = updatedCase.lastActivationPeriodStart ? new Date(updatedCase.lastActivationPeriodStart) : new Date(0)
      
      if (lastActivation < periodStart) {
        await User.updateOne({ _id: userId }, { $inc: { currentCases: 1 } })
        await Case.updateOne({ _id: id }, { $set: { lastActivationPeriodStart: user.currentPeriodStart || new Date() } })
      }
    }

    if (status && status !== currentCase.status) {
      const isClosing = status === CaseStatus.CLOSED
      const isArchiving = status === CaseStatus.ARCHIVED
      
      let actionType: any = 'CASE_STATUS_CHANGE'
      if (isClosing) actionType = 'CASE_CLOSED'
      if (isArchiving) actionType = 'CASE_STATUS_CHANGE'
      
      const description = isClosing 
        ? `User ${user.email} closed case: "${updatedCase.name}"`
        : `User ${user.email} changed case "${updatedCase.name}" status from ${currentCase.status} to ${updatedCase.status}`

      await logAction({
        adminId: user._id,
        adminName: user.name,
        targetId: updatedCase._id,
        targetName: updatedCase.name,
        targetType: 'case',
        category: 'platform',
        action: actionType,
        before: beforeState,
        after: { status: updatedCase.status, email: user.email },
        description
      })
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'updateCase error')
    res.status(500).json({ success: false, message: 'Failed to update case' } as IApiResponse)
  }
}

export const deleteCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const caseToDelete = await Case.findOne({ _id: id, userId })
    if (!caseToDelete) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    if (caseToDelete.status !== CaseStatus.CLOSED) {
      res.status(400).json({ success: false, message: 'Only closed cases can be permanently deleted.' } as IApiResponse)
      return
    }

    const files = await CaseFile.find({ caseId: id, userId })
    let totalFreedStorage = 0
    for (const file of files) {
      if (file.key) {
        try {
          await deleteFromStorage(file.key)
        } catch (storageError) {
          controllerLogger.error({ err: storageError, fileId: file._id }, 'deleteCase: failed to delete file from storage')
        }
      }
      if (!file.isTemporary && file.size) {
        totalFreedStorage += file.size
      }
    }

    await CaseFile.deleteMany({ caseId: id, userId })
    await ChatMessage.deleteMany({ caseId: id, userId })
    await Event.deleteMany({ caseId: id, userId })

    if (totalFreedStorage > 0) {
      await User.updateOne({ _id: userId }, { $inc: { totalStorageUsed: -totalFreedStorage } })
    }

    const deletedCase = await Case.findOneAndDelete({ _id: id, userId })

    if (deletedCase) {
      await logAction({
        adminId: user._id,
        adminName: user.name,
        targetId: deletedCase._id,
        targetName: deletedCase.name,
        targetType: 'case',
        category: 'platform',
        action: 'CASE_DELETED',
        before: { email: user.email, name: deletedCase.name },
        description: `User ${user.email} permanently deleted closed case: ${deletedCase.name} and all its associated data.`
      })
    }

    res.status(200).json({
      success: true,
      message: 'Case permanently deleted successfully.'
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'deleteCase error')
    res.status(500).json({ success: false, message: 'Failed to delete case' } as IApiResponse)
  }
}

export const reactivateCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const currentCase = await Case.findOne({ _id: id, userId })
    if (!currentCase) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    if (currentCase.status !== CaseStatus.CLOSED) {
      res.status(400).json({ success: false, message: 'Only closed cases can be reactivated.' } as IApiResponse)
      return
    }

    if (currentCase.closedByUser) {
      res.status(403).json({
        success: false,
        message: 'This case was permanently sealed by you and cannot be reactivated. You can create a new case instead.'
      } as IApiResponse)
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    if (user.plan === UserPlan.NONE) {
      res.status(403).json({ success: false, message: 'Subscribe to a plan to reactivate cases.' } as IApiResponse)
      return
    }

    const maxAllowedCases = user.maxCases || user.planLimit
    if (user.currentCases >= maxAllowedCases) {
      res.status(403).json({
        success: false,
        message: `You have reached the case limit for your ${user.plan} plan (${maxAllowedCases} cases). Please upgrade your plan to reactivate more cases, or wait until your next billing cycle for your limit to be replenished.`
      } as IApiResponse)
      return
    }

    currentCase.status = CaseStatus.ACTIVE
    currentCase.closedAt = undefined
    
    const periodStart = user.currentPeriodStart ? new Date(user.currentPeriodStart) : new Date()

    await User.updateOne({ _id: userId }, { $inc: { currentCases: 1 } })
    currentCase.lastActivationPeriodStart = periodStart

    if (currentCase.isTrialCase) {
      currentCase.isTrialCase = false
    }

    await currentCase.save()

    const restoreResult = await Event.updateMany(
      { caseId: id, userId, status: 'closed' },
      { $set: { status: 'active' } }
    )
    controllerLogger.info({ caseId: id, restored: restoreResult.modifiedCount }, 'Restored events on case reactivation')

    await createNotification({
      userId,
      title: 'Case Reactivated',
      message: `Case "${currentCase.name}" is now active again. ${restoreResult.modifiedCount} archived events have been restored.`,
      type: NotificationType.CASE_UPDATE,
      priority: NotificationPriority.MEDIUM,
      link: `/cases/${id}`
    })

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: currentCase._id,
      targetName: currentCase.name,
      targetType: 'case',
      category: 'platform',
      action: 'STATUS_CHANGE',
      after: { status: CaseStatus.ACTIVE, email: user.email },
      description: `User ${user.email} reactivated case: "${currentCase.name}"`
    })

    res.status(200).json({
      success: true,
      message: 'Case reactivated successfully',
      data: currentCase
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'reactivateCase error')
    res.status(500).json({ success: false, message: 'Failed to reactivate case' } as IApiResponse)
  }
}
