import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X, ShieldAlert } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  className
}) => {
  const icons = {
    success: CheckCircle,
    error: ShieldAlert,
    warning: AlertCircle,
    info: Info
  }

  const styles = {
    success: 'bg-primary/5 border-primary/20 text-primary shadow-[0_0_20px_rgba(0,230,118,0.05)]',
    error: 'bg-rose-500/5 border-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.05)]',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]',
    info: 'bg-sky-500/5 border-sky-500/20 text-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.05)]'
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-5 backdrop-blur-xl relative overflow-hidden',
        styles[type],
        className
      )}
    >
      <div className="absolute inset-0 micro-grid opacity-[0.05] pointer-events-none"></div>
      <div className="flex relative z-10">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-4 flex-1">
          {title && (
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
          )}
          <div className={cn('text-[11px] font-medium tracking-wide leading-relaxed opacity-90')}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
