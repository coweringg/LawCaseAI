"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Lock, 
    History, 
    Printer, 
    RotateCcw, 
    Bot, 
    FileText, 
    Download, 
    CheckCircle, 
    Zap,
    Archive as ArchiveIcon,
    LayoutDashboard,
    Folder
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function ArchiveClient() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden relative">
                <div className="bg-slate-900/40 border-b border-white/5 px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest z-20">
                    <div className="flex items-center text-slate-500 gap-3">
                        <Lock size={12} className="text-amber-500/60" />
                        Archived Case • Read-Only Terminal • Closed Feb 14, 2026
                    </div>
                    <button className="text-primary hover:text-white flex items-center gap-2 transition-colors">
                        <History size={12} />
                        View Audit Protocol
                    </button>
                </div>

                <header className="h-20 flex-none border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between px-8 relative overflow-hidden z-20">
                    <div className="flex items-center gap-6 relative z-10">
                        <Link href="/dashboard">
                            <div className="p-3 text-slate-400 hover:text-primary rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10">
                                <ArrowLeft size={20} />
                            </div>
                        </Link>
                        <div className="h-10 w-px bg-white/10 mx-2"></div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-black text-white truncate max-w-[400px] tracking-tightest leading-none font-display">Estate of J. Doe v. Smith</h2>
                                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase tracking-widest">Closed</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <span>Case ID: #{id}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                <span>Probate</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button className="px-6 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 rounded-xl hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-xl">
                            <Printer size={14} />
                            Export Dossier
                        </button>
                        <button className="px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-xl">
                            <RotateCcw size={14} />
                            Restore Case
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.02]">
                            <span className="text-[10rem] font-black text-white rotate-[-15deg] tracking-tightest">ARCHIVED</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 z-10 scrollbar-hide">
                            <div className="flex items-center justify-center">
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black text-slate-500 border border-white/5 uppercase tracking-[0.2em]">Jan 10, 2026</span>
                            </div>
                            
                            <div className="flex gap-6 max-w-4xl">
                                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-none shadow-2xl relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-2xl"></div>
                                    <Zap size={20} className="text-primary relative z-10" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Intelligence Unit</span>
                                        <span className="text-[10px] font-bold text-slate-600">10:42 Protocol</span>
                                    </div>
                                    <div className="p-6 bg-white/[0.03] backdrop-blur-xl rounded-[2rem] rounded-tl-sm border border-white/10 text-slate-300 text-sm leading-relaxed shadow-2xl">
                                        <p>I&apos;ve analyzed the deposition transcripts from the plaintiff. There are three key inconsistencies regarding the timeline of events on July 14th.</p>
                                        <ul className="list-disc ml-4 mt-4 space-y-2 opacity-80 font-medium">
                                            <li>Contradiction in arrival time at the property.</li>
                                            <li>Discrepancy regarding witness presence.</li>
                                            <li>Conflict with earlier email evidence.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 flex-row-reverse max-w-4xl ml-auto">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-slate-400 flex-none uppercase shadow-xl">
                                    SJ
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-[10px] font-bold text-slate-600">10:45 Protocol</span>
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Sarah Jenkins</span>
                                    </div>
                                    <div className="p-6 bg-primary/10 backdrop-blur-xl rounded-[2rem] rounded-tr-sm border border-primary/20 text-slate-200 text-sm leading-relaxed text-left shadow-2xl">
                                        <p>Yes, please draft the summary. Focus specifically on the witness discrepancy as that&apos;s our strongest point for the dismissal.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center mt-12">
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black text-slate-500 border border-white/5 uppercase tracking-[0.2em]">Feb 14, 2026</span>
                            </div>
                            <div className="flex justify-center">
                                <div className="flex items-center gap-3 px-6 py-3 bg-red-500/5 rounded-2xl border border-red-500/10 shadow-2xl">
                                    <Lock size={14} className="text-red-500/60" />
                                    <span className="text-[10px] font-black text-red-400/80 uppercase tracking-widest">Case Intelligence Sealed by Order of Operator Jenkins</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/[0.01] backdrop-blur-3xl z-20">
                            <div className="relative">
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm rounded-[2rem] z-10 cursor-not-allowed flex items-center justify-center border border-white/5 shadow-2xl">
                                    <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-[#0B1121] px-6 py-3 rounded-xl border border-white/10 shadow-2xl">
                                        <Lock size={16} className="text-amber-500/60" />
                                        <span>Terminal Locked: Closed Matter Protocol</span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex items-center gap-4 opacity-50 blur-[1px]">
                                    <div className="flex-1 h-12"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="w-80 flex-none border-l border-white/10 bg-white/[0.01] backdrop-blur-3xl overflow-y-auto hidden xl:block p-8 space-y-10 scrollbar-hide">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Final Outcome Registry</h3>
                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-[2px] h-full bg-emerald-500/50"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Settlement Protocol</h4>
                                    <CheckCircle size={14} className="text-emerald-500" />
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">
                                    Case settled out of court on Feb 14, 2026. Final agreement signed by all parties. Settlement amount remains classified.
                                </p>
                                <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    <Zap size={10} className="text-primary" />
                                    Synthesized by Core AI
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archived Dossiers</h3>
                                <span className="text-[9px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-slate-400">2 Units</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: 'Final_Settlement_Signed.pdf', size: '2.4 MB', date: 'Feb 14, 2026', type: 'pdf' },
                                    { name: 'Motion_Dismiss_v3.docx', size: '145 KB', date: 'Jan 15, 2026', type: 'doc' }
                                ].map((file, idx) => (
                                    <div key={idx} className="group bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all flex items-center gap-4 shadow-xl">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${file.type === 'pdf' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                            {file.type === 'pdf' ? <FileText size={18} /> : <FileText size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-white truncate mb-1">{file.name}</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{file.size} &bull; {file.date}</p>
                                        </div>
                                        <button className="p-2 text-slate-500 hover:text-primary rounded-xl transition-all">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
