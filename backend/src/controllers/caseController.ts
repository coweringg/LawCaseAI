import { Response } from 'express'
import { Case, User, CaseFile, ChatMessage, Event } from '../models'
import { IApiResponse, CaseStatus, IAuthRequest, UserPlan, EventPriority, NotificationType, NotificationPriority } from '../types'
import { logAction } from '../utils/auditLogger'
import { createNotification } from '../utils/notification'
import { deleteFromStorage } from '../utils/fileUpload'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const createCase = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { name, client, description, practiceArea, status, complexity, keyDates } = req.body
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.plan === UserPlan.NONE) {
      throw new AppError('You do not have an active plan. Please subscribe to a plan to start creating cases.', 403)
    }

    const isTrial = user.plan === UserPlan.TRIAL

    if (isTrial && user.trialCaseId) {
      throw new AppError('Your free trial is limited to one single case/matter. Please upgrade to a paid plan to create more cases.', 403)
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
        .map((kd: any) => {
          const eventDate = new Date(kd.isoDate);
          
          return Event.create({
            title: kd.title,
            start: eventDate,
            type: kd.type || 'other',
            priority: kd.priority || 'medium',
            caseId: newCase._id,
            userId,
            status: 'active',
            isAllDay: !kd.hasTime,
            metadata: { 
              hasTime: !!kd.hasTime,
              originalTime: kd.time 
            }
          });
        })
      await Promise.allSettled(eventPromises)
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
})

export const getCases = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
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
})

export const getCaseStats = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id
    if (!userId) {
      throw new AppError('Unauthorized', 401)
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
})

export const getCaseById = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
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
      throw new AppError('Case not found', 404)
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    res.status(200).json({
      success: true,
      data: caseData
    } as IApiResponse)
})

export const updateCase = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }

    const currentCase = await Case.findOne({ _id: id, userId })
    if (!currentCase) {
      throw new AppError('Case not found', 404)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
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
        await Event.updateMany(
          { caseId: id, userId, status: 'active' },
          { $set: { status: 'closed' } }
        )
        
        await createNotification({
          userId,
          title: 'Case Closed',
          message: `Workspace for "${currentCase.name}" has been sealed. Calendar events were archived.`,
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
      throw new AppError('No valid fields to update', 400)
    }

    const updatedCase = await Case.findOneAndUpdate(
      { _id: id, userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )

    if (!updatedCase) {
      throw new AppError('Case not found', 404)
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
      
      const descriptionStr = isClosing 
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
        description: descriptionStr
      })
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    } as IApiResponse)
})

export const deleteCase = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const caseToDelete = await Case.findOne({ _id: id, userId })
    if (!caseToDelete) {
      throw new AppError('Case not found', 404)
    }

    if (caseToDelete.status !== CaseStatus.CLOSED) {
      throw new AppError('Only closed cases can be permanently deleted.', 400)
    }

    const files = await CaseFile.find({ caseId: id, userId })
    let totalFreedStorage = 0
    for (const file of files) {
      if (file.key) {
        try {
          await deleteFromStorage(file.key)
        } catch (storageError) {
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
})

export const reactivateCase = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }

    const currentCase = await Case.findOne({ _id: id, userId })
    if (!currentCase) {
      throw new AppError('Case not found', 404)
    }

    if (currentCase.status !== CaseStatus.CLOSED) {
      throw new AppError('Only closed cases can be reactivated.', 400)
    }

    if (currentCase.closedByUser) {
      throw new AppError('This case was permanently sealed by you and cannot be reactivated. You can create a new case instead.', 403)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.plan === UserPlan.NONE) {
      throw new AppError('Subscribe to a plan to reactivate cases.', 403)
    }

    const maxAllowedCases = user.maxCases || user.planLimit
    if (user.currentCases >= maxAllowedCases) {
      throw new AppError(`You have reached the case limit for your ${user.plan} plan (${maxAllowedCases} cases). Please upgrade your plan to reactivate more cases.`, 403)
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

    await Event.updateMany(
      { caseId: id, userId, status: 'closed' },
      { $set: { status: 'active' } }
    )

    await createNotification({
      userId,
      title: 'Case Reactivated',
      message: `Case "${currentCase.name}" is now active again. Archived events have been restored.`,
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
})
