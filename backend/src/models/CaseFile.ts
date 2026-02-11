import mongoose, { Schema, Document } from 'mongoose'
import { ICaseFile } from '../types'

const caseFileSchema = new Schema<ICaseFile>({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'File type is required']
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
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  key: {
    type: String,
    required: [true, 'File key is required'],
    unique: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
caseFileSchema.index({ caseId: 1 })
caseFileSchema.index({ userId: 1 })
caseFileSchema.index({ uploadedAt: -1 })

// Pre-remove middleware to update case file count
caseFileSchema.pre('deleteOne', { document: true, query: false }, async function(this: ICaseFile & Document, next: (err?: Error) => void) {
  try {
    const Case = mongoose.model('Case')
    await Case.findByIdAndUpdate(this.caseId, { $inc: { fileCount: -1 } })
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Static methods
caseFileSchema.statics.findByCase = function(caseId: string) {
  return this.find({ caseId }).sort({ uploadedAt: -1 })
}

caseFileSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ uploadedAt: -1 })
}

caseFileSchema.statics.countByCase = function(caseId: string) {
  return this.countDocuments({ caseId })
}

// Virtuals
caseFileSchema.virtual('sizeFormatted').get(function(this: ICaseFile & Document) {
  const bytes = this.size
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

caseFileSchema.virtual('isImage').get(function(this: ICaseFile & Document) {
  return this.type.startsWith('image/')
})

caseFileSchema.virtual('isDocument').get(function(this: ICaseFile & Document) {
  return this.type.includes('application/') || this.type === 'text/plain'
})

const CaseFileModel = mongoose.model<ICaseFile>('CaseFile', caseFileSchema)

export default CaseFileModel
