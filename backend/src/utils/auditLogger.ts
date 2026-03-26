import { AuditLog } from '../models'
import { Types } from 'mongoose'
import logger from '../utils/logger'

const auditLoggerInstance = logger.child({ module: 'audit' })

interface LogOptions {
  adminId: Types.ObjectId
  adminName: string
  targetId?: Types.ObjectId
  targetName: string
  targetType: 'user' | 'case' | 'support' | 'organization' | 'payment' | 'system' | 'billing'
  category: 'admin' | 'platform'
  severity?: 'info' | 'warning' | 'critical'
  action: string
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
      severity: options.severity || 'info',
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
