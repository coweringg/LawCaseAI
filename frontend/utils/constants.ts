export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const PLAN_LIMITS = {
  basic: 5,
  professional: 25,
  enterprise: 100
}

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024 // 10MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
]

export const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CASES: '/dashboard/cases',
  CASE_DETAIL: '/dashboard/cases/[id]',
  SETTINGS: '/dashboard/settings',
  ADMIN: '/admin'
}
