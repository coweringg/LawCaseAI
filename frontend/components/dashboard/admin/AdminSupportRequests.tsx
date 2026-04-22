import React from 'react'
import { motion } from 'framer-motion'
import { Bell, Headphones, CheckCircle, Clock, RotateCcw, Trash2, Filter, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { formatDate, cn } from '@/utils/helpers'

interface SupportRequest {
  _id: string; userId: string; userEmail: string; userName: string; lawFirm?: string
  type: 'system_error' | 'feature_uplink' | 'login_issue'
  subject: string; description: string
  status: 'pending' | 'resolved'; createdAt: string; updatedAt: string
}

interface AdminSupportRequestsProps {
  supportRequests: SupportRequest[]
  signalSubTab: 'public' | 'user'; setSignalSubTab: (v: 'public' | 'user') => void
  supportTypeFilter: 'all' | 'system_error' | 'feature_uplink' | 'login_issue'; setSupportTypeFilter: (v: 'all' | 'system_error' | 'feature_uplink' | 'login_issue') => void
  supportStatusFilter: string; setSupportStatusFilter: (v: string) => void
  publicSubjectFilter: string; setPublicSubjectFilter: (v: string) => void
  supportPage: number; setSupportPage: React.Dispatch<React.SetStateAction<number>>; supportTotalPages: number
  isSupportLoading: boolean
  setSelectedSupportRequest: (v: SupportRequest) => void
  setShowSupportDetailModal: (v: boolean) => void
  handleResolveSupport: (id: string) => void
  handleDeleteSupport: (id: string) => void
  handleClearSupport: (type?: string) => void
}

export function AdminSupportRequests({
  supportRequests, signalSubTab, setSignalSubTab,
  supportTypeFilter, setSupportTypeFilter,
  supportStatusFilter, setSupportStatusFilter,
  publicSubjectFilter, setPublicSubjectFilter,
  supportPage, setSupportPage, supportTotalPages,
  isSupportLoading, setSelectedSupportRequest, setShowSupportDetailModal,
  handleResolveSupport, handleDeleteSupport, handleClearSupport
}: AdminSupportRequestsProps) {
  const supportColumns = [
    {
      key: 'createdAt' as keyof SupportRequest,
      title: 'Received',
      render: (v: string) => <span className="text-slate-400 text-sm">{formatDate(v)}</span>
    },
    {
      key: 'userName' as keyof SupportRequest,
      title: 'User',
      render: (v: string, item: SupportRequest) => (
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-tight">{v}</span>
          <span className="text-[10px] text-slate-500 font-medium">{item.userEmail}</span>
          {item.lawFirm && <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">{item.lawFirm}</span>}
        </div>
      )
    },
    {
      key: 'type' as keyof SupportRequest,
      title: 'Category',
      render: (v: string, item: SupportRequest) => {
        if (v === 'login_issue') {
          const subject = item.subject || 'Login Issue'
          const subjectColor = 
            subject === 'Login Error' ? 'bg-orange-500/20 text-orange-400' :
            subject === 'Forgot Password' ? 'bg-violet-500/20 text-violet-400' :
            subject === 'Account Locked' ? 'bg-rose-500/20 text-rose-400' :
            subject === 'Other Issue' ? 'bg-cyan-500/20 text-cyan-400' :
            'bg-orange-500/20 text-orange-400'
          return (
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", subjectColor)}>
              {subject}
            </span>
          )
        }
        return (
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
            v === 'system_error' ? "bg-error-500/20 text-error-500" : "bg-emerald-500/20 text-emerald-400"
          )}>
            {v === 'system_error' ? 'System Error' : 'Feature Uplink'}
          </span>
        )
      }
    },
    {
      key: 'subject' as keyof SupportRequest,
      title: 'Transmission',
      render: (v: string, item: SupportRequest) => (
        <div className="flex flex-col max-w-md">
          <span className="text-white font-bold truncate">{v}</span>
          <span className="text-xs text-slate-400 line-clamp-1">{item.description}</span>
        </div>
      )
    },
    {
      key: 'status' as keyof SupportRequest,
      title: 'Status',
      render: (v: string) => (
        <span className={cn(
          "inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
          v === 'resolved' ? "bg-success-500/20 text-success-500" : "bg-warning-500/20 text-warning-500"
        )}>
          {v === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {v}
        </span>
      )
    },
    {
      key: '_id' as keyof SupportRequest,
      title: 'Action',
      render: (v: string, item: SupportRequest) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSupportRequest(item)
              setShowSupportDetailModal(true)
            }}
            className="text-primary hover:text-white bg-primary/10 hover:bg-primary/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-primary/20"
          >
            Details
          </Button>
          {item.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResolveSupport(item._id)}
              className="text-success-500 hover:text-white bg-success-500/10 hover:bg-success-500/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-success-500/20"
            >
              Resolve
            </Button>
          )}
          <Button
            variant="none"
            size="sm"
            onClick={() => handleDeleteSupport(item._id)}
            className="p-1 px-2 h-auto text-slate-600 hover:text-error-500 hover:bg-error-500/10 border border-transparent hover:border-error-500/20 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <motion.div key="support" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
            <Bell size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Signal Feed</h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Incoming Support Packets</p>
          </div>
        </div>

        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 gap-1.5">
          <button
            onClick={() => {
              setSignalSubTab('public')
              setSupportPage(1)
            }}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150",
              signalSubTab === 'public'
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            Public Signals
          </button>
          <button
            onClick={() => {
              setSignalSubTab('user')
              setSupportPage(1)
            }}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150",
              signalSubTab === 'user'
                ? "bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            User Signals
          </button>
        </div>
      </div>

      {signalSubTab === 'public' && (
        <motion.div
          key="public-signals"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Bell size={18} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Public Signals</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Login and Access Issues - Unauthenticated Users</p>
              </div>
            </div>

            <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 gap-1.5 flex-wrap">
              {[
                { id: '', label: 'All', activeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/20 shadow-lg' },
                { id: 'Login Error', label: 'Login Error', activeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10' },
                { id: 'Forgot Password', label: 'Forgot Password', activeClass: 'bg-violet-500/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/10' },
                { id: 'Account Locked', label: 'Account Locked', activeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/10' },
                { id: 'Other Issue', label: 'Other Issue', activeClass: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setPublicSubjectFilter(s.id)
                    setSupportPage(1)
                  }}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    publicSubjectFilter === s.id
                      ? s.activeClass
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <select
                  value={supportStatusFilter}
                  onChange={(e) => {
                    setSupportStatusFilter(e.target.value)
                    setSupportPage(1)
                  }}
                  className="bg-white/[0.02] border border-white/10 rounded-xl pl-6 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer hover:bg-white/[0.04] hover:text-white transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">All Nodes</option>
                  <option value="pending" className="bg-slate-900">Pending</option>
                  <option value="resolved" className="bg-slate-900">Resolved</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-white transition-colors">
                  <Filter size={12} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClearSupport('login_issue')}
                className="px-5 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-error-500 flex items-center gap-2 transition-all shadow-xl"
              >
                <Trash2 size={14} />
                Wipe Signals
              </motion.button>
            </div>
          </div>

          <div className="premium-glass border border-orange-500/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px]">
            <Table 
              data={supportRequests}
              columns={supportColumns}
              loading={isSupportLoading}
              emptyMessage="No public login signals detected."
            />

            {supportTotalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Page {supportPage} of {supportTotalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="none"
                    size="sm"
                    disabled={supportPage === 1 || isSupportLoading}
                    onClick={() => setSupportPage(p => p - 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    disabled={supportPage === supportTotalPages || isSupportLoading}
                    onClick={() => setSupportPage(p => p + 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {signalSubTab === 'user' && (
        <motion.div
          key="user-signals"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Headphones size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">User Signals</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Errors and Feature Requests - Authenticated Users</p>
              </div>
            </div>

            <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 gap-1.5">
              {[
                { id: 'all', label: 'All', activeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/20 shadow-lg' },
                { id: 'system_error', label: 'System Errors', activeClass: 'bg-error-500/20 text-error-500 border border-error-500/20 shadow-lg shadow-error-500/10' },
                { id: 'feature_uplink', label: 'Feature Uplinks', activeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10' }
              ].map(sType => (
                <button
                  key={sType.id}
                  onClick={() => {
                    setSupportTypeFilter(sType.id as any)
                    setSupportPage(1)
                  }}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    supportTypeFilter === sType.id 
                      ? sType.activeClass
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {sType.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <select
                  value={supportStatusFilter}
                  onChange={(e) => {
                    setSupportStatusFilter(e.target.value)
                    setSupportPage(1)
                  }}
                  className="bg-white/[0.02] border border-white/10 rounded-xl pl-6 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer hover:bg-white/[0.04] hover:text-white transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">All Nodes</option>
                  <option value="pending" className="bg-slate-900">Pending</option>
                  <option value="resolved" className="bg-slate-900">Resolved</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-white transition-colors">
                  <Filter size={12} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClearSupport(supportTypeFilter === 'all' ? 'user_all' : supportTypeFilter)}
                className="px-5 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-error-500 flex items-center gap-2 transition-all shadow-xl"
              >
                <Trash2 size={14} />
                Wipe Signals
              </motion.button>
            </div>
          </div>

          <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px]">
            <Table 
              data={supportRequests}
              columns={supportColumns}
              loading={isSupportLoading}
              emptyMessage="No user signals detected in current spectrum."
            />

            {supportTotalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Page {supportPage} of {supportTotalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="none"
                    size="sm"
                    disabled={supportPage === 1 || isSupportLoading}
                    onClick={() => setSupportPage(p => p - 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    disabled={supportPage === supportTotalPages || isSupportLoading}
                    onClick={() => setSupportPage(p => p + 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
