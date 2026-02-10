import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardNav } from '@/components/DashboardNav'
import { formatDate } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface Case {
  id: string
  name: string
  client: string
  description: string
  status: 'active' | 'closed' | 'archived'
  createdAt: string
  updatedAt: string
  fileCount: number
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCase, setNewCase] = useState({
    name: '',
    client: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (token) {
      fetchCases()
    }
  }, [token])

  const fetchCases = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCases(data.data.cases || [])
      } else {
        toast.error('Failed to fetch cases')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCase.name.trim() || !newCase.client.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCase)
      })

      const data = await response.json()

      if (response.ok) {
        setCases(prev => [data.data, ...prev])
        setNewCase({ name: '', client: '', description: '' })
        setShowCreateModal(false)
        toast.success('Case created successfully!')
      } else {
        toast.error(data.message || 'Failed to create case')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredCases = cases.filter(case_ =>
    case_.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800'
      case 'closed':
        return 'bg-secondary-100 text-secondary-800'
      case 'archived':
        return 'bg-warning-100 text-warning-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-secondary-100 text-secondary-800'
      case 'professional':
        return 'bg-primary-100 text-primary-800'
      case 'enterprise':
        return 'bg-success-100 text-success-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
        <div className="flex">
          <DashboardNav currentPage="cases" />
          
          <div className="flex-1">
            <header className="bg-white shadow-sm border-b border-secondary-100">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Cases</h1>
                    <p className="text-secondary-600">Manage your legal cases</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Case
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Total Cases</p>
                        <p className="text-2xl font-bold text-secondary-900">{cases.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-success-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-success-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Active</p>
                        <p className="text-2xl font-bold text-secondary-900">
                          {cases.filter(c => c.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-warning-100 rounded-lg">
                        <Clock className="w-6 h-6 text-warning-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Plan Usage</p>
                        <p className="text-2xl font-bold text-secondary-900">
                          {user.currentCases}/{user.planLimit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-info-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-info-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Current Plan</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(user.plan)}`}>
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : filteredCases.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No cases found</h3>
                      <p className="text-secondary-600 mb-4">
                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first case'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowCreateModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Case
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Case Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Files
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {filteredCases.map((case_) => (
                            <tr key={case_.id} className="hover:bg-secondary-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-secondary-900">{case_.name}</div>
                                  <div className="text-sm text-secondary-500">{case_.description}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-secondary-400 mr-2" />
                                  <span className="text-sm text-secondary-900">{case_.client}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(case_.status)}`}>
                                  {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                {case_.fileCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                {formatDate(case_.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/dashboard/cases/${case_.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Create New Case</h3>
                <form onSubmit={handleCreateCase} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Case Name *
                    </label>
                    <input
                      type="text"
                      value={newCase.name}
                      onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Smith vs. Johnson"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newCase.client}
                      onChange={(e) => setNewCase(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newCase.description}
                      onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="Brief description of case..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Case'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
