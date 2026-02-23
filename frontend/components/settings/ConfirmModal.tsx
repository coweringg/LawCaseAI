import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass-dark p-10 rounded-[40px] border border-white/10 shadow-3xl text-center overflow-hidden"
                    >
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>

                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border ${type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                    'bg-primary/10 border-primary/20 text-primary'
                            }`}>
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
                            {message}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5"
                            >
                                Abort
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' :
                                        type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' :
                                            'bg-primary hover:bg-primary-hover shadow-primary/20'
                                    }`}
                            >
                                Confirm Connection
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
