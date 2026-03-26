import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  ArrowLeft,
  Building,
  User,
  Users,
  CreditCard,
  Calendar,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Mail,
  Zap,
  Globe,
  Database,
  Lock,
  RotateCcw,
  Check,
  X,
  RefreshCw,
  MoreVertical,
  Minus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/utils/helpers'

interface OrgMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  amount: number;
  status: string;
  date: string;
  currency: string;
}

interface OrganizationDetail {
  _id: string;
  name: string;
  adminId: string;
  totalSeats: number;
  usedSeats: number;
  firmCode: string;
  isActive: boolean;
  currentPeriodEnd: string;
  admin: {
    name: string;
    email: string;
    plan: string;
    createdAt: string;
  };
  members: OrgMember[];
  transactions: Transaction[];
}

export default function OrganizationDetailPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { id } = router.query
  
  const [loading, setLoading] = useState(true)
  const [org, setOrg] = useState<OrganizationDetail | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchDetails = async () => {
    if (!id) return
    try {
      const res = await api.get(`/admin/organizations/${id}`)
      if (res.data.success) {
        setOrg(res.data.data)
      }
    } catch (error) {
       console.error('Failed to fetch details', error)
       toast.error('Failed to decrypt institutional packet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
      return
    }

    if (id && user?.role === 'admin') {
      fetchDetails()
    }
  }, [id, user, isAuthLoading, router])

  const handleToggleStatus = async () => {
    if (!org) return
    setIsProcessing(true)
    try {
      const active = !org.isActive
      const res = await api.patch(`/admin/organizations/${org._id}/status`, { isActive: active })
      if (res.data.success) {
        setOrg({ ...org, isActive: active })
        toast.success(`Node ${active ? 'ENABLED' : 'TERMINATED'}`)
      }
    } catch (error) {
       toast.error('Command rejected by security layer.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtendPlan = async () => {
    if (!org) return
    setIsProcessing(true)
    try {
      const res = await api.post(`/admin/organizations/${org._id}/extend`, { months: 1 })
      if (res.data.success) {
        setOrg({ ...org, currentPeriodEnd: res.data.data.currentPeriodEnd })
        toast.success('Lease successfully extended.')
      }
    } catch (error) {
       toast.error('Failed to extend node lease.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading || !org) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting Firm Assets...</p>
        </div>
      </DashboardLayout>
    )
  }

  const expiryDate = new Date(org.currentPeriodEnd)
  const now = new Date()
  const isExpired = expiryDate < now

  return (
    <DashboardLayout>
      <Head>
        <title>{org.name} | Admin Node Viewer</title>
      </Head>

      <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-display">
        <div className="flex items-center justify-between">
           <button 
             onClick={() => router.push('/dashboard/admin/organizations')}
             className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
           >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Index</span>
           </button>

           <div className="flex items-center gap-4">
              <div className={cn(
                "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                org.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                 <div className={cn("w-2 h-2 rounded-full", org.isActive ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")} />
                 Status: {org.isActive ? 'OPERATIONAL' : 'OFFLINE'}
              </div>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[3rem] p-12 overflow-hidden border border-white/10 shadow-2xl premium-glass"
        >
           <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-40 pointer-events-none" />
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20">
                       <Building className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h1 className="text-5xl font-black text-white tracking-tightest">{org.name}</h1>
                       <div className="flex items-center gap-2 mt-2 opacity-60">
                          <code className="text-primary font-mono text-sm tracking-widest">{org.firmCode}</code>
                          <span className="text-white text-xs">&bull;</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Established Node</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Contract Capacity</p>
                       <p className="text-xl font-black text-white">{org.usedSeats} <span className="text-slate-700">/</span> {org.totalSeats}</p>
                       <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(org.usedSeats/org.totalSeats)*100}%` }} className="bg-primary h-full" />
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Service Tier</p>
                       <p className="text-xl font-black text-primary flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {org.admin.plan.toUpperCase()}
                       </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Lease Expiry</p>
                       <p className={cn("text-xl font-black", isExpired ? "text-red-500" : "text-white")}>
                          {formatDate(org.currentPeriodEnd)}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                 <button 
                   onClick={handleExtendPlan}
                   disabled={isProcessing}
                   className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50"
                 >
                    Extend Node Lease
                 </button>
                 <button 
                   onClick={handleToggleStatus}
                   disabled={isProcessing}
                   className={cn(
                     "px-10 py-5 rounded-[1.5rem] font-black border uppercase text-xs tracking-widest transition-all shadow-xl disabled:opacity-50",
                     org.isActive ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                   )}
                 >
                    {org.isActive ? 'Deactivate Node' : 'Activate Node'}
                 </button>
              </div>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <div className="xl:col-span-1 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-glass rounded-[2rem] p-8 border border-white/10"
              >
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 border-b border-white/5 pb-4">Administrative Anchor</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                           <User className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Admin Name</p>
                           <p className="text-sm font-black text-white">{org.admin.name}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                           <Mail className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Address</p>
                           <p className="text-sm font-black text-white">{org.admin.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                           <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Node Genesis</p>
                           <p className="text-sm font-black text-white">{formatDate(org.admin.createdAt)}</p>
                        </div>
                     </div>
                  </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="premium-glass rounded-[2rem] p-8 border border-white/10"
              >
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-8 border-b border-white/5 pb-4">Financial Log</h3>
                  <div className="space-y-4">
                     {org.transactions.length === 0 ? (
                       <div className="py-12 text-center opacity-30">
                          <CreditCard className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">No transactions recorded</p>
                       </div>
                     ) : (
                       org.transactions.map((tx) => (
                         <div key={tx._id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                  <Check className="w-4 h-4" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-white">${tx.amount} {tx.currency}</p>
                                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{formatDate(tx.date)}</p>
                               </div>
                            </div>
                            <span className="text-[8px] font-black px-2 py-1 rounded bg-white/5 text-slate-500 uppercase tracking-tighter">SUCCESS</span>
                         </div>
                       ))
                     )}
                  </div>
              </motion.div>
           </div>

           <div className="xl:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="premium-glass rounded-[2rem] border border-white/10 overflow-hidden"
              >
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                       <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Node Membership</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authorized entity personnel</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white uppercase tracking-tighter">
                          {org.members.length} Identifiers
                       </span>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-white/[0.02]">
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Member</th>
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Clearance</th>
                             <th className="px-8 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Date</th>
                             <th className="px-8 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Control</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {org.members.map((member) => (
                             <tr key={member._id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                         {member.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-xs font-black text-white">{member.name}</p>
                                         <p className="text-[9px] text-slate-500">{member.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <span className={cn(
                                     "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                     member.role === 'admin' ? "bg-primary/20 text-primary" : "bg-white/10 text-slate-400"
                                   )}>
                                      {member.role || 'Member'}
                                   </span>
                                </td>
                                <td className="px-8 py-5">
                                   <p className="text-[10px] font-medium text-slate-300">{formatDate(member.createdAt)}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button className="text-slate-700 hover:text-white transition-colors">
                                      <MoreVertical className="w-4 h-4" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .tracking-tightest {
          letter-spacing: -0.06em;
        }
      `}</style>
    </DashboardLayout>
  )
}
