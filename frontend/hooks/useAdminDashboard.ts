import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [userPage, setUserPage] = useState(1)
  const [userLimit, setUserLimit] = useState(10)

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editData, setEditData] = useState({ name: '', email: '', password: '', lawFirm: '', firmCode: '' })
  const [editError, setEditError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'support'>('users')
  const [activeHistoryTab, setActiveHistoryTab] = useState<'admin' | 'platform'>('admin')
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'cases' | 'payments' | 'activity' | 'members' | 'ia'>('overview')

  const [logSearchTerm, setLogSearchTerm] = useState('')
  const [debouncedLogSearchTerm, setDebouncedLogSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [logLimit, setLogLimit] = useState(10)

  const [showDiffModal, setShowDiffModal] = useState(false)
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogEntry | null>(null)

  const [supportTypeFilter, setSupportTypeFilter] = useState<'all' | 'system_error' | 'feature_uplink' | 'login_issue'>('all')
  const [supportStatusFilter, setSupportStatusFilter] = useState('')
  const [signalSubTab, setSignalSubTab] = useState<'public' | 'user'>('public')
  const [publicSubjectFilter, setPublicSubjectFilter] = useState('')
  const [supportPage, setSupportPage] = useState(1)
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null)
  const [showSupportDetailModal, setShowSupportDetailModal] = useState(false)

  const [showPlanModal, setShowPlanModal] = useState(false)

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLogSearchTerm(logSearchTerm), 500)
    return () => clearTimeout(timer)
  }, [logSearchTerm])

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['adminUsers', userPage, userLimit, debouncedSearchTerm, roleFilter],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: userPage.toString(),
        limit: userLimit.toString(),
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        ...(roleFilter !== 'all' ? { role: roleFilter } : {})
      })
      const response = await api.get(`/admin/users?${query.toString()}`)
      return response.data.data
    },
    enabled: !!user && user.role === 'admin'
  })

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats')
      return response.data.data
    },
    enabled: !!user && user.role === 'admin'
  })

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['adminLogs', activeHistoryTab, logPage, logLimit, debouncedLogSearchTerm, startDate, endDate, actionFilter, targetTypeFilter],
    queryFn: async () => {
      const query = new URLSearchParams({
        category: activeHistoryTab,
        page: logPage.toString(),
        limit: logLimit.toString(),
        ...(debouncedLogSearchTerm ? { search: debouncedLogSearchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(targetTypeFilter ? { targetType: targetTypeFilter } : {})
      })
      const response = await api.get(`/admin/audit-logs?${query.toString()}`)
      return response.data.data
    },
    enabled: !!user && user.role === 'admin' && activeTab === 'history'
  })

  const { data: supportData, isLoading: isSupportLoading } = useQuery({
    queryKey: ['adminSupport', supportPage, supportStatusFilter, signalSubTab, supportTypeFilter, publicSubjectFilter],
    queryFn: async () => {
      let typeParam = ''
      if (signalSubTab === 'public') {
        typeParam = 'login_issue'
      } else if (supportTypeFilter !== 'all') {
        typeParam = supportTypeFilter
      }

      const query = new URLSearchParams({
        page: supportPage.toString(),
        limit: '10',
        ...(typeParam ? { type: typeParam } : {}),
        ...(supportStatusFilter ? { status: supportStatusFilter } : {}),
        ...(signalSubTab === 'public' && publicSubjectFilter ? { subject: publicSubjectFilter } : {})
      })
      const response = await api.get(`/admin/support?${query.toString()}`)
      return response.data.data
    },
    enabled: !!user && user.role === 'admin' && activeTab === 'support'
  })

  const { data: userHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['userHistory', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null
      const response = await api.get(`/admin/users/${selectedUser.id}/history`)
      return response.data.data
    },
    enabled: !!selectedUser?.id && showHistoryModal
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
      return api.put(`/admin/users/${userId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User status updated')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.delete(`/admin/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('User terminated successfully')
    }
  })

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string, plan: string }) => {
      return api.put(`/admin/users/${userId}/plan`, { plan })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setShowPlanModal(false)
      setSelectedUser(null)
      toast.success('Plan updated successfully')
    }
  })

  const editUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
      const payload = { ...data }
      if (!payload.password) delete payload.password
      return api.put(`/admin/users/${userId}`, payload)
    },
    onSuccess: async (_, { userId, data }) => {
      if (selectedUser?.isOrgAdmin && selectedUser.organizationId && data.firmCode !== selectedUser.firmCode) {
        await api.put(`/admin/organizations/${selectedUser.organizationId}/code`, { firmCode: data.firmCode })
      }
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setShowEditModal(false)
      setSelectedUser(null)
      toast.success('User protocol updated')
    },
    onError: (error: any) => {
      setEditError(error.response?.data?.message || 'Update failed')
    }
  })

  const forceLogoutMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post(`/admin/users/${userId}/logout`)
    },
    onSuccess: () => {
      toast.success('Sessions invalidated')
    }
  })

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      return api.delete(`/admin/audit-logs/${logId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] })
      toast.success('Log purged')
    }
  })

  const clearLogsMutation = useMutation({
    mutationFn: async (category: string) => {
      return api.delete(`/admin/audit-logs?category=${category}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLogs'] })
      toast.success('History wiped')
    }
  })

  const resolveSupportMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return api.put(`/admin/support/${requestId}/status`, { status: 'resolved' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupport'] })
      toast.success('Resolved')
    }
  })

  const deleteSupportMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return api.delete(`/admin/support/${requestId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupport'] })
      toast.success('Deleted')
    }
  })

  const clearSupportMutation = useMutation({
    mutationFn: async (type: string) => {
      return api.delete(`/admin/support?type=${type}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupport'] })
      toast.success('Support cleared')
    }
  })

  const users = usersData?.users || []
  const userTotalPages = usersData?.pages || 1
  const adminLogs = activeHistoryTab === 'admin' ? (logsData?.logs || []) : []
  const platformLogs = activeHistoryTab === 'platform' ? (logsData?.logs || []) : []
  const totalPages = logsData?.pages || 1
  const supportRequests = supportData?.requests || []
  const supportTotalPages = supportData?.pages || 1
  const totalSupportRequests = supportData?.total || 0

  const handleExportCSV = async () => {
    try {
      const query = new URLSearchParams({
        category: activeHistoryTab,
        export: 'csv',
        ...(debouncedLogSearchTerm ? { search: debouncedLogSearchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(targetTypeFilter ? { targetType: targetTypeFilter } : {})
      })
      const response = await api.get(`/admin/audit-logs?${query.toString()}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit-logs-${activeHistoryTab}-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Export failed')
    }
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

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, isAuthLoading, router])

  return {
    users, stats, adminLogs, platformLogs, supportRequests, userHistory,
    isLoading: isAuthLoading || isUsersLoading || isStatsLoading,
    isLogsLoading, isSupportLoading, isHistoryLoading,
    isUpdating: editUserMutation.isPending,
    isPlanUpdating: updatePlanMutation.isPending,
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    userPage, setUserPage,
    userLimit, setUserLimit,
    userTotalPages,
    logPage, setLogPage,
    logLimit, setLogLimit,
    totalPages,
    supportPage, setSupportPage,
    supportTotalPages,
    totalSupportRequests,
    activeTab, setActiveTab,
    activeHistoryTab, setActiveHistoryTab,
    activeDetailTab, setActiveDetailTab,
    signalSubTab, setSignalSubTab,
    selectedUser, setSelectedUser,
    showEditModal, setShowEditModal,
    showHistoryModal, setShowHistoryModal,
    showDiffModal, setShowDiffModal,
    selectedLogForDiff, setSelectedLogForDiff,
    showSupportDetailModal, setShowSupportDetailModal,
    selectedSupportRequest, setSelectedSupportRequest,
    showPlanModal, setShowPlanModal,
    editData, setEditData,
    editError, setEditError,
    logSearchTerm, setLogSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    actionFilter, setActionFilter,
    targetTypeFilter, setTargetTypeFilter,
    supportTypeFilter, setSupportTypeFilter,
    supportStatusFilter, setSupportStatusFilter,
    publicSubjectFilter, setPublicSubjectFilter,
    confirmConfig, setConfirmConfig,
    handleUserStatusChange: (id: string, s: string) => updateStatusMutation.mutate({ userId: id, status: s }),
    handleDeleteUser: (id: string) => {
      setConfirmConfig({
        isOpen: true,
        title: 'Terminate User Identity',
        message: 'Permanent deletion protocol. Action is irreversible.',
        confirmText: 'Permanently Delete',
        variant: 'danger',
        onConfirm: () => {
          deleteUserMutation.mutate(id)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleUpdatePlan: (id: string, p: string) => updatePlanMutation.mutate({ userId: id, plan: p }),
    handleEditSubmit: (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedUser) editUserMutation.mutate({ userId: selectedUser.id, data: editData })
    },
    handleForceLogout: (id: string) => {
      setConfirmConfig({
        isOpen: true,
        title: 'Invalidate Sessions',
        message: 'Force remote logout for all active sessions?',
        confirmText: 'Invalidate',
        variant: 'warning',
        onConfirm: () => {
          forceLogoutMutation.mutate(id)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleDeleteLog: (id: string) => {
      setConfirmConfig({
        isOpen: true,
        title: 'Purge Log',
        message: 'Remove this entry from the database?',
        confirmText: 'Purge',
        variant: 'danger',
        onConfirm: () => {
          deleteLogMutation.mutate(id)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleClearLogs: () => {
      setConfirmConfig({
        isOpen: true,
        title: 'Wipe History',
        message: `DELETE ALL ${activeHistoryTab === 'admin' ? 'Administrative' : 'Platform'} records?`,
        confirmText: 'Wipe All',
        variant: 'danger',
        onConfirm: () => {
          clearLogsMutation.mutate(activeHistoryTab)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleResolveSupport: (id: string) => resolveSupportMutation.mutate(id),
    handleDeleteSupport: (id: string) => {
      setConfirmConfig({
        isOpen: true,
        title: 'Delete Signal',
        message: 'Permanently delete this support request?',
        confirmText: 'Delete',
        variant: 'danger',
        onConfirm: () => {
          deleteSupportMutation.mutate(id)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleClearSupport: (type?: string) => {
      setConfirmConfig({
        isOpen: true,
        title: 'Clear Signals',
        message: 'Delete ALL requests in this category?',
        confirmText: 'Clear All',
        variant: 'danger',
        onConfirm: () => {
          clearSupportMutation.mutate(type || supportTypeFilter)
          setConfirmConfig(p => ({ ...p, isOpen: false }))
        }
      })
    },
    handleExportCSV,
    openEditModal,
    fetchUserHistory: (id: string) => {
      const u = users.find((u: AdminUser) => u.id === id);
      if (u) setSelectedUser(u);
      setShowHistoryModal(true);
    },
    setUserHistory: () => {},
    user,
    isAuthLoading
  };
}
