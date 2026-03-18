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
  Brain,
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
  X,
  Bell,
  Cpu,
  Database,
  Globe,
  Lock,
  Zap,
  Command,
  Monitor,
  Terminal,
  ShieldCheck,
  LayoutDashboard,
  Calendar,
  Headphones
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { toast } from 'react-hot-toast'

interface AdminUser {
  id: string
  name: string
  email: string
  lawFirm: string
  plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise'
  planLimit: number
  currentCases: number
  status: 'active' | 'disabled' | 'suspended'
  organizationId?: string
  isOrgAdmin?: boolean
  firmCode?: string
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
  category: 'admin' | 'platform'
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
  orgMembers?: any[]
  organizationData?: {
    id: string
    firmCode: string
    totalSeats: number
    usedSeats: number
  }
  aiUsage?: {
    totalTokensConsumed: number
    totalStorageUsed: number
    plan: string
    maxTokens: number
    maxTotalStorage: number
  }
}

interface SupportRequest {
  _id: string
  userId: string
  userEmail: string
  userName: string
  lawFirm?: string
  type: 'system_error' | 'feature_uplink' | 'login_issue'
  subject: string
  description: string
  status: 'pending' | 'resolved'
  createdAt: string
  updatedAt: string
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
  const [editData, setEditData] = useState({ name: '', email: '', password: '', lawFirm: '', firmCode: '' })
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'support'>('users')
  const [activeHistoryTab, setActiveHistoryTab] = useState<'admin' | 'platform'>('admin')
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'cases' | 'payments' | 'activity' | 'members' | 'ia'>('overview')
  const [adminLogs, setAdminLogs] = useState<AuditLogEntry[]>([])
  const [platformLogs, setPlatformLogs] = useState<AuditLogEntry[]>([])
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [logSearchTerm, setLogSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogEntry | null>(null)
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [isSupportLoading, setIsSupportLoading] = useState(false)
  const [supportTypeFilter, setSupportTypeFilter] = useState<'all' | 'system_error' | 'feature_uplink' | 'login_issue'>('all')
  const [supportStatusFilter, setSupportStatusFilter] = useState('')
  const [signalSubTab, setSignalSubTab] = useState<'public' | 'user'>('public')
  const [publicSubjectFilter, setPublicSubjectFilter] = useState('')
  const [supportPage, setSupportPage] = useState(1)
  const [totalSupportRequests, setTotalSupportRequests] = useState(0)
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null)
  const [showSupportDetailModal, setShowSupportDetailModal] = useState(false)
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
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [isPlanUpdating, setIsPlanUpdating] = useState(false)

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

