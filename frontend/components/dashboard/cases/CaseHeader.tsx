"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';

interface CaseHeaderProps {
    caseData: any;
    isTrialExpired: boolean;
    onCloseCase: () => void;
}

export function CaseHeader({ caseData, isTrialExpired, onCloseCase }: CaseHeaderProps) {
    return (
        <header className="h-20 flex-none border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between px-8 relative overflow-hidden z-20">
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>
            <div className="flex items-center gap-6 relative z-10">
                <Link href="/cases">
                    <motion.div
                        whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.05)", transition: { duration: 0.15 } }}
                        className="p-3 text-slate-400 hover:text-primary rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                    >
                        <ArrowLeft size={20} />
                    </motion.div>
                </Link>
                <div className="h-10 w-px bg-white/10 mx-2"></div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider">{caseData?.client || 'Matrix Client'}</span>
                        <span className="w-1 h-1 bg-primary/40 rounded-full"></span>
                        <span className="text-[11px] font-bold text-primary tracking-wider">{caseData?.practiceArea || 'Neural Analysis'}</span>
                        {caseData?.complexity && (
                            <>
                                <span className="w-1 h-1 bg-primary/40 rounded-full"></span>
                                <span className={`text-[11px] font-bold tracking-wider ${
                                    caseData.complexity === '1' ? 'text-emerald-500' :
                                    caseData.complexity === '2' ? 'text-indigo-500' :
                                    'text-rose-500'
                                }`}>
                                    Lvl {caseData.complexity}
                                </span>
                            </>
                        )}
                    </div>
                    <h2 className="text-xl font-black text-white truncate max-w-[400px] font-display tracking-tightest leading-none">{caseData?.name || 'Loading Intelligence...'}</h2>
                </div>
            </div>

            <div className="flex items-center gap-5 relative z-10">
                <AnimatePresence>
                    {caseData?.status === 'active' && !isTrialExpired && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,50,50,0.1)", transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCloseCase}
                            className="px-6 py-2.5 premium-glass border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-2.5 shadow-xl"
                        >
                            <Lock size={12} />
                            Purge Workspace
                        </motion.button>
                    )}
                </AnimatePresence>
                <div className={`flex items-center gap-2.5 text-[10px] font-black px-5 py-2.5 rounded-xl border tracking-[0.2em] uppercase shadow-2xl backdrop-blur-2xl transition-all duration-200 ${caseData?.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-white/10'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${caseData?.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'}`}></div>
                    {caseData?.status || 'Active'}
                </div>
            </div>
        </header>
    );
}
