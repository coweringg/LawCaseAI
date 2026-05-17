import { cn } from '@/utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, ShieldAlert } from 'lucide-react';
import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    children?: React.ReactNode;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false,
    children
}: ConfirmModalProps) {
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
                        className="bg-[#0c0c12] w-full max-w-md rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden relative z-10"
                    >
                        <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

                        <div className="p-8 md:p-12 text-center relative z-10">
                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto border-2 transition-all duration-500",
                                isDestructive 
                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]' 
                                    : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_30px_rgba(0,230,118,0.2)]'
                            )}>
                                {isDestructive ? <ShieldAlert size={40} /> : <Info size={40} />}
                            </div>

                            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tightest leading-none">
                                {title}
                            </h2>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-8 leading-relaxed px-4">
                                {message}
                            </p>

                            {children}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={cn(
                                        "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-[0.98] shadow-2xl",
                                        isDestructive
                                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                                            : 'bg-primary hover:bg-primary/90 text-background-dark shadow-primary/40'
                                    )}
                                >
                                    {confirmLabel}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all"
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
