import React from 'react'
import { motion } from 'framer-motion'
import { Users, Search, User, CheckCircle, XCircle, AlertCircle, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { formatDate, cn } from '@/utils/helpers'

interface AdminUser {
  id: string; name: string; email: string; lawFirm: string
  plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise'
  planLimit: number; currentCases: number
  status: 'active' | 'disabled' | 'suspended'
  role?: string; organizationId?: string; isOrgAdmin?: boolean; firmCode?: string
  createdAt: string; lastLogin: string; lastActivity?: string
}

interface AdminUsersTableProps {
  users: AdminUser[]
  searchTerm: string; setSearchTerm: (v: string) => void
  roleFilter: 'all' | 'admin' | 'user'; setRoleFilter: (v: 'all' | 'admin' | 'user') => void
  userPage: number; setUserPage: React.Dispatch<React.SetStateAction<number>>; userTotalPages: number
  setSelectedUser: (u: AdminUser) => void
  setShowHistoryModal: (v: boolean) => void
  setShowPlanModal: (v: boolean) => void
  fetchUserHistory: (id: string) => void
  openEditModal: (u: AdminUser) => void
  handleUserStatusChange: (id: string, status: 'active' | 'disabled') => void
  handleDeleteUser: (id: string) => void
}

export function AdminUsersTable({
  users, searchTerm, setSearchTerm, roleFilter, setRoleFilter,
  userPage, setUserPage, userTotalPages,
  setSelectedUser, setShowHistoryModal, setShowPlanModal,
  fetchUserHistory, openEditModal, handleUserStatusChange, handleDeleteUser
}: AdminUsersTableProps) {
  const displayUsers = Array.isArray(users) ? users : []

  const userColumns = [
    {
      key: 'name' as keyof AdminUser,
      title: 'User',
      render: (value: string, item: AdminUser) => {
        const activityDate = item.lastActivity || item.lastLogin
        const isOnline = activityDate && (new Date().getTime() - new Date(activityDate).getTime()) < 2 * 60 * 1000
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black",
                isOnline ? "bg-success-500 animate-pulse" : "bg-slate-600"
              )} title={isOnline ? 'Online' : 'Offline'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-white tracking-tight">{value}</p>
                {item.role === 'admin' && (
                  <span className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">{item.email}</p>
            </div>
          </div>
        )
      }
    },
    {
      key: 'lawFirm' as keyof AdminUser,
      title: 'Law Firm',
      render: (value: string) => (
        <span className="text-slate-300 font-medium">{value || 'N/A'}</span>
      )
    },
    {
      key: 'firmCode' as keyof AdminUser,
      title: 'Firm Code',
      render: (value: string, item: AdminUser) => (
        <div className="flex flex-col">
          <span className={cn(
            "font-mono text-xs font-bold tracking-tight",
            value ? "text-primary" : "text-slate-600 italic"
          )}>
            {value || 'NO CODE'}
          </span>
          {item.isOrgAdmin && value && (
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">System Admin Key</span>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof AdminUser,
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${value === 'active' ? 'bg-success-500/20 text-success-500' :
          value === 'disabled' ? 'bg-error-500/20 text-error-500' :
            'bg-warning-500/20 text-warning-500'
          }`}>
          {value === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
          {value === 'disabled' && <XCircle className="w-3 h-3 mr-1" />}
          {value === 'suspended' && <AlertCircle className="w-3 h-3 mr-1" />}
          {value}
        </span>
      )
    },
    {
      key: 'createdAt' as keyof AdminUser,
      title: 'Joined',
      render: (value: string) => <span className="text-slate-400 text-sm font-medium">{formatDate(value)}</span>
    },
    {
      key: 'actions' as keyof AdminUser,
      title: 'Actions',
      render: (_value: any, item: AdminUser) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="none"
            size="sm"
            onClick={() => {
              setSelectedUser(item)
              setShowHistoryModal(true)
              fetchUserHistory(item.id)
            }}
            className="text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-secondary/20 h-8 rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Details
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => openEditModal(item)}
            className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-indigo-500/20 h-8 rounded-lg transition-all"
          >
            Edit
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => handleUserStatusChange(item.id, item.status === 'active' ? 'disabled' : 'active')}
            className={cn(
              "font-bold uppercase text-[10px] tracking-widest px-3 border h-8 rounded-lg transition-all",
              item.status === 'active' 
                ? 'text-warning-500 bg-warning-500/10 hover:bg-warning-500/30 border-warning-500/20' 
                : 'text-success-500 bg-success-500/10 hover:bg-success-500/30 border-success-500/20'
            )}
          >
            {item.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => {
              setSelectedUser(item)
              setShowPlanModal(true)
            }}
            className="text-primary hover:text-white bg-primary/10 hover:bg-primary/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-primary/20 h-8 rounded-lg transition-all"
          >
            Plan
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => handleDeleteUser(item.id)}
            className="text-error-500 hover:text-white bg-error-500/10 hover:bg-error-500/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-error-500/20 h-8 rounded-lg transition-all"
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <motion.div key="users" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 relative z-10">
              <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 gap-1.5 w-fit">
                  <button
                    onClick={() => {
                      setRoleFilter('all')
                      setUserPage(1)
                    }}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                      roleFilter === 'all'
                        ? "bg-slate-500/20 text-slate-300 border border-slate-500/20 shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    All Entities
                  </button>
                  <button
                    onClick={() => {
                      setRoleFilter('admin')
                      setUserPage(1)
                    }}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                      roleFilter === 'admin'
                        ? "bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Administrators
                  </button>
                  <button
                    onClick={() => {
                      setRoleFilter('user')
                      setUserPage(1)
                    }}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                      roleFilter === 'user'
                        ? "bg-secondary/20 text-secondary border border-secondary/20 shadow-lg shadow-secondary/10"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Standard Users
                  </button>
                </div>

                <div className="premium-glass p-4 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Identify network entity by name, stream, or law firm..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setUserPage(1)
                      }}
                      className="w-full pl-16 pr-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] text-[15px] font-bold text-white placeholder-slate-600 transition-all uppercase tracking-widest"
                    />
                  </div>
                </div>

                <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
                  <Table
                    data={displayUsers}
                    columns={userColumns}
                    emptyMessage="Initial search returned no matching entities."
                  />

                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-white/[0.01]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Page {userPage} of {userTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="none"
                          size="sm"
                          disabled={userPage === 1}
                          onClick={() => setUserPage(p => p - 1)}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="none"
                          size="sm"
                          disabled={userPage === userTotalPages}
                          onClick={() => setUserPage(p => p + 1)}
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
