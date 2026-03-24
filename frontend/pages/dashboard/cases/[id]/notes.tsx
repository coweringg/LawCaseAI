import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CaseNotesEditor() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex flex-col font-display">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
                            <span className="material-icons-round">gavel</span>
                            <span>LawCaseAI</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Link href="/dashboard" className="hover:text-primary transition-colors">Cases</Link>
                                <span className="material-icons-round text-xs">chevron_right</span>
                                <Link href={`/dashboard/cases/${id}`} className="hover:text-primary transition-colors">Smith v. Jones</Link>
                                <span className="material-icons-round text-xs">chevron_right</span>
                                <span className="text-slate-400">Internal Notes</span>
                            </div>
                            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Memo: Initial Discovery Analysis - Case #{id || '4429'}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                            <span className="material-icons-round text-sm text-emerald-500">cloud_done</span>
                            <span>Auto-saved at 2:45 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <span className="material-icons-round text-lg">picture_as_pdf</span>
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover shadow-sm shadow-primary/20 transition-all">
                                <span className="material-icons-round text-lg">person_add_alt</span>
                                <span className="hidden sm:inline">Share with Team</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-16 flex flex-col items-center py-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark hidden md:flex">
                        <button className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 transition-colors">
                            <span className="material-icons-round text-xl">description</span>
                        </button>
                        <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center mb-4 transition-colors">
                            <span className="material-icons-round text-xl">history</span>
                        </button>
                        <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center mb-4 transition-colors">
                            <span className="material-icons-round text-xl">attachment</span>
                        </button>
                        <div className="mt-auto">
                            <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center mb-4 transition-colors">
                                <span className="material-icons-round text-xl">settings</span>
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark/50 flex flex-col items-center pt-8 pb-20 px-4 md:px-0 scrollbar-hide">
                        <div className="mb-8 flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 sticky top-4 z-10 transition-colors">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><span className="material-icons-round">format_bold</span></button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><span className="material-icons-round">format_italic</span></button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><span className="material-icons-round">format_underlined</span></button>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><span className="material-icons-round">format_list_bulleted</span></button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"><span className="material-icons-round">format_list_numbered</span></button>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-primary bg-primary/10 transition-colors"><span className="material-icons-round">auto_awesome</span></button>
                        </div>

                        <div className="w-full max-w-[850px] bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl min-h-[800px] p-8 md:p-16 relative transition-colors">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">Draft</span>
                                <span className="text-slate-400 text-xs font-medium">Created Oct 24, 2023 • Confidential</span>
                            </div>
                            <div className="prose prose-slate max-w-none dark:prose-invert">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Discovery Phase: Plaintiff Interrogatories</h2>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                                    Following the initial review of the motion to dismiss filed by the defendant, we must pivot our focus toward the discovery phase. The primary objective of this memo is to outline the key points of contention that will be addressed in the first set of interrogatories.
                                </p>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">1. Fact Pattern Analysis</h3>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                    The incident occurred on July 14th at approximately 18:30 hours. Witness statements from the site manager (Ex. B) suggest that the maintenance logs were not updated for a period of 72 hours prior to the equipment failure.
                                </p>
                                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6 group relative">
                                    <p className="italic text-slate-600 dark:text-slate-400">
                                        &quot;The defendant owed a duty of care to the plaintiff to maintain premises in a reasonably safe condition...&quot;
                                    </p>
                                    <button className="absolute -right-3 top-2 p-1.5 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-full text-primary hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                        <span className="material-icons-round text-sm">auto_awesome</span>
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">2. Applicable Statutes</h3>
                                <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300 mb-6">
                                    <li>State Civil Code § 1714: Responsibility for willful acts and negligence.</li>
                                    <li>Occupational Safety and Health Act (OSHA) 29 CFR 1910.</li>
                                    <li>Relevant precedents in <span className="italic">Walker v. Superior Court (1988)</span> regarding statutory interpretation.</li>
                                </ul>
                            </div>
                        </div>
                    </main>

                    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col hidden xl:flex">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <span className="material-icons-round text-white text-sm">auto_awesome</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">AI Assistant</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-icons-round text-primary text-xl">auto_fix_high</span>
                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Refine Text</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Adjust tone to be more formal, concise, or persuasive.</p>
                                <div className="flex gap-2">
                                    <button className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:border-primary transition-colors">Make Formal</button>
                                    <button className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded hover:border-primary transition-colors">Shorten</button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Contextual Insight</span>
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5"></div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        &quot;Consider citing the 2021 amendment to Civil Code § 1714 for more specific liability definitions.&quot;
                                    </p>
                                    <button className="mt-3 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                        <span>APPLY SUGGESTION</span>
                                        <span className="material-icons-round text-xs">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="relative">
                                <input className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary transition-shadow" placeholder="Ask AI anything..." type="text" />
                                <button className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors">
                                    <span className="material-icons-round text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </ProtectedRoute>
    );
}
