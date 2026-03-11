import { AuditLog } from '../models'
import { Types } from 'mongoose'
import logger from '../utils/logger'

const auditLoggerInstance = logger.child({ module: 'audit' })

interface LogOptions {
  adminId: Types.ObjectId
  adminName: string
  targetId?: Types.ObjectId
  targetName: string
  targetType: 'user' | 'case' | 'support' | 'organization' | 'payment'
  category: 'admin' | 'platform'
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PLAN_CHANGE' | 'LOGIN' | 'PASSWORD_RESET' | 'USER_DISABLED' | 'USER_ENABLED' | 'CASE_CREATED' | 'CASE_DELETED' | 'FILE_UPLOADED' | 'FILE_DELETED' | 'FILE_RENAMED' | 'BULK_FILE_DELETED' | 'AI_CONSULTATION' | 'PROFILE_UPDATE' | 'NOTIFICATION_CHANGE' | 'PAYMENT_METHOD_ADD' | 'PAYMENT_METHOD_REMOVE' | 'CASE_STATUS_CHANGE' | 'USER_DELETED' | 'CASE_CLOSED' | 'PASSWORD_CHANGE' | 'SUPPORT_REQUEST_SUBMITTED' | 'SUPPORT_REQUEST_STATUS_UPDATE' | 'ORG_CODE_UPDATE' | 'PAYMENT_PROCESSED' | 'TRIAL_ACTIVATED' | 'TRIAL_EXPIRED'
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  description: string
}

export const logAction = async (options: LogOptions): Promise<void> => {
  try {
    await AuditLog.create({
      adminId: options.adminId,
      adminName: options.adminName,
      targetId: options.targetId || new Types.ObjectId(),
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
    auditLoggerInstance.error({ err: error, action: options.action, targetId: options.targetId }, 'Failed to create audit log')
  }
}
