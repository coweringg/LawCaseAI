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
  Radio
} from 'lucide-react'
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
  
  // Actions State
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false)
  
  // Broadcast State
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
      }
    } catch (error) {
      console.error('Failed to toggle maintenance', error)
      alert('Failed to toggle maintenance mode')
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
        fetchSystemStatus() // Refresh to see active alert
      }
    } catch (error) {
      console.error('Failed to broadcast', error)
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
        }
    } catch (error) {
        console.error('Failed to clear broadcast', error)
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
        <title>System Command | LawCaseAI Admin</title>
      </Head>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-error-500" />
              System Command Center
            </h1>
            <p className="text-slate-400 mt-1">Global controls for platform integrity and communication</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
             <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Maintenance Control */}
            <Card variant="glass" className={cn(
                "border-2 transition-all duration-500",
                systemStatus.maintenanceMode ? "border-error-500 bg-error-500/10" : "border-white/10"
            )}>
              <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                <div className={cn(
                    "p-6 rounded-full transition-all duration-500",
                    systemStatus.maintenanceMode ? "bg-error-500/20 text-error-500" : "bg-white/5 text-slate-500"
                )}>
                   <Power className="w-12 h-12" />
                </div>
                
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Maintenance Mode</h2>
                   <p className="text-slate-400 text-sm max-w-xs mx-auto">
                     {systemStatus.maintenanceMode 
                       ? "Platform is currently LOCKED. Only admins can access." 
                       : "Platform is operational. Standard user access is enabled."}
                   </p>
                </div>

                <div className="w-full pt-4">
                  <Button
                    onClick={handleToggleMaintenance}
                    disabled={isTogglingMaintenance}
                    className={cn(
                        "w-full py-6 text-sm font-black uppercase tracking-[0.2em] transition-all",
                        systemStatus.maintenanceMode 
                          ? "bg-slate-700 hover:bg-slate-600 text-white" 
                          : "bg-error-600 hover:bg-error-500 text-white shadow-lg shadow-error-500/20"
                    )}
                  >
                     {isTogglingMaintenance 
                       ? "Switching Protocol..." 
                       : (systemStatus.maintenanceMode ? "Deactivate Maintenance" : "Activate Maintenance Protocol")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Broadcast System */}
            <Card variant="glass" className="border-white/10">
               <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-primary/20 rounded-xl text-primary">
                        <Radio className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-white">Global Broadcast</h2>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">Send alerts to all active connected users</p>
                     </div>
                  </div>

                  {systemStatus.globalAlert ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Broadcast</span>
                             <span className={cn(
                                 "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                 `bg-${systemStatus.globalAlert.type === 'error' ? 'error' : systemStatus.globalAlert.type === 'success' ? 'success' : systemStatus.globalAlert.type === 'warning' ? 'warning' : 'primary'}-500/20 text-${systemStatus.globalAlert.type === 'error' ? 'error' : systemStatus.globalAlert.type === 'success' ? 'success' : systemStatus.globalAlert.type === 'warning' ? 'warning' : 'primary'}-500`
                             )}>
                                 {systemStatus.globalAlert.type}
                             </span>
                          </div>
                          <p className="text-white font-medium text-sm">"{systemStatus.globalAlert.message}"</p>
                          <div className="text-[10px] text-slate-600 font-mono">
                              Sent: {formatDate(systemStatus.globalAlert.timestamp)}
                          </div>
                          <Button 
                            onClick={handleClearBroadcast}
                            disabled={isBroadcasting}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest mt-2"
                          >
                             Clear Broadcast
                          </Button>
                      </div>
                  ) : (
                      <form onSubmit={handleSendBroadcast} className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Content</label>
                            <Input
                               value={broadcastMessage}
                               onChange={(e) => setBroadcastMessage(e.target.value)}
                               placeholder="e.g., Scheduled maintenance in 10 minutes..."
                               className="bg-black/40 border-white/10 text-white py-3"
                               required
                            />
                         </div>
                         
                         <div className="grid grid-cols-4 gap-2">
                            {(['info', 'success', 'warning', 'error'] as const).map(type => (
                                <button
                                   key={type}
                                   type="button"
                                   onClick={() => setBroadcastType(type)}
                                   className={cn(
                                       "py-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                       broadcastType === type 
                                         ? `border-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-500 bg-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-500/20 text-white`
                                         : "border-transparent bg-white/5 text-slate-500 hover:bg-white/10"
                                   )}
                                >
                                    {type}
                                </button>
                            ))}
                         </div>

                         <Button 
                           type="submit"
                           disabled={isBroadcasting || !broadcastMessage.trim()}
                           className="w-full bg-primary hover:bg-primary/80 text-white py-4 font-black uppercase tracking-widest text-xs"
                         >
                            {isBroadcasting ? "Broadcasting..." : "Transmit Alert"}
                         </Button>
                      </form>
                  )}
               </CardContent>
            </Card>

        </div>
      </div>
    </DashboardLayout>
  )
}
