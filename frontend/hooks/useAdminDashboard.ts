import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string
  name: string
  email: string
  lawFirm: string
  plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise'
  planLimit: number
  currentCases: number
  status: 'active' | 'disabled' | 'suspended'
  role?: string
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
  targetType: 'user' | 'case' | 'payment' | 'system' | 'organization' | 'ai'
  category: 'admin' | 'platform'
  action: string
  severity: 'info' | 'warning' | 'critical'
  details: {
    before?: any
    after?: any
    description: string
  }
  timestamp: string
}

interface UserHistory {
  cases: Array<{
    _id: string
    name: string
    client: string
    status: 'active' | 'closed' | 'pending'
    createdAt: string
    closedAt?: string
  }>
  payments: Array<{
    _id: string
    amount: number
    currency: string
    status: string
    createdAt: string
    plan: string
  }>
  auditLogs: AuditLogEntry[]
  orgMembers?: Array<{
    id: string
    name: string
    email: string
    role: string
    status: 'active' | 'disabled' | 'suspended'
    plan?: string
    currentCases?: number
    isOrgAdmin?: boolean
    _id: string
  }>
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

export function useAdminDashboard() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [userPage, setUserPage] = useState(1)
  const [userLimit, setUserLimit] = useState(10)
  const [userTotalPages, setUserTotalPages] = useState(1)
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
  const [actionFilter, setActionFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [logLimit, setLogLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogEntry | null>(null)
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [isSupportLoading, setIsSupportLoading] = useState(false)
  const [supportTypeFilter, setSupportTypeFilter] = useState<'all' | 'system_error' | 'feature_uplink' | 'login_issue'>('all')
  const [supportStatusFilter, setSupportStatusFilter] = useState('')
  const [signalSubTab, setSignalSubTab] = useState<'public' | 'user'>('public')
  const [publicSubjectFilter, setPublicSubjectFilter] = useState('')
  const [supportPage, setSupportPage] = useState(1)
  const [supportTotalPages, setSupportTotalPages] = useState(1)
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
      const query = new URLSearchParams({
        page: userPage.toString(),
        limit: userLimit.toString(),
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(roleFilter !== 'all' ? { role: roleFilter } : {})
      })
      const response = await api.get(`/admin/users?${query.toString()}`)
      if (response.data.success) {
        setUsers(response.data.data.users || [])
        setUserTotalPages(response.data.data.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [userPage, userLimit, searchTerm, roleFilter])

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
        page: logPage.toString(),
        limit: logLimit.toString(),
        ...(logSearchTerm ? { search: logSearchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(targetTypeFilter ? { targetType: targetTypeFilter } : {})
      })
      const response = await api.get(`/admin/audit-logs?${query.toString()}`)
      if (response.data.success) {
        if (category === 'admin') setAdminLogs(response.data.data.logs || [])
        else setPlatformLogs(response.data.data.logs || [])
        setTotalPages(response.data.data.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setIsLogsLoading(false)
    }
  }, [activeHistoryTab, logSearchTerm, startDate, endDate, actionFilter, targetTypeFilter, logPage, logLimit])

  const handleExportCSV = async () => {
    try {
      const query = new URLSearchParams({
        category: activeHistoryTab,
        export: 'csv',
        ...(logSearchTerm ? { search: logSearchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(targetTypeFilter ? { targetType: targetTypeFilter } : {})
      })
      
      const response = await api.get(`/admin/audit-logs?${query.toString()}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit-logs-${activeHistoryTab}-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('CSV Export failed:', error)
      toast.error('Failed to export CSV')
    }
  }

  const fetchSupportRequests = useCallback(async () => {
    setIsSupportLoading(true)
    try {
      let typeParam = ''
      if (signalSubTab === 'public') {
        typeParam = 'login_issue'
      } else {
        if (supportTypeFilter !== 'all') {
          typeParam = supportTypeFilter
        }
      }

      const query = new URLSearchParams({
        page: supportPage.toString(),
        limit: '10',
        ...(typeParam ? { type: typeParam } : {}),
        ...(supportStatusFilter ? { status: supportStatusFilter } : {}),
        ...(signalSubTab === 'public' && publicSubjectFilter ? { subject: publicSubjectFilter } : {})
      })
      const response = await api.get(`/admin/support?${query.toString()}`)
      if (response.data.success) {
        setSupportRequests(response.data.data.requests)
        setTotalSupportRequests(response.data.data.total)
        setSupportTotalPages(response.data.data.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch support requests:', error)
    } finally {
      setIsSupportLoading(false)
    }
  }, [supportPage, supportStatusFilter, signalSubTab, supportTypeFilter, publicSubjectFilter])

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
    if (activeTab === 'users' && user?.role === 'admin') {
      const timer = setTimeout(() => {
        fetchUsers()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [activeTab, searchTerm, roleFilter, userPage, fetchUsers, user?.role])

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'admin') {
      fetchAuditLogs(activeHistoryTab)
    } else if (activeTab === 'support' && user?.role === 'admin') {
      fetchSupportRequests()
    }
  }, [activeTab, activeHistoryTab, user?.role, fetchAuditLogs, fetchSupportRequests, logPage, supportPage, supportStatusFilter, signalSubTab, supportTypeFilter, publicSubjectFilter])

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
      const payload: Partial<typeof editData> = { ...editData }
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

  

  return {
    users, setUsers,
    stats, setStats,
    isLoading, setIsLoading,
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    userPage, setUserPage,
    userLimit, setUserLimit,
    userTotalPages, setUserTotalPages,
    selectedUser, setSelectedUser,
    showEditModal, setShowEditModal,
    showHistoryModal, setShowHistoryModal,
    userHistory, setUserHistory,
    isHistoryLoading, setIsHistoryLoading,
    editData, setEditData,
    editError, setEditError,
    isUpdating, setIsUpdating,
    activeTab, setActiveTab,
    activeHistoryTab, setActiveHistoryTab,
    activeDetailTab, setActiveDetailTab,
    adminLogs, setAdminLogs,
    platformLogs, setPlatformLogs,
    isLogsLoading, setIsLogsLoading,
    logSearchTerm, setLogSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    actionFilter, setActionFilter,
    targetTypeFilter, setTargetTypeFilter,
    logPage, setLogPage,
    logLimit, setLogLimit,
    totalPages, setTotalPages,
    showDiffModal, setShowDiffModal,
    selectedLogForDiff, setSelectedLogForDiff,
    supportRequests, setSupportRequests,
    isSupportLoading, setIsSupportLoading,
    supportTypeFilter, setSupportTypeFilter,
    supportStatusFilter, setSupportStatusFilter,
    signalSubTab, setSignalSubTab,
    publicSubjectFilter, setPublicSubjectFilter,
    supportPage, setSupportPage,
    supportTotalPages, setSupportTotalPages,
    totalSupportRequests, setTotalSupportRequests,
    selectedSupportRequest, setSelectedSupportRequest,
    showSupportDetailModal, setShowSupportDetailModal,
    confirmConfig, setConfirmConfig,
    showPlanModal, setShowPlanModal,
    isPlanUpdating, setIsPlanUpdating,
    fetchUsers,
    fetchStats,
    fetchAuditLogs,
    handleExportCSV,
    fetchSupportRequests,
    handleDeleteLog,
    handleClearLogs,
    handleUpdatePlan,
    fetchUserHistory,
    handleUserStatusChange,
    handleDeleteUser,
    handleForceLogout,
    handleEditSubmit,
    handleResolveSupport,
    handleDeleteSupport,
    handleClearSupport,
    openEditModal,
    user,
    isAuthLoading,
    api
  };
}
