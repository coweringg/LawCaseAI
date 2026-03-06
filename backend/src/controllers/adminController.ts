import { Response } from 'express'
import { Types } from 'mongoose'
import { User, Case, Transaction, AuditLog, SupportRequest, Organization, Event } from '../models'
import { IAuthRequest, IApiResponse, UserRole, UserStatus, UserPlan, IAdminStats, CaseStatus, SupportRequestStatus, EventStatus, SupportRequestType } from '../types'
import { logAction } from '../utils/auditLogger'

export const getUsers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query: Record<string, unknown> = { status: { $ne: UserStatus.DELETED } }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { lawFirm: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const userObj = { ...u, id: u._id.toString() }
      if (u.organizationId) {
        const org = await Organization.findById(u.organizationId)
        if (org) {
          return { ...userObj, firmCode: org.firmCode }
        }
      }
      return userObj
    }))

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: enrichedUsers,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const getStats = async (_req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ status: { $ne: UserStatus.DELETED } })
    const activeUsers = await User.countDocuments({ status: UserStatus.ACTIVE })
    await Case.updateMany(
      { userId: { $in: await User.find({ status: UserStatus.DELETED }).distinct('_id') }, status: { $ne: CaseStatus.DELETED } },
      { $set: { status: CaseStatus.DELETED } }
    )

    const totalCases = await Case.countDocuments({ status: { $ne: CaseStatus.DELETED } })
    
    const totalRevenue = totalUsers * 49 
    const monthlyRevenue = activeUsers * 29 
    
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth },
      status: { $ne: UserStatus.DELETED } 
    })

    const stats: IAdminStats = {
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalCases,
      newUsersThisMonth
    }

    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      data: stats
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const updateUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, email, role, status, lawFirm, plan, password } = req.body

    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const admin = req.user!
    const before = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lawFirm: user.lawFirm,
      plan: user.plan
    }

    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role as UserRole
    if (status) user.status = status as UserStatus
    if (lawFirm) user.lawFirm = lawFirm
    if (plan) user.plan = plan as UserPlan
    
    if (password) {
      user.password = password
    }

    await user.save()

    await logAction({
      adminId: admin._id,
      adminName: admin.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'admin',
      action: password ? 'PASSWORD_RESET' : 'UPDATE',
      before,
      after: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lawFirm: user.lawFirm,
        plan: user.plan
      },
      description: password 
        ? `Reset password for user ${user.email}` 
        : `Updated profile for user ${user.email}`
    })

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    } as IApiResponse)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already in use' } as IApiResponse)
      return
    }
    const message = error instanceof Error ? error.message : 'Failed to update user'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const deleteUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user || user.status === UserStatus.DELETED) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    if (user._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot delete yourself' } as IApiResponse)
      return
    }

    const admin = req.user!
    const oldStatus = user.status
    
    const originalEmail = user.email
    user.email = `deleted_${Date.now()}_${originalEmail}`
    user.status = UserStatus.DELETED
    await user.save()

    if (user.plan === UserPlan.ENTERPRISE && user.isOrgAdmin && user.organizationId) {
      const orgId = user.organizationId
      
      const members = await User.find({ organizationId: orgId })
      const memberIds = members.map(m => m._id)

      await User.updateMany(
        { organizationId: orgId },
        { 
          $set: { 
            plan: UserPlan.NONE, 
            currentCases: 0,
            isOrgAdmin: false
          },
          $unset: { organizationId: 1 }
        }
      )

      await Case.updateMany(
        { userId: { $in: memberIds }, status: CaseStatus.ACTIVE },
        { $set: { status: CaseStatus.CLOSED, closedAt: new Date() } }
      )

      await Event.updateMany(
        { userId: { $in: memberIds }, status: EventStatus.ACTIVE },
        { $set: { status: EventStatus.CLOSED } }
      )

      await Organization.findByIdAndUpdate(orgId, { isActive: false })
    }

    await Case.updateMany(
      { userId: user._id, status: { $ne: CaseStatus.DELETED } },
      { $set: { status: CaseStatus.DELETED } }
    )

    await logAction({
      adminId: admin._id,
      adminName: admin.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'admin',
      action: 'USER_DELETED',
      before: { email: user.email, status: oldStatus },
      description: `Soft-deleted user account: ${user.email} (${user.name})`
    })

    res.status(200).json({
      success: true,
      message: 'User account marked as deleted'
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const updateUserStatus = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!Object.values(UserStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' } as IApiResponse)
      return
    }

    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const admin = req.user!
    const oldStatus = user.status
    user.status = status as UserStatus
    await user.save()

    await logAction({
      adminId: admin._id,
      adminName: admin.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'admin',
      action: status === 'disabled' ? 'USER_DISABLED' : 'USER_ENABLED',
      before: { status: oldStatus, email: user.email },
      after: { status: user.status, email: user.email },
      description: status === 'disabled' 
        ? `Disabled access for user ${user.email}` 
        : `Restored access for user ${user.email}`
    })

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const updateUserPlan = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { plan } = req.body

    if (!Object.values(UserPlan).includes(plan)) {
      res.status(400).json({ success: false, message: 'Invalid plan' } as IApiResponse)
      return
    }

    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const admin = req.user!
    const oldPlan = user.plan
    user.plan = plan as UserPlan
    await user.save()

    await logAction({
      adminId: admin._id,
      adminName: admin.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'admin',
      action: 'PLAN_CHANGE',
      before: { plan: oldPlan, email: user.email },
      after: { plan: user.plan, email: user.email },
      description: `Changed plan for ${user.email} to ${plan}`
    })

    res.status(200).json({
      success: true,
      message: 'User plan updated successfully',
      data: user
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update plan'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const getUserHistory = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    const cases = await Case.find({ userId: id }).sort({ createdAt: -1 })
    const payments = await Transaction.find({ userId: id }).sort({ date: -1 })
    const auditLogs = await AuditLog.find({ 
      $or: [
        { targetId: id },
        { adminId: id }
      ]
    }).sort({ timestamp: -1 })

    let orgMembers: Record<string, unknown>[] = []
    let organizationData: Record<string, unknown> | null = null
    
    if (user.organizationId) {
      orgMembers = await User.find({ 
        organizationId: user.organizationId,
        _id: { $ne: user._id } 
      })
      .select('name email plan status currentCases isOrgAdmin createdAt')
      .lean()
      
      const org = await Organization.findById(user.organizationId).lean()
      if (org) {
        organizationData = {
          id: org._id.toString(),
          firmCode: org.firmCode,
          totalSeats: org.totalSeats,
          usedSeats: org.usedSeats
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'User history fetched successfully',
      data: {
        cases,
        payments,
        auditLogs,
        orgMembers,
        organizationData,
        aiUsage: {
          totalTokensConsumed: user.totalTokensConsumed,
          totalStorageUsed: user.totalStorageUsed,
          plan: user.plan,
          maxTokens: user.maxTokens,
          maxTotalStorage: user.maxTotalStorage
        }
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user history'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const getAuditLogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, category, search, startDate, endDate } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter: Record<string, any> = {}
    if (category && (category === 'admin' || category === 'platform')) {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { adminName: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { 'details.description': { $regex: search, $options: 'i' } }
      ]
    }

    if (startDate || endDate) {
      filter.timestamp = {}
      if (startDate) filter.timestamp.$gte = new Date(startDate as string)
      if (endDate) {
        const end = new Date(endDate as string)
        end.setHours(23, 59, 59, 999)
        filter.timestamp.$lte = end
      }
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await AuditLog.countDocuments(filter)

    res.status(200).json({
      success: true,
      message: 'Audit logs fetched successfully',
      data: {
        logs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch audit logs'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const deleteAuditLog = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const log = await AuditLog.findByIdAndDelete(id)
    
    if (!log) {
      res.status(404).json({ success: false, message: 'Log entry not found' } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Log entry deleted successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete log entry'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const clearAuditLogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query

    if (!category || (category !== 'admin' && category !== 'platform')) {
      res.status(400).json({ success: false, message: 'Invalid or missing category' } as IApiResponse)
      return
    }

    await AuditLog.deleteMany({ category })

    res.status(200).json({
      success: true,
      message: `Successfully cleared all ${category} logs`
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to clear logs'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const logoutUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1
    await User.findByIdAndUpdate(id, { 
      $set: { tokenVersion: user.tokenVersion },
      $unset: { lastActivity: 1 } 
    })

    res.status(200).json({
      success: true,
      message: `User ${user.email} sessions have been invalidated`
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to force logout'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const getSupportRequests = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query: Record<string, unknown> = {}
    if (type) query.type = type
    if (status) query.status = status

    const requests = await SupportRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await SupportRequest.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Support requests fetched successfully',
      data: {
        requests,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch support requests'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const updateSupportRequestStatus = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!Object.values(SupportRequestStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' } as IApiResponse)
      return
    }

    const request = await SupportRequest.findByIdAndUpdate(id, { status }, { new: true })
    if (!request) {
      res.status(404).json({ success: false, message: 'Support request not found' } as IApiResponse)
      return
    }

    await logAction({
      adminId: req.user!._id,
      adminName: req.user!.name,
      targetId: request._id,
      targetName: request.subject,
      targetType: 'support',
      category: 'admin',
      action: 'SUPPORT_REQUEST_STATUS_UPDATE',
      after: { status: request.status },
      description: `Admin marked support request "${request.subject}" as ${status}`
    })

    res.status(200).json({
      success: true,
      message: `Support request status updated to ${status}`,
      data: request
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const deleteSupportRequest = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const request = await SupportRequest.findByIdAndDelete(id)
    if (!request) {
      res.status(404).json({ success: false, message: 'Support request not found' } as IApiResponse)
      return
    }

    await logAction({
      adminId: req.user!._id,
      adminName: req.user!.name,
      targetId: request._id,
      targetName: request.subject,
      targetType: 'support',
      category: 'admin',
      action: 'DELETE',
      description: `Admin deleted support request: ${request.subject}`
    })

    res.status(200).json({
      success: true,
      message: 'Support request deleted successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete support request'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const clearSupportRequests = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query
    const query: Record<string, unknown> = {}
    
    if (type === 'user_all') {
      query.type = { $ne: SupportRequestType.LOGIN_ISSUE }
    } else if (type && type !== 'all') {
      query.type = type
    }

    const result = await SupportRequest.deleteMany(query)

    await logAction({
      adminId: req.user!._id,
      adminName: req.user!.name,
      targetId: new Types.ObjectId(),
      targetName: type === 'system_error' ? 'All System Errors' : type === 'feature_uplink' ? 'All Feature Uplinks' : 'All support requests',
      targetType: 'support',
      category: 'admin',
      action: 'DELETE',
      description: `Admin cleared ${result.deletedCount} support requests${type ? ` of type ${type}` : ''}`
    })

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} support requests`,
      data: { deletedCount: result.deletedCount }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to clear support requests'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

export const updateOrganizationCode = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { firmCode } = req.body

    if (!firmCode) {
      res.status(400).json({ success: false, message: 'Firm code is required' } as IApiResponse)
      return
    }

    const org = await Organization.findById(id)
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
      return
    }

    const oldCode = org.firmCode
    org.firmCode = firmCode.toUpperCase()
    await org.save()

    await logAction({
      adminId: req.user!._id,
      adminName: req.user!.name,
      targetId: org._id,
      targetName: org.name,
      targetType: 'organization',
      category: 'admin',
      action: 'ORG_CODE_UPDATE',
      before: { firmCode: oldCode },
      after: { firmCode: org.firmCode },
      description: `Updated firm code for ${org.name} from ${oldCode} to ${org.firmCode}`
    })

    res.status(200).json({
      success: true,
      message: 'Firm code updated successfully',
      data: org
    } as IApiResponse)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'This firm code is already in use by another organization.' 
      } as IApiResponse)
      return
    }
    const message = error instanceof Error ? error.message : 'Failed to update firm code'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}
