import mongoose, { Schema } from 'mongoose'
import { ISupportRequest, SupportRequestType, SupportRequestStatus } from '../types'

const supportRequestSchema = new Schema<ISupportRequest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  lawFirm: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: Object.values(SupportRequestType),
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: Object.values(SupportRequestStatus),
    default: SupportRequestStatus.PENDING
  }
}, {
  timestamps: true
})

supportRequestSchema.index({ userId: 1 })
supportRequestSchema.index({ type: 1 })
supportRequestSchema.index({ status: 1 })
supportRequestSchema.index({ createdAt: -1 })

const SupportRequest = mongoose.model<ISupportRequest>('SupportRequest', supportRequestSchema)

export default SupportRequest
