import { AuditLog } from '../models'
import { Types } from 'mongoose'

interface LogOptions {
  adminId: Types.ObjectId
  adminName: string
  targetId: Types.ObjectId
  targetName: string
  targetType: 'user' | 'case'
  category: 'admin' | 'platform'
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PLAN_CHANGE' | 'LOGIN' | 'PASSWORD_RESET' | 'USER_DISABLED' | 'USER_ENABLED' | 'CASE_CREATED' | 'CASE_DELETED' | 'FILE_UPLOADED' | 'FILE_DELETED' | 'AI_CONSULTATION' | 'PROFILE_UPDATE' | 'NOTIFICATION_CHANGE' | 'PAYMENT_METHOD_ADD' | 'PAYMENT_METHOD_REMOVE' | 'CASE_STATUS_CHANGE' | 'USER_DELETED' | 'CASE_CLOSED' | 'PASSWORD_CHANGE'
  before?: any
  after?: any
  description: string
}

/**
 * Utility to create an audit log entry
 */
export const logAction = async (options: LogOptions): Promise<void> => {
  try {
    await AuditLog.create({
      adminId: options.adminId,
      adminName: options.adminName,
      targetId: options.targetId,
      targetName: options.targetName,
      targetType: options.targetType,
      category: options.category,
      action: options.action,
      details: {
        before: options.before,
        after: options.after,
        description: options.description
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // We don't throw error here to avoid breaking the main request flow
    // but in a production app we might want a more robust queuing system
  }
}
