"use client";

import DashboardLayout from '@/components/layouts/DashboardLayout';
import GlobalAuditModal from '@/components/modals/GlobalAuditModal';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Briefcase, Clock, Gavel, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Skeleton } from '@/components/ui/Skeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Skeleton width="240px" height="40px" className="mb-2" />
          <Skeleton width="320px" height="16px" />
        </div>
        <Skeleton width="180px" height="48px" borderRadius="12px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="120px" className="premium-glass" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Skeleton height="400px" className="premium-glass" />
        </div>
        <div className="space-y-6">
          <Skeleton height="500px" className="premium-glass" />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, fetchProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRefreshed = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response && axiosError.response.status === 503) {
          return;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated, fetchDashboardData]);

  useEffect(() => {
    if (searchParams?.get('status') === 'success' && isAuthenticated && !profileRefreshed.current) {
      profileRefreshed.current = true;
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      const initialPlan = user?.plan;
      const initialOrgId = user?.organizationId;
      const startTime = Date.now();
      
      const needsLoadingToast = initialPlan === 'none';
      
      if (needsLoadingToast) {
        toast.loading('Synchronizing your new neural access...', { id: 'payment-polling' });
      }
      
      const pollProfile = async () => {
        const updatedUser = await fetchProfile();
        const hasPlanChanged = updatedUser && (
            updatedUser.plan !== initialPlan || 
            updatedUser.organizationId !== initialOrgId ||
            updatedUser.isOrgAdmin
        );
        const timeElapsed = Date.now() - startTime;

        if (hasPlanChanged) {
          toast.success('Access matrix updated. Welcome to your new tier.', { id: 'payment-polling' });
          await fetchDashboardData();
          return;
        }

        if (timeElapsed > 60000) {
          if (needsLoadingToast) {
             toast.error('The payment is taking longer than usual to sync. Please refresh in a minute.', { id: 'payment-polling' });
          }
          await fetchDashboardData();
          return;
        }

        setTimeout(pollProfile, 3000);
      };

      pollProfile();
    }
  }, [searchParams, isAuthenticated, user, fetchProfile, fetchDashboardData]);

  if (!mounted || (isLoading && !dashboardData)) return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
        <DashboardSkeleton />
      </div>
    </DashboardLayout>
  );

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
      case 'critical': return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
      case 'high': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
      case 'medium': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      case 'low': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      default: return 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]';
    }
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <>
    <DashboardLayout>
      <motion.div
        initial={false}
        animate="visible"
        variants={containerVariants}
        className="flex flex-col gap-8 relative z-10 pt-6 lg:pt-12 pb-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-200 hover:border-primary/40 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-inner border border-white/5">
                  <span className="material-icons-round text-2xl">auto_awesome</span>
                </div>
                {(dashboardData?.hoursSaved?.today || 0) > 0 && (
                  <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest shadow-lg backdrop-blur-md">
                    +{dashboardData!.hoursSaved.today.toFixed(1)}h today
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Cognitive Time Saved</p>
              <h3 className="text-4xl font-black text-white mt-3 font-display tracking-tightest">
                {dashboardData?.hoursSaved?.total?.toFixed(1) || '0.0'} <span className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Hrs</span>
              </h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-200 hover:border-violet-400/40 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-violet-400/10 text-violet-400 rounded-2xl flex items-center justify-center group-hover:bg-violet-400 group-hover:text-background-dark transition-all duration-200 shadow-inner border border-white/5">
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
                      className="bg-violet-400 h-full rounded-full shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                    ></motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-200 hover:border-sky-400/40 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-sky-400/10 text-sky-400 rounded-2xl flex items-center justify-center group-hover:bg-sky-400 group-hover:text-background-dark transition-all duration-200 shadow-inner border border-white/5">
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

          <motion.div variants={itemVariants} className="premium-glass p-5 lg:p-7 rounded-2xl lg:rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-200 hover:border-amber-400/40 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-400 group-hover:text-background-dark transition-all duration-200 shadow-inner border border-white/5">
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
            <div className="premium-glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-200 hover:border-primary/20 backdrop-blur-3xl">
              <div className="p-4 lg:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-black text-white font-display tracking-tightest">Registry Operations</h3>
                    <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time case intelligence stream</p>
                  </div>
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
                          onClick={() => router.push(`/dashboard/cases/${c._id}`)}
                          onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/cases/${c._id}`)}
                          tabIndex={0}
                          role="button"
                          aria-label={`View case ${c.name}`}
                        >
                          <td className="px-4 lg:px-8 py-4 lg:py-6">
                            <div className="flex items-center gap-3 lg:gap-5">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/[0.03] flex items-center justify-center text-white font-black text-base lg:text-lg shadow-xl border border-white/[0.08] uppercase transform group-hover:scale-105 group-hover:border-primary/40 transition-all duration-200 shrink-0">
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
                            <div className="flex items-center gap-2 text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                              <Sparkles size={12} className="text-sky-400 animate-pulse" />
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
            <motion.div variants={itemVariants} className="premium-glass rounded-[2rem] border border-white/10 shadow-2xl p-8 transition-all hover:border-rose-500/30 group backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.02] to-transparent pointer-events-none" />
              <h3 className="text-[10px] font-black text-white mb-8 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)]" />
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

            <motion.div variants={itemVariants} className="premium-glass rounded-[2rem] p-8 text-white shadow-[0_20px_80px_-15px_rgba(217,70,239,0.25)] relative overflow-hidden group border border-white/10 hover:border-fuchsia-500/40 transition-all duration-1000 backdrop-blur-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 micro-grid opacity-10 z-0 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-500 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-fuchsia-500/20 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                    <span className="material-icons-round text-2xl">psychology</span>
                  </div>
                  <div>
                      <h4 className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-400">Cognitive Neural Core</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,1)]"></span>
                        </span>
                        <p className="text-[9px] text-fuchsia-400 font-black uppercase tracking-widest">Neural Layer Active</p>
                      </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-[13px] text-slate-300 leading-relaxed font-bold">
                    {(dashboardData?.documents?.total || 0) > 0
                      ? `Intelligence matrix synchronized. Indexed ${dashboardData!.documents.total} units across the semantic cloud.`
                      : "System in idle hibernation. Awaiting case documentation to initialize the neural processing layer."}
                  </p>
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAuditModalOpen(true)}
                      className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:shadow-fuchsia-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      Execute Neural Audit
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-[100px]"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
      
      <AnimatePresence>
        {isAuditModalOpen && (
          <GlobalAuditModal 
            isOpen={isAuditModalOpen} 
            onClose={() => setIsAuditModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function DashboardClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
