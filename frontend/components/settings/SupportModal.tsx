import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    supportData: any;
    setSupportData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const SupportModal: React.FC<SupportModalProps> = ({
    isOpen,
    onClose,
    supportData,
    setSupportData,
    onSubmit,
    isSubmitting
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
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="relative w-full max-w-xl glass-dark rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden"
                    >
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                        <div className="p-8 border-b border-white/10 flex justify-between items-center relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Sparkles className="text-primary" />
                                Initialize Support
                            </h3>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="p-10 space-y-8 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    type="button"
                                    onClick={() => setSupportData({ ...supportData, type: 'system_error' })}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${supportData.type === 'system_error' ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                                >
                                    <span className={`material-icons-round text-2xl ${supportData.type === 'system_error' ? 'text-red-500' : 'text-slate-600'}`}>report_problem</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Error</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSupportData({ ...supportData, type: 'feature_uplink' })}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${supportData.type === 'feature_uplink' ? 'border-primary/50 bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                                >
                                    <span className={`material-icons-round text-2xl ${supportData.type === 'feature_uplink' ? 'text-primary' : 'text-slate-600'}`}>rocket_launch</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Feature Uplink</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Header</label>
                                <input
                                    type="text"
                                    required
                                    value={supportData.subject}
                                    onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                    placeholder="Transmission summary..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Log</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={supportData.description}
                                    onChange={(e) => setSupportData({ ...supportData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold resize-none"
                                    placeholder="Provide technical specifics..."
                                />
                            </div>

                            <div className="flex justify-end gap-5 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <span className="material-icons-round text-base">send</span>}
                                    Broadcast Stream
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
