import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import config from '../config'
import { IUser, UserRole, UserPlan, UserStatus } from '../types'
export interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>
  updateLastLogin(userId: string): Promise<IUser | null>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  lawFirm: {
    type: String,
    required: [true, 'Law firm is required'],
    trim: true,
    maxlength: [200, 'Law firm name cannot exceed 200 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.LAWYER
  },
  plan: {
    type: String,
    enum: Object.values(UserPlan),
    default: UserPlan.NONE
  },
  planLimit: {
    type: Number,
    default: 100000
  },
  currentCases: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  },
  isOrgAdmin: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  caseUpdates: {
    type: Boolean,
    default: true
  },
  aiResponses: {
    type: Boolean,
    default: false
  },
  marketingEmails: {
    type: Boolean,
    default: false
  },
  hoursSavedByAI: {
    type: Number,
    default: 0,
    min: 0
  },
  hoursSavedToday: {
    type: Number,
    default: 0,
    min: 0
  },
  lastHoursSavedReset: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  lastActivity: {
    type: Date
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  savedLoginToken: {
    type: String,
    select: false
  },
  paymentMethods: [{
    id: { type: String, required: true },
    brand: { type: String, required: true },
    last4: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true }
  }],
  defaultPaymentMethodId: {
    type: String
  },
  totalTokensConsumed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalStorageUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  billingInterval: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  currentPeriodEnd: {
    type: Date
  },
  isTrialUsed: {
    type: Boolean,
    default: false
  },
  trialStartedAt: {
    type: Date
  },
  trialCaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  expiredPremium: {
    type: Boolean,
    default: false
  },
  expiredTrial: {
    type: Boolean,
    default: false
  },
  customLimits: {
    maxCases: Number,
    maxTokens: Number,
    maxTotalStorage: Number,
    maxFilesPerCase: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

userSchema.index({ role: 1 })
userSchema.index({ status: 1 })
userSchema.index({ plan: 1 })
userSchema.index({ createdAt: -1 })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

userSchema.pre('save', function (next) {
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateAuthToken = function (): string {
  const payload: {
    userId: string;
    email: string;
    role: UserRole;
    plan: UserPlan;
    version: number;
  } = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
    plan: this.plan,
    version: this.tokenVersion || 0
  }

  const secret = config.jwt.secret
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as '7d'
  }

  return jwt.sign(payload, secret, options)
}

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password')
}

userSchema.statics.updateLastLogin = function (userId: string) {
  return this.findByIdAndUpdate(userId, { lastLogin: new Date() })
}

userSchema.virtual('isAtPlanLimit').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return (
    this.currentCases >= limits.maxCases ||
    this.totalTokensConsumed >= limits.maxTokens ||
    this.totalStorageUsed >= limits.maxTotalStorage
  )
})

userSchema.virtual('planUsagePercentage').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  
  const caseUsage = (this.currentCases / limits.maxCases) * 100
  const tokenUsage = (this.totalTokensConsumed / limits.maxTokens) * 100
  const storageUsage = (this.totalStorageUsed / limits.maxTotalStorage) * 100
  
  return Math.round(Math.max(caseUsage, tokenUsage, storageUsage))
})

userSchema.virtual('remainingCases').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return Math.max(0, limits.maxCases - this.currentCases)
})

userSchema.virtual('remainingTokens').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return Math.max(0, limits.maxTokens - this.totalTokensConsumed)
})

userSchema.virtual('remainingStorage').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return Math.max(0, limits.maxTotalStorage - this.totalStorageUsed)
})

userSchema.virtual('maxCases').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return this.customLimits?.maxCases || limits.maxCases
})

userSchema.virtual('maxTokens').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return this.customLimits?.maxTokens || limits.maxTokens
})

userSchema.virtual('maxTotalStorage').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return this.customLimits?.maxTotalStorage || limits.maxTotalStorage
})

userSchema.virtual('maxFilesPerCase').get(function () {
  const limits = (config.planLimits as any)[this.plan] || config.planLimits.basic
  return this.customLimits?.maxFilesPerCase || limits.maxFilesPerCase
})

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User
