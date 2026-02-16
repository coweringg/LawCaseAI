import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Folder, Briefcase, Shield, Scale, Plus } from 'lucide-react';

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

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setCases(data.data);
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

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Cases</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and analyze your legal cases with AI.</p>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'active', label: 'Active' },
                                { id: 'closed', label: 'Closed' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id as any)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === f.id
                                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

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
                                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                            {/* Subtle Gradient background */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 ${areaColor.split(' ')[0]}`}></div>

                                            <div className="flex justify-between items-start mb-5 relative z-10">
                                                <div className={`p-3 rounded-xl transition-colors ${areaColor}`}>
                                                    {getAreaIcon(c.practiceArea)}
                                                </div>
                                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-widest uppercase ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                                    c.status === 'closed' ? 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                                                        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                    }`}>
                                                    {c.status || 'ACTIVE'}
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors truncate">{c.name}</h3>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.client || 'Direct Client'}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">{c.practiceArea || 'General Legal'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 relative z-10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Case Readiness</span>
                                                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden mb-4">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] font-bold">
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <span className="material-icons-round text-sm">description</span>
                                                        <span>{c.fileCount || 0} Docs</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <span className="material-icons-round text-sm">schedule</span>
                                                        <span>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* New Case Placeholder */}
                            <Link href="/cases/new" className="group">
                                <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-primary/50 hover:bg-white dark:hover:bg-surface-dark hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[250px] cursor-pointer text-slate-400 group-hover:text-primary">
                                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <span className="text-base font-bold">New Case Project</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Begin AI indexing</span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
