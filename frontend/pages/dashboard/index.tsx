import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2, Briefcase, Clock, AlertCircle, Gavel, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardStats } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>LawCaseAI - Dashboard</title>
      </Head>
      <DashboardLayout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col gap-8 relative z-10"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="glass p-6 rounded-2xl border border-white/10 shadow-xl transition-all hover:border-primary/30 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-icons-round">auto_awesome</span>
                </div>
                {(dashboardData?.hoursSaved?.today || 0) > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                    +{dashboardData!.hoursSaved.today}h today
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hours Saved by AI</p>
              <h3 className="text-3xl font-black text-white mt-2 font-display">
                {dashboardData?.hoursSaved?.total || '0.0'} <span className="text-lg font-medium text-slate-500">hrs</span>
              </h3>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-6 rounded-2xl border border-white/10 shadow-xl transition-all hover:border-primary/30 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Briefcase size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 border border-white/5 px-2 py-1 rounded-full">
                  {dashboardData?.cases?.active || 0} / {dashboardData?.cases?.limit || 5} Active
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Active Cases</p>
              <div className="flex items-end gap-3 mt-2">
                <h3 className="text-3xl font-black text-white font-display">
                  {dashboardData?.cases?.usagePercentage || 0}%
                </h3>
                <div className="mb-2 flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData?.cases?.usagePercentage || 0}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-6 rounded-2xl border border-white/10 shadow-xl transition-all hover:border-primary/30 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <AlertCircle size={20} />
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                  {isLoading ? 'Syncing...' : 'Live'}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Documents</p>
              <h3 className="text-3xl font-black text-white mt-2 font-display">
                {dashboardData?.documents?.total || 0}
              </h3>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-6 rounded-2xl border border-white/10 shadow-xl transition-all hover:border-primary/30 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Gavel size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                  {(dashboardData?.cases?.closed || 0) > 0 ? 'Updated' : 'Active'}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Closed Cases</p>
              <h3 className="text-3xl font-black text-white mt-2 font-display">
                {(dashboardData?.cases?.closed || 0).toString().padStart(2, '0')}
              </h3>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all hover:border-primary/20">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-display">Recent Case Activity</h3>
                  <Link href="/cases" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-white transition-colors">View repository</Link>
                </div>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5">
                          <th className="px-6 py-4">Case Details</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">AI Audit</th>
                          <th className="px-6 py-4 text-right">Last Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboardData?.recentCases?.map((c: any) => (
                          <tr
                            key={c._id}
                            className="group hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => router.push(`/cases/${c._id}`)}
                            onKeyDown={(e) => e.key === 'Enter' && router.push(`/cases/${c._id}`)}
                            tabIndex={0}
                            role="button"
                            aria-label={`View case ${c.name}`}
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 uppercase">
                                  {c.name.substring(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{c.name}</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{c.practiceArea || 'General Legal'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Sparkles size={12} className="text-primary" />
                                {c.fileCount > 0 ? 'Analysis Ready' : 'Data Required'}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{new Date(c.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {(!dashboardData?.recentCases || dashboardData.recentCases.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">No recent activity detected</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 shadow-xl p-6 transition-all hover:border-red-500/30">
                <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-icons-round text-red-500 text-lg">priority_high</span>
                  Critical Deadlines
                </h3>
                <div className="space-y-4">
                  {(dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0) ? (
                    dashboardData.upcomingDeadlines.map((deadline, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => router.push('/calendar')}
                        onKeyDown={(e) => e.key === 'Enter' && router.push('/calendar')}
                        tabIndex={0}
                        role="button"
                        aria-label={`View deadline: ${deadline.title}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${deadline.priority === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                          <div>
                            <p className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">{deadline.title}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mt-1">
                              <Clock size={10} />
                              {(() => {
                                try {
                                  const d = new Date(deadline.date);
                                  return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'MMM d, h:mm a');
                                } catch {
                                  return 'Invalid Date';
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${deadline.priority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                          {deadline.priority}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No active threats detected</p>
                    </div>
                  )}
                </div>
                <Link href="/calendar" className="block w-full text-center mt-6 py-2.5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-white transition-all shadow-lg active:scale-95">
                  Access Master Calendar
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group border border-white/20">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.1] scale-150 rotate-12 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                      <span className="material-icons-round text-white">smart_toy</span>
                    </div>
                    <h4 className="font-black text-[10px] tracking-widest uppercase">AI Intelligence Core</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[12px] text-blue-50 leading-relaxed font-medium">
                      {(dashboardData?.documents?.total || 0) > 0
                        ? `Intelligence unit has indexed ${dashboardData!.documents.total} documents. Semantic analysis is available for audit.`
                        : "Ready for ingestion. Upload case files to synchronize with the AI core and generate immediate insights."}
                    </p>
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 bg-white text-primary text-[11px] font-black uppercase tracking-widest rounded-xl hover:shadow-2xl transition-all shadow-lg"
                      >
                        Initialize Quick Audit
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute >
  );
}
