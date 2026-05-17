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
  expiredPremium?: boolean
  expiredTrial?: boolean
  willCancelAtPeriodEnd?: boolean
  paddleSubscriptionId?: string
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
  recentCases: {
    id: string
    name: string
    client: string
    description: string
    lawyerId: string
    createdAt: string
    updatedAt: string
    status: 'active' | 'closed' | 'archived'
    fileCount: number
  }[]
  upcomingDeadlines: {
    title: string
    date: string
    priority: 'low' | 'medium' | 'high' | 'critical'
  }[]
}
