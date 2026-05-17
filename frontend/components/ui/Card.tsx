import { cn } from '@/utils/helpers'
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'standard' | 'glass' | 'none'
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'standard', ...props }) => {
  const isGlass = variant === 'glass'
  const isNone = variant === 'none'
  return (
    <div
      className={cn(
        isGlass 
          ? 'glass border-white/10 shadow-xl overflow-hidden' 
          : isNone 
            ? '' 
            : 'bg-white rounded-xl shadow-sm border border-secondary-200',
        'p-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
}
