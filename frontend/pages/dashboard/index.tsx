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
  const { user, isAuthenticated } = useAuth();
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
      } catch (error: any) {
        // Ignore 503 errors as they are handled by the maintenance overlay
        if (error.response && error.response.status === 503) {
            return;
        }
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'high': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
      case 'medium': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      case 'low': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      default: return 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]';
    }
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-primary/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner border border-white/5">
                    <span className="material-icons-round text-2xl">auto_awesome</span>
                  </div>
                  {(dashboardData?.hoursSaved?.today || 0) > 0 && (
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest shadow-lg backdrop-blur-md">
                      +{dashboardData!.hoursSaved.today}h today
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Cognitive Time Saved</p>
                <h3 className="text-4xl font-black text-white mt-3 font-display tracking-tightest">
                  {dashboardData?.hoursSaved?.total || '0.0'} <span className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Hrs</span>
                </h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-blue-500/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner border border-white/5">
                    <Briefcase size={22} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest bg-white/5 backdrop-blur-md">
                    {dashboardData?.cases?.active || 0} / {(dashboardData?.cases?.limit || 0) >= 500 ? '∞' : (dashboardData?.cases?.limit || 0)} Units
                  </span>
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Capacity Utilization</p>
                <div className="flex items-end gap-4 mt-3">
                  <h3 className="text-4xl font-black text-white font-display tracking-tightest">
                    {(dashboardData?.cases?.limit || 0) >= 500 
                      ? '∞' 
                      : (dashboardData?.cases?.limit || 0) === 0 
                        ? '0%' 
                        : `${dashboardData?.cases?.usagePercentage || 0}%`}
                  </h3>
                  {(dashboardData?.cases?.limit || 0) < 500 && (
                    <div className="mb-3 flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dashboardData?.cases?.usagePercentage || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 h-full rounded-full shadow-[0_0_15px_rgba(10,68,184,0.5)]"
                      ></motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-amber-500/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner border border-white/5">
                    <AlertCircle size={22} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Live Sync</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Indexed Intelligence</p>
                <h3 className="text-4xl font-black text-white mt-3 font-display tracking-tightest">
                  {dashboardData?.documents?.total || 0} <span className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Docs</span>
                </h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 hover:border-indigo-500/40 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner border border-white/5">
                    <Gavel size={22} />
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Resolved Assertions</p>
                <h3 className="text-4xl font-black text-white mt-3 font-display tracking-tightest">
                  {(dashboardData?.cases?.closed || 0).toString().padStart(2, '0')} <span className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Closed</span>
                </h3>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              <div className="premium-glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/20 backdrop-blur-3xl">
                <div className="p-4 lg:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h3 className="text-lg lg:text-xl font-black text-white font-display tracking-tightest">Registry Operations</h3>
                    <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time case intelligence stream</p>
                  </div>
                  <Link href="/cases" className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-widest transition-all border border-white/5">
                    Terminal View
                    <span className="material-icons-round text-xs lg:text-sm">open_in_new</span>
                  </Link>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : (
                    <table className="w-full text-left min-w-[600px]">
                      <thead>
                        <tr className="bg-white/5 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5">
                          <th className="px-4 lg:px-6 py-4">Case Details</th>
                          <th className="px-4 lg:px-6 py-4">Status</th>
                          <th className="px-4 lg:px-6 py-4">AI Audit</th>
                          <th className="px-4 lg:px-6 py-4 text-right">Last Sync</th>
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
                            <td className="px-4 lg:px-8 py-4 lg:py-6">
                              <div className="flex items-center gap-3 lg:gap-5">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base lg:text-lg shadow-xl shadow-primary/20 border border-white/20 uppercase transform group-hover:rotate-6 transition-transform duration-500 shrink-0">
                                  {c.name.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] lg:text-[15px] font-black text-white group-hover:text-primary transition-colors tracking-tight truncate">{c.name}</p>
                                  <p className="text-[8px] lg:text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1 opacity-70 truncate">{c.practiceArea || 'General Legal'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-4 lg:py-6">
                              <span className="inline-flex items-center px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[8px] lg:text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest shadow-lg backdrop-blur-md">
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 lg:px-8 py-4 lg:py-6 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                <Sparkles size={12} className="text-primary animate-pulse" />
                                <span className="hidden sm:inline">{c.fileCount > 0 ? 'Analysis Active' : 'Waiting Layer'}</span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-4 lg:py-6 text-right whitespace-nowrap">
                              <div className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
                                {new Date(c.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            </td>
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
              <motion.div variants={itemVariants} className="premium-glass rounded-[2rem] border border-white/10 shadow-2xl p-8 transition-all hover:border-red-500/30 group backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent pointer-events-none" />
                <h3 className="text-[10px] font-black text-white mb-8 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
                  Critical Vectors
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
                          <div className={`w-1 h-8 rounded-full ${getPriorityColor(deadline.priority)}`}></div>
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
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${getPriorityBadgeStyles(deadline.priority)}`}>
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

              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0a44b8] via-[#0d6efd] to-[#4f46e5] rounded-[2rem] p-8 text-white shadow-[0_20px_50px_rgba(10,68,184,0.3)] relative overflow-hidden group border border-white/20">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.15] scale-150 rotate-12 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-white/10">
                      <span className="material-icons-round text-white text-2xl">psychology</span>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] tracking-[0.3em] uppercase opacity-90">Cognitive Neural Core</h4>
                        <p className="text-[9px] text-white/60 font-black uppercase mt-1">Status: Operational</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[13px] text-blue-50 leading-relaxed font-medium opacity-90">
                      {(dashboardData?.documents?.total || 0) > 0
                        ? `Neural engine has indexed ${dashboardData!.documents.total} intelligence units. Semantic cross-reference matrix is live.`
                        : "System idle. Inject case documentation to initialize the neural processing layer and execute immediate analytics."}
                    </p>
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-white text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-50 transition-all shadow-xl"
                      >
                        Deep Audit Command
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
