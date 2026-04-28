import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ChevronRight, Zap } from 'lucide-react';

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
                        className="absolute inset-0 bg-[#02040A]/80 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[480px] bg-[#0A0D14] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="p-8 pb-6 flex justify-between items-start relative z-10">
                            <div>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                    <Zap className="text-primary w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    Expand Infrastructure
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Scale your firm&apos;s neural processing capacity.</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>

                        <div className="px-8 pb-8 relative z-10 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Neural Seats</label>
                                <div className="flex items-center justify-between p-2 bg-[#121620] rounded-2xl border border-white/5 shadow-inner">
                                    <button 
                                        onClick={() => setAdditionalSeats(Math.max(1, additionalSeats - 1))} 
                                        className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                                    >
                                        <span className="text-xl font-medium">-</span>
                                    </button>
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{additionalSeats}</span>
                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Seats</span>
                                    </div>
                                    <button 
                                        onClick={() => setAdditionalSeats(additionalSeats + 1)} 
                                        className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                                    >
                                        <span className="text-xl font-medium">+</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Commitment Subtotal</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">${subtotal.toLocaleString()}</span>
                                            <span className="text-sm font-medium text-slate-400">USD</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            ${monthlyPricePerSeat}/seat/mo ({billingInfo?.interval || 'monthly'})
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onConfirm}
                                disabled={isProcessing}
                                className="group relative w-full h-14 bg-white text-black font-black uppercase tracking-[0.1em] text-sm rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    {isProcessing ? (
                                        <Loader2 className="animate-spin text-black" size={20} />
                                    ) : (
                                        <>
                                            <Sparkles size={18} className="text-black" /> 
                                            Acquire Capacity
                                            <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
