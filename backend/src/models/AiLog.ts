import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAiLog extends Document {
  userId?: Types.ObjectId
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter'
  aiModel: string
  action: 'chat' | 'analysis' | 'audit'
  status: 'success' | 'error' | 'rate_limit'
  tokens: number
  responseTime: number
  errorMessage?: string
  resolved?: boolean
  timestamp: Date
}

const aiLogSchema = new Schema<IAiLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  provider: {
    type: String,
    required: true,
    index: true
  },
  aiModel: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['chat', 'analysis', 'audit'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error', 'rate_limit'],
    required: true,
    index: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number,
    default: 0
  },
  errorMessage: String,
  resolved: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
})

aiLogSchema.index({ timestamp: -1, status: 1 })
aiLogSchema.index({ provider: 1, timestamp: -1 })
aiLogSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.model<IAiLog>('AiLog', aiLogSchema)
