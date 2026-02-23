import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Folder, Briefcase, Shield, Scale, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getAreaIcon = (area: string) => {
    const a = area?.toLowerCase() || '';
    if (a.includes('criminal')) return <Shield className="w-5 h-5" />;
    if (a.includes('civil') || a.includes('litigation')) return <Scale className="w-5 h-5" />;
    if (a.includes('corp') || a.includes('business')) return <Briefcase className="w-5 h-5" />;
    return <Folder className="w-5 h-5" />;
};

const getAreaColor = (area: string) => {
    const a = area?.toLowerCase() || '';
    if (a.includes('criminal')) return 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400';
    if (a.includes('civil') || a.includes('litigation')) return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400';
    if (a.includes('corp') || a.includes('business')) return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
    return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
};

export default function MyCases() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await api.get('/cases');
                if (response.data.success) {
                    setCases(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching cases:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchCases();
        } else if (!isAuthLoading) {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAuthLoading]);

    const filteredCases = cases.filter(c => {
        if (statusFilter === 'all') return true;
        return (c.status || 'active').toLowerCase() === statusFilter;
    }).sort((a, b) => {
        const statusA = (a.status || 'active').toLowerCase();
        const statusB = (b.status || 'active').toLowerCase();
        if (statusA === 'active' && statusB !== 'active') return -1;
        if (statusA !== 'active' && statusB === 'active') return 1;
        return 0;
    });

    if (!mounted) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>LawCaseAI - My Cases</title>
            </Head>
            <DashboardLayout>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col gap-8 relative z-10"
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tightest font-display mb-3">Intelligence Repository</h1>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Master Index &bull; Neural Synchronization Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 premium-glass p-1.5 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                            {[
                                { id: 'all', label: 'All Vectors' },
                                { id: 'active', label: 'Active Layer' },
                                { id: 'closed', label: 'Archived core' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id as any)}
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${statusFilter === f.id
                                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center py-32 gap-6">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(37,99,235,0.2)]"></div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Decrypting Repository...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {/* New Case Placeholder */}
                            <Link href="/cases/new" className="group">
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="premium-glass bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 hover:border-primary/50 hover:bg-primary/[0.03] transition-all duration-500 h-full flex flex-col items-center justify-center min-h-[340px] cursor-pointer shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-125 rotate-45 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-700 shadow-2xl border border-white/5 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                            <Plus className="w-10 h-10" />
                                        </div>
                                        <span className="text-xl font-black text-white font-display tracking-tightest">Initialize Case</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] mt-3 text-primary group-hover:text-blue-400 transition-colors">Neural Core Expansion</span>
                                    </div>
                                </motion.div>
                            </Link>

                            {filteredCases.map(c => {
                                const progress = Math.min((c.fileCount || 0) * 20, 100);
                                const areaColor = getAreaColor(c.practiceArea);

                                return (
                                    <Link href={`/cases/${c._id}`} key={c._id} className="group">
                                        <motion.div
                                            variants={itemVariants}
                                            whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
                                            className="premium-glass border border-white/10 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all duration-500 h-full flex flex-col relative overflow-hidden shadow-2xl group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                            <div className="absolute inset-0 crystallography-pattern opacity-[0.02] scale-150 pointer-events-none group-hover:scale-[1.6] transition-transform duration-1000"></div>

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className={`p-4 rounded-2xl shadow-xl backdrop-blur-xl border border-white/5 group-hover:scale-110 transition-transform duration-500 ${areaColor}`}>
                                                    {getAreaIcon(c.practiceArea)}
                                                </div>
                                                <span className={`text-[8px] font-black px-4 py-1.5 rounded-full border tracking-[0.15em] uppercase shadow-lg backdrop-blur-md transition-all duration-500 ${c.status === 'active' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-white/20' 
                                                    : c.status === 'closed' 
                                                    ? 'bg-slate-500/10 text-slate-400 border-white/10' 
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-white'
                                                    }`}>
                                                    {c.status || 'ACTIVE'}
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex-1">
                                                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary transition-colors leading-tight font-display tracking-tightest">{c.name}</h3>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.client || 'Direct Client'}</span>
                                                    <span className="w-1.5 h-1.5 bg-white/5 rounded-full"></span>
                                                    <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">{c.practiceArea || 'General Legal'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 relative z-10 border-t border-white/5 pt-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Matrix Readiness</span>
                                                    <span className="text-[11px] font-black text-white font-display">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6 shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                                                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 
                                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                                                            : 'bg-gradient-to-r from-primary via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                                                    ></motion.div>
                                                </div>

                                                <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                                        <span className="material-icons-round text-sm text-primary">description</span>
                                                        <span>{c.fileCount || 0} Intelligence Units</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                                        <span className="material-icons-round text-sm">schedule</span>
                                                        <span>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
