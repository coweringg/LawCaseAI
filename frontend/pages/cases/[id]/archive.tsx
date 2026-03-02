import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CaseArchive() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 h-screen flex overflow-hidden">
                <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2d] flex flex-col justify-between transition-all duration-300 hidden md:flex">
                    <div>
                        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl mr-0 lg:mr-3">
                                L
                            </div>
                            <span className="font-bold text-lg hidden lg:block tracking-tight text-slate-900 dark:text-white">LawCaseAI</span>
                        </div>
                        <nav className="mt-6 px-2 lg:px-4 space-y-1">
                            <Link href="/dashboard" className="flex items-center px-2 lg:px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary rounded-lg transition-colors group">
                                <span className="material-icons-round text-2xl group-hover:text-primary">dashboard</span>
                                <span className="ml-3 font-medium hidden lg:block">Dashboard</span>
                            </Link>
                            <Link href="/cases" className="flex items-center px-2 lg:px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary rounded-lg transition-colors group">
                                <span className="material-icons-round text-2xl group-hover:text-primary">folder</span>
                                <span className="ml-3 font-medium hidden lg:block">Active Cases</span>
                            </Link>
                            <Link href="/cases/archived" className="flex items-center px-2 lg:px-4 py-3 bg-primary/10 text-primary rounded-lg transition-colors group">
                                <span className="material-icons-round text-2xl">archive</span>
                                <span className="ml-3 font-medium hidden lg:block">Archives</span>
                            </Link>
                        </nav>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="mt-4 flex items-center px-2 lg:px-4 justify-center lg:justify-start">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                JS
                            </div>
                            <div className="ml-3 hidden lg:block">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Sarah Jenkins</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Senior Partner</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
                    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-2 flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
                            <span className="material-icons-round text-slate-500 mr-2 text-lg">lock</span>
                            Archived Case • Read-Only Mode. This case was closed on Feb 14, 2026.
                        </div>
                        <button className="text-primary hover:text-primary-hover font-semibold text-xs uppercase tracking-wide flex items-center gap-1 transition-colors">
                            <span className="material-icons-round text-sm">history</span>
                            View Audit Log
                        </button>
                    </div>

                    <header className="bg-white dark:bg-[#151b2d] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-icons-round">arrow_back</span>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Estate of J. Doe v. Smith</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700 uppercase tracking-wider">Closed</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>Case ID: #{id || '26-CIV-009'}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>Probate</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                                <span className="material-icons-round text-base">print</span>
                                Export PDF
                            </button>
                            <button className="px-4 py-2 border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <span className="material-icons-round text-base">restore</span>
                                Reopen Case
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#151b2d] relative">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
                                <span className="text-6xl md:text-8xl font-black text-slate-900 rotate-[-15deg]">ARCHIVED</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide">
                                <div className="flex items-center justify-center">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-700">Jan 10, 2026</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="material-icons-round text-white text-sm">smart_toy</span>
                                    </div>
                                    <div className="flex-1 max-w-2xl">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Case Assistant</span>
                                            <span className="text-xs text-slate-400">10:42 AM</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-sm">
                                            <p>I&apos;ve analyzed the deposition transcripts from the plaintiff. There are three key inconsistencies regarding the timeline of events on July 14th.</p>
                                            <ul className="list-disc ml-4 mt-2 space-y-1">
                                                <li>Contradiction in arrival time at the property.</li>
                                                <li>Discrepancy regarding witness presence.</li>
                                                <li>Conflict with earlier email evidence.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        JS
                                    </div>
                                    <div className="flex-1 max-w-2xl text-right">
                                        <div className="flex items-baseline gap-2 mb-1 justify-end">
                                            <span className="text-xs text-slate-400">10:45 AM</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Sarah Jenkins</span>
                                        </div>
                                        <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-2xl rounded-tr-none border border-primary/20 text-slate-800 dark:text-slate-200 text-sm leading-relaxed text-left inline-block shadow-sm">
                                            <p>Yes, please draft the summary. Focus specifically on the witness discrepancy as that&apos;s our strongest point for the dismissal.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center mt-8">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-700">Feb 14, 2026</span>
                                </div>
                                <div className="flex justify-center my-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <span className="material-icons-round text-slate-400 text-sm">lock_clock</span>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Case formally closed by Sarah Jenkins. Thread archived.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121726] z-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl z-10 cursor-not-allowed flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                            <span className="material-icons-round text-lg">lock</span>
                                            <span>Conversation is locked for closed cases</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3 opacity-50">
                                        <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" disabled>
                                            <span className="material-icons-round">add_circle_outline</span>
                                        </button>
                                        <input className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-slate-500" disabled placeholder="Type your message..." type="text" />
                                        <button className="p-2 bg-primary text-white rounded-lg opacity-50" disabled>
                                            <span className="material-icons-round text-lg">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark overflow-y-auto hidden xl:block">
                            <div className="p-6">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Case Outcome Summary</h3>
                                <div className="bg-white dark:bg-[#151b2d] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white">Resolved - Settlement</h4>
                                        <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                                        Case settled out of court on Feb 14, 2026. Final agreement signed by all parties. Settlement amount confidential.
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                                        <span className="material-icons-round text-sm text-primary">auto_awesome</span>
                                        <span>Generated by AI Assistant</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case Files (Read Only)</h3>
                                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">3</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="group bg-white dark:bg-[#151b2d] p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                            <span className="material-icons-round text-xl">picture_as_pdf</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Final_Settlement_Agreement_Signed.pdf</p>
                                            <p className="text-xs text-slate-500">2.4 MB • Feb 14, 2026</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Download">
                                            <span className="material-icons-round text-lg">download</span>
                                        </button>
                                    </div>
                                    <div className="group bg-white dark:bg-[#151b2d] p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <span className="material-icons-round text-xl">description</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Motion_to_Dismiss_Draft_v3.docx</p>
                                            <p className="text-xs text-slate-500">145 KB • Jan 15, 2026</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Download">
                                            <span className="material-icons-round text-lg">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
