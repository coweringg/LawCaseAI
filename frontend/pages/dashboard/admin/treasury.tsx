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
  Download
} from 'lucide-react'
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
        <title>Financial Treasury | LawCaseAI Admin</title>
      </Head>

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="material-icons-round text-success-500 text-4xl">account_balance</span>
              Financial Treasury
            </h1>
            <p className="text-slate-400 mt-1">Real-time revenue monitoring and plan distribution</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white uppercase text-xs font-black tracking-widest gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="border-success-500/20 bg-success-500/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-success-500 uppercase tracking-widest mb-1">Total Revenue</p>
                  <h3 className="text-4xl font-black text-white">${data.kpi.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-3 rounded-xl bg-success-500/20">
                  <DollarSign className="w-6 h-6 text-success-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Monthly Recurring (MRR)</p>
                  <h3 className="text-4xl font-black text-white">${data.kpi.mrr.toLocaleString()}</h3>
                </div>
                <div className="p-3 rounded-xl bg-primary/20">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-success-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{data.kpi.growth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-warning/20 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">Active Subscriptions</p>
                  <h3 className="text-4xl font-black text-white">
                    {data.planDistribution.reduce((acc: number, curr: any) => acc + curr.count, 0)}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-warning/20">
                  <CreditCard className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="h-[400px] flex flex-col">
               <div className="p-6 border-b border-white/5">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                   <Briefcase className="w-4 h-4 text-success-500" />
                   Revenue Flow (30 Days)
                 </h3>
               </div>
               <div className="flex-1 p-4 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.revenueTrend}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis 
                        dataKey="_id" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatDate(val).split(',')[0]} 
                     />
                     <YAxis 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                     />
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar 
                        dataKey="amount" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                     />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </Card>
          </div>

          {/* Plan Distribution */}
          <div className="lg:col-span-1">
             <Card variant="glass" className="h-[400px] flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white" />
                    Plan Mix
                  </h3>
                </div>
                <div className="flex-1 min-h-0 relative">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={data.planDistribution}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="_id"
                        >
                          {data.planDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                        />
                     </PieChart>
                   </ResponsiveContainer>
                   
                   {/* Custom Legend */}
                   <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 flex-wrap px-4">
                      {data.planDistribution.map((entry: any, index: number) => (
                        <div key={entry._id} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                           <span className="text-[10px] uppercase font-bold text-slate-400">
                             {entry._id} ({entry.count})
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
