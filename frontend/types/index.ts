export interface User {
  id: string
  email: string
  name: string
  role: 'lawyer' | 'admin'
  plan: 'basic' | 'professional' | 'enterprise'
  planLimit: number
  currentCases: number
  createdAt: string
  isActive: boolean
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
