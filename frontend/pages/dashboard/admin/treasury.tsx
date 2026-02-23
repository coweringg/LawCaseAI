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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Briefcase,
  Layers,
  Award,
  Download,
  Zap,
  Globe,
  Lock,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/utils/helpers'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function TreasuryDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await api.get('/admin/treasury')
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch treasury stats', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user, isAuthLoading, router])

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Accessing Vault...
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Elite Treasury Vault | LawCaseAI</title>
      </Head>

      <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col p-8 md:p-12 gap-12">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
        
        {/* Header Area */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Financial Authorization: Alpha-Two</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tightest leading-none font-display uppercase italic bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              Treasury Vault
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-success-500" /> Real-time Revenue Matrix & Institutional Liquidity
            </p>
          </div>

          <div className="flex gap-4">
             <Button 
                variant="none" 
                className="premium-glass h-14 px-8 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all flex items-center gap-3"
             >
                <Download size={18} className="text-success-500" />
                Export Ledger .CSV
             </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { 
                label: 'Total Net Revenue', 
                value: `$${data.kpi.totalRevenue.toLocaleString()}`, 
                icon: DollarSign, 
                color: 'text-success-500', 
                bg: 'bg-success-500/5', 
                border: 'border-success-500/20' 
            },
            { 
                label: 'Monthly Recurring (MRR)', 
                value: `$${data.kpi.mrr.toLocaleString()}`, 
                icon: TrendingUp, 
                color: 'text-primary', 
                bg: 'bg-primary/5', 
                border: 'border-primary/20',
                meta: `+${data.kpi.growth}% Velocity`
            },
            { 
                label: 'Active Institutional Subscriptions', 
                value: data.planDistribution.reduce((acc: number, curr: any) => acc + curr.count, 0), 
                icon: CreditCard, 
                color: 'text-secondary', 
                bg: 'bg-secondary/5', 
                border: 'border-secondary/20' 
            }
          ].map((kpi, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={kpi.label}
              className={`premium-glass p-8 rounded-[2.5rem] border ${kpi.border} ${kpi.bg} shadow-2xl group flex flex-col justify-between min-h-[180px]`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{kpi.label}</p>
                  <p className="text-5xl font-black text-white tracking-tighter italic">{kpi.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
                </div>
              </div>
              {kpi.meta && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-success-500/20 rounded-md text-[9px] font-black text-success-500 uppercase tracking-widest">
                    {kpi.meta}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          {/* Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <Card variant="glass" className="premium-glass border-white/10 shadow-2xl h-[500px] rounded-[3rem] p-4 flex flex-col overflow-hidden">
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-success-500/10 rounded-xl border border-success-500/20">
                     <Activity size={20} className="text-success-500" />
                   </div>
                   <div>
                     <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Revenue Stream Analysis</h3>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">30-Day Financial Trajectory</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">Daily Aggregation</div>
                 </div>
               </div>
               <div className="flex-1 p-8 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.revenueTrend}>
                     <defs>
                       <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                         <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                     <XAxis 
                        dataKey="_id" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatDate(val).split(',')[0]} 
                        dy={10}
                     />
                     <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                        dx={-10}
                     />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#10b981', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                        cursor={{fill: 'rgba(255,255,255,0.03)'}}
                     />
                     <Bar 
                        dataKey="amount" 
                        fill="url(#revenueGradient)" 
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                     />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </Card>
          </motion.div>

          {/* Plan Distribution */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
             <Card variant="glass" className="premium-glass border-white/10 shadow-2xl h-[500px] rounded-[3rem] p-4 flex flex-col overflow-hidden group">
                <div className="p-8 border-b border-white/5">
                   <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                     <Layers className="w-5 h-5 text-indigo-500" />
                     Network Tier Mix
                   </h3>
                </div>
                <div className="flex-1 min-h-0 relative py-4">
                   <ResponsiveContainer width="100%" height="80%">
                     <PieChart>
                        <Pie
                          data={data.planDistribution}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="count"
                          nameKey="_id"
                          stroke="none"
                        >
                          {data.planDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '15px' }}
                           itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        />
                     </PieChart>
                   </ResponsiveContainer>
                   
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center mt-[-40px]">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global</p>
                         <p className="text-3xl font-black text-white italic">MIX</p>
                      </div>
                   </div>
                   
                   {/* Custom Legend */}
                   <div className="grid grid-cols-2 gap-4 px-8 pb-8">
                      {data.planDistribution.map((entry: any, index: number) => (
                        <div key={entry._id} className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-[10px] uppercase font-black text-white tracking-widest">
                                {entry._id}
                              </span>
                           </div>
                           <p className="text-xs font-black text-slate-500 ml-3.5 tracking-tighter">
                             {entry.count} ENTITIES
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
