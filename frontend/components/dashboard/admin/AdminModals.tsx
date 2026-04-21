import React from 'react'
import { motion } from 'framer-motion'
import {
  User, Users, FileText, History, CreditCard, Brain, Eye, Key,
  CheckCircle, XCircle, AlertCircle, ShieldAlert, Clock, Zap,
  Database, Cpu, Terminal, ShieldCheck, Globe, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { formatDate, cn } from '@/utils/helpers'

interface AdminUser {
  id: string; name: string; email: string; lawFirm: string
  plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise'
  planLimit: number; currentCases: number
  status: 'active' | 'disabled' | 'suspended'
  role?: string; organizationId?: string; isOrgAdmin?: boolean; firmCode?: string
  createdAt: string; lastLogin: string; lastActivity?: string
}

interface AuditLogEntry {
  _id: string; adminId: string; adminName: string; targetId: string; targetName: string
  targetType: 'user' | 'case' | 'payment' | 'system' | 'organization' | 'ai'
  category: 'admin' | 'platform'; action: string; severity: 'info' | 'warning' | 'critical'
  details: { before?: any; after?: any; description: string }; timestamp: string
}

interface UserHistory {
  cases: Array<{ _id: string; name: string; client: string; status: 'active' | 'closed' | 'pending'; createdAt: string; closedAt?: string }>
  payments: Array<{ _id: string; amount: number; currency: string; status: string; createdAt: string; plan: string }>
  auditLogs: AuditLogEntry[]
  orgMembers?: Array<{ id: string; name: string; email: string; role: string; status: 'active' | 'disabled' | 'suspended'; plan?: string; currentCases?: number; isOrgAdmin?: boolean; _id: string }>
  organizationData?: { id: string; firmCode: string; totalSeats: number; usedSeats: number }
  aiUsage?: { totalTokensConsumed: number; totalStorageUsed: number; plan: string; maxTokens: number; maxTotalStorage: number }
}

interface SupportRequest {
  _id: string; userId: string; userEmail: string; userName: string; lawFirm?: string
  type: 'system_error' | 'feature_uplink' | 'login_issue'; subject: string; description: string
  status: 'pending' | 'resolved'; createdAt: string; updatedAt: string
}

interface AdminModalsProps {
  showHistoryModal: boolean; setShowHistoryModal: (v: boolean) => void
  selectedUser: AdminUser | null; setSelectedUser: (v: AdminUser | null) => void
  userHistory: UserHistory | null; setUserHistory: (v: UserHistory | null) => void
  isHistoryLoading: boolean
  activeDetailTab: 'overview' | 'cases' | 'payments' | 'activity' | 'members' | 'ia'; setActiveDetailTab: (v: 'overview' | 'cases' | 'payments' | 'activity' | 'members' | 'ia') => void
  fetchUserHistory: (id: string) => void
  showDiffModal: boolean; setShowDiffModal: (v: boolean) => void
  selectedLogForDiff: AuditLogEntry | null; setSelectedLogForDiff: (v: AuditLogEntry | null) => void
  showEditModal: boolean; setShowEditModal: (v: boolean) => void
  editData: { name: string; email: string; password: string; lawFirm: string; firmCode: string }; setEditData: React.Dispatch<React.SetStateAction<{ name: string; email: string; password: string; lawFirm: string; firmCode: string }>>
  handleEditSubmit: (e: React.FormEvent) => void
  isUpdating: boolean; editError: string | null
  showPlanModal: boolean; setShowPlanModal: (v: boolean) => void
  handleUpdatePlan: (userId: string, plan: string) => void; isPlanUpdating: boolean
  showSupportDetailModal: boolean; setShowSupportDetailModal: (v: boolean) => void
  selectedSupportRequest: SupportRequest | null; setSelectedSupportRequest: (v: SupportRequest | null) => void
  handleResolveSupport: (id: string) => void
  confirmConfig: { isOpen: boolean; title: string; message: string; confirmText?: string; onConfirm: () => void; variant: 'danger' | 'warning' | 'info' }; setConfirmConfig: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; message: string; confirmText?: string; onConfirm: () => void; variant: 'danger' | 'warning' | 'info' }>>
  openEditModal: (u: AdminUser) => void
  handleForceLogout: (id: string) => void
}

