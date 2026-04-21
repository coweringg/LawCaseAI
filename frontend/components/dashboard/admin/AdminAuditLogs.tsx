import React from 'react'
import { motion } from 'framer-motion'
import { Search, FileText, ShieldAlert, Eye, RotateCcw, Trash2, Filter, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { formatDate, cn } from '@/utils/helpers'

interface AuditLogEntry {
  _id: string; adminId: string; adminName: string; targetId: string; targetName: string
  targetType: 'user' | 'case' | 'payment' | 'system' | 'organization' | 'ai'
  category: 'admin' | 'platform'; action: string
  severity: 'info' | 'warning' | 'critical'
  details: { before?: any; after?: any; description: string }
  timestamp: string
}

interface AdminAuditLogsProps {
  adminLogs: AuditLogEntry[]; platformLogs: AuditLogEntry[]
  activeHistoryTab: 'admin' | 'platform'; setActiveHistoryTab: (v: 'admin' | 'platform') => void
  logSearchTerm: string; setLogSearchTerm: (v: string) => void
  startDate: string; setStartDate: (v: string) => void
  endDate: string; setEndDate: (v: string) => void
  actionFilter: string; setActionFilter: (v: string) => void
  targetTypeFilter: string; setTargetTypeFilter: (v: string) => void
  logPage: number; setLogPage: React.Dispatch<React.SetStateAction<number>>; totalPages: number
  isLogsLoading: boolean
  setSelectedLogForDiff: (v: AuditLogEntry) => void
  setShowDiffModal: (v: boolean) => void
  handleExportCSV: () => void
  handleDeleteLog: (id: string) => void
  handleClearLogs: () => void
  fetchAuditLogs: (category?: 'admin' | 'platform') => void | Promise<void>
}

export function AdminAuditLogs({
  adminLogs, platformLogs, activeHistoryTab, setActiveHistoryTab,
  logSearchTerm, setLogSearchTerm, startDate, setStartDate, endDate, setEndDate,
  actionFilter, setActionFilter, targetTypeFilter, setTargetTypeFilter,
  logPage, setLogPage, totalPages, isLogsLoading,
  setSelectedLogForDiff, setShowDiffModal,
  handleExportCSV, handleDeleteLog, handleClearLogs, fetchAuditLogs
}: AdminAuditLogsProps) {
  const auditColumns = [
    {
      key: 'timestamp' as keyof AuditLogEntry,
      title: 'Date',
      render: (value: string) => <span className="text-slate-400 text-sm">{formatDate(value)}</span>
    },
    {
      key: 'adminName' as keyof AuditLogEntry,
      title: 'Admin',
      render: (value: string) => <span className="text-white font-bold">{value}</span>
    },
    {
      key: 'targetName' as keyof AuditLogEntry,
      title: 'Target User/Item',
      render: (value: string, item: AuditLogEntry) => (
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-tight">{value}</span>
          {item.details.before?.email && <span className="text-[10px] text-slate-500 font-medium">{item.details.before.email}</span>}
          {item.details.after?.email && !item.details.before?.email && <span className="text-[10px] text-slate-500 font-medium">{item.details.after.email}</span>}
        </div>
      )
    },
    {
      key: 'severity' as keyof AuditLogEntry,
      title: 'Severity',
      render: (v: string) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit",
          v === 'critical' ? 'text-error-500 bg-error-500/10 border border-error-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
          v === 'warning' ? 'text-warning-500 bg-warning-500/10 border border-warning-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
          'text-primary bg-primary/10 border border-primary/20'
        )}>
          <span className={cn(
            "w-1 h-1 rounded-full",
            v === 'critical' ? 'bg-error-500 animate-pulse' :
            v === 'warning' ? 'bg-warning-500' :
            'bg-primary'
          )} />
          {v}
        </span>
      )
    },
    {
      key: 'action' as keyof AuditLogEntry,
      title: 'Movement Type',
      render: (value: string) => {
        const displayValue = value.replace(/_/g, ' ')
        const colors: Record<string, string> = {
          'DELETE': 'text-error-500',
          'CASE_DELETED': 'text-error-500',
          'USER_DISABLED': 'text-error-500',
          'UPDATE': 'text-primary',
          'PROFILE_UPDATE': 'text-primary',
          'CASE_CREATED': 'text-success-500',
          'USER_ENABLED': 'text-success-500',
          'CASE_STATUS_CHANGE': 'text-warning-500',
          'CASE_CLOSED': 'text-slate-400',
          'PASSWORD_RESET': 'text-error-500',
          'PASSWORD_CHANGE': 'text-orange-400',
          'LOGIN': 'text-success-500',
          'FILE_UPLOADED': 'text-secondary',
          'FILE_DELETED': 'text-error-500',
          'AI_CONSULTATION': 'text-purple-400',
          'PLAN_CHANGE': 'text-indigo-400',
          'PAYMENT_PROCESSED': 'text-emerald-400',
          'PAYMENT_METHOD_ADD': 'text-emerald-400',
          'PAYMENT_METHOD_REMOVE': 'text-error-500',
          'USER_DELETED': 'text-error-500',
          'STATUS_CHANGE': 'text-warning-500',
          'NOTIFICATION_CHANGE': 'text-slate-400',
          'SUPPORT_REQUEST_SUBMITTED': 'text-blue-400',
          'SUPPORT_REQUEST_STATUS_UPDATE': 'text-blue-400',
          'ORG_CODE_UPDATE': 'text-indigo-400',
          'CREATE': 'text-success-500',
          'SYSTEM_MAINTENANCE_ENABLED': 'text-error-500',
          'SYSTEM_MAINTENANCE_DISABLED': 'text-success-500',
          'GLOBAL_ALERT_POSTED': 'text-warning-500',
          'AI_PROVIDER_STATUS_CHANGE': 'text-primary'
        }
        
        return (
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.1em]",
            colors[value] || 'text-slate-400'
          )}>
            {displayValue}
          </span>
        )
      }
    },
    {
      key: 'details' as keyof AuditLogEntry,
      title: 'Movement Description',
      render: (value: any, item: AuditLogEntry) => (
        <div className="flex items-center space-x-2">
          <span className="text-slate-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] block">
            {value.description}
          </span>
          {(item.details.before || item.details.after) && (
            <Button
              variant="none"
              size="sm"
              onClick={() => {
                setSelectedLogForDiff(item)
                setShowDiffModal(true)
              }}
              className="p-1 px-2 h-auto text-primary hover:text-white hover:bg-primary/20 bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all font-black text-[9px] uppercase tracking-tighter rounded-md"
            >
              <Eye className="w-3 h-3 mr-1 inline" />
              View Details
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'actions' as any,
      title: 'Cleanup',
      render: (_value: any, item: AuditLogEntry) => (
        <Button
          variant="none"
          size="sm"
          onClick={() => handleDeleteLog(item._id)}
          className="p-1 px-2 h-auto text-slate-600 hover:text-error-500 hover:bg-error-500/10 border border-transparent hover:border-error-500/20 transition-all duration-200"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )
    }
  ]

  return (
    <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 relative z-10">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-error-500/10 rounded-xl border border-error-500/20">
                    <ShieldAlert size={18} className="text-error-500" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Security Protocols</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Historical Movement Logs</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full max-w-5xl">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder={`Filter ${activeHistoryTab === 'admin' ? 'Administrative' : 'Client'} archives...`}
                      value={logSearchTerm}
                      onChange={(e) => {
                        setLogSearchTerm(e.target.value)
                        setLogPage(1)
                      }}
                      className="w-full pl-12 pr-10 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[13px] text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all font-bold uppercase tracking-widest"
                    />
                    {logSearchTerm && (
                      <button 
                        onClick={() => {
                          setLogSearchTerm('')
                          setLogPage(1)
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="relative group">
                    <select
                      value={actionFilter}
                      onChange={(e) => {
                        setActionFilter(e.target.value)
                        setLogPage(1)
                      }}
                      className="bg-white/[0.02] border border-white/10 rounded-2xl pl-6 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer hover:bg-white/[0.04] hover:text-white transition-all appearance-none min-w-[140px]"
                    >
                      <option value="" className="bg-slate-900">All Actions</option>
                      <option value="CREATE" className="bg-slate-900">Create</option>
                      <option value="UPDATE" className="bg-slate-900">Update</option>
                      <option value="DELETE" className="bg-slate-900">Delete</option>
                      <option value="LOGIN" className="bg-slate-900">Login</option>
                      <option value="LOGOUT" className="bg-slate-900">Logout</option>
                      <option value="PLAN_CHANGE" className="bg-slate-900">Plan Change</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-white transition-colors">
                        <Filter size={12} />
                    </div>
                  </div>

                  <div className="relative group">
                    <select
                      value={targetTypeFilter}
                      onChange={(e) => {
                        setTargetTypeFilter(e.target.value)
                        setLogPage(1)
                      }}
                      className="bg-white/[0.02] border border-white/10 rounded-2xl pl-6 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer hover:bg-white/[0.04] hover:text-white transition-all appearance-none min-w-[140px]"
                    >
                      <option value="" className="bg-slate-900">All Sections</option>
                      <option value="user" className="bg-slate-900">Users</option>
                      <option value="case" className="bg-slate-900">Cases</option>
                      <option value="organization" className="bg-slate-900">Orgs</option>
                      <option value="payment" className="bg-slate-900">Payments</option>
                      <option value="system" className="bg-slate-900">System</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-white transition-colors">
                        <Filter size={12} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2 hover:bg-white/[0.04] transition-all">
                    <Calendar size={12} className="text-slate-500" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setLogPage(1)
                      }}
                      className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 w-28 [color-scheme:dark]"
                    />
                    <span className="text-slate-800 font-bold">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setLogPage(1)
                      }}
                      className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 w-28 [color-scheme:dark]"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportCSV}
                    className="px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
                  >
                    <FileText size={14} />
                    Export CSV
                  </motion.button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="premium-glass p-1 rounded-xl border border-white/10 flex gap-1">
                    {[
                      { id: 'admin', label: 'Security' },
                      { id: 'platform', label: 'Activity' }
                    ].map(hTab => (
                      <button
                        key={hTab.id}
                        onClick={() => {
                          setActiveHistoryTab(hTab.id as any)
                          setLogSearchTerm('')
                          setLogPage(1)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          activeHistoryTab === hTab.id ? "bg-primary/20 text-primary border border-primary/20" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {hTab.label}
                      </button>
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchAuditLogs(activeHistoryTab)}
                    disabled={isLogsLoading}
                    className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                  >
                    <RotateCcw size={16} className={cn(isLogsLoading && "animate-spin")} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearLogs}
                    className="px-5 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-error-500 flex items-center gap-2 transition-all shadow-xl"
                  >
                    <Trash2 size={14} />
                    Purge
                  </motion.button>
                </div>
              </div>
              
              <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px]">
                <Table 
                  data={activeHistoryTab === 'admin' ? adminLogs : platformLogs}
                  columns={auditColumns}
                  loading={isLogsLoading}
                  emptyMessage="Archive query returned zero results."
                />
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.01]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Page {logPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="none"
                        size="sm"
                        disabled={logPage === 1 || isLogsLoading}
                        onClick={() => setLogPage(p => p - 1)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="none"
                        size="sm"
                        disabled={logPage === totalPages || isLogsLoading}
                        onClick={() => setLogPage(p => p + 1)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
    </motion.div>
  )
}