  const fetchSupportRequests = useCallback(async () => {
    setIsSupportLoading(true)
    try {
      const query = new URLSearchParams({
        page: supportPage.toString(),
        limit: '100',
        ...(supportStatusFilter ? { status: supportStatusFilter } : {})
      })
      const response = await api.get(`/admin/support?${query.toString()}`)
      if (response.data.success) {
        setSupportRequests(response.data.data.requests)
        setTotalSupportRequests(response.data.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch support requests:', error)
    } finally {
      setIsSupportLoading(false)
    }
  }, [supportPage, supportStatusFilter])

  useEffect(() => {
    const initDashboard = async () => {
      if (!isAuthLoading) {
        if (!user || user.role !== 'admin') {
          router.push('/dashboard')
        } else {
          try {
            await Promise.all([
              fetchUsers(),
              fetchStats(),
              fetchAuditLogs('admin'),
              fetchAuditLogs('platform'),
              fetchSupportRequests()
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
  }, [user, isAuthLoading, router, fetchUsers, fetchStats, fetchAuditLogs, fetchSupportRequests])

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'admin') {
      fetchAuditLogs(activeHistoryTab)
    } else if (activeTab === 'support' && user?.role === 'admin') {
      fetchSupportRequests()
    }
  }, [activeTab, activeHistoryTab, user?.role, fetchAuditLogs, fetchSupportRequests])

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

  const handleUpdatePlan = async (userId: string, plan: string) => {
    setIsPlanUpdating(true)
    try {
      const response = await api.put(`/admin/users/${userId}/plan`, { plan })
      if (response.data.success) {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, plan: plan as any } : user
        ))
        setShowPlanModal(false)
        setSelectedUser(null)
        toast.success(`Plan updated to ${plan} successfully`)
      }
    } catch (error) {
      console.error('Failed to update plan:', error)
      toast.error('Failed to update user plan')
    } finally {
      setIsPlanUpdating(false)
    }
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
    setEditError(null)
    
    try {
      const payload: any = { ...editData }
      if (!payload.password) delete payload.password

      const response = await api.put(`/admin/users/${selectedUser.id}`, payload, {
        validateStatus: (status) => status < 500
      })

      if (response.status === 200 && response.data.success) {
        if (selectedUser.isOrgAdmin && selectedUser.organizationId && editData.firmCode !== selectedUser.firmCode) {
          try {
            await api.put(`/admin/organizations/${selectedUser.organizationId}/code`, { 
              firmCode: editData.firmCode 
            })
          } catch (orgError: any) {
            console.error('Failed to update firm code:', orgError)
            const errorMsg = orgError.response?.data?.message || 'Failed to update organization code'
            setEditError(errorMsg)
            setIsUpdating(false)
            return
          }
        }
        
        await fetchUsers()
        setShowEditModal(false)
        setSelectedUser(null)
        toast.success('User protocol updated successfully')
      } else if (response.status === 400) {
        setEditError(response.data.message || 'Failed to update user')
      }
    } catch (error: any) {
      console.error('Failed to update user:', error)
      setEditError(error.response?.data?.message || 'Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResolveSupport = async (requestId: string) => {
    try {
      const response = await api.put(`/admin/support/${requestId}/status`, { status: 'resolved' })
      if (response.data.success) {
        setSupportRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, status: 'resolved' } : req
        ))
        toast.success('Support request marked as resolved')
      }
    } catch (error) {
      console.error('Failed to resolve support request:', error)
      toast.error('Failed to update status')
    }
  }

  const handleDeleteSupport = async (requestId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Support Signal',
      message: 'Are you sure you want to permanently delete this support request? This action cannot be undone.',
      confirmText: 'Delete Signal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/support/${requestId}`)
          if (response.data.success) {
            setSupportRequests(prev => prev.filter(r => r._id !== requestId))
            setTotalSupportRequests(prev => prev - 1)
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            toast.success('Support request deleted')
          }
        } catch (error) {
          console.error('Failed to delete support request:', error)
          toast.error('Failed to delete request')
        }
      }
    })
  }

  const handleClearSupport = async (typeOverride?: string) => {
    const finalType = typeOverride || supportTypeFilter
    const categoryName = finalType === 'system_error' ? 'System Errors' : finalType === 'feature_uplink' ? 'Feature Uplinks' : finalType === 'login_issue' ? 'Public Signals' : 'All Signals'
    
    setConfirmConfig({
      isOpen: true,
      title: 'Signal Cleanup',
      message: `Are you sure you want to delete ALL ${categoryName}? This action will permanently wipe this section.`,
      confirmText: 'Wipe All',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await api.delete(`/admin/support?type=${finalType}`)
          if (response.data.success) {
            await fetchSupportRequests()
            setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            toast.success(`Cleared all ${categoryName}`)
          }
        } catch (error) {
          console.error('Failed to clear support requests:', error)
          toast.error('Failed to clear requests')
        }
      }
    })
  }

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user)
    setEditError(null)
    setEditData({
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm,
      firmCode: user.firmCode || '',
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
          'FILE_DELETED': 'bg-error-500/20 text-error-500',
          'AI_CONSULTATION': 'bg-purple-500/20 text-purple-400',
          'PLAN_CHANGE': 'bg-indigo-500/20 text-indigo-400',
          'PAYMENT_PROCESSED': 'bg-emerald-500/20 text-emerald-400',
          'PAYMENT_METHOD_ADD': 'bg-emerald-500/20 text-emerald-400',
          'PAYMENT_METHOD_REMOVE': 'bg-error-500/20 text-error-500',
          'USER_DELETED': 'bg-error-500/20 text-error-500',
          'STATUS_CHANGE': 'bg-warning-500/20 text-warning-500',
          'NOTIFICATION_CHANGE': 'bg-slate-500/20 text-slate-400',
          'SUPPORT_REQUEST_SUBMITTED': 'bg-blue-500/20 text-blue-400',
          'SUPPORT_REQUEST_STATUS_UPDATE': 'bg-blue-500/20 text-blue-400',
          'ORG_CODE_UPDATE': 'bg-indigo-500/20 text-indigo-400',
          'CREATE': 'bg-success-500/20 text-success-500'
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
      <Head>
        <title>Command Center | LawCaseAI</title>
      </Head>

      <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col p-8 md:p-12 gap-12">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Administrative Nexus</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tightest leading-none font-display uppercase italic bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              Command Suite
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> System Authorization Level: Alpha-One
            </p>
          </div>

          <div className="flex gap-4">
             <Button 
                variant="none" 
                className="premium-glass h-14 px-8 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all flex items-center gap-3"
             >
                <Monitor size={18} className="text-primary" />
                Network Status: Active
             </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { label: 'Total Network Users', value: stats.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
              { label: 'Active Logic Streams', value: stats.activeUsers, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
              { label: 'Repository Entities', value: stats.totalCases, icon: Database, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/20' }
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.label}
                className={`premium-glass p-8 rounded-[2.5rem] border ${stat.border} ${stat.bg} shadow-2xl group flex justify-between items-center`}
              >
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-wrap gap-4 premium-glass p-2 rounded-3xl border border-white/10 shadow-2xl w-fit">
          {[
            { id: 'users', label: 'User Identity Nexus', icon: Users },
            { id: 'history', label: 'Protocol Archives', icon: Terminal },
            { id: 'support', label: 'Logic Signal Feed', icon: Bell }
          ].map((tab) => (
            <motion.button
              whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                activeTab === tab.id 
                ? "bg-primary text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-white/20" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 relative z-10"
            >
              <div className="premium-glass p-4 rounded-3xl border border-white/10 shadow-2xl">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Identify network entity by name, stream, or law firm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] text-[15px] font-bold text-white placeholder-slate-600 transition-all uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
                <Table
                  data={filteredUsers}
                  columns={userColumns}
                  emptyMessage="Initial search returned no matching entities."
                />
              </div>
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 relative z-10"
            >
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

                <div className="flex flex-1 max-w-2xl gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder={`Filter ${activeHistoryTab === 'admin' ? 'Administrative' : 'Client'} archives...`}
                      value={logSearchTerm}
                      onChange={(e) => setLogSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[13px] text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all font-bold uppercase tracking-widest"
                    />
                    {logSearchTerm && (
                      <button 
                        onClick={() => setLogSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2 hover:bg-white/[0.04] transition-all">
                    <Calendar size={12} className="text-slate-500" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 w-28 [color-scheme:dark]"
                    />
                    <span className="text-slate-800 font-bold">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 w-28 [color-scheme:dark]"
                    />
                  </div>
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
              </div>
            </motion.div>
          ) : activeTab === 'support' ? (
            <motion.div 
              key="support"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 relative z-10"
            >
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
                    onClick={() => setSignalSubTab('public')}
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
                    onClick={() => setSignalSubTab('user')}
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
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Login & Access Issues • Unauthenticated Users</p>
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
                          onClick={() => setPublicSubjectFilter(s.id)}
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
                          onChange={(e) => setSupportStatusFilter(e.target.value)}
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
                        whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchSupportRequests}
                        disabled={isSupportLoading}
                        className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                      >
                        <RotateCcw size={16} className={cn(isSupportLoading && "animate-spin")} />
                      </motion.button>

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
                      data={supportRequests.filter(r => {
                        if (r.type !== 'login_issue') return false
                        if (publicSubjectFilter && r.subject !== publicSubjectFilter) return false
                        return true
                      })}
                      columns={supportColumns}
                      loading={isSupportLoading}
                      emptyMessage="No public login signals detected."
                    />
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
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Errors & Feature Requests • Authenticated Users</p>
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
                          onClick={() => setSupportTypeFilter(sType.id as any)}
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
                          onChange={(e) => setSupportStatusFilter(e.target.value)}
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
                        whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchSupportRequests}
                        disabled={isSupportLoading}
                        className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                      >
                        <RotateCcw size={16} className={cn(isSupportLoading && "animate-spin")} />
                      </motion.button>

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
                      data={supportRequests.filter(r => {
                        if (supportTypeFilter === 'system_error') return r.type === 'system_error'
                        if (supportTypeFilter === 'feature_uplink') return r.type === 'feature_uplink'
                        return r.type !== 'login_issue'
                      })}
                      columns={supportColumns}
                      loading={isSupportLoading}
                      emptyMessage="No user signals detected in current spectrum."
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 opacity-40 flex flex-col items-center gap-6"
            >
              <Lock size={48} className="text-slate-700" />
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Module Offline &bull; Access Level Zero</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                          { key: 'actions', title: '', render: (_, item: any) => (
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
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
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
    </DashboardLayout>
  )
}
