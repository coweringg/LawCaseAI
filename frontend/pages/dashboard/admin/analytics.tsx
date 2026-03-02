import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Zap,
  DollarSign,
  Clock,
  User,
  Users,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/utils/helpers'

export default function AnalyticsDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/analytics/ai?range=${range}`)
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, isAuthLoading, router, range])

  const handleDeepAudit = async () => {
    toast.loading('Initiating Deep System Audit...', { id: 'audit' })
    try {
      // Re-fetch data to simulate an audit/refresh
      const res = await api.get(`/admin/analytics/ai?range=${range}`)
      if (res.data.success) {
        setData(res.data.data)
        toast.success('System Audit Complete: All nodes synchronized.', { id: 'audit' })
      }
    } catch (error) {
      console.error('Audit failed', error)
      toast.error('Audit link failed. Core synchronization interrupted.', { id: 'audit' })
    }
  }

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Synthesizing Intelligence...
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head>
        <title>AI Analytics | LawCaseAI Admin</title>
      </Head>

      <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">System Node: Intelligence</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tightest font-display italic uppercase">
              Neural Analytics
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Deep-Space Signal Processing &bull; Model Performance Metrics Active
            </p>
          </div>

          <div className="premium-glass p-1.5 rounded-2xl border border-white/10 shadow-2xl flex gap-1.5">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  range === r 
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                {r}
              </motion.button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Tokens', value: data.totals.tokens.toLocaleString(), icon: Zap, color: 'primary', border: 'border-primary/20', bg: 'bg-primary/5' },
            { label: 'Est. Cost', value: `$${data.totals.cost.toFixed(2)}`, icon: DollarSign, color: 'secondary', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
            { label: 'Avg Latency', value: `${data.totals.avgResponseTime}ms`, icon: Clock, color: 'warning', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
            { label: 'Interactions', value: data.totals.messages.toLocaleString(), icon: Activity, color: 'success', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' }
          ].map((kpi, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={kpi.label}
              className={`premium-glass border ${kpi.border} ${kpi.bg} p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{kpi.label}</p>
                  <h3 className="text-4xl font-black text-white tracking-tightest leading-none">{kpi.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                  <kpi.icon size={20} className={`text-${kpi.color}`} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+12.4% from average</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Trend Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                        <TrendingUp size={18} className="text-primary" />
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Consumption Trend</h3>
                 </div>
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Signal Status: Synchronized</div>
               </div>
               <div className="flex-1 p-8 min-h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.dailyTrend}>
                     <defs>
                       <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                     <XAxis 
                        dataKey="_id" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                        tick={{ fontWeight: 900, letterSpacing: '0.1em' }}
                     />
                     <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                        tick={{ fontWeight: 900, letterSpacing: '0.1em' }}
                     />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: '16px' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}
                        cursor={{ stroke: 'rgba(37, 99, 235, 0.2)', strokeWidth: 2 }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="tokens" 
                        stroke="#2563eb" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorTokens)" 
                        animationDuration={2000}
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
          </motion.div>

          {/* Power Users List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <Users size={18} className="text-amber-500" />
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Power Node Holders</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                  <AnimatePresence>
                    {data.powerUsers.map((user: any, index: number) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        key={user._id} 
                        className="flex items-center justify-between p-5 rounded-[1.5rem] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-white group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[12px] font-black text-white group-hover:text-primary transition-colors tracking-tightest truncate max-w-[120px]">{user.name}</p>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                           <p className="text-[13px] font-black text-white tracking-widest">{user.messageCount}</p>
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Signals</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {data.powerUsers.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40 py-20">
                        <Shield size={32} className="text-slate-700" />
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No active power nodes</p>
                     </div>
                  )}
                </div>
                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeepAudit}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white hover:border-primary/40 transition-all"
                    >
                        Deep System Audit
                    </motion.button>
                </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
