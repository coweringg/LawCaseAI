import mongoose, { Schema, Document } from 'mongoose'
import { ICase, CaseStatus } from '../types'

const caseSchema = new Schema<ICase>({
  name: {
    type: String,
    required: [true, 'Case name is required'],
    trim: true,
    maxlength: [200, 'Case name cannot exceed 200 characters']
  },
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: Object.values(CaseStatus),
    default: CaseStatus.ACTIVE
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fileCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
caseSchema.index({ userId: 1 })
caseSchema.index({ status: 1 })
caseSchema.index({ createdAt: -1 })
caseSchema.index({ name: 'text', client: 'text', description: 'text' })

// Pre-remove middleware to update user's case count
caseSchema.pre('deleteOne', { document: true, query: false }, async function(this: ICase & Document, next: (err?: Error) => void) {
  try {
    const User = mongoose.model('User')
    await User.findByIdAndUpdate(this.userId, { $inc: { currentCases: -1 } })
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Static methods
caseSchema.statics.findByUser = function(userId: string, options: { status?: CaseStatus; limit?: number; skip?: number } = {}) {
  const query: { userId: string; status?: CaseStatus } = { userId }
  
  if (options.status) {
    query.status = options.status
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
}

caseSchema.statics.countByUser = function(userId: string, status?: CaseStatus) {
  const query: { userId: string; status?: CaseStatus } = { userId }
  if (status) {
    query.status = status
  }
  return this.countDocuments(query)
}

// Virtuals
caseSchema.virtual('isActive').get(function(this: ICase & Document) {
  return this.status === CaseStatus.ACTIVE
})

caseSchema.virtual('isClosed').get(function(this: ICase & Document) {
  return this.status === CaseStatus.CLOSED
})

const CaseModel = mongoose.model<ICase>('Case', caseSchema)

export default CaseModel
