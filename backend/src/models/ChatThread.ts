import mongoose, { Schema } from 'mongoose'
import { IChatThread } from '../types'

const chatThreadSchema = new Schema<IChatThread>({
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true,
    maxlength: [100, 'Thread title cannot exceed 100 characters'],
    default: 'General'
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

chatThreadSchema.index({ caseId: 1, userId: 1 })
chatThreadSchema.index({ caseId: 1, isDefault: 1 })

const ChatThreadModel = mongoose.model<IChatThread>('ChatThread', chatThreadSchema)

export default ChatThreadModel
