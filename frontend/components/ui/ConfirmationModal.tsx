import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, X, ShieldAlert } from 'lucide-react'
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
  const variantColors = {
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-500',
      border: 'border-rose-500/20',
      button: 'bg-rose-600 hover:bg-rose-500',
      glow: 'shadow-rose-900/40',
      icon: ShieldAlert
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      button: 'bg-amber-500 hover:bg-amber-400',
      glow: 'shadow-amber-900/40',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/20',
      button: 'bg-primary hover:bg-primary/90',
      glow: 'shadow-primary/40',
      icon: Info
    }
  }

  const activeVariant = variantColors[variant]
  const Icon = activeVariant.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0c0c12] rounded-[2.5rem] border border-white/10 p-8 md:p-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
            
            <button
              onClick={onClose}
              className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors p-2 rounded-full z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center space-y-8">
              <div className={cn(
                "w-20 h-20 rounded-3xl border-2 flex items-center justify-center shadow-2xl transition-all duration-500",
                activeVariant.bg,
                activeVariant.border,
                activeVariant.text
              )}>
                <Icon size={40} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tightest leading-none">
                  {title}
                </h3>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed px-4">
                  {message}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    onConfirm()
                    if (!isLoading) onClose()
                  }}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-[0.98] shadow-2xl",
                    activeVariant.button,
                    variant === 'info' ? 'text-background-dark' : 'text-white'
                  )}
                >
                  {isLoading ? 'Transmitting...' : confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
