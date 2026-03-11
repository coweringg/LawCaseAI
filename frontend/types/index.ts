export interface User {
  id: string
  email: string
  name: string
  lawFirm?: string
  role: 'lawyer' | 'admin'
  plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise'
  planLimit: number
  currentCases: number
  createdAt: string
  isActive: boolean
  lastLogin?: string
  organizationId?: string
  isOrgAdmin?: boolean
  isTrialUsed?: boolean
  trialStartedAt?: string
  trialCaseId?: string
  totalTokensConsumed?: number
  totalStorageUsed?: number
  maxTokens?: number
  maxTotalStorage?: number
  billingInterval?: 'monthly' | 'annual'
}

export interface IOrganization {
  id: string
  name: string
  firmCode: string
  totalSeats: number
  usedSeats: number
  isActive: boolean
  isOrgAdmin: boolean
}

export interface DashboardDeadline {
  title: string
  date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface DashboardStats {
  hoursSaved: {
    today: number
    total: number
  }
  cases: {
    active: number
    limit: number
    usagePercentage: number
    closed: number
  }
  documents: {
    total: number
  }
  recentCases: Case[]
  upcomingDeadlines: DashboardDeadline[]
}

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
}

export interface BillingInfo {
  plan: string
  currentCases: number
  planLimit: number
  remainingCases: number
  planUsagePercentage: number
  paymentMethods: PaymentMethod[]
  defaultPaymentMethodId: string
  nextBillingDate: string
  amount: number
  interval?: 'monthly' | 'annual'
}

export interface Purchase {
  _id: string
  date: string
  plan: string
  amount: number
  status: 'succeeded' | 'failed' | 'pending'
  invoiceUrl: string
}

export interface CalendarEvent {
  _id: string
  title: string
  description?: string
  start: string
  end: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'closed'
  type: string
  location?: string
  caseId?: string
}

export interface Case {
  id: string
  name: string
  client: string
  description: string
  lawyerId: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'closed' | 'archived'
  fileCount: number
}

export interface CaseFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  caseId: string
  uploadedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  caseId: string
}

export interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  caseLimit: number
  popular?: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface CaseState {
  cases: Case[]
  currentCase: Case | null
  isLoading: boolean
  error: string | null
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export interface FileState {
  files: CaseFile[]
  isUploading: boolean
  uploadProgress: number
  error: string | null
}
