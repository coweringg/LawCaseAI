import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Users,
  Search,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  Clock,
  History,
  CreditCard,
  Eye,
  ArrowRight,
  ShieldAlert,
  Key,
  RotateCcw,
  Trash2,
  Filter,
  X
} from 'lucide-react'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, cn } from '@/utils/helpers'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

interface AdminUser {
  id: string
  name: string
  email: string
  lawFirm: string
  plan: 'basic' | 'professional' | 'enterprise'
  planLimit: number
  currentCases: number
  status: 'active' | 'disabled' | 'suspended'
  createdAt: string
  lastLogin: string
  lastActivity?: string
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCases: number
  newUsersThisMonth: number
}

interface AuditLogEntry {
  _id: string
  adminId: string
  adminName: string
  targetId: string
  targetName: string
  targetType: 'user' | 'case'
  action: string
  details: {
    before?: any
    after?: any
    description: string
  }
  timestamp: string
}

interface UserHistory {
  cases: any[]
  payments: any[]
  auditLogs: AuditLogEntry[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [editData, setEditData] = useState({ name: '', email: '', password: '', lawFirm: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'history'>('users')
  const [activeHistoryTab, setActiveHistoryTab] = useState<'admin' | 'platform'>('admin')
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'cases' | 'payments' | 'activity'>('overview')
  const [adminLogs, setAdminLogs] = useState<AuditLogEntry[]>([])
  const [platformLogs, setPlatformLogs] = useState<AuditLogEntry[]>([])
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [logSearchTerm, setLogSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogEntry | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  })

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users')
      if (response.data.success) {
        setUsers(response.data.data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    }
  }, [])

  const fetchAuditLogs = useCallback(async (category: 'admin' | 'platform' = activeHistoryTab) => {
    setIsLogsLoading(true)
    try {
      const query = new URLSearchParams({
        category,
        limit: '100',
        ...(logSearchTerm ? { search: logSearchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      })
      const response = await api.get(`/admin/audit-logs?${query.toString()}`)
      if (response.data.success) {
        if (category === 'admin') setAdminLogs(response.data.data.logs)
        else setPlatformLogs(response.data.data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setIsLogsLoading(false)
    }
  }, [activeHistoryTab, logSearchTerm, startDate, endDate])

  useEffect(() => {
    const initDashboard = async () => {
      if (!isAuthLoading) {
        if (!user || user.role !== 'admin') {
          router.push('/dashboard')
        } else {
          try {
            // Fetch everything and wait
            await Promise.all([
              fetchUsers(),
              fetchStats(),
              fetchAuditLogs('admin'),
              fetchAuditLogs('platform')
            ])
          } catch (error) {
            console.error('Initialization error:', error)
          } finally {
            setIsLoading(false)
          }
        }
      }
    }
    
    initDashboard()
  }, [user, isAuthLoading, router, fetchUsers, fetchStats, fetchAuditLogs])

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'admin') {
      fetchAuditLogs(activeHistoryTab)
    }
  }, [activeTab, activeHistoryTab, user?.role, fetchAuditLogs])

  useEffect(() => {
    if (user?.role === 'admin') {
      const refreshInterval = setInterval(() => {
        fetchUsers()
        fetchStats()
      }, 60000)
      return () => clearInterval(refreshInterval)
    }
  }, [user?.role, fetchUsers, fetchStats])

  const handleDeleteLog = async (logId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Purge Audit Log',
      message: 'Are you sure you want to delete this specific audit entry from the permanent archives?',
      confirmText: 'Purge Now',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/audit-logs/${logId}`)
          if (response.data.success) {
            if (activeHistoryTab === 'admin') {
              setAdminLogs(prev => prev.filter(l => l._id !== logId))
            } else {
              setPlatformLogs(prev => prev.filter(l => l._id !== logId))
            }
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
          }
        } catch (error) {
          console.error('Failed to delete log entry:', error)
        }
      }
    })
  }

  const handleClearLogs = async () => {
    const categoryName = activeHistoryTab === 'admin' ? 'Administrative Records' : 'User Movement Logs'
    setConfirmConfig({
      isOpen: true,
      title: 'System-Wide Cleanup',
      message: `Are you CERTAIN you want to DELETE ALL ${categoryName}? This action is irreversible and will completely empty the selected history.`,
      confirmText: 'Wipe History',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/audit-logs?category=${activeHistoryTab}`)
          if (response.data.success) {
            if (activeHistoryTab === 'admin') setAdminLogs([])
            else setPlatformLogs([])
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
          }
        } catch (error) {
          console.error('Failed to clear logs:', error)
        }
      }
    })
  }

  const fetchUserHistory = useCallback(async (userId: string) => {
    setIsHistoryLoading(true)
    try {
      const response = await api.get(`/admin/users/${userId}/history`)
      if (response.data.success) {
        setUserHistory(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user history:', error)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'admin') {
      const timer = setTimeout(() => {
        fetchAuditLogs(activeHistoryTab)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [activeTab, activeHistoryTab, logSearchTerm, startDate, endDate, user?.role, fetchAuditLogs])

  const handleUserStatusChange = async (userId: string, status: 'active' | 'disabled') => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status })

      if (response.data.success) {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, status } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Terminate User Identity',
      message: 'Are you absolutely sure you want to permanently delete this user? This protocol cannot be undone, and the user will lose all platform access immediately.',
      confirmText: 'Permanently Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/users/${userId}`)
          if (response.data.success) {
            setUsers(prev => prev.filter(u => u.id !== userId))
            fetchStats()
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
          }
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      }
    })
  }

  const handleForceLogout = async (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remote Session Termination',
      message: 'Are you sure you want to terminate all active sessions for this user? The user will be required to re-authenticate to regain access.',
      confirmText: 'Invalidate Sessions',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const response = await api.post(`/admin/users/${userId}/logout`)
          if (response.data.success) {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            // Notificar mediante UI si hubiese un sistema de notificaciones global
          }
        } catch (error) {
          console.error('Failed to force logout:', error)
        }
      }
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsUpdating(true)
    try {
      const payload: any = { ...editData }
      if (!payload.password) delete payload.password

      const response = await api.put(`/admin/users/${selectedUser.id}`, payload)
      if (response.data.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? response.data.data : u))
        setShowEditModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user)
    setEditData({
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm,
      password: ''
    })
    setShowEditModal(true)
  }

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lawFirm?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
              <p className="font-bold text-white tracking-tight">{value}</p>
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
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(item)
              setShowHistoryModal(true)
              fetchUserHistory(item.id)
            }}
            className="text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-secondary/20"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(item)}
            className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-indigo-500/20"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUserStatusChange(item.id, item.status === 'active' ? 'disabled' : 'active')}
            className={cn(
              "font-bold uppercase text-[10px] tracking-widest px-3 border",
              item.status === 'active' 
                ? 'text-warning-500 bg-warning-500/10 hover:bg-warning-500/30 border-warning-500/20' 
                : 'text-success-500 bg-success-500/10 hover:bg-success-500/30 border-success-500/20'
            )}
          >
            {item.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(item.id)}
            className="text-error-500 hover:text-white bg-error-500/10 hover:bg-error-500/30 font-bold uppercase text-[10px] tracking-widest px-3 border border-error-500/20"
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

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
      key: 'action' as keyof AuditLogEntry,
      title: 'Movement Type',
      render: (value: string) => {
        const displayValue = value.replace(/_/g, ' ')
        const colors: Record<string, string> = {
          'DELETE': 'bg-error-500/20 text-error-500',
          'CASE_DELETED': 'bg-error-500/20 text-error-500',
          'USER_DISABLED': 'bg-error-500/20 text-error-500',
          'UPDATE': 'bg-primary/20 text-primary',
          'PROFILE_UPDATE': 'bg-primary/20 text-primary',
          'CASE_CREATED': 'bg-success-500/20 text-success-500',
          'USER_ENABLED': 'bg-success-500/20 text-success-500',
          'CASE_STATUS_CHANGE': 'bg-warning-500/20 text-warning-500',
          'CASE_CLOSED': 'bg-slate-500/20 text-slate-400',
          'PASSWORD_RESET': 'bg-error-500/20 text-error-500',
          'PASSWORD_CHANGE': 'bg-orange-500/20 text-orange-400',
          'LOGIN': 'bg-success-500/20 text-success-500',
          'FILE_UPLOADED': 'bg-secondary/20 text-secondary',
          'AI_CONSULTATION': 'bg-purple-500/20 text-purple-400'
        }
        
        return (
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
            colors[value] || 'bg-slate-500/20 text-slate-400'
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
          {item.details.before && item.details.after && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLogForDiff(item)
                setShowDiffModal(true)
              }}
              className="p-1 px-2 h-auto text-primary hover:text-white hover:bg-primary/20 transition-all font-black text-[9px] uppercase tracking-tighter"
            >
              Diff
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
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteLog(item._id)}
          className="p-1 px-2 h-auto text-slate-600 hover:text-error-500 hover:bg-error-500/10 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )
    }
  ]

  if (isAuthLoading || !user || user.role !== 'admin' || isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {isAuthLoading ? 'Verifying Security Access...' : 'Retrieving Administrative Data...'}
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8 text-center sm:text-left transition-all">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
             <span className="material-icons-round text-primary text-4xl">admin_panel_settings</span>
             User Management
          </h1>
          <p className="text-slate-400">Search, edit, and manage all platform users</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="glass" className="border-white/10 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-primary/20 rounded-2xl">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-white/10 hover:border-success/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-success-500/20 rounded-2xl">
                    <Activity className="w-8 h-8 text-success-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Users</p>
                    <p className="text-3xl font-black text-white">{stats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-white/10 hover:border-secondary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary/20 rounded-2xl">
                    <FileText className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Cases</p>
                    <p className="text-3xl font-black text-white">{stats.totalCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'users' ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'history' ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Platform History
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Search */}
            <Card variant="glass" className="mb-6 border-white/10">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or law firm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-slate-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card variant="glass" className="border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <Table
                  data={filteredUsers}
                  columns={userColumns}
                  emptyMessage="No users found."
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-error-500">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Security Protocols
                </h3>
                <span className="mx-4 h-4 w-[1px] bg-white/10 hidden md:block"></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform Activity Audit Trail</p>
              </div>

              <div className="flex flex-1 max-w-2xl gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder={`Search in ${activeHistoryTab === 'admin' ? 'Admin' : 'User'} logs...`}
                    value={logSearchTerm}
                    onChange={(e) => setLogSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/5 rounded-xl text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20 transition-all font-medium"
                  />
                  {logSearchTerm && (
                    <button 
                      onClick={() => setLogSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1 bg-white/5 border border-white/5 rounded-xl px-2 py-1">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 mr-2">Time Filter</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] text-slate-400 focus:ring-0 w-24 [color-scheme:dark]"
                  />
                  <span className="text-slate-700 w-2 text-center">-</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] text-slate-400 focus:ring-0 w-24 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveHistoryTab('admin')
                      setLogSearchTerm('')
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeHistoryTab === 'admin' ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Admin Logs
                  </button>
                  <button
                    onClick={() => {
                      setActiveHistoryTab('platform')
                      setLogSearchTerm('')
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeHistoryTab === 'platform' ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    User Movements
                  </button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogSearchTerm('')
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="text-slate-500 hover:text-white font-bold uppercase text-[10px] tracking-widest px-2"
                  title="Reset filters"
                >
                  <Filter className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchAuditLogs(activeHistoryTab)}
                  disabled={isLogsLoading}
                  className="text-slate-400 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest px-3 border border-white/5 h-9 rounded-xl"
                >
                  <RotateCcw className={cn("w-3.5 h-3.5", isLogsLoading && "animate-spin")} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLogs}
                  className="text-error-500 hover:text-white hover:bg-error-500/20 font-bold uppercase text-[10px] tracking-widest px-3 border border-error-500/20 h-9 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <Card variant="glass" className="overflow-hidden border-white/5">
              <Table 
                data={activeHistoryTab === 'admin' ? adminLogs : platformLogs}
                columns={auditColumns}
                loading={isLogsLoading}
                emptyMessage="No history found."
              />
            </Card>
          </div>
        )}

        {/* User Details Modal */}
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
              {/* Internal Tabs */}
              <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl w-fit sticky top-0 z-20 backdrop-blur-md mb-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'cases', label: 'Cases', icon: FileText },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'activity', label: 'Activity', icon: History }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeDetailTab === tab.id ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeDetailTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Summary Grid */}
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
                      <p className="text-xl font-black text-white">{userHistory.cases.length}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan</p>
                      <p className="text-xl font-black text-white uppercase">{selectedUser?.plan}</p>
                    </div>
                  </div>

                  {/* Profile Info */}
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
                    </div>
                  </div>

                  {/* Security Actions */}
                  <div className="bg-error-500/5 p-6 rounded-3xl border border-error-500/20 space-y-4">
                    <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-error-500">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Security Protocols
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowHistoryModal(false)
                          openEditModal(selectedUser!)
                        }}
                        className="text-warning-500 bg-warning-500/10 hover:bg-warning-500/30 font-bold uppercase text-[10px] tracking-widest px-4 border border-warning-500/20"
                      >
                        <Key className="w-3.5 h-3.5 mr-2" />
                        Modify Security Passcode
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleForceLogout(selectedUser!.id)}
                        className="text-error-500 bg-error-500/10 hover:bg-error-500/30 font-bold uppercase text-[10px] tracking-widest px-4 border border-error-500/20"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-2" />
                        Force System Logout
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'cases' && (
                <div className="space-y-6 animate-in fade-in duration-300">
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

                  {/* Case Specific History */}
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
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                Target: {log.targetName}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-600 font-bold uppercase">{formatDate(log.timestamp)}</span>
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
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/5">
                    {userHistory.payments.length > 0 ? (
                      <Table 
                        data={userHistory.payments}
                        columns={[
                          { key: 'date', title: 'Transaction Date', render: (v) => <span className="text-slate-400">{formatDate(v)}</span> },
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
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    {userHistory.auditLogs.map((log) => (
                      <div key={log._id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start justify-between">
                        <div>
                          <p className="text-xs text-white font-bold">{log.details.description}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                            Auth Agent: {log.adminName}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold uppercase">{formatDate(log.timestamp)}</span>
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
            </div>
          ) : null}
        </Modal>

        {/* Diff Modal */}
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
                  <p className="text-white font-bold">{selectedLogForDiff.action.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="text-slate-300 font-medium">{formatDate(selectedLogForDiff.timestamp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-error-500 uppercase tracking-widest ml-1">Legacy State (Before)</h4>
                  <div className="bg-error-500/5 border border-error-500/20 rounded-2xl p-4 font-mono text-[11px] text-slate-400 overflow-auto max-h-[300px]">
                    <pre>{JSON.stringify(selectedLogForDiff.details.before, null, 2)}</pre>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-success-500 uppercase tracking-widest ml-1">New Protocol (After)</h4>
                  <div className="bg-success-500/5 border border-success-500/20 rounded-2xl p-4 font-mono text-[11px] text-slate-200 overflow-auto max-h-[300px]">
                    <pre>{JSON.stringify(selectedLogForDiff.details.after, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Auth Agent Context</p>
                <p className="text-sm text-slate-300 italic">&quot;{selectedLogForDiff.details.description}&quot;</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setShowDiffModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-[10px] tracking-widest px-8"
                >
                  Close Analysis
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit User Modal */}
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

            <div className="flex justify-end space-x-4 pt-8">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="text-slate-400 hover:text-white font-bold uppercase text-[10px] tracking-[0.2em]"
              >
                Abort
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating} 
                className="bg-primary hover:bg-primary/80 text-white px-10 py-4 h-auto rounded-2xl shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.2em]"
              >
                {isUpdating ? 'Transmitting...' : 'Commit Changes'}
              </Button>
            </div>
          </form>
        </Modal>
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
        />
      </div>
    </DashboardLayout>
  )
}
