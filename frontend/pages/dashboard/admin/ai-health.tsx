import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import api from '@/utils/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface AiProvider {
  provider: string
  status: 'operational' | 'degraded' | 'down'
  latency: number
  successRate: number
  rateLimits: number
  estimatedCost: string
}

interface AiLogEntry {
  _id: string
  userId?: { email: string }
  provider: string
  aiModel: string
  action: string
  status: string
  tokens: number
  responseTime: number
  errorMessage?: string
  timestamp: string
  resolved: boolean
}

interface AiHealthData {
  providers: AiProvider[]
  recentLogs: {
    logs: AiLogEntry[]
    total: number
    page: number
    pages: number
  }
  stats: {
    requests24h: number
    requests7d: number
    requests30d: number
    tokens24h: number
    dailyTrend: Array<{ _id: string, requests: number, provider: string }>
  }
}

const AiHealthMonitor = () => {
  const [data, setData] = useState<AiHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [logPage, setLogPage] = useState(1)

  const fetchData = async () => {
    try {
      const response = await api.get(`/admin/ai-health?logPage=${logPage}&logLimit=10`)
      if (response.data.success) {
        setData(response.data.data)
        setLastRefreshed(new Date())
      }
    } catch (err) {
      toast.error('Failed to sync with AI Health nodes')
    } finally {
      setLoading(false)
    }
  }

  const resolveError = async (id: string) => {
    try {
      await api.patch(`/admin/ai-health/logs/${id}/resolve`)
      toast.success('System log updated')
      fetchData()
    } catch (err) {
      toast.error('Failed to update log')
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [logPage])

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head>
        <title>AI Health Monitor | Admin | LawCaseAI</title>
      </Head>

      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              AI Health Monitor
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time telemetry and infrastructure status for AI nodes.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Last Node Sync</span>
              <span className="text-sm font-mono text-primary">{format(lastRefreshed, 'HH:mm:ss')}</span>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-primary"
            >
              <span className="material-icons-round">refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Requests (24h)" 
            value={data?.stats.requests24h.toLocaleString()} 
            icon="hub" 
            color="primary" 
          />
          <StatCard 
            title="Active Tokens (24h)" 
            value={(data?.stats.tokens24h && data.stats.tokens24h > 1000000) ? (data.stats.tokens24h / 1000000).toFixed(1) + 'M' : data?.stats.tokens24h.toLocaleString()} 
            icon="token" 
            color="blue" 
          />
          <StatCard 
            title="Requests (7d)" 
            value={data?.stats.requests7d.toLocaleString()} 
            icon="history" 
            color="purple" 
          />
          <StatCard 
            title="Requests (30d)" 
            value={data?.stats.requests30d.toLocaleString()} 
            icon="calendar_month" 
            color="emerald" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data?.providers.map((provider) => (
            <ProviderCard key={provider.provider} provider={provider} />
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary">terminal</span>
              System Error Logs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Node</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Performance</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Payload</th>
                  <th className="px-6 py-4">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentLogs?.logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{format(new Date(log.timestamp), 'MMM d, HH:mm')}</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{log._id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.provider === 'openai' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                        <span className="text-sm font-bold uppercase">{log.provider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                        log.status === 'success' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                        log.status === 'rate_limit' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                        'bg-rose-400/10 text-rose-400 border-rose-400/20'
                      }`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-400">{log.responseTime}ms</span>
                        <span className="text-primary font-mono">{log.tokens} tx</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-300">{log.userId?.email || 'System'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 max-w-xs truncate font-mono">
                        {log.errorMessage || log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status !== 'success' && !log.resolved ? (
                        <button 
                          onClick={() => resolveError(log._id)}
                          className="p-1 px-3 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 rounded-lg text-[10px] font-bold uppercase transition-all"
                        >
                          Resolve
                        </button>
                      ) : log.resolved ? (
                        <span className="material-icons-round text-emerald-400 text-sm">check_circle</span>
                      ) : (
                        <span className="text-gray-600 text-[10px] font-bold uppercase">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.recentLogs.pages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Page {data.recentLogs.page} of {data.recentLogs.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={logPage === 1}
                  onClick={() => setLogPage(p => p - 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all text-white"
                >
                  Previous
                </button>
                <button
                  disabled={logPage === data.recentLogs.pages}
                  onClick={() => setLogPage(p => p + 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

const StatCard = ({ title, value, icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
        <span className={`material-icons-round text-2xl text-${color}-500`}>{icon}</span>
      </div>
    </div>
    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black mt-1 tabular-nums">{value}</h3>
  </motion.div>
)

const ProviderCard = ({ provider }: { provider: AiProvider }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-10 -top-10 w-40 h-40 ${
      provider.status === 'operational' ? 'bg-emerald-400/10' : 
      provider.status === 'degraded' ? 'bg-amber-400/10' : 'bg-rose-400/10'
    } blur-[80px] rounded-full`}></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Provider Node</span>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            {provider.provider}
            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.3)] ${
              provider.status === 'operational' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
              provider.status === 'degraded' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 
              'bg-rose-400/10 text-rose-400 border-rose-400/20'
            }`}>
              {provider.status}
            </span>
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">Est. Daily Cost</span>
          <span className="text-2xl font-mono text-emerald-400 font-bold">${provider.estimatedCost}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Latency</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold font-mono">{provider.latency}</span>
            <span className="text-[10px] text-gray-500 mb-1 underline decoration-primary/50">ms</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Success Rate</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold font-mono text-primary">{provider.successRate}</span>
            <span className="text-[10px] text-gray-500 mb-1 font-bold">%</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rate Limits</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold font-mono text-amber-500">{provider.rateLimits}</span>
            <span className="text-[10px] text-gray-400 mb-1">hits</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 overflow-hidden">
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${provider.successRate}%` }}
             transition={{ duration: 1, ease: 'easeOut' }}
             className={`h-full ${
               provider.status === 'operational' ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
               'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
             }`}
           />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-bold text-gray-500 uppercase">System Integrity</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Verified Node Pulse</span>
        </div>
      </div>
    </div>
  </motion.div>
)

export default AiHealthMonitor
