import React from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Proceed',
  cancelText = 'Abort',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null

  const variantColors = {
    danger: {
      bg: 'bg-error-500/10',
      text: 'text-error-500',
      border: 'border-error-500/30',
      button: 'bg-error-500 hover:bg-error-600',
      glow: 'shadow-error-500/20',
      icon: AlertTriangle
    },
    warning: {
      bg: 'bg-warning-500/10',
      text: 'text-warning-500',
      border: 'border-warning-500/30',
      button: 'bg-warning-500 hover:bg-warning-600',
      glow: 'shadow-warning-500/20',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/30',
      button: 'bg-primary hover:bg-primary/80',
      glow: 'shadow-primary/20',
      icon: Info
    }
  }

  const activeVariant = variantColors[variant]
  const Icon = activeVariant.icon

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative inline-block w-full max-w-md transform overflow-hidden rounded-[40px] glass-dark border border-white/20 p-8 text-left align-middle shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transition-all">
          <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
          
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-500 hover:text-white hover:bg-white/5 transition-colors p-2 rounded-full z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-6 pt-4">
            {/* Icon Container */}
            <div className={cn(
              "p-5 rounded-3xl border-2 shadow-2xl transition-all duration-500",
              activeVariant.bg,
              activeVariant.border,
              activeVariant.glow
            )}>
              <Icon className={cn("w-10 h-10", activeVariant.text)} />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                {title}
              </h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full pt-6">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 text-slate-400 hover:text-white font-bold uppercase text-[11px] tracking-[0.2em]"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 px-8 py-4 h-auto rounded-2xl shadow-xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all transform hover:scale-[1.02]",
                  activeVariant.button,
                  activeVariant.glow
                )}
              >
                {isLoading ? 'Transmitting...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
