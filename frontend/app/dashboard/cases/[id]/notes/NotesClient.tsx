"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
    Loader2, 
    Gavel, 
    ChevronRight, 
    CloudCheck, 
    FileText as FileIcon, 
    History, 
    Paperclip, 
    Settings, 
    Bold, 
    Italic, 
    Underline, 
    List, 
    ListOrdered, 
    Zap, 
    UserPlus, 
    Send,
    ExternalLink
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { motion } from 'framer-motion';

export default function NotesClient() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#05060a]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#05060a] text-slate-200 min-h-screen flex flex-col font-display">
            <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-primary font-black text-xl hover:opacity-80 transition-opacity">
                        <Gavel size={24} />
                        <span className="tracking-tightest">LawCaseAI</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Cases</Link>
                            <ChevronRight size={10} />
                            <Link href={`/dashboard/cases/${id}`} className="hover:text-primary transition-colors">Smith v. Jones</Link>
                            <ChevronRight size={10} />
                            <span className="text-slate-400">Internal Notes</span>
                        </div>
                        <h1 className="text-[13px] font-black text-white uppercase tracking-tightest">Memo: Initial Discovery Analysis - Case #{id || '4429'}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <CloudCheck size={14} className="text-emerald-500" />
                        <span>Auto-saved at 2:45 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                            <FileIcon size={16} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all border border-white/10">
                            <UserPlus size={16} />
                            <span className="hidden sm:inline">Collaboration</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-16 flex flex-col items-center py-6 border-r border-white/10 bg-black/20 hidden md:flex">
                    <button className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6 transition-colors border border-primary/30 shadow-lg shadow-primary/10">
                        <FileIcon size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-xl text-slate-500 hover:bg-white/5 flex items-center justify-center mb-4 transition-colors border border-transparent hover:border-white/10">
                        <History size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-xl text-slate-500 hover:bg-white/5 flex items-center justify-center mb-4 transition-colors border border-transparent hover:border-white/10">
                        <Paperclip size={20} />
                    </button>
                    <div className="mt-auto">
                        <button className="w-10 h-10 rounded-xl text-slate-500 hover:bg-white/5 flex items-center justify-center mb-4 transition-colors border border-transparent hover:border-white/10">
                            <Settings size={20} />
                        </button>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto bg-[#05060a] flex flex-col items-center pt-8 pb-20 px-4 md:px-0 scrollbar-hide relative">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                    
                    <div className="mb-8 flex items-center gap-1 bg-black/60 backdrop-blur-3xl p-1.5 rounded-2xl shadow-2xl border border-white/10 sticky top-4 z-10 transition-colors">
                        <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Bold size={18} /></button>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Italic size={18} /></button>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Underline size={18} /></button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1.5"></div>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><List size={18} /></button>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><ListOrdered size={18} /></button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1.5"></div>
                        <button className="p-2.5 bg-primary/20 rounded-xl text-primary transition-all border border-primary/30"><Zap size={18} /></button>
                    </div>

                    <div className="w-full max-w-[850px] bg-white/[0.02] backdrop-blur-3xl shadow-2xl border border-white/10 rounded-[2.5rem] min-h-[850px] p-12 md:p-20 relative transition-all group overflow-hidden">
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover:scale-[1.6] transition-transform duration-1000"></div>
                        
                        <div className="flex items-center gap-3 mb-12 relative z-10">
                            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">Draft Dossier</span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Created Oct 24, 2023 &bull; Level 4 Confidential</span>
                        </div>
                        
                        <article className="relative z-10">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tightest leading-tight uppercase italic italic">Discovery Phase: Plaintiff Interrogatories</h2>
                            <div className="space-y-8 text-[15px] font-medium leading-relaxed text-slate-300">
                                <p>
                                    Following the initial review of the motion to dismiss filed by the defendant, we must pivot our focus toward the discovery phase. The primary objective of this memo is to outline the key points of contention that will be addressed in the first set of interrogatories.
                                </p>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest pt-4">1. Fact Pattern Analysis</h3>
                                <p>
                                    The incident occurred on July 14th at approximately 18:30 hours. Witness statements from the site manager (Ex. B) suggest that the maintenance logs were not updated for a period of 72 hours prior to the equipment failure.
                                </p>
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-primary/5 border-l-4 border-primary p-8 rounded-2xl mb-8 group/quote relative shadow-2xl overflow-hidden"
                                >
                                    <div className="absolute inset-0 crystallography-pattern opacity-[0.05] pointer-events-none"></div>
                                    <p className="italic text-slate-300 relative z-10 text-lg">
                                        &ldquo;The defendant owed a duty of care to the plaintiff to maintain premises in a reasonably safe condition...&rdquo;
                                    </p>
                                    <button className="absolute -right-2 top-4 p-2 bg-black/60 backdrop-blur-xl shadow-2xl border border-white/10 rounded-xl text-primary hover:scale-110 transition-all opacity-0 group-hover/quote:opacity-100 flex items-center justify-center">
                                        <Zap size={16} />
                                    </button>
                                </motion.div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest pt-4">2. Applicable Statutes</h3>
                                <ul className="space-y-4 text-slate-400 list-none pl-0">
                                    {[
                                        'State Civil Code § 1714: Responsibility for willful acts and negligence.',
                                        'Occupational Safety and Health Act (OSHA) 29 CFR 1910.',
                                        'Relevant precedents in Walker v. Superior Court (1988) regarding statutory interpretation.'
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 items-start font-black uppercase tracking-widest text-[11px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-lg shadow-primary/40"></div>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    </div>
                </main>

                <aside className="w-80 border-l border-white/10 bg-black/20 flex flex-col hidden xl:flex overflow-hidden relative group/side">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/side:scale-[1.6] transition-transform duration-1000"></div>
                    
                    <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border border-white/20">
                                <Zap size={16} className="text-white" />
                            </div>
                            <span className="font-black text-white uppercase tracking-[0.2em] text-[11px]">Neural Core</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10">
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-3xl hover:border-primary/40 transition-all cursor-pointer group/card shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <Zap size={18} className="text-primary" />
                                <h4 className="font-black text-[11px] text-white uppercase tracking-widest">Synthesis Refinement</h4>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed mb-6 italic">Adjust tone to be more formal, concise, or persuasive.</p>
                            <div className="flex gap-3 relative z-10">
                                <button className="flex-1 py-2 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 rounded-lg hover:border-primary hover:text-white transition-all">Formalize</button>
                                <button className="flex-1 py-2 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/10 rounded-lg hover:border-primary hover:text-white transition-all">Compress</button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-6">Autonomous Insight</span>
                            <div className="bg-black/40 backdrop-blur-3xl rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-2xl group/insight">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                                <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
                                <p className="text-[11px] font-black text-slate-300 leading-relaxed italic uppercase tracking-widest relative z-10">
                                    &ldquo;Consider citing the 2021 amendment to Civil Code &sect; 1714 for more specific liability definitions.&rdquo;
                                </p>
                                <button className="mt-6 text-[9px] font-black text-primary flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 uppercase tracking-[0.2em]">
                                    <span>Sync Suggestion</span>
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/40 relative z-10">
                        <div className="relative group/search">
                            <input className="w-full bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 pl-5 pr-12 focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder-slate-600 text-white shadow-2xl" placeholder="Query AI Core..." type="text" />
                            <button className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all border border-white/10">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
