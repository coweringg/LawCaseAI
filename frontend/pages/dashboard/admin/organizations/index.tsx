import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Search,
  Users,
  CreditCard,
  Calendar,
  Settings,
  ShieldCheck,
  Eye,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Building,
  Terminal,
  ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/utils/helpers'

interface OrgAdmin {
  email: string;
  plan: string;
}

interface Organization {
  _id: string;
  name: string;
  totalSeats: number;
  usedSeats: number;
  firmCode: string;
  isActive: boolean;
  currentPeriodEnd: string;
  createdAt: string;
  adminInfo: OrgAdmin;
}

export default function OrganizationsDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [totalCount, setTotalCount] = useState(0)

  const fetchOrganizations = async () => {
    try {
      const res = await api.get(`/admin/organizations?page=${page}&limit=10&search=${searchTerm}&status=${filterStatus}`)
      if (res.data.success) {
        setOrganizations(res.data.data.organizations || [])
        setTotalPages(res.data.data.pages || 1)
        setTotalCount(res.data.data.total || 0)
      }
    } catch (error) {
       console.error('Failed to fetch orgs', error)
       toast.error('Failed to retrieve firms index.')
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
      fetchOrganizations()
    }
  }, [user, isAuthLoading, router, page, searchTerm, filterStatus])

  const getStatus = (org: Organization) => {
    const now = new Date()
    const expiry = new Date(org.currentPeriodEnd)
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (!org.isActive) return { label: 'Deactivated', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: 'block' }
    if (diffDays < 0) return { label: 'Expired', color: 'text-red-500', bg: 'bg-red-500/10', icon: 'error' }
    if (diffDays < 7) return { label: 'Expiring Soon', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: 'warning' }
    return { label: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: 'check_circle' }
  }

  const filteredOrgs = organizations || []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Mapping Global Infrastructure...
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Organizations | LawCaseAI Admin</title>
      </Head>

      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Firm Governance</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tightest flex items-center gap-4">
              Organizations <span className="text-slate-700">/</span> Institutional Nodes
            </h1>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex items-center gap-3"
          >
             <div className="px-4 py-2 premium-glass rounded-xl border border-white/5 flex items-center gap-3">
                <Building className="w-4 h-4 text-primary" />
                <span className="text-xl font-black text-white">{totalCount}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Entities</span>
             </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 xl:grid-cols-4 gap-6"
        >
          <div className="xl:col-span-3 premium-glass rounded-[2rem] border border-white/10 p-2 flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search firm name, email or code..."
                className="w-full bg-white/[0.03] border-none rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-slate-600 outline-none focus:bg-white/[0.05] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-2xl w-full md:w-auto">
              {(['all', 'active', 'expiring', 'expired'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filterStatus === status 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="premium-glass rounded-[2rem] border border-white/10 p-2">
             <button className="w-full h-full bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:shadow-[0_0_30px_rgba(10,68,184,0.3)] transition-all">
                <Terminal className="w-4 h-4" />
                Audit Protocol
             </button>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="premium-glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Organization Details</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Administrative Anchor</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Plan Type</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Capacity Usage</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contract End</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredOrgs.map((org, index) => {
                    const status = getStatus(org)
                    const usagePercent = Math.round((org.usedSeats / org.totalSeats) * 100)
                    
                    return (
                      <motion.tr 
                        key={org._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                              <Building className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-white">{org.name}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{org.firmCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-bold text-slate-300">{org.adminInfo.email}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-tighter">
                              {org.adminInfo.plan}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-2">
                             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                               <span className="text-slate-500">{org.usedSeats} / {org.totalSeats}</span>
                               <span className="text-white">{usagePercent}%</span>
                             </div>
                             <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${usagePercent}%` }}
                                 className={cn(
                                   "h-full rounded-full",
                                   usagePercent > 90 ? "bg-red-500" : "bg-primary"
                                 )}
                               />
                             </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-slate-600" />
                              <span className="text-xs font-medium">{formatDate(org.currentPeriodEnd)}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className={cn(
                             "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                             status.bg,
                             status.color,
                             status.color.replace('text-', 'border-').replace('500', '500/20')
                           )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-glow", status.color.replace('text-', 'bg-'))} />
                              {status.label}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button 
                             onClick={() => router.push(`/dashboard/admin/organizations/${org._id}`)}
                             className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-primary hover:border-primary transition-all shadow-xl"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Showing Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="text-[10px] font-black uppercase tracking-widest !bg-white/5 hover:!bg-white/10 border border-white/10 disabled:opacity-30 h-10 px-6 rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="text-[10px] font-black uppercase tracking-widest !bg-white/5 hover:!bg-white/10 border border-white/10 disabled:opacity-30 h-10 px-6 rounded-xl"
                  >
                    Next
                  </Button>
                </div>
            </div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 10px currentColor;
        }
        .tracking-tightest {
          letter-spacing: -0.05em;
        }
      `}</style>
    </DashboardLayout>
  )
}
