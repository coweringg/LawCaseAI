import { Response } from 'express'
import { Types } from 'mongoose'
import { User, Case, Transaction, AuditLog, SupportRequest, Organization, Event } from '../models'
import { IAuthRequest, IApiResponse, UserRole, UserStatus, UserPlan, IAdminStats, CaseStatus, SupportRequestStatus, EventStatus, SupportRequestType } from '../types'
import { logAction } from '../utils/auditLogger'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getUsers = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { search, page = 1, limit = 10, role } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query: Record<string, unknown> = { status: { $ne: UserStatus.DELETED } }
    
    if (role && role !== 'all') {
      if (role === 'admin') {
        query.role = UserRole.ADMIN
      } else if (role === 'user') {
        query.role = { $ne: UserRole.ADMIN }
      }
    }

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
})

export const getStats = catchAsync(async (_req: IAuthRequest, res: Response): Promise<void> => {
    const totalUsers = await User.countDocuments({ status: { $ne: UserStatus.DELETED } })
    const activeUsers = await User.countDocuments({ status: UserStatus.ACTIVE })
    
    await Case.updateMany(
      { userId: { $in: await User.find({ status: UserStatus.DELETED }).distinct('_id') }, status: { $ne: CaseStatus.DELETED } },
      { $set: { status: CaseStatus.DELETED } }
    )

    const totalCases = await Case.countDocuments({ status: { $ne: CaseStatus.DELETED } })
    
    const totalRevenueAgg = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = totalRevenueAgg[0]?.total || 0

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const monthlyRevenueAgg = await Transaction.aggregate([
      { 
        $match: { 
          status: 'succeeded',
          date: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0
    
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
})

export const updateUser = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, email, role, status, lawFirm, plan, password } = req.body

    const user = await User.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
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
    if (email) {
        const existing = await User.findOne({ email, _id: { $ne: id } });
        if (existing) throw new AppError('Email already in use', 400);
        user.email = email;
    }
    if (role) user.role = role as UserRole
    if (status) user.status = status as UserStatus
    if (lawFirm) user.lawFirm = lawFirm
    if (plan) user.plan = plan as UserPlan
    if (password) user.password = password

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
})

export const deleteUser = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user || user.status === UserStatus.DELETED) {
      throw new AppError('User not found', 404)
    }

    if (user._id.toString() === req.user?._id.toString()) {
      throw new AppError('You cannot delete yourself', 400)
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
      before: { email: originalEmail, status: oldStatus },
      description: `Soft-deleted user account: ${originalEmail} (${user.name})`
    })

    res.status(200).json({
      success: true,
      message: 'User account marked as deleted'
    } as IApiResponse)
})

export const updateUserStatus = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { status } = req.body

    if (!Object.values(UserStatus).includes(status)) {
      throw new AppError('Invalid status', 400)
    }

    const user = await User.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
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
      description: status === 'disabled' ? `Disabled access for user ${user.email}` : `Restored access for user ${user.email}`
    })

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    } as IApiResponse)
})

export const updateUserPlan = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { plan } = req.body

    if (!Object.values(UserPlan).includes(plan)) {
      throw new AppError('Invalid plan', 400)
    }

    const user = await User.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
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
})

export const getUserHistory = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const [cases, payments, auditLogs] = await Promise.all([
        Case.find({ userId: id }).sort({ createdAt: -1 }),
        Transaction.find({ userId: id }).sort({ date: -1 }),
        AuditLog.find({ $or: [{ targetId: id }, { adminId: id }] }).sort({ timestamp: -1 })
    ])

    let orgMembers: Record<string, unknown>[] = []
    let organizationData: Record<string, unknown> | null = null
    
    if (user.organizationId) {
      orgMembers = await User.find({ organizationId: user.organizationId, _id: { $ne: user._id } })
        .select('name email plan status currentCases isOrgAdmin createdAt')
        .lean()
      
      const org = await Organization.findById(user.organizationId).lean()
      if (org) {
        organizationData = { id: org._id.toString(), firmCode: org.firmCode, totalSeats: org.totalSeats, usedSeats: org.usedSeats }
      }
    }

    res.status(200).json({
      success: true,
      message: 'User history fetched successfully',
      data: { cases, payments, auditLogs, orgMembers, organizationData,
        aiUsage: { totalTokensConsumed: user.totalTokensConsumed, totalStorageUsed: user.totalStorageUsed, plan: user.plan, maxTokens: user.maxTokens, maxTotalStorage: user.maxTotalStorage }
      }
    } as IApiResponse)
})

