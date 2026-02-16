import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DocumentViewer() {
    const router = useRouter();
    const { id } = router.query;
    const [zoom, setZoom] = useState(125);

    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex flex-col overflow-hidden font-display">
                {/* Top Global Toolbar */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="bg-primary p-1.5 rounded-lg hover:opacity-80 transition-opacity">
                            <span className="material-icons-round text-white text-xl">gavel</span>
                        </Link>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight">LawCaseAI</h1>
                            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Analysis Studio</p>
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="material-icons-round text-slate-400 text-sm">description</span>
                            <span className="text-sm font-semibold truncate max-w-[200px] md:max-w-[300px]">Commercial_Lease_Agreement_v4_Final.pdf</span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded font-bold text-slate-500 hidden sm:inline-block">PRIVATE</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-icons-round text-sm">file_download</span>
                            <span className="hidden md:inline">Export Analysis</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
                            <span className="material-icons-round text-sm">auto_awesome</span>
                            <span className="hidden md:inline">Generate Summary</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                        <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-500">JS</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Side Navigation (Slim) */}
                    <nav className="w-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-8 z-10 hidden md:flex">
                        <button className="text-primary p-2 rounded-lg bg-primary/10"><span className="material-icons-round">folder</span></button>
                        <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-icons-round">bookmarks</span></button>
                        <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-icons-round">history_edu</span></button>
                        <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-icons-round">settings</span></button>
                        <div className="mt-auto">
                            <button className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className="material-icons-round">help_outline</span></button>
                        </div>
                    </nav>

                    {/* Left Panel: Document Viewer */}
                    <section className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950/50 relative overflow-hidden">
                        {/* Viewer Toolbar */}
                        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">chevron_left</span></button>
                                    <div className="flex items-center px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium">
                                        <span className="text-slate-900 dark:text-white">4</span>
                                        <span className="mx-1 text-slate-400">/</span>
                                        <span className="text-slate-500">24</span>
                                    </div>
                                    <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">chevron_right</span></button>
                                </div>
                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                                <div className="flex items-center gap-1 hidden sm:flex">
                                    <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">remove</span></button>
                                    <span className="text-xs font-medium px-2 text-slate-600 dark:text-slate-400 w-12 text-center">{zoom}%</span>
                                    <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">add</span></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg bg-primary/10 text-primary transition-colors"><span className="material-icons-round text-lg">edit</span></button>
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">highlighter</span></button>
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">sticky_note_2</span></button>
                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><span className="material-icons-round text-lg">search</span></button>
                            </div>
                        </div>

                        {/* PDF Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200/50 dark:bg-black/20">
                            <div className="max-w-3xl w-full bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl shadow-slate-200 dark:shadow-black/50 p-8 md:p-12 min-h-[1000px] relative transition-transform origin-top" style={{ transform: `scale(${zoom / 100})` }}>
                                {/* Page Number Indicator */}
                                <div className="absolute top-4 right-4 text-[10px] text-slate-300 font-bold tracking-widest">PAGE 04</div>

                                <h2 className="text-xl font-bold mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">ARTICLE IV: LEASE TERMS AND CONDITIONS</h2>

                                <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                                    <p><span className="font-bold text-slate-900 dark:text-white font-sans">4.1 Rent Commencement.</span> The Lease Term shall commence on the "Rent Commencement Date" which shall be the earlier of (a) the date upon which Tenant opens for business in the Premises, or (b) ninety (90) days following the Delivery Date.</p>

                                    <div className="bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r relative group">
                                        <p><span className="font-bold text-slate-900 dark:text-white font-sans">4.2 Operating Expenses.</span> <span className="bg-yellow-200/50 dark:bg-yellow-500/20 px-1 rounded">Tenant shall pay to Landlord, as Additional Rent, Tenant's Proportionate Share of all Operating Expenses incurred by Landlord in the operation, repair, replacement, and maintenance of the Common Areas.</span> Landlord shall provide Tenant with a statement of actual Operating Expenses within 120 days after the end of each calendar year.</p>

                                        <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                            <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg mb-1">
                                                AI Identified Risk: Uncapped Expenses
                                            </div>
                                        </div>
                                    </div>

                                    <p><span className="font-bold text-slate-900 dark:text-white font-sans">4.3 Security Deposit.</span> Upon execution of this Lease, Tenant shall deposit with Landlord the sum of Twenty-Five Thousand Dollars ($25,000.00) as security for the faithful performance and observance by Tenant of the terms, provisions, and conditions of this Lease.</p>

                                    <p><span className="font-bold text-slate-900 dark:text-white font-sans">4.4 Late Charges.</span> If any installment of Fixed Rent or Additional Rent is not paid within five (5) days after its due date, Tenant shall pay a late charge equal to five percent (5%) of the amount of such overdue payment.</p>

                                    <div className="h-40 border-t border-dashed border-slate-200 dark:border-slate-800 mt-12 pt-8 flex items-center justify-center">
                                        <div className="w-48 h-12 bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400 italic text-xs border border-slate-200 dark:border-slate-700">
                                            Digital Signature Placeholder
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: AI Assistant */}
                    <aside className="w-[350px] xl:w-[420px] bg-white dark:bg-slate-900 flex flex-col shrink-0 border-l border-slate-200 dark:border-slate-800 absolute right-0 top-0 bottom-0 shadow-xl md:static translate-x-full md:translate-x-0 transition-transform">
                        <div className="h-12 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
                            <span className="material-icons-round text-primary text-lg">auto_awesome</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">AI Legal Assistant</span>
                            <div className="ml-auto flex gap-1">
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition-colors">
                                    <span className="material-icons-round text-lg">history</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-black/20">
                            {/* Welcome */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-icons-round text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="space-y-2 max-w-[85%]">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-sm text-slate-700 dark:text-slate-300">
                                        Hello! I've indexed this 24-page Commercial Lease Agreement. How can I assist your review today?
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">9:41 AM</span>
                                </div>
                            </div>

                            {/* User Request */}
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-xs text-slate-600 dark:text-slate-300">JS</span>
                                </div>
                                <div className="space-y-2 max-w-[85%] flex flex-col items-end">
                                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-md">
                                        Summarize the operating expense clauses and identify any potential risks for the tenant.
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium mr-1">9:42 AM</span>
                                </div>
                            </div>

                            {/* AI Response */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-icons-round text-primary text-sm">smart_toy</span>
                                </div>
                                <div className="space-y-3 max-w-[85%]">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-sm text-slate-700 dark:text-slate-300">
                                        <p className="mb-2">I found relevant information regarding <span className="font-bold">Operating Expenses</span> in <span className="text-primary font-bold cursor-pointer hover:underline">Clause 4.2 (Page 4)</span>.</p>
                                        <ul className="list-disc ml-4 space-y-2">
                                            <li><span className="font-bold">Summary:</span> Tenant pays proportionate share of all operating costs.</li>
                                            <li><span className="text-red-500 font-bold">Risk:</span> The definition of "Operating Expenses" is broad and includes "replacements," which could lead to significant capital expenditure exposure.</li>
                                            <li><span className="text-red-500 font-bold">Risk:</span> There is no cap on the annual increase of these expenses.</li>
                                        </ul>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold hover:bg-white dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800/50">Find similar clauses</button>
                                        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold hover:bg-white dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800/50">Draft counter-clause</button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">9:43 AM</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                                {['Find conflicting clauses', 'Extract key dates', 'Risk assessment'].map(chip => (
                                    <button key={chip} className="whitespace-nowrap px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium hover:border-primary hover:text-primary transition-all text-slate-600 dark:text-slate-400">
                                        {chip}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none placeholder-slate-400 transition-shadow" placeholder="Ask anything about this document..." rows={2}></textarea>
                                <button className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                                    <span className="material-icons-round text-sm">send</span>
                                </button>
                            </div>
                            <p className="mt-2 text-[10px] text-slate-400 text-center">AI can make mistakes. Always verify legal citations.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </ProtectedRoute>
    );
}