export function AdminModals(props: AdminModalsProps) {
  const {
    showHistoryModal, setShowHistoryModal, selectedUser, setSelectedUser,
    userHistory, setUserHistory, isHistoryLoading, activeDetailTab, setActiveDetailTab,
    fetchUserHistory, showDiffModal, setShowDiffModal, selectedLogForDiff, setSelectedLogForDiff,
    showEditModal, setShowEditModal, editData, setEditData, handleEditSubmit, isUpdating, editError,
    showPlanModal, setShowPlanModal, handleUpdatePlan, isPlanUpdating,
    showSupportDetailModal, setShowSupportDetailModal, selectedSupportRequest, setSelectedSupportRequest,
    handleResolveSupport, confirmConfig, setConfirmConfig, openEditModal, handleForceLogout
  } = props

  return (
    <>
        <Modal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false)
            setSelectedUser(null)
            setUserHistory(null)
            setActiveDetailTab('overview')
          }}
          title="User Command Center"
          variant="glass"
          size="xl"
          allowScroll={true}
        >
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Retrieving Historical Data...</p>
            </div>
          ) : userHistory ? (
            <div className="space-y-6">
              <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl w-fit sticky top-0 z-20 backdrop-blur-md mb-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'cases', label: 'Cases', icon: FileText },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'activity', label: 'Activity', icon: History },
                  { id: 'ia', label: 'IA', icon: Brain },
                  ...(userHistory.orgMembers && userHistory.orgMembers.length > 0 
                    ? [{ id: 'members', label: 'Firm Members', icon: Users }] 
                    : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                      activeDetailTab === tab.id 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeDetailTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <p className={cn(
                        "text-xl font-black uppercase",
                        selectedUser?.status === 'active' ? 'text-success-500' : 'text-error-500'
                      )}>{selectedUser?.status}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Cases</p>
                      <p className="text-xl font-black text-white">{userHistory?.cases.length}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan</p>
                      <p className="text-xl font-black text-white uppercase">{selectedUser?.plan}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Identity Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</p>
                        <p className="text-white font-bold">{selectedUser?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                        <p className="text-white font-bold">{selectedUser?.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Law Firm</p>
                        <p className="text-white font-bold">{selectedUser?.lawFirm || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Member Since</p>
                        <p className="text-white font-bold">{formatDate(selectedUser?.createdAt || '')}</p>
                      </div>
                      {userHistory?.organizationData && (
                        <>
                          <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4 mt-2"></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Firm Code</p>
                            <p className="text-primary font-mono font-bold tracking-widest">{userHistory?.organizationData.firmCode}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Firm Capacity</p>
                            <p className="text-white font-bold text-sm tracking-tight">Using {userHistory?.organizationData.usedSeats} of {userHistory?.organizationData.totalSeats} seats</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-error-500/5 p-6 rounded-3xl border border-error-500/20 space-y-4">
                    <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-error-500">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Security Protocols
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="none"
                        onClick={() => {
                          setShowHistoryModal(false)
                          openEditModal(selectedUser!)
                        }}
                        className="text-warning-500 bg-warning-500/10 hover:bg-warning-500/30 font-bold uppercase text-[10px] tracking-widest px-4 border border-warning-500/20 h-10 rounded-xl transition-all"
                      >
                        <Key className="w-3.5 h-3.5 mr-2" />
                        Modify Security Passcode
                      </Button>
                      <Button
                        variant="none"
                        onClick={() => handleForceLogout(selectedUser!.id)}
                        className="text-error-500 bg-error-500/10 hover:bg-error-500/30 font-bold uppercase text-[10px] tracking-widest px-4 border border-error-500/20 h-10 rounded-xl transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-2" />
                        Force System Logout
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'cases' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/5 mb-6">
                    <Table 
                      data={userHistory.cases}
                      columns={[
                        { key: 'name', title: 'Case Identity', render: (v) => <span className="font-bold text-white">{v}</span> },
                        { key: 'client', title: 'Client', render: (v) => <span className="text-slate-300 font-medium">{v || 'N/A'}</span> },
                        { key: 'createdAt', title: 'Open Date', render: (v) => (
                          <div className="flex flex-col">
                            <span className="text-slate-400">{formatDate(v)}</span>
                            <span className="text-[8px] text-slate-600 uppercase font-bold">Initiated</span>
                          </div>
                        )},
                        { key: 'closedAt', title: 'Closed Date', render: (v, item: any) => (
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-[11px] font-medium",
                              v ? "text-slate-400" : "text-slate-600 italic"
                            )}>
                              {v ? formatDate(v) : (item.status === 'closed' ? 'Historical' : 'In Progress')}
                            </span>
                            {v && <span className="text-[8px] text-error-500/50 uppercase font-bold tracking-tighter">Deactivated</span>}
                          </div>
                        )},
                        { key: 'status', title: 'Protocol Status', render: (v) => (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                            v === 'active' ? 'text-success-500 bg-success-500/10' : 
                            v === 'closed' ? 'text-slate-500 bg-white/5' :
                            'text-warning-500 bg-warning-500/10'
                          )}>{v}</span>
                        )}
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Case Activity Timeline</h3>
                    <div className="space-y-2">
                      {userHistory.auditLogs
                        .filter(log => log.targetType === 'case' || log.action.includes('CASE'))
                        .map((log) => (
                          <div key={log._id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start justify-between hover:bg-white/10 transition-colors">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-tighter",
                                  log.action.includes('CREATED') ? 'bg-success-500/20 text-success-500' :
                                  log.action.includes('CLOSED') ? 'bg-slate-500/20 text-slate-400' :
                                  log.action.includes('DELETED') ? 'bg-error-500/20 text-error-500' :
                                  'bg-primary/20 text-primary'
                                )}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                                <p className="text-xs text-white font-bold">{log.details.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[10px] text-slate-600 font-bold uppercase">{formatDate(log.timestamp)}</span>
                              {(log.details.before || log.details.after) && (
                                <Button
                                  variant="none"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLogForDiff(log)
                                    setShowDiffModal(true)
                                  }}
                                  className="p-1 px-2 h-auto text-primary hover:text-white hover:bg-primary/20 bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all font-black text-[9px] uppercase tracking-tighter rounded-md mt-1"
                                >
                                  <Eye className="w-3 h-3 mr-1 inline" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                      ))}
                      {userHistory.auditLogs.filter(log => log.targetType === 'case' || log.action.includes('CASE')).length === 0 && (
                        <div className="p-8 text-center bg-white/5 rounded-2xl text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                          No case activity recorded in logs
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'payments' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/5">
                    {userHistory.payments.length > 0 ? (
                      <Table 
                        data={userHistory.payments}
                        columns={[
                          { key: 'createdAt', title: 'Transaction Date', render: (v) => <span className="text-slate-400">{formatDate(v)}</span> },
                          { key: 'plan', title: 'Service Plan', render: (v) => <span className="font-bold text-white uppercase">{v}</span> },
                          { key: 'amount', title: 'Credit Amount', render: (v) => <span className="text-success-500 font-black">${v}</span> }
                        ]}
                      />
                    ) : (
                      <div className="p-12 text-center bg-white/5 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                        No financial records found in treasury
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'activity' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    {userHistory.auditLogs.map((log) => (
                      <div key={log._id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-tighter",
                              log.category === 'admin' ? 'bg-error-500/20 text-error-500' : 'bg-primary/20 text-primary'
                            )}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                            <p className="text-xs text-white font-bold">{log.details.description}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                            Auth Agent: {log.adminName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] text-slate-600 font-bold uppercase">{formatDate(log.timestamp)}</span>
                          {(log.details.before || log.details.after) && (
                            <Button
                              variant="none"
                              size="sm"
                              onClick={() => {
                                setSelectedLogForDiff(log)
                                setShowDiffModal(true)
                              }}
                              className="p-1 px-2 h-auto text-primary hover:text-white hover:bg-primary/20 bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all font-black text-[9px] uppercase tracking-tighter rounded-md"
                            >
                              <Eye className="w-3 h-3 mr-1 inline" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {userHistory.auditLogs.length === 0 && (
                      <div className="p-12 text-center bg-white/5 rounded-3xl text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                        No administrative mutations recorded
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'members' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/5">
                    {userHistory?.orgMembers && userHistory.orgMembers.length > 0 ? (
                      <Table 
                        data={userHistory?.orgMembers || []}
                        columns={[
                          { key: 'name', title: 'Member Name', render: (v, item: any) => (
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{v}</span>
                              {item.isOrgAdmin && <span className="text-[8px] text-primary uppercase font-black tracking-tighter mt-0.5">System Admin Key</span>}
                            </div>
                          )},
                          { key: 'email', title: 'Email Address', render: (v) => <span className="text-slate-400 font-medium">{v}</span> },
                          { key: 'currentCases', title: 'Active Cases', render: (v) => <span className="font-bold text-slate-300">{v || 0} Cases</span> },
                          { key: 'plan', title: 'Current Plan', render: (v) => (
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              v === 'enterprise' ? 'text-primary bg-primary/10' : 'text-slate-500 bg-white/5'
                            )}>
                              {v}
                            </span>
                          )},
                          { key: 'status', title: 'Account Status', render: (v) => (
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              v === 'active' ? 'text-success-500' : 'text-error-500'
                            )}>
                              {v}
                            </span>
                          )},
                          { key: 'id' as any, title: '', render: (_, item: any) => (
                            <Button 
                              variant="none" 
                              size="sm"
                              className="text-secondary bg-secondary/10 hover:bg-secondary/30 transition-all text-[10px] font-black uppercase tracking-widest h-8 px-4 w-full"
                              onClick={() => {
                                setSelectedUser({ ...item, id: item._id } as AdminUser)
                                setActiveDetailTab('overview')
                                fetchUserHistory(item._id)
                              }}
                            >
                              View Intel
                            </Button>
                          )}
                        ]}
                      />
                    ) : (
                      <div className="p-12 text-center bg-white/5 rounded-3xl text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                        No additional firm members identified
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDetailTab === 'ia' && (
                <div className="space-y-8 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(!userHistory.aiUsage?.plan || !['elite', 'enterprise'].includes(userHistory.aiUsage?.plan.toLowerCase())) && (
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Neural Tokens</p>
                          <h3 className="text-3xl font-black text-white tracking-tightest">
                            {userHistory.aiUsage?.totalTokensConsumed.toLocaleString() || 0}
                          </h3>
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                          <Zap size={20} className="text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Usage Spectrum</span>
                          <span>{Math.round(((userHistory.aiUsage?.totalTokensConsumed || 0) / (userHistory.aiUsage?.maxTokens || 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((userHistory.aiUsage?.totalTokensConsumed || 0) / (userHistory.aiUsage?.maxTokens || 1)) * 100)}%` }}
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               ((userHistory.aiUsage?.totalTokensConsumed || 0) / (userHistory.aiUsage?.maxTokens || 1)) > 0.9 ? 'bg-error-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                               ((userHistory.aiUsage?.totalTokensConsumed || 0) / (userHistory.aiUsage?.maxTokens || 1)) > 0.7 ? 'bg-warning-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                               'bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                             )}
                          />
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">
                          Limit: {userHistory.aiUsage?.maxTokens.toLocaleString() || 0} Tokens
                        </p>
                      </div>
                    </div>
                    )}

                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Vault Storage</p>
                          <h3 className="text-3xl font-black text-white tracking-tightest">
                            {((userHistory.aiUsage?.totalStorageUsed || 0) / (1024 * 1024)).toFixed(2)} MB
                          </h3>
                        </div>
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                          <Database size={20} className="text-emerald-500" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Data Density</span>
                          <span>{Math.round(((userHistory.aiUsage?.totalStorageUsed || 0) / (userHistory.aiUsage?.maxTotalStorage || 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((userHistory.aiUsage?.totalStorageUsed || 0) / (userHistory.aiUsage?.maxTotalStorage || 1)) * 100)}%` }}
                             className={cn(
                               "h-full rounded-full transition-all duration-1000",
                               ((userHistory.aiUsage?.totalStorageUsed || 0) / (userHistory.aiUsage?.maxTotalStorage || 1)) > 0.9 ? 'bg-error-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                               'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                             )}
                          />
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">
                          Limit: {((userHistory.aiUsage?.maxTotalStorage || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <Cpu size={14} className="text-primary" />
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Usage Insight</h4>
                     </div>
                     <p className="text-xs text-slate-400 leading-relaxed italic">
                        &quot;This user is currently operating under the <span className="text-white font-bold uppercase">{userHistory.aiUsage?.plan}</span> high-performance protocol. AI consumption is monitored across all case interactions and document processing cycles.&quot;
                     </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={showDiffModal}
          onClose={() => {
            setShowDiffModal(false)
            setSelectedLogForDiff(null)
          }}
          title="Audit Movement Comparison"
          variant="glass"
          size="lg"
        >
          {selectedLogForDiff && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Movement Type</p>
                  <p className="text-white font-bold">{selectedLogForDiff?.action?.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="text-slate-300 font-medium">{selectedLogForDiff && formatDate(selectedLogForDiff.timestamp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-error-500 uppercase tracking-widest ml-1">Legacy State (Before)</h4>
                  <div className="bg-error-500/5 border border-error-500/20 rounded-2xl p-4 font-mono text-[11px] text-slate-400 overflow-auto max-h-[300px]">
                    <pre>{JSON.stringify(selectedLogForDiff?.details.before, null, 2)}</pre>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-success-500 uppercase tracking-widest ml-1">New Protocol (After)</h4>
                  <div className="bg-success-500/5 border border-success-500/20 rounded-2xl p-4 font-mono text-[11px] text-slate-200 overflow-auto max-h-[300px]">
                    <pre>{JSON.stringify(selectedLogForDiff?.details.after, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Auth Agent Context</p>
                <p className="text-sm text-slate-300 italic">&quot;{selectedLogForDiff?.details.description}&quot;</p>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          title="Edit Access Protocol"
          variant="glass"
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {editError && (
              <div className="bg-error-500/10 border border-error-500/20 text-error-500 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-xs font-bold">{editError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Member Identity</label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Full Legal Name"
                  required
                  className="bg-black/40 border-white/10 text-white py-4 rounded-2xl focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Channel</label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="user@lawfirm.com"
                  required
                  className="bg-black/40 border-white/10 text-white py-4 rounded-2xl focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Affiliation</label>
              <Input
                value={editData.lawFirm}
                onChange={(e) => setEditData({ ...editData, lawFirm: e.target.value })}
                placeholder="Law Firm / Department Name"
                className="bg-black/40 border-white/10 text-white py-4 rounded-2xl focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Passcode (Security Override)</label>
              <Input
                type="password"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                placeholder="Leave blank for no change"
                className="bg-black/40 border-white/10 text-white py-4 rounded-2xl focus:border-primary/50"
              />
            </div>

            {selectedUser?.isOrgAdmin && (
              <div className="space-y-2 animate-in slide-in-from-left-2 duration-150">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Firm Access Code (Administrative Key)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    value={editData.firmCode}
                    onChange={(e) => setEditData({ ...editData, firmCode: e.target.value.toUpperCase() })}
                    placeholder="ENTERPRISE CODE"
                    className="bg-primary/5 border-primary/20 text-primary py-4 pl-12 rounded-2xl focus:border-primary font-mono font-bold tracking-widest"
                  />
                </div>
                <p className="text-[9px] text-slate-500 ml-1 italic capitalize">Changing this will require new members to use the new key, but existing members stay linked.</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-8">
              <Button
                variant="none"
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-[0.2em] transition-all"
              >
                Abort
              </Button>
              <Button 
                variant="none"
                type="submit" 
                disabled={isUpdating} 
                className="bg-primary hover:bg-primary/80 text-white px-10 py-4 h-auto rounded-2xl shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                {isUpdating ? 'Transmitting...' : 'Commit Changes'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmationModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.confirmText === 'Proceed' ? 'info' : 'danger'}
        />

        <Modal
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false)
            setSelectedUser(null)
          }}
          title="Manage User Plan"
          variant="glass"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Plan</p>
              <p className="text-lg font-black text-white uppercase">{selectedUser?.plan || 'None'}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'none', label: 'None (Default)', limit: 0, color: 'text-slate-400' },
                { id: 'basic', label: 'Basic', limit: 8, color: 'text-primary' },
                { id: 'professional', label: 'Professional', limit: 18, color: 'text-indigo-400' },
                { id: 'elite', label: 'Elite', limit: 100000, color: 'text-secondary' },
                { id: 'enterprise', label: 'Enterprise', limit: 100000, color: 'text-amber-400' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleUpdatePlan(selectedUser!.id, p.id as any)}
                  disabled={isPlanUpdating || selectedUser?.plan === p.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                    selectedUser?.plan === p.id 
                      ? "border-primary bg-primary/10 cursor-default" 
                      : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn("text-sm font-black uppercase tracking-widest", p.color)}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {p.limit >= 100000 ? 'Unlimited' : `${p.limit} Cases Limit`}
                    </span>
                  </div>
                  {selectedUser?.plan === p.id ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all group-hover:translate-x-1" />
                  )}
                </button>
              ))}
            </div>

            {isPlanUpdating && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Updating Protocol...</span>
              </div>
            )}
          </div>
        </Modal>
        <Modal
          isOpen={showSupportDetailModal}
          onClose={() => {
            setShowSupportDetailModal(false)
            setSelectedSupportRequest(null)
          }}
          title="Signal Interference Detail"
          variant="glass"
          size="lg"
        >
          {selectedSupportRequest && (
            <div className="max-h-[75vh] overflow-y-auto pr-4 -mr-4 scrollbar-hide">
              <div className="space-y-8 animate-in fade-in duration-250">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative z-10 flex items-center gap-5">
                    <div className={cn(
                      "p-4 rounded-2xl border",
                      selectedSupportRequest.type === 'system_error' 
                        ? "bg-error-500/10 border-error-500/20 text-error-500" 
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                      {selectedSupportRequest.type === 'system_error' ? <AlertCircle size={24} /> : <Zap size={24} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Packet Type</p>
                      <h3 className="text-xl font-black text-white tracking-tight uppercase">
                        {selectedSupportRequest.type === 'system_error' ? 'System Integrity Breach' : 'Feature Uplink Request'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Timestamp</p>
                    <p className="text-sm text-slate-300 font-bold uppercase">{formatDate(selectedSupportRequest.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-primary" />
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Logic Stream Origin</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Identity</p>
                      <p className="text-white font-bold text-lg">{selectedSupportRequest.userName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypted Beacon</p>
                      <p className="text-primary font-bold">{selectedSupportRequest.userEmail}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Database size={16} className="text-secondary" />
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">System Parameters</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transmission Status</p>
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mt-1",
                        selectedSupportRequest.status === 'resolved' ? "bg-success-500/20 text-success-500" : "bg-warning-500/20 text-warning-500"
                      )}>
                        {selectedSupportRequest.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {selectedSupportRequest.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference Hash</p>
                      <p className="text-slate-400 font-mono text-xs truncate uppercase tracking-tighter">{selectedSupportRequest._id}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Terminal size={120} className="text-primary" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <History size={18} className="text-primary" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Transmission Payload</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 underline decoration-primary/30">Header Subject</p>
                        <p className="text-white font-black text-xl italic tracking-tight">{selectedSupportRequest.subject}</p>
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 min-h-[120px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 underline decoration-slate-800">Decoded Sequence</p>
                        <p className="text-slate-200 text-sm leading-relaxed font-medium">
                          {selectedSupportRequest.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <Button
                    variant="none"
                    onClick={() => {
                      setShowSupportDetailModal(false)
                      setSelectedSupportRequest(null)
                    }}
                    className="text-slate-400 hover:text-white hover:bg-white/5 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all"
                  >
                    Close Signal
                  </Button>
                  {selectedSupportRequest.status === 'pending' && (
                    <Button
                      variant="none"
                      onClick={() => {
                        handleResolveSupport(selectedSupportRequest._id)
                        setShowSupportDetailModal(false)
                      }}
                      className="bg-success-500 hover:bg-success-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-success-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={14} />
                      Resolve Anomaly
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
    </>
  )
}
