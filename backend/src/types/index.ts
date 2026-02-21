import { Document, Types } from 'mongoose'
import { Request } from 'express'

// Enums (defined first to be available for interfaces)
export enum UserRole {
  LAWYER = 'lawyer',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin'
}

export enum UserPlan {
  NONE = 'none',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ELITE = 'elite',
  ENTERPRISE = 'enterprise'
}

export enum CaseStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum EventType {
  DEADLINE = 'deadline',
  HEARING = 'hearing',
  MEETING = 'meeting',
  REVIEW = 'review',
  CONSULTATION = 'consultation',
  OTHER = 'other'
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export enum EventStatus {
  ACTIVE = 'active',
  CLOSED = 'closed'
}

export enum SupportRequestType {
  SYSTEM_ERROR = 'system_error',
  FEATURE_UPLINK = 'feature_uplink'
}

export enum SupportRequestStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export interface IPaymentMethod {
  id: string
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
}

export interface IOrganization extends Document {
  _id: Types.ObjectId
  name: string
  adminId: Types.ObjectId
  totalSeats: number
  usedSeats: number
  firmCode: string
  isActive: boolean
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  lawFirm: string
  role: UserRole
  plan: UserPlan
  planLimit: number
  currentCases: number
  status: UserStatus
  organizationId?: Types.ObjectId
  isOrgAdmin?: boolean
  emailNotifications: boolean
  caseUpdates: boolean
  aiResponses: boolean
  marketingEmails: boolean
  hoursSavedByAI: number
  hoursSavedToday: number
  lastHoursSavedReset: Date
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
  lastActivity: Date
  tokenVersion: number
  paymentMethods: IPaymentMethod[]
  defaultPaymentMethodId?: string
  comparePassword(candidatePassword: string): Promise<boolean>
  generateAuthToken(): string
}

export interface ICase extends Document {
  _id: Types.ObjectId
  name: string
  client: string
  description: string
  status: CaseStatus
  userId: Types.ObjectId
  practiceArea?: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  fileCount: number
}

export interface ICaseFile extends Document {
  _id: Types.ObjectId
  name: string
  originalName: string
  size: number
  type: string
  caseId: Types.ObjectId
  userId: Types.ObjectId
  url: string
  key: string
  uploadedAt: Date
}

export interface IChatMessage extends Document {
  _id: Types.ObjectId
  content: string
  sender: 'user' | 'ai'
  caseId: Types.ObjectId
  userId: Types.ObjectId
  timestamp: Date
  metadata?: {
    model?: string
    tokens?: number
    responseTime?: number
  }
}

export interface IEvent extends Document {
  _id: Types.ObjectId
  title: string
  description?: string
  start: Date
  end?: Date
  type: EventType
  priority: EventPriority
  caseId?: Types.ObjectId
  userId: Types.ObjectId
  location?: string
  isAllDay: boolean
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export interface ISupportRequest extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  userEmail: string
  userName: string
  type: SupportRequestType
  subject: string
  description: string
  status: SupportRequestStatus
  createdAt: Date
  updatedAt: Date
}

export interface IAdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCases: number
  newUsersThisMonth: number
}

export interface IAuthRequest extends Request {
  user?: IUser
}

export interface IJWTPayload {
  userId: string
  email: string
  role: string
  plan: string
  version: number
}

export interface IApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string | ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface IFileUploadResponse {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

export interface IChatResponse {
  response: string
  model: string
  tokens: number
  responseTime: number
}

export interface IUserRegistration {
  name: string
  email: string
  password: string
  lawFirm: string
  firmCode?: string
}

export interface IUserLogin {
  email: string
  password: string
}

export interface ICaseUpdate {
  name?: string
  client?: string
  description?: string
  status?: CaseStatus
}

export interface INotificationSettings {
  emailNotifications: boolean
  caseUpdates: boolean
  aiResponses: boolean
  marketingEmails: boolean
}

export interface IPlanLimits {
  none: number
  basic: number
  professional: number
  elite: number
  enterprise: number
}

export interface IValidationRule {
  field: string
  message: string
  rule: string
}

export interface IValidationError {
  field: string
  message: string
  value?: unknown
}

export interface IMiddlewareError extends Error {
  statusCode?: number
  code?: string
}

export const PLAN_LIMITS: IPlanLimits = {
  none: 0,
  basic: 8,
  professional: 18,
  elite: 100000,
  enterprise: 100000
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/jpg'
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
