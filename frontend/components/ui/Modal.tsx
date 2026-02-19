import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  variant?: 'standard' | 'glass'
  allowScroll?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  variant = 'standard',
  allowScroll = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const isGlass = variant === 'glass'

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className={cn(
            "fixed inset-0 transition-opacity",
            isGlass ? "bg-black/60 backdrop-blur-md" : "bg-black bg-opacity-50"
          )}
          onClick={onClose}
        />
        
        <div 
          className={cn(
            'relative w-full shadow-2xl transform transition-all overflow-hidden',
            isGlass 
              ? 'glass-dark rounded-[40px] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]' 
              : 'bg-white rounded-xl',
            sizeClasses[size]
          )}
        >
          {isGlass && <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>}
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                "absolute right-6 top-6 transition-colors p-2 rounded-full z-20",
                isGlass 
                  ? "text-slate-500 hover:text-white hover:bg-white/5" 
                  : "text-secondary-400 hover:text-secondary-600"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {title && (
            <div className={cn(
              "px-8 py-6 relative z-10",
              isGlass ? "border-b border-white/10" : "border-b border-secondary-100"
            )}>
              <h2 className={cn(
                "text-xl font-black uppercase tracking-widest",
                isGlass ? "text-white" : "text-secondary-900"
              )}>
                {title}
              </h2>
            </div>
          )}
          
          <div className={cn(
            "px-8 py-8 relative z-10",
            isGlass ? "text-white" : "text-secondary-700",
            allowScroll ? "max-h-[70vh] overflow-y-auto custom-scrollbar" : ""
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
