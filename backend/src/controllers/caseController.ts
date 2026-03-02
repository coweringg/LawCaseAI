import { Response } from 'express'

import { Case, User } from '../models'
import { IApiResponse, CaseStatus, IAuthRequest, UserPlan } from '../types'
import { logAction } from '../utils/auditLogger'
import logger from '../utils/logger'

const controllerLogger = logger.child({ module: 'case-controller' })

export const createCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { name, client, description, practiceArea } = req.body
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

    if (user.currentCases >= user.planLimit) {
      res.status(403).json({
        success: false,
        message: `You have reached the case limit for your ${user.plan} plan (${user.planLimit} cases). Please upgrade your plan to continue creating more cases, or wait until your next billing cycle for your limit to be replenished.`
      } as IApiResponse)
      return
    }

    const newCase = new Case({
      name,
      client,
      description,
      practiceArea,
      status: CaseStatus.ACTIVE,
      userId,
      lastActivationPeriodStart: user.currentPeriodStart || new Date()
    })

    await newCase.save()

    await User.updateOne({ _id: userId }, { $inc: { currentCases: 1 } })

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
      } else if (status === CaseStatus.ACTIVE) {
        allowedUpdates.closedAt = null
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

    const deletedCase = await Case.findOneAndDelete({ _id: id, userId })

    if (!deletedCase) {
      res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
      return
    }

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: deletedCase._id,
      targetName: deletedCase.name,
      targetType: 'case',
      category: 'platform',
      action: 'CASE_DELETED',
      before: { email: user.email, name: deletedCase.name },
      description: `User ${user.email} deleted case: ${deletedCase.name}`
    })

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
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
    
    const periodStart = user.currentPeriodStart ? new Date(user.currentPeriodStart) : new Date(0)
    const lastActivation = currentCase.lastActivationPeriodStart ? new Date(currentCase.lastActivationPeriodStart) : new Date(0)
    
    if (lastActivation < periodStart) {
      await User.updateOne({ _id: userId }, { $inc: { currentCases: 1 } })
      currentCase.lastActivationPeriodStart = user.currentPeriodStart || new Date()
    }

    await currentCase.save()

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
