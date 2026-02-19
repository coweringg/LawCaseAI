import { Response } from 'express'
import { User, Case, Transaction, AuditLog } from '../models'
import { IAuthRequest, IApiResponse, UserRole, UserStatus, UserPlan, IAdminStats } from '../types'
import { logAction } from '../utils/auditLogger'

/**
 * Get all users with searching and pagination.
 */
export const getUsers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query: any = { status: { $ne: UserStatus.DELETED } } // Exclude deleted users from main list
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

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
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

/**
 * Get administrative statistics.
 */
export const getStats = async (_req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ status: { $ne: UserStatus.DELETED } })
    const activeUsers = await User.countDocuments({ status: UserStatus.ACTIVE })
    const totalCases = await Case.countDocuments()
    
    // Revenue placeholders
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

/**
 * Update user details (email, role, status, etc.)
 */
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

    // Update fields if provided
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

    // Log the action
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
    const message = error instanceof Error ? error.message : 'Failed to update user'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

/**
 * Delete a user (Soft Delete).
 */
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
    
    // Soft delete
    user.status = UserStatus.DELETED
    await user.save()

    // Log the action
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

/**
 * Update user status
 */
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

    // Log the action
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

/**
 * Update user plan
 */
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

    // Log the action
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

/**
 * Get detailed user history (cases, payments, audit logs)
 */
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
    const auditLogs = await AuditLog.find({ targetId: id }).sort({ timestamp: -1 })

    res.status(200).json({
      success: true,
      message: 'User history fetched successfully',
      data: {
        cases,
        payments,
        auditLogs
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user history'
    res.status(500).json({ success: false, message } as IApiResponse)
  }
}

/**
 * Get platform-wide audit logs with searching and specific categories.
 */
export const getAuditLogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, category, search, startDate, endDate } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter: any = {}
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

/**
 * Delete a single audit log entry.
 */
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

/**
 * Clear all audit logs for a specific category.
 */
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

/**
 * Force logout a user by incrementing their tokenVersion.
 */
export const logoutUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1
    // Clear activity status immediately on force logout
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
