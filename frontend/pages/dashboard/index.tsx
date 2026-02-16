import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2, Briefcase, Clock, AlertCircle, Gavel } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0, archived: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);

        const casesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases?limit=3`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const casesData = await casesRes.json();
        if (casesData.success) setRecentCases(casesData.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <span className="material-icons-round">auto_awesome</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">+2.4h today</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Hours Saved by AI</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">42.8 <span className="text-lg font-medium text-slate-400">hrs</span></h3>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/5 text-primary rounded-xl">
                  <Briefcase size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-600 px-2 py-1 rounded-full">{stats.active} / {user?.planLimit || 5} Active</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Cases</p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{Math.round((stats.active / (user?.planLimit || 5)) * 100)}%</h3>
                <div className="mb-2 w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(stats.active / (user?.planLimit || 5)) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertCircle size={20} />
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">Syncing...</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Documents</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">124</h3>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Gavel size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">Updated</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Closed Cases</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.closed.toString().padStart(2, '0')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Case Activity</h3>
                  <Link href="/cases" className="text-sm font-bold text-primary hover:underline">View All Records</Link>
                </div>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-6 py-4">Case Details</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">AI Insight</th>
                          <th className="px-6 py-4 text-right">Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {recentCases.map(c => (
                          <tr key={c._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/cases/${c._id}`}>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 uppercase">
                                  {c.name.substring(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                                  <p className="text-[11px] text-slate-400 italic font-medium">{c.practiceArea || 'General Legal'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span className="material-icons-round text-primary text-sm">auto_fix_high</span>
                                Ready for analysis
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right text-[11px] text-slate-400 font-bold uppercase">{new Date(c.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {recentCases.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">No recent activity. Create your first case to get started.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-icons-round text-red-500 text-lg">priority_high</span>
                  Critical Deadlines
                </h3>
                <div className="space-y-4">
                  <div className="p-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">No upcoming deadlines found in your current cases.</p>
                  </div>
                </div>
                <Link href="/calendar" className="block w-full text-center mt-6 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl hover:border-primary hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  View Full Calendar
                </Link>
              </div>

              <div className="bg-primary rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <span className="material-icons-round text-white">smart_toy</span>
                    </div>
                    <h4 className="font-bold text-sm tracking-wide uppercase">AI Legal Insight</h4>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">
                      Your AI assistant is ready to help you analyze documents and find precedents as soon as you upload files.
                    </p>
                    <div className="pt-2">
                      <button className="w-full py-2 bg-white text-primary text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-lg">
                        Get Quick Audit
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
