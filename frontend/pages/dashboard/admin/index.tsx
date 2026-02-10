import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Building,
  CreditCard,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, getPlanColor } from '@/utils/helpers'

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
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCases: number
  newUsersThisMonth: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [newPlan, setNewPlan] = useState<'basic' | 'professional' | 'enterprise'>('basic')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
    fetchStats()
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleUserStatusChange = async (userId: string, status: 'active' | 'disabled') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handlePlanChange = async (userId: string, plan: 'basic' | 'professional' | 'enterprise') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, plan, planLimit: getPlanLimit(plan) } : user
        ))
        setShowPlanModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to update user plan:', error)
    }
  }

  const getPlanLimit = (plan: string) => {
    switch (plan) {
      case 'basic': return 5
      case 'professional': return 25
      case 'enterprise': return 100
      default: return 5
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lawFirm.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const userColumns = [
    {
      key: 'name' as keyof AdminUser,
      title: 'User',
      render: (value: string, item: AdminUser) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-secondary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-900">{value}</p>
            <p className="text-sm text-secondary-500">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'lawFirm' as keyof AdminUser,
      title: 'Law Firm'
    },
    {
      key: 'plan' as keyof AdminUser,
      title: 'Plan',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'currentCases' as keyof AdminUser,
      title: 'Cases',
      render: (value: number, item: AdminUser) => (
        <span className="text-sm">{value} / {item.planLimit}</span>
      )
    },
    {
      key: 'status' as keyof AdminUser,
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-success-100 text-success-800' :
          value === 'disabled' ? 'bg-error-100 text-error-800' :
          'bg-warning-100 text-warning-800'
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
      render: (value: string) => formatDate(value)
    },
    {
      key: 'actions' as keyof AdminUser,
      title: 'Actions',
      render: (value: any, item: AdminUser) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(item)
              setShowPlanModal(true)
              setNewPlan(item.plan)
            }}
          >
            Change Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUserStatusChange(item.id, item.status === 'active' ? 'disabled' : 'active')}
            className={item.status === 'active' ? 'text-error-600 hover:text-error-800' : 'text-success-600 hover:text-success-800'}
          >
            {item.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">LawCaseAI Admin</span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary-50 text-primary-700">
                <Users className="w-5 h-5 mr-3" />
                Users
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-64 p-6 border-t border-secondary-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">Admin User</p>
                <p className="text-xs text-secondary-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.push('/login')
              }}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-secondary-100">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
                  <p className="text-secondary-600">Manage users and system settings</p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Total Users</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-success-100 rounded-lg">
                        <Activity className="w-6 h-6 text-success-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Active Users</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.activeUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-warning-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-warning-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-secondary-900">${stats.monthlyRevenue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-secondary-100 rounded-lg">
                        <FileText className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Total Cases</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.totalCases}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table
                  data={filteredUsers}
                  columns={userColumns}
                  emptyMessage="No users found."
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Change Plan Modal */}
      <Modal
        isOpen={Boolean(showPlanModal && selectedUser)}
        onClose={() => {
          setShowPlanModal(false)
          setSelectedUser(null)
        }}
        title="Change User Plan"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary-600 mb-4">
              Change plan for <strong>{selectedUser?.name}</strong>
            </p>
            <div className="space-y-3">
              {[
                { value: 'basic', label: 'Basic - $29/month', limit: '5 cases' },
                { value: 'professional', label: 'Professional - $79/month', limit: '25 cases' },
                { value: 'enterprise', label: 'Enterprise - $199/month', limit: '100 cases' }
              ].map((plan) => (
                <label key={plan.value} className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.value}
                    checked={newPlan === plan.value}
                    onChange={(e) => setNewPlan(e.target.value as 'basic' | 'professional' | 'enterprise')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <div>
                    <p className="font-medium text-secondary-900">{plan.label}</p>
                    <p className="text-sm text-secondary-500">{plan.limit}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowPlanModal(false)
                setSelectedUser(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && handlePlanChange(selectedUser.id, newPlan)}
            >
              Update Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
