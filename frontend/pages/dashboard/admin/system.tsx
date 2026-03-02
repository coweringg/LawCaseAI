import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  ShieldAlert,
  Zap,
  Megaphone,
  Power,
  Server,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  Radio,
  Cpu,
  Globe,
  Database,
  Lock,
  Command,
  Terminal,
  ShieldCheck,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/utils/helpers'

export default function SystemCommandCenter() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false)
  
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'success' | 'error'>('info')
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const fetchSystemStatus = async () => {
    try {
      const res = await api.get('/admin/system/status')
      if (res.data.success) {
        setSystemStatus(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch system status', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
      return
    }

    if (user?.role === 'admin') {
      fetchSystemStatus()
    }
  }, [user, isAuthLoading, router])

  const handleToggleMaintenance = async () => {
    if (!systemStatus) return
    setIsTogglingMaintenance(true)
    try {
      const active = !systemStatus.maintenanceMode
      const res = await api.post('/admin/system/maintenance', { active })
      if (res.data.success) {
        setSystemStatus((prev: any) => ({ ...prev, maintenanceMode: active }))
        toast.success(`Mainframe Lockdown ${active ? 'ENGAGED' : 'RELEASED'}`)
      }
    } catch (error) {
      console.error('Failed to toggle maintenance', error)
      toast.error('System command rejected. Encryption mismatch.')
    } finally {
      setIsTogglingMaintenance(false)
    }
  }

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastMessage.trim()) return

    setIsBroadcasting(true)
    try {
      const res = await api.post('/admin/system/alert', { 
        message: broadcastMessage, 
        type: broadcastType,
        active: true 
      })
      if (res.data.success) {
        setBroadcastMessage('')
        fetchSystemStatus()
        toast.success('Pulse Signal Encoded & Transmitting')
      }
    } catch (error: any) {
      console.error('Failed to broadcast', error)
      toast.error(error.response?.data?.message || 'Transmission Link Failure')
    } finally {
      setIsBroadcasting(false)
    }
  }

  const handleClearBroadcast = async () => {
    setIsBroadcasting(true)
    try {
        const res = await api.post('/admin/system/alert', { active: false })
        if (res.data.success) {
            setSystemStatus((prev: any) => ({ ...prev, globalAlert: null }))
            toast.success('Signal Terminated. Frequency Cleared.')
        }
    } catch (error) {
        console.error('Failed to clear broadcast', error)
        toast.error('Critical: Failed to terminate signal link.')
    } finally {
        setIsBroadcasting(false)
    }
  }

  if (loading || !systemStatus) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Establishing Secure Link...
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head>
        <title>System Command | LawCaseAI</title>
      </Head>

      <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col p-8 md:p-12 gap-12">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-error-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">System Authorization Level: Alpha-Zero</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tightest leading-none font-display uppercase italic bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              System Command
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-error-500" /> Platform Integrity & Network Communications
            </p>
          </div>

          <div className="flex gap-4">
             <div className="premium-glass h-14 px-8 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                Mainframe Status: Active
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card variant="glass" className={cn(
                  "premium-glass border-white/10 overflow-hidden transition-all duration-700 h-full",
                  systemStatus.maintenanceMode ? "ring-2 ring-error-500/40 bg-error-500/5 shadow-[0_0_50px_rgba(239,68,68,0.1)]" : "shadow-2xl"
              )}>
                <div className="absolute inset-0 mesh-gradient opacity-[0.05] pointer-events-none"></div>
                <CardContent className="p-12 flex flex-col items-center text-center space-y-8 relative z-10">
                  <div className={cn(
                      "w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-700",
                      systemStatus.maintenanceMode 
                        ? "bg-error-500/20 text-error-500 border-2 border-error-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]" 
                        : "bg-white/5 text-slate-500 border-2 border-white/5"
                  )}>
                     <Power className={cn("w-16 h-16", systemStatus.maintenanceMode && "animate-pulse")} />
                  </div>
                  
                  <div className="space-y-4">
                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Maintenance Protocol</h2>
                     <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-sm mx-auto">
                       {systemStatus.maintenanceMode 
                         ? "CRITICAL: The mainframe is currently in LOCKDOWN mode. All external user uplink streams are terminated. Access restricted to Admin Keys only." 
                         : "Standard operational parameters detected. All user identity streams are currently receiving data packets. Access open to all verified network users."}
                     </p>
                  </div>

                  <div className="w-full pt-6">
                    <Button
                      variant="none"
                      onClick={handleToggleMaintenance}
                      disabled={isTogglingMaintenance}
                      className={cn(
                          "w-full h-20 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 border-2",
                          systemStatus.maintenanceMode 
                            ? "bg-white/5 hover:bg-white/10 text-white border-white/20" 
                            : "bg-error-600 hover:bg-error-500 text-white border-error-500 shadow-xl shadow-error-500/20"
                      )}
                    >
                       {isTogglingMaintenance 
                         ? "Syncing Central Core..." 
                         : (systemStatus.maintenanceMode ? "Deactivate Lockdown" : "Initiate System Lockdown")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card variant="glass" className="premium-glass border-white/10 shadow-2xl h-full overflow-hidden">
                 <div className="absolute inset-0 mesh-gradient opacity-[0.03] pointer-events-none"></div>
                 <CardContent className="p-12 space-y-8 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 text-primary shadow-xl shadow-primary/10">
                          <Radio className="w-10 h-10" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Global Pulse Broadcast</h2>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">Inter-Network Communication Channel</p>
                       </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {systemStatus.globalAlert ? (
                          <motion.div 
                            key="active-alert"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 shadow-2xl"
                          >
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Transmitting...</span>
                                 </div>
                                 <span className={cn(
                                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                     systemStatus.globalAlert.type === 'error' ? 'bg-error-500/20 text-error-500 border-error-500/20' : 
                                     systemStatus.globalAlert.type === 'success' ? 'bg-success-500/20 text-success-500 border-success-500/20' : 
                                     systemStatus.globalAlert.type === 'warning' ? 'bg-warning-500/20 text-warning-500 border-warning-500/20' : 
                                     'bg-primary/20 text-primary border-primary/20'
                                 )}>
                                     {systemStatus.globalAlert.type} Signal
                                 </span>
                              </div>
                              <p className="text-white font-bold text-lg leading-tight tracking-tight italic">&quot;{systemStatus.globalAlert.message}&quot;</p>
                              <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-slate-600" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                      Timestamp: {formatDate(systemStatus.globalAlert.timestamp)}
                                    </span>
                                  </div>
                                  <Button 
                                    variant="none"
                                    onClick={handleClearBroadcast}
                                    disabled={isBroadcasting}
                                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl transition-all border border-white/10 h-10"
                                  >
                                     Terminate Signal
                                  </Button>
                              </div>
                          </motion.div>
                      ) : (
                          <motion.form 
                            key="new-alert"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onSubmit={handleSendBroadcast} 
                            className="space-y-6"
                          >
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Message Payload</label>
                                <textarea
                                   value={broadcastMessage}
                                   onChange={(e) => setBroadcastMessage(e.target.value)}
                                   placeholder="Initiate communication protocol. Enter packet message..."
                                   className="w-full h-32 bg-black/40 border border-white/5 text-white p-6 rounded-[2rem] text-sm font-bold placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-black/60 transition-all resize-none shadow-inner"
                                   required
                                />
                             </div>
                             
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Signal Spectrum</label>
                                <div className="grid grid-cols-4 gap-3">
                                   {(['info', 'success', 'warning', 'error'] as const).map(type => (
                                       <button
                                          key={type}
                                          type="button"
                                          onClick={() => setBroadcastType(type)}
                                          className={cn(
                                              "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                              broadcastType === type 
                                                ? `bg-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-500 text-white shadow-xl shadow-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-500/20 border-white/20`
                                                : "border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10"
                                          )}
                                       >
                                           {type}
                                       </button>
                                   ))}
                                </div>
                             </div>
    
                             <Button 
                               variant="none"
                               type="submit"
                               disabled={isBroadcasting || !broadcastMessage.trim()}
                               className="w-full bg-primary hover:bg-primary/80 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-primary/20 transition-all mt-4 border border-white/10"
                             >
                                <Radio size={16} className={cn("mr-3", isBroadcasting && "animate-pulse")} />
                                {isBroadcasting ? "Encoding Packets..." : "Broadcast Signal"}
                             </Button>
                          </motion.form>
                      )}
                    </AnimatePresence>
                 </CardContent>
              </Card>
            </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
