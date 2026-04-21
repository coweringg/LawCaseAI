"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSearchParams } from 'next/navigation';

export default function SearchClient() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const initialQuery = searchParams?.get('q') || '';
    
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<{ cases: any[], files: any[] }>({ cases: [], files: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query) performSearch(query);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    if (!mounted) return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );

    return (
        <div className="bg-[#05060a] text-slate-100 min-h-screen flex flex-col font-display relative overflow-hidden">
            <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="sticky top-0 z-50 bg-[#080a10]/80 backdrop-blur-2xl border-b border-white/10 px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center gap-10">
                    <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-2xl">gavel</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">LawCase<span className="text-primary">AI</span></span>
                    </Link>

                    <div className="flex-grow max-w-3xl relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary group-focus-within:scale-110 transition-transform">
                            <span className="material-icons-round">psychology</span>
                        </div>
                        <input
                            className="w-full pl-14 pr-24 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 text-sm font-bold transition-all outline-none placeholder-slate-600 shadow-inner"
                            placeholder="Interrogate your knowledge base using neural natural language..."
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                            <button 
                                onClick={() => performSearch(query)}
                                className="bg-primary text-white h-full px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'EXECUTE'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                        <Link href="/settings" className="flex items-center gap-4 hover:opacity-80 transition-all group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white group-hover:text-primary transition-colors">{user?.name || 'Authorized Counsel'}</p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black opacity-60">Neural Operator</p>
                            </div>
                            <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-primary/40 transition-all">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex max-w-[1600px] mx-auto w-full overflow-hidden">
                <main className="flex-grow overflow-y-auto p-10 scrollbar-hide">
                    <div className="mb-12">
                        <nav className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                            <span>Intelligence Layer</span>
                            <span className="material-icons-round text-sm opacity-30">chevron_right</span>
                            <span className="text-primary">Global Audit Engine</span>
                        </nav>
                        <h1 className="text-4xl font-black text-white font-display tracking-tightest">
                            {isLoading ? 'Scanning Repositories...' : (
                                results.cases.length + results.files.length > 0 ? (
                                    <>Detected <span className="text-primary">{results.cases.length + results.files.length}</span> Matches for <span className="text-primary italic">&quot;{query}&quot;</span></>
                                ) : query ? (
                                    <>No matches found for <span className="text-slate-500">&quot;{query}&quot;</span></>
                                ) : 'Awaiting Search Protocols'
                            )}
                        </h1>
                    </div>

                    {!query && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] border border-white/5 flex items-center justify-center mb-10 relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                                <span className="material-icons-round text-5xl text-primary relative z-10 animate-pulse">radar</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Ready for Global Intelligence Audit</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                                Enter keywords or natural language queries to search across all your legal cases, documents, and past AI interactions.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {isLoading ? (
                            <>
                                <div className="space-y-6">
                                    <Skeleton width="180px" height="14px" className="mb-6" />
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} height="100px" borderRadius="1.5rem" className="premium-glass" />
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    <Skeleton width="180px" height="14px" className="mb-6" />
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} height="100px" borderRadius="1.5rem" className="premium-glass" />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {results.cases.length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(10,68,184,0.8)]"></span>
                                            Matter Repositories
                                        </h2>
                                        <AnimatePresence>
                                            {results.cases.map((c, i) => (
                                                <Link key={i} href={`/dashboard/cases/${c.id}`}>
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="premium-glass border border-white/10 rounded-3xl p-6 hover:border-primary/40 transition-all group shadow-2xl overflow-hidden relative"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="flex items-center gap-5 relative z-10">
                                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6 shadow-xl">
                                                                <span className="material-icons-round text-2xl">folder</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-black text-white truncate group-hover:text-primary transition-colors">{c.title}</h3>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.subtitle}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{c.status}</span>
                                                                </div>
                                                            </div>
                                                            <span className="material-icons-round text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {results.files.length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                                            Intelligence Units
                                        </h2>
                                        <AnimatePresence>
                                            {results.files.map((f, i) => (
                                                <Link key={i} href={`/dashboard/cases/${f.caseId}`}>
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="premium-glass border border-white/10 rounded-3xl p-6 hover:border-blue-500/40 transition-all group shadow-2xl relative overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="flex items-center gap-5 relative z-10">
                                                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-rotate-6 shadow-xl">
                                                                <span className="material-icons-round text-2xl">description</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-black text-white truncate group-hover:text-blue-400 transition-colors">{f.title}</h3>
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{f.subtitle}</p>
                                                            </div>
                                                            <span className="material-icons-round text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {query && !isLoading && results.cases.length === 0 && results.files.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">No intelligence vectors matched your query.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
