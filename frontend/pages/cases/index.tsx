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
    const { token } = useAuth();
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

        if (token) {
            fetchCases();
        }
    }, [token]);

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
                    className="flex flex-col gap-6 relative z-10"
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight font-display mb-2">My Cases</h1>
                            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Repository index • AI Synchronized</p>
                        </div>

                        <div className="flex items-center gap-1 glass p-1 rounded-xl border border-white/10">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'active', label: 'Active' },
                                { id: 'closed', label: 'Closed' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id as any)}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCases.map(c => {
                                const progress = Math.min((c.fileCount || 0) * 20, 100);
                                const areaColor = getAreaColor(c.practiceArea);

                                return (
                                    <Link href={`/cases/${c._id}`} key={c._id} className="group">
                                        <motion.div
                                            variants={itemVariants}
                                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            className="glass border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 h-full flex flex-col relative overflow-hidden shadow-xl"
                                        >
                                            {/* Subtle Gradient background */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.05] ${areaColor.split(' ')[0]}`}></div>
                                            <div className="absolute inset-0 crystallography-pattern opacity-[0.02] scale-150 pointer-events-none"></div>

                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className={`p-3 rounded-xl shadow-lg ${areaColor}`}>
                                                    {getAreaIcon(c.practiceArea)}
                                                </div>
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-tighter uppercase ${c.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    c.status === 'closed' ? 'bg-slate-500/10 text-slate-400 border-white/10' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {c.status || 'ACTIVE'}
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex-1">
                                                <h3 className="text-lg font-black text-white mb-2 group-hover:text-primary transition-colors truncate font-display">{c.name}</h3>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.client || 'Direct Client'}</span>
                                                    <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">{c.practiceArea || 'General Legal'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-8 relative z-10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Case Readiness</span>
                                                    <span className="text-[10px] font-black text-white">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1.5, delay: 0.2 }}
                                                        className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]'}`}
                                                    ></motion.div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                                                        <span className="material-icons-round text-sm">description</span>
                                                        <span>{c.fileCount || 0} Records</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                                                        <span className="material-icons-round text-sm">event_note</span>
                                                        <span>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}

                            {/* New Case Placeholder */}
                            <Link href="/cases/new" className="group">
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                    className="glass-dark border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[300px] cursor-pointer group-hover:shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-125 rotate-45 z-0 pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-xl border border-white/5">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <span className="text-lg font-black text-white font-display">Initialize New Project</span>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2 text-primary opacity-80">Link Intelligence Core</span>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
