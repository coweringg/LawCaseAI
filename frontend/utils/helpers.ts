import { format } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs)
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd, yyyy HH:mm')
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-success-600 bg-success-50'
    case 'closed':
      return 'text-secondary-600 bg-secondary-50'
    case 'archived':
      return 'text-warning-600 bg-warning-50'
    default:
      return 'text-secondary-600 bg-secondary-50'
  }
}

export const getPlanColor = (plan: string): string => {
  switch (plan) {
    case 'basic':
      return 'text-secondary-600 bg-secondary-50'
    case 'professional':
      return 'text-primary-600 bg-primary-50'
    case 'enterprise':
      return 'text-warning-600 bg-warning-50'
    default:
      return 'text-secondary-600 bg-secondary-50'
  }
}
