import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    type = 'info'
}) => {
    const icons = {
        danger: ShieldAlert,
        warning: AlertCircle,
        info: Info
    };

    const colors = {
        danger: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        info: 'text-primary bg-primary/10 border-primary/20'
    };

    const buttonStyles = {
        danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40',
        warning: 'bg-amber-500 hover:bg-amber-400 text-background-dark shadow-amber-900/40',
        info: 'bg-primary hover:bg-primary/90 text-background-dark shadow-primary/40'
    };

    const Icon = icons[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md bg-[#0c0c12] border border-white/10 p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] text-center overflow-hidden"
                    >
                        <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

                        <div className={cn(
                            "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border shadow-2xl relative z-10",
                            colors[type]
                        )}>
                            <Icon size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tightest leading-none mb-4 relative z-10">
                            {title}
                        </h3>
                        <p className="text-[13px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed mb-10 relative z-10 opacity-80">
                            {message}
                        </p>

                        <div className="flex flex-col gap-3 relative z-10">
                            <button
                                onClick={onConfirm}
                                className={cn(
                                    "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl",
                                    buttonStyles[type]
                                )}
                            >
                                Execute Protocol
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-white/5"
                            >
                                Abort Sequence
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
