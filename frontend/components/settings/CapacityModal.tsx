import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, Zap } from 'lucide-react';
import React from 'react';

interface CapacityModalProps {
    isOpen: boolean;
    onClose: () => void;
    additionalSeats: number;
    setAdditionalSeats: (seats: number) => void;
    paymentData: any;
    setPaymentData: (data: any) => void;
    isProcessing: boolean;
    onConfirm: () => void;
    billingInfo: any;
}

export const CapacityModal: React.FC<CapacityModalProps> = ({
    isOpen,
    onClose,
    additionalSeats,
    setAdditionalSeats,
    isProcessing,
    onConfirm,
    billingInfo
}) => {
    const monthlyPricePerSeat = billingInfo?.interval === 'annual' ? 240 : 300;
    const subtotal = additionalSeats * monthlyPricePerSeat * (billingInfo?.interval === 'annual' ? 12 : 1);

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
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                        
                        <div className="p-10 pb-6 relative z-10">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tightest leading-none mb-1.5">
                                        Expand Capacity
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Acquire Neural Nodes</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Additional Seat Allocation</label>
                                    <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-2xl border border-white/10">
                                        <button 
                                            onClick={() => setAdditionalSeats(Math.max(1, additionalSeats - 1))} 
                                            className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 border border-white/5"
                                        >
                                            <span className="text-2xl font-light">-</span>
                                        </button>
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white tracking-tighter">{additionalSeats}</span>
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">New Nodes</span>
                                        </div>
                                        <button 
                                            onClick={() => setAdditionalSeats(additionalSeats + 1)} 
                                            className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95 border border-white/5"
                                        >
                                            <span className="text-2xl font-light">+</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-end relative z-10">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol Commitment</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-white tracking-tighter">${subtotal.toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">USD</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                                ${monthlyPricePerSeat}/node/{billingInfo?.interval === 'annual' ? 'yr' : 'mo'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={onConfirm}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-background-dark text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,230,118,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> 
                                                Initialize Acquisition
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-white/5"
                                    >
                                        Abort Request
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
