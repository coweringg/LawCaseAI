import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Loader2, Sparkles } from 'lucide-react';

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
    paymentData,
    setPaymentData,
    isProcessing,
    onConfirm,
    billingInfo
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg glass-dark rounded-[40px] shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                        <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Layers className="text-primary" />
                                Expand Infrastructure
                            </h3>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-10 relative z-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Neural Seats</label>
                                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <button onClick={() => setAdditionalSeats(Math.max(1, additionalSeats - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white">-</button>
                                    <span className="flex-1 text-center text-2xl font-black text-white">{additionalSeats}</span>
                                    <button onClick={() => setAdditionalSeats(additionalSeats + 1)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white">+</button>
                                </div>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider text-center">
                                    Subtotal: ${(additionalSeats * (billingInfo?.interval === 'annual' ? 249 : 300)).toLocaleString()} USD commitment
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorization Key (Mock Card)</label>
                                <input
                                    type="text"
                                    placeholder="4111 1111 1111 1111"
                                    value={paymentData.cardNumber}
                                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold"
                                />
                            </div>

                            <button
                                onClick={onConfirm}
                                disabled={isProcessing}
                                className="w-full py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Acquire Capacity</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
