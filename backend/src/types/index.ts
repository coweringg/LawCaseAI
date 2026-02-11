import { Document, Types } from 'mongoose'
import { Request } from 'express'

// Enums (defined first to be available for interfaces)
export enum UserRole {
  LAWYER = 'lawyer',
  ADMIN = 'admin'
}

export enum UserPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export enum CaseStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUSPENDED = 'suspended'
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
  emailNotifications: boolean
  caseUpdates: boolean
  aiResponses: boolean
  marketingEmails: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
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
  createdAt: Date
  updatedAt: Date
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
  basic: number
  professional: number
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
  basic: 5,
  professional: 25,
  enterprise: 100
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
