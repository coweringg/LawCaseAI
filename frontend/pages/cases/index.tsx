import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Folder } from 'lucide-react';

export default function MyCases() {
    const { token } = useAuth();
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Cases</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track your active legal cases.</p>
                        </div>
                        <Link href="/cases/new">
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
                                <span className="material-icons-round">add</span> New Case
                            </button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {cases.map(c => (
                                <Link href={`/cases/${c._id}`} key={c._id} className="group">
                                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary/5 group-hover:text-primary transition-colors text-slate-500">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${c.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                c.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-50 text-slate-700 border-slate-100'
                                                }`}>
                                                {(c.status || 'active').toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">{c.practiceArea || 'Legal Case'}</p>

                                        <div className="mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                <span className="material-icons-round text-sm text-slate-400">event</span>
                                                <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `40%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* New Case Placeholder */}
                            <Link href="/cases/new" className="group">
                                <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all h-full flex flex-col items-center justify-center min-h-[200px] cursor-pointer text-slate-400 group-hover:text-primary">
                                    <span className="material-icons-round text-3xl mb-2">add_circle_outline</span>
                                    <span className="text-sm font-bold">Create New Case</span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
