import React from 'react'
import { cn } from '@/utils/helpers'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'standard' | 'glass'
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'standard', ...props }) => {
  const isGlass = variant === 'glass'
  return (
    <div
      className={cn(
        isGlass 
          ? 'glass border-white/10 shadow-xl overflow-hidden' 
          : 'bg-white rounded-xl shadow-sm border border-secondary-200',
        'p-0', // Admin dashboard uses p-0 for table containers, we'll handle padding in components
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('mb-4 px-6 pt-6', className)} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <h3 className={cn('text-lg font-bold text-slate-800 dark:text-white', className)}>
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)}>
      {children}
    </p>
  )
}

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-100 dark:border-white/5 px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
}
