"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, CheckCircle, Zap, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface CaseRightSidebarProps {
    activeTab: 'summary' | 'search' | 'notes';
    setActiveTab: (tab: 'summary' | 'search' | 'notes') => void;
    caseData: any;
    caseSummary: string | null;
    isLoadingSummary: boolean;
    onGenerateSummary: () => void;
    onViewFullAnalysis: () => void;
    isUploadingTemp: boolean;
    temporaryFileId: string | null;
    filesCount: number;
}

export function CaseRightSidebar({
    activeTab,
    setActiveTab,
    caseData,
    caseSummary,
    isLoadingSummary,
    onGenerateSummary,
    onViewFullAnalysis,
    isUploadingTemp,
    temporaryFileId,
    filesCount
}: CaseRightSidebarProps) {
    return (
        <aside className="w-64 flex-none flex flex-col bg-white/[0.01] border-l border-white/10 backdrop-blur-3xl overflow-hidden relative group/right">
            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/right:scale-[1.6] transition-transform duration-1000"></div>
            
            <div className="grid grid-cols-2 bg-white/[0.02] border-b border-white/10 p-1.5 m-3 rounded-[1.5rem] premium-glass relative z-10">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'summary' ? 'bg-primary text-white shadow-xl border border-white/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <List size={12} />
                    Abstract
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'search' ? 'bg-primary text-white shadow-xl border border-white/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <CheckCircle size={12} />
                    Metrics
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'summary' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 shadow-2xl relative overflow-hidden group/card hover:border-primary/30 transition-all duration-200">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                            <Zap size={14} fill="currentColor" />
                                        </div>
                                        <h3 className="text-[11px] font-bold text-white tracking-wider">Case Synopsis</h3>
                                    </div>
                                    <motion.button
                                        whileHover={{ rotate: 180 }}
                                        onClick={onGenerateSummary}
                                        disabled={isLoadingSummary}
                                        className="p-2 text-slate-500 hover:text-primary transition-all disabled:opacity-30"
                                    >
                                        <span className={`material-icons-round text-sm ${isLoadingSummary ? 'animate-spin' : ''}`}>sync</span>
                                    </motion.button>
                                </div>

                                {caseSummary ? (
                                    <div className="space-y-3 relative z-10">
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(37,99,235,0.3)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onViewFullAnalysis}
                                            className="w-full group relative overflow-hidden bg-primary/10 border border-primary/30 hover:border-primary/60 p-5 rounded-[1.5rem] transition-all text-center"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-3 shadow-inner group-hover:scale-110 transition-transform">
                                                <span className="material-icons-round text-2xl">psychology</span>
                                            </div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Neural Synopsis</h4>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Intelligence Ready</p>
                                            </div>
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 relative z-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                        <p className="text-[11px] font-bold text-slate-600 tracking-wider mb-6">No Analysis Available</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={onGenerateSummary}
                                            className="px-6 py-3 bg-primary text-white text-[10px] font-bold tracking-widest rounded-xl shadow-xl transition-all"
                                        >
                                            Analyze Case
                                        </motion.button>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <span className="text-[9px] font-bold text-slate-600 tracking-widest">Confidence Index</span>
                                    <span className="text-[11px] font-bold text-emerald-400">98.4%</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-500 tracking-widest px-2">System Metadata</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { label: 'Created On', val: format(new Date(caseData?.createdAt || Date.now()), 'MMM d, yyyy'), icon: Clock },
                                        { label: 'Practice Domain', val: caseData?.practiceArea || 'General', icon: Shield },
                                        { label: 'Priority Level', val: 'High', icon: Zap }
                                    ].map((it, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 premium-glass border border-white/5 rounded-2xl shadow-lg">
                                            <div className="flex items-center gap-3">
                                                <it.icon size={12} className="text-slate-500" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{it.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-tightest">{it.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'search' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="premium-glass border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-[11px] font-black text-white mb-2 uppercase tracking-[0.3em] relative z-10">Neural Readiness</h3>
                                <p className="text-[9px] font-black text-slate-500 mb-8 uppercase tracking-widest relative z-10 leading-relaxed">
                                    {isUploadingTemp ? (
                                        <span className="text-amber-500 animate-pulse">Synchronizing Neural Core...</span>
                                    ) : temporaryFileId ? (
                                        <span className="text-primary">Analysis Unit Staged & Ready</span>
                                    ) : filesCount > 0 ? (
                                        `${filesCount} Units Analyzed & Successfully Indexed`
                                    ) : (
                                        'Waiting for Data Ingestion...'
                                    )}
                                </p>
                                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5 p-0.5 relative z-10">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ 
                                            width: isUploadingTemp ? '40%' : 
                                                   temporaryFileId ? '100%' : 
                                                   filesCount > 0 ? '100%' : '0%' 
                                        }}
                                        className={`h-full rounded-full shadow-lg transition-all duration-1000 ${
                                            isUploadingTemp ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                                            'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                        }`}
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
}
