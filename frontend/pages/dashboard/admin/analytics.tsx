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
  Area
} from 'recharts'
import {
  Brain,
  Zap,
  DollarSign,
  Clock,
  User,
  TrendingUp,
  Activity,
  Calendar,
  Filter
} from 'lucide-react'
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

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Neural Analytics
            </h1>
            <p className="text-slate-400 mt-1">Deep insight into AI model performance and consumption</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                  range === r ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glass" className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Tokens</p>
                  <h3 className="text-3xl font-black text-white">{data.totals.tokens.toLocaleString()}</h3>
                </div>
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-secondary/20 bg-secondary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Est. Cost</p>
                  <h3 className="text-3xl font-black text-white">${data.totals.cost.toFixed(2)}</h3>
                </div>
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-warning/20 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">Avg Latency</p>
                  <h3 className="text-3xl font-black text-white">{data.totals.avgResponseTime}ms</h3>
                </div>
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-success-500 uppercase tracking-widest mb-1">Interactions</p>
                  <h3 className="text-3xl font-black text-white">{data.totals.messages.toLocaleString()}</h3>
                </div>
                <Activity className="w-5 h-5 text-success-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trend Chart */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="h-[400px] flex flex-col">
               <div className="p-6 border-b border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-primary" />
                   Token Consumption Trend
                 </h3>
               </div>
               <div className="flex-1 p-4 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.dailyTrend}>
                     <defs>
                       <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis 
                        dataKey="_id" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatDate(val).split(',')[0]} // Short date
                     />
                     <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                     />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="tokens" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorTokens)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </Card>
          </div>

          {/* Power Users List */}
          <div className="lg:col-span-1">
             <Card variant="glass" className="h-[400px] flex flex-col">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-warning" />
                    Top Power Users
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {data.powerUsers.map((user: any, index: number) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">
                          {index + 1}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                           <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-white">{user.messageCount}</p>
                         <p className="text-[9px] text-slate-500 uppercase">Requests</p>
                      </div>
                    </div>
                  ))}
                  {data.powerUsers.length === 0 && (
                     <div className="text-center p-8 text-slate-500 text-xs">No active users found</div>
                  )}
                </div>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
