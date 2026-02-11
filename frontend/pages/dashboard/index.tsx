import React, { useState, useEffect, useCallback } from 'react'
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

  const fetchCases = useCallback(async () => {
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
  }, [token])

  useEffect(() => {
    if (token) {
      fetchCases()
    }
  }, [token, fetchCases])

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
        return 'bg-law-accent-100 text-law-accent-800'
      case 'closed':
        return 'bg-law-charcoal-100 text-law-charcoal-800'
      case 'archived':
        return 'bg-law-gold-100 text-law-gold-800'
      default:
        return 'bg-law-charcoal-100 text-law-charcoal-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-law-charcoal-100 text-law-charcoal-800'
      case 'professional':
        return 'bg-law-blue-100 text-law-blue-800'
      case 'enterprise':
        return 'bg-law-accent-100 text-law-accent-800'
      default:
        return 'bg-law-charcoal-100 text-law-charcoal-800'
    }
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-law-charcoal-50 flex items-center justify-center">
          <div className="spinner w-12 h-12"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-law-charcoal-50">
        <div className="flex">
          <DashboardNav currentPage="cases" />
          
          <div className="flex-1">
            <header className="bg-white shadow-law border-b border-law-charcoal-200">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="heading-3 text-law-charcoal-900">Case Management</h1>
                    <p className="text-law-charcoal-600 mt-1">Manage and track all your legal cases in one place</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-law-charcoal-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      New Case
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-law-blue-100 rounded-law-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-law-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-law-charcoal-600">Total Cases</p>
                        <p className="text-3xl font-bold text-law-charcoal-900">{cases.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-law-accent-100 rounded-law-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-law-accent-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-law-charcoal-600">Active Cases</p>
                        <p className="text-3xl font-bold text-law-charcoal-900">
                          {cases.filter(c => c.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-law-gold-100 rounded-law-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-law-gold-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-law-charcoal-600">Plan Usage</p>
                        <p className="text-3xl font-bold text-law-charcoal-900">
                          {user.currentCases}/{user.planLimit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-law-blue-100 rounded-law-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-law-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-law-charcoal-600">Current Plan</p>
                        <span className={`badge ${getPlanColor(user.plan)}`}>
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>

              <div className="card-premium">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-4">Recent Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="spinner w-8 h-8"></div>
                    </div>
                  ) : filteredCases.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-law-charcoal-100 rounded-law-lg flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-law-charcoal-400" />
                      </div>
                      <h3 className="heading-4 text-law-charcoal-900 mb-3">No cases found</h3>
                      <p className="text-law-charcoal-600 mb-6">
                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first case'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowCreateModal(true)} className="btn-primary">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Case
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead className="table-header">
                          <tr>
                            <th className="table-header-cell">
                              Case Name
                            </th>
                            <th className="table-header-cell">
                              Client
                            </th>
                            <th className="table-header-cell">
                              Status
                            </th>
                            <th className="table-header-cell">
                              Files
                            </th>
                            <th className="table-header-cell">
                              Created
                            </th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {filteredCases.map((case_) => (
                            <tr key={case_.id} className="table-row">
                              <td className="table-cell">
                                <div>
                                  <div className="text-sm font-medium text-law-charcoal-900">{case_.name}</div>
                                  <div className="text-sm text-law-charcoal-500">{case_.description}</div>
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-law-charcoal-400 mr-2" />
                                  <span className="text-sm text-law-charcoal-900">{case_.client}</span>
                                </div>
                              </td>
                              <td className="table-cell">
                                <span className={`badge ${getStatusColor(case_.status)}`}>
                                  {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                                </span>
                              </td>
                              <td className="table-cell">
                                {case_.fileCount}
                              </td>
                              <td className="table-cell">
                                {formatDate(case_.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/dashboard/cases/${case_.id}`}>
                                  <Button className="btn-outline" size="sm">
                                    View Details
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
              </div>
            </main>
          </div>
        </div>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-8">
                <h3 className="heading-3 text-law-charcoal-900 mb-6">Create New Case</h3>
                <form onSubmit={handleCreateCase} className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">
                      Case Name *
                    </label>
                    <input
                      type="text"
                      value={newCase.name}
                      onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Smith vs. Johnson"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newCase.client}
                      onChange={(e) => setNewCase(prev => ({ ...prev, client: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Description
                    </label>
                    <textarea
                      value={newCase.description}
                      onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field"
                      rows={4}
                      placeholder="Brief description of case..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-primary" disabled={isCreating}>
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
