import mongoose, { Schema } from 'mongoose'
import { IOrganization } from '../types'

const organizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin reference is required']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Must have at least 1 seat']
  },
  usedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  firmCode: {
    type: String,
    required: [true, 'Firm code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stripeSubscriptionId: {
    type: String
  }
}, {
  timestamps: true
})

// Index for fast code lookup
organizationSchema.index({ firmCode: 1 })

const Organization = mongoose.model<IOrganization>('Organization', organizationSchema)

export default Organization
