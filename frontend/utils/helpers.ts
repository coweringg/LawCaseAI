import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'

export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs)
}

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  return format(dateObj, 'MMM dd, yyyy')
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}
