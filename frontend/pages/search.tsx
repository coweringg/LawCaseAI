import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function SmartSearch() {
    const [query, setQuery] = useState('Find all mentions of medical malpractice across all active cases');

    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
                    <div className="max-w-[1600px] mx-auto flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                                <span className="material-icons-round text-2xl">gavel</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">LawCase<span className="text-primary">AI</span></span>
                        </Link>

                        {/* Smart Search Bar */}
                        <div className="flex-grow max-w-3xl relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <span className="material-icons-round text-primary text-xl">psychology</span>
                            </div>
                            <input
                                className="w-full pl-12 pr-24 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
                                placeholder="Search your knowledge base using natural language..."
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center">
                                <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm">
                                    SEARCH
                                </button>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <span className="material-icons-round">notifications</span>
                            </button>
                            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                            <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Jonathan Sterling</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Senior Partner</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-slate-200"></div>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex-grow flex max-w-[1600px] mx-auto w-full overflow-hidden">
                    {/* Sidebar Filters */}
                    <aside className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto hidden lg:block">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Advanced Filters</h2>

                        {/* Date Range */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-700 dark:text-slate-300">
                                <span className="material-icons-round text-sm text-primary">calendar_today</span>
                                Date Range
                            </label>
                            <select className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm mb-3 focus:ring-primary focus:border-primary">
                                <option>Last 12 Months</option>
                                <option>Custom Range</option>
                                <option>All Time</option>
                            </select>
                        </div>

                        {/* Case Name */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-700 dark:text-slate-300">
                                <span className="material-icons-round text-sm text-primary">folder_shared</span>
                                Case Name
                            </label>
                            <div className="space-y-2">
                                {['Smith vs. General Medical', 'City of Chicago vs. Peterson', 'Vanderbilt Estate Probate'].map((label, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{label}</span>
                                    </label>
                                ))}
                                <button className="text-[11px] text-primary font-bold uppercase mt-2 hover:underline">View 14 more cases</button>
                            </div>
                        </div>

                        {/* Document Type */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-700 dark:text-slate-300">
                                <span className="material-icons-round text-sm text-primary">description</span>
                                Document Type
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="flex items-center justify-between p-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold">
                                    <span>Depositions</span>
                                    <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[10px]">12</span>
                                </button>
                                <button className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent rounded-lg text-xs font-semibold transition-colors">
                                    <span>Court Orders</span>
                                    <span>4</span>
                                </button>
                                <button className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent rounded-lg text-xs font-semibold transition-colors">
                                    <span>Evidence Photos</span>
                                    <span>2</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-grow overflow-y-auto p-8">
                        {/* Header Section */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <span>Knowledge Base</span>
                                    <span className="material-icons-round text-sm">chevron_right</span>
                                    <span className="text-primary">Global Smart Search</span>
                                </nav>
                                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    Showing 18 results for <span className="text-primary italic">"{query}"</span>
                                </h1>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8">
                            <button className="pb-4 border-b-2 border-primary text-primary text-sm font-bold flex items-center gap-2">
                                Documents <span className="bg-primary/10 px-2 py-0.5 rounded text-xs">12</span>
                            </button>
                            <button className="pb-4 border-b-2 border-transparent text-slate-500 text-sm font-bold flex items-center gap-2 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                                Chat History <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">4</span>
                            </button>
                            <button className="pb-4 border-b-2 border-transparent text-slate-500 text-sm font-bold flex items-center gap-2 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                                Folders <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">2</span>
                            </button>
                        </div>

                        {/* Search Results List */}
                        <div className="space-y-6">
                            {/* Result Card 1 */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary group cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                                            <span className="material-icons-round">picture_as_pdf</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Expert_Testimony_Dr_Vance.pdf</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><span className="material-icons-round text-sm">folder</span> Smith vs. General Medical</span>
                                                <span>•</span>
                                                <span>Oct 12, 2023</span>
                                                <span>•</span>
                                                <span className="text-emerald-600 font-bold">98% Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "...Under standard protocol, the failure to review the preoperative labs constitutes a clear instance of <span className="bg-primary/10 text-primary px-0.5 rounded font-bold">medical malpractice</span>. Dr. Vance testified that the deviation from the standard of care was egregious..."
                                    </p>
                                </div>
                            </div>

                            {/* Result Card 2 */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary group cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                            <span className="material-icons-round">description</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Internal_Memo_Final_Review.docx</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><span className="material-icons-round text-sm">folder</span> City of Chicago vs. Peterson</span>
                                                <span>•</span>
                                                <span>Sept 28, 2023</span>
                                                <span>•</span>
                                                <span className="text-blue-600 font-bold">92% Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "...we must assess whether the plaintiff’s history of prior surgery complicates our defense against the <span className="bg-primary/10 text-primary px-0.5 rounded font-bold">medical malpractice</span> claim..."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Right Side Panel (Intelligence Summary) */}
                    <aside className="w-80 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 hidden xl:block overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Insight</h2>
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <div className="flex items-center gap-2 text-primary mb-3">
                                    <span className="material-icons-round text-sm">auto_awesome</span>
                                    <span className="text-xs font-bold uppercase tracking-wider">Pattern Detected</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                    The term <span className="font-bold">"medical malpractice"</span> appears most frequently in relation to <strong>post-operative care failures</strong> across 3 active cases.
                                </p>
                                <button className="mt-4 w-full bg-primary text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-sm">Draft Summary</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </ProtectedRoute>
    );
}
