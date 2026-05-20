"use client";

import MonolithLogo from '@/components/ui/MonolithLogo';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

    const totalResults = results.cases.length + results.files.length;

    if (!mounted) return (
        <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
    );

    return (
        <div className="bg-[#05060a] text-slate-100 min-h-screen flex flex-col font-display relative overflow-hidden">
            <div className="absolute inset-0 micro-grid opacity-[0.15] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="sticky top-0 z-50 bg-[#080a10]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-6 lg:gap-10">
                    <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
                        <MonolithLogo size={36} glowIntensity="lg" />
                        <span className="text-xl font-black tracking-tight text-white hidden sm:inline">LawCase<span className="text-primary">AI</span></span>
                    </Link>

                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-primary group-focus-within:scale-110 transition-transform">
                            <span className="material-icons-round text-xl">psychology</span>
                        </div>
                        <input
                            className="w-full pl-14 pr-28 py-3.5 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:border-primary/40 text-sm font-bold transition-all outline-none placeholder-slate-600 shadow-[inset_0_2px_15px_rgba(0,0,0,0.6)]"
                            placeholder="Interrogate your knowledge base using neural natural language..."
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                            <button
                                onClick={() => performSearch(query)}
                                className="bg-primary text-background-dark h-full px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'EXECUTE'}
                            </button>
                        </div>
                    </div>

                    <Link href="/settings" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-all group">
                        <div className="text-right hidden lg:block">
                            <p className="text-xs font-black text-white group-hover:text-primary transition-colors">{user?.name || 'Authorized Counsel'}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black opacity-60">Neural Operator</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-primary/40 transition-all font-black text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </Link>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 lg:py-12">

                    <div className="mb-10">
                        <nav className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                            <Link href="/dashboard" className="hover:text-white transition-colors">Operational Command</Link>
                            <span className="material-icons-round text-sm opacity-30">chevron_right</span>
                            <span className="text-primary">Global Audit Engine</span>
                        </nav>
                        <h1 className="text-3xl lg:text-4xl font-black text-white font-display tracking-tightest">
                            {isLoading ? 'Scanning Repositories...' : (
                                totalResults > 0 ? (
                                    <>Detected <span className="text-primary">{totalResults}</span> Matches for <span className="text-primary italic">&quot;{query}&quot;</span></>
                                ) : query ? (
                                    <>No matches found for <span className="text-slate-500">&quot;{query}&quot;</span></>
                                ) : 'Awaiting Search Protocols'
                            )}
                        </h1>
                        {totalResults > 0 && (
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    {results.cases.length} Cases
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    {results.files.length} Documents
                                </span>
                            </div>
                        )}
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {isLoading ? (
                            <>
                                <div className="space-y-5">
                                    <Skeleton width="180px" height="14px" className="mb-4" />
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} height="90px" borderRadius="1.25rem" />
                                    ))}
                                </div>
                                <div className="space-y-5">
                                    <Skeleton width="180px" height="14px" className="mb-4" />
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} height="90px" borderRadius="1.25rem" />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {results.cases.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,230,118,0.6)]"></span>
                                            Matter Repositories
                                        </h2>
                                        <AnimatePresence>
                                            {results.cases.map((c, i) => (
                                                <Link key={i} href={`/dashboard/cases/${c.id}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-background-dark transition-all shadow-lg flex-shrink-0">
                                                                <span className="material-icons-round text-xl">folder</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-base font-black text-white truncate group-hover:text-primary transition-colors">{c.title}</h3>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.subtitle}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{c.status}</span>
                                                                </div>
                                                            </div>
                                                            <span className="material-icons-round text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all text-lg">arrow_forward</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {results.files.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                                            Intelligence Units
                                        </h2>
                                        <AnimatePresence>
                                            {results.files.map((f, i) => (
                                                <Link key={i} href={`/dashboard/cases/${f.caseId}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg flex-shrink-0">
                                                                <span className="material-icons-round text-xl">description</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-base font-black text-white truncate group-hover:text-blue-400 transition-colors">{f.title}</h3>
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{f.subtitle}</p>
                                                            </div>
                                                            <span className="material-icons-round text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all text-lg">arrow_forward</span>
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

                    {query && !isLoading && totalResults === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center mx-auto mb-6">
                                <span className="material-icons-round text-3xl text-slate-600">search_off</span>
                            </div>
                            <p className="text-slate-400 text-sm font-bold mb-2">No intelligence vectors matched your query.</p>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Try different keywords or broader search terms.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
