import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import React from 'react';

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
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md bg-[#0c0c12] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden"
                    >
                        <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                        
                        <div className="p-10 pb-6 relative z-10">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-2xl">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tightest leading-none mb-1.5">
                                        Optimize Nodes
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Scale Down Infrastructure</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Seats to Decommission</label>
                                        <span className="text-[9px] text-primary font-black uppercase tracking-widest">
                                            {maxAvailable} Available
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                                        <button 
                                            onClick={() => setSeatsToRemove(Math.max(1, seatsToRemove - 1))} 
                                            className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 border border-white/5"
                                        >
                                            <span className="text-2xl font-light">-</span>
                                        </button>
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white tracking-tighter">{seatsToRemove}</span>
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Seats</span>
                                        </div>
                                        <button 
                                            onClick={() => setSeatsToRemove(Math.min(maxAvailable, seatsToRemove + 1))} 
                                            className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 border border-white/5"
                                        >
                                            <span className="text-2xl font-light">+</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                    <p className="text-[11px] text-rose-200/60 leading-relaxed font-bold uppercase tracking-wider">
                                        <span className="text-rose-500">Protocol:</span> Removal will execute at the start of the next cycle. Current capacity remains active until termination.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={onConfirm}
                                        disabled={isProcessing || seatsToRemove <= 0}
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Execute Decommission'
                                        )}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-white/5"
                                    >
                                        Abort sequence
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
