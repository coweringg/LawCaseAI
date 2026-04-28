import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';

interface DowngradeCapacityModalProps {
    isOpen: boolean;
    onClose: () => void;
    seatsToRemove: number;
    setSeatsToRemove: (seats: number) => void;
    maxAvailable: number;
    isProcessing: boolean;
    onConfirm: () => void;
}

export const DowngradeCapacityModal: React.FC<DowngradeCapacityModalProps> = ({
    isOpen,
    onClose,
    seatsToRemove,
    setSeatsToRemove,
    maxAvailable,
    isProcessing,
    onConfirm,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#02040A]/80 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[480px] bg-[#0A0D14] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                        
                        <div className="p-8 pb-6 flex justify-between items-start relative z-10">
                            <div>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                    <Trash2 className="text-red-500 w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    Optimize Infrastructure
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Reduce neural seats for the next billing cycle.</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>

                        <div className="px-8 pb-8 relative z-10 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seats to Decommission</label>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">
                                        {maxAvailable} Available
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-[#121620] rounded-2xl border border-white/5 shadow-inner">
                                    <button 
                                        onClick={() => setSeatsToRemove(Math.max(1, seatsToRemove - 1))} 
                                        className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                                    >
                                        <span className="text-xl font-medium">-</span>
                                    </button>
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{seatsToRemove}</span>
                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Seats</span>
                                    </div>
                                    <button 
                                        onClick={() => setSeatsToRemove(Math.min(maxAvailable, seatsToRemove + 1))} 
                                        className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                                    >
                                        <span className="text-xl font-medium">+</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                <p className="text-[11px] text-red-200/60 leading-relaxed">
                                    <span className="font-bold text-red-400">Notice:</span> Removal of seats will take effect at the beginning of your next billing period. Your current capacity will remain available until then.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onConfirm}
                                disabled={isProcessing || seatsToRemove <= 0}
                                className="w-full py-4 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Decommission
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
