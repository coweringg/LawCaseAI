import mongoose, { Schema } from 'mongoose'
import { IChatMessage } from '../types'

const chatMessageSchema = new Schema<IChatMessage>({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: [true, 'Sender is required']
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
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    model: {
      type: String,
      default: null
    },
    tokens: {
      type: Number,
      min: 0
    },
    responseTime: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
chatMessageSchema.index({ caseId: 1, timestamp: 1 })
chatMessageSchema.index({ userId: 1 })
chatMessageSchema.index({ timestamp: -1 })

// Static methods
chatMessageSchema.statics.findByCase = function(caseId: string, limit: number = 50) {
  return this.find({ caseId })
    .sort({ timestamp: 1 })
    .limit(limit)
}

chatMessageSchema.statics.countByCase = function(caseId: string) {
  return this.countDocuments({ caseId })
}

chatMessageSchema.statics.findLatestByCase = function(caseId: string) {
  return this.findOne({ caseId })
    .sort({ timestamp: -1 })
}

// Virtuals
chatMessageSchema.virtual('isFromUser').get(function() {
  return this.sender === 'user'
})

chatMessageSchema.virtual('isFromAI').get(function() {
  return this.sender === 'ai'
})

chatMessageSchema.virtual('timeAgo').get(function() {
  const now = new Date()
  const diff = now.getTime() - this.timestamp.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
})

const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)

export default ChatMessageModel