export const getAuditLogs = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 10, category, search, startDate, endDate, action, targetType, export: exportCsv } = req.query
    const filter: Record<string, any> = {}
    
    if (category) filter.category = category
    if (action) filter.action = action
    if (targetType) filter.targetType = targetType

    if (search) {
      filter.$or = [
        { adminName: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } },
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

    if (exportCsv === 'true') {
      const allLogs = await AuditLog.find(filter).sort({ timestamp: -1 }).lean()
      const headers = ['Timestamp', 'Admin', 'Action', 'Target', 'Type', 'Severity', 'Description']
      const rows = allLogs.map(log => [
        new Date(log.timestamp).toISOString(), log.adminName, log.action, log.targetName, log.targetType, log.severity || 'info', log.details.description.replace(/,/g, ';')
      ])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv')
      res.status(200).send(csv)
      return
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(filter)
    ])

    res.status(200).json({
      success: true,
      message: 'Audit logs fetched successfully',
      data: { logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    } as IApiResponse)
})

export const deleteAuditLog = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const log = await AuditLog.findByIdAndDelete(id)
    if (!log) throw new AppError('Log entry not found', 404)

    res.status(200).json({ success: true, message: 'Log entry deleted successfully' })
})

export const clearAuditLogs = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { category } = req.query
    if (!category || (category !== 'admin' && category !== 'platform')) {
      throw new AppError('Invalid or missing category', 400)
    }
    await AuditLog.deleteMany({ category })
    res.status(200).json({ success: true, message: `Successfully cleared all ${category} logs` })
})

export const logoutUser = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) throw new AppError('User not found', 404)

    user.tokenVersion = (user.tokenVersion || 0) + 1
    await User.findByIdAndUpdate(id, { $set: { tokenVersion: user.tokenVersion }, $unset: { lastActivity: 1 } })

    res.status(200).json({ success: true, message: `User ${user.email} sessions invalidated` })
})

export const getSupportRequests = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { type, status, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const query: Record<string, unknown> = {}
    if (type) query.type = type
    if (status) query.status = status

    const [requests, total] = await Promise.all([
        SupportRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        SupportRequest.countDocuments(query)
    ])

    res.status(200).json({
      success: true,
      data: { requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    } as IApiResponse)
})

export const updateSupportRequestStatus = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { status } = req.body
    if (!Object.values(SupportRequestStatus).includes(status)) throw new AppError('Invalid status', 400)

    const request = await SupportRequest.findByIdAndUpdate(id, { status }, { new: true })
    if (!request) throw new AppError('Support request not found', 404)

    await logAction({
      adminId: req.user!._id, adminName: req.user!.name, targetId: request._id, targetName: request.subject, targetType: 'support', category: 'admin', action: 'SUPPORT_REQUEST_STATUS_UPDATE', after: { status: request.status }, description: `Admin marked request "${request.subject}" as ${status}`
    })

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: request })
})

export const deleteSupportRequest = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const request = await SupportRequest.findByIdAndDelete(id)
    if (!request) throw new AppError('Support request not found', 404)

    await logAction({
      adminId: req.user!._id, adminName: req.user!.name, targetId: request._id, targetName: request.subject, targetType: 'support', category: 'admin', action: 'DELETE', description: `Admin deleted support request: ${request.subject}`
    })

    res.status(200).json({ success: true, message: 'Support request deleted successfully' })
})

export const clearSupportRequests = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { type } = req.query
    const query: Record<string, unknown> = {}
    if (type === 'user_all') query.type = { $ne: SupportRequestType.LOGIN_ISSUE }
    else if (type && type !== 'all') query.type = type

    const result = await SupportRequest.deleteMany(query)

    await logAction({
      adminId: req.user!._id, adminName: req.user!.name, targetId: new Types.ObjectId(), targetName: 'Cleared requests', targetType: 'support', category: 'admin', action: 'DELETE', description: `Admin cleared ${result.deletedCount} requests`
    })

    res.status(200).json({ success: true, message: `Cleared ${result.deletedCount} requests` })
})

export const updateOrganizationCode = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { firmCode } = req.body
    if (!firmCode) throw new AppError('Firm code is required', 400)

    const org = await Organization.findById(id)
    if (!org) throw new AppError('Organization not found', 404)

    const exists = await Organization.findOne({ firmCode: firmCode.toUpperCase(), _id: { $ne: id } });
    if (exists) throw new AppError('This firm code is already in use.', 400);

    const oldCode = org.firmCode
    org.firmCode = firmCode.toUpperCase()
    await org.save()

    await logAction({
      adminId: req.user!._id, adminName: req.user!.name, targetId: org._id, targetName: org.name, targetType: 'organization', category: 'admin', action: 'ORG_CODE_UPDATE', before: { firmCode: oldCode }, after: { firmCode: org.firmCode }, description: `Updated firm code for ${org.name}`
    })

    res.status(200).json({ success: true, data: org })
})
