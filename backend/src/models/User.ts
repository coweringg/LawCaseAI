import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import config from '../config'
import { IUser, UserRole, UserPlan, UserStatus } from '../types'

// Interface for static methods
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
    default: UserPlan.BASIC
  },
  planLimit: {
    type: Number,
    default: config.planLimits.basic
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
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
userSchema.index({ role: 1 })
userSchema.index({ status: 1 })
userSchema.index({ plan: 1 })
userSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Pre-save middleware to set plan limit based on plan
userSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    this.planLimit = config.planLimits[this.plan as UserPlan]
  }
  next()
})

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateAuthToken = function(): string {
  const payload: {
    userId: string;
    email: string;
    role: UserRole;
    plan: UserPlan;
  } = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
    plan: this.plan
  }
  
  const secret = config.jwt.secret
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as '7d' // Type assertion con un valor válido conocido
  }
  
  return jwt.sign(payload, secret, options)
}

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).select('+password')
}

userSchema.statics.updateLastLogin = function(userId: string) {
  return this.findByIdAndUpdate(userId, { lastLogin: new Date() })
}

// Virtuals
userSchema.virtual('isAtPlanLimit').get(function() {
  return this.currentCases >= this.planLimit
})

userSchema.virtual('planUsagePercentage').get(function() {
  return Math.round((this.currentCases / this.planLimit) * 100)
})

userSchema.virtual('remainingCases').get(function() {
  return Math.max(0, this.planLimit - this.currentCases)
})

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User
