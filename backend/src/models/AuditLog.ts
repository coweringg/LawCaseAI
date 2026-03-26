import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAuditLog extends Document {
  adminId: Types.ObjectId
  adminName: string
  targetId: Types.ObjectId
  targetName: string
  targetType: 'user' | 'case' | 'support' | 'organization' | 'payment' | 'system' | 'billing'
  category: 'admin' | 'platform'
  severity: 'info' | 'warning' | 'critical'
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PLAN_CHANGE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET' | 'USER_DISABLED' | 'USER_ENABLED' | 'CASE_CREATED' | 'CASE_DELETED' | 'FILE_UPLOADED' | 'FILE_DELETED' | 'AI_CONSULTATION' | 'PROFILE_UPDATE' | 'NOTIFICATION_CHANGE' | 'PAYMENT_METHOD_ADD' | 'PAYMENT_METHOD_REMOVE' | 'CASE_STATUS_CHANGE' | 'USER_DELETED' | 'CASE_CLOSED' | 'PASSWORD_CHANGE' | 'SUPPORT_REQUEST_SUBMITTED' | 'SUPPORT_REQUEST_STATUS_UPDATE' | 'ORG_CODE_UPDATE' | 'MAINTENANCE_TOGGLE' | 'GLOBAL_ALERT_UPDATE'
  details: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    description: string
  }
  timestamp: Date
}

const auditLogSchema = new Schema<IAuditLog>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'case', 'support', 'organization', 'payment', 'system', 'billing'],
    required: true
  },
  category: {
    type: String,
    enum: ['admin', 'platform'],
    required: true,
    default: 'admin'
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true,
    default: 'info'
  },
  action: {
    type: String,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PLAN_CHANGE', 'LOGIN', 'LOGOUT',
      'PASSWORD_RESET', 'USER_DISABLED', 'USER_ENABLED', 'CASE_CREATED', 
      'CASE_DELETED', 'FILE_UPLOADED', 'FILE_DELETED', 'AI_CONSULTATION', 
      'PROFILE_UPDATE', 'NOTIFICATION_CHANGE', 'PAYMENT_METHOD_ADD', 
      'PAYMENT_METHOD_REMOVE', 'CASE_STATUS_CHANGE', 'USER_DELETED', 
      'CASE_CLOSED', 'PASSWORD_CHANGE', 'SUPPORT_REQUEST_SUBMITTED', 
      'SUPPORT_REQUEST_STATUS_UPDATE', 'ORG_CODE_UPDATE', 'MAINTENANCE_TOGGLE',
      'GLOBAL_ALERT_UPDATE'
    ],
    required: true
  },
  details: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    description: { type: String, required: true }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

auditLogSchema.index({ targetId: 1, timestamp: -1 })
auditLogSchema.index({ category: 1, timestamp: -1 })
auditLogSchema.index({ timestamp: -1 })

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
