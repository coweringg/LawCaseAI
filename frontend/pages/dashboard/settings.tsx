import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  Building,
  CreditCard,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  FileText,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  lawFirm: string
  plan: 'basic' | 'professional' | 'enterprise'
  planLimit: number
  currentCases: number
  createdAt: string
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    lawFirm: ''
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    caseUpdates: true,
    aiResponses: false,
    marketingEmails: false
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        lawFirm: user.lawFirm || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!validateEmail(profileForm.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        const data = await response.json()
        updateUser(data.data)
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        toast.success('Profile updated successfully')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (!validatePassword(passwordForm.newPassword)) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully' })
        toast.success('Password updated successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update password' })
        toast.error(error.message || 'Failed to update password')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
    }
  }

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification preferences updated' })
        toast.success('Notification preferences updated')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update notifications' })
        toast.error(error.message || 'Failed to update notifications')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'basic':
        return { name: 'Basic', price: '$29', color: 'bg-secondary-100 text-secondary-800' }
      case 'professional':
        return { name: 'Professional', price: '$79', color: 'bg-primary-100 text-primary-800' }
      case 'enterprise':
        return { name: 'Enterprise', price: '$199', color: 'bg-success-100 text-success-800' }
      default:
        return { name: 'Basic', price: '$29', color: 'bg-secondary-100 text-secondary-800' }
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

  const planInfo = getPlanInfo(user.plan)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900">
                <FileText className="w-5 h-5 mr-3" />
                Cases
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary-50 text-primary-700">
                <SettingsIcon className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-64 p-6 border-t border-secondary-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                <p className="text-xs text-secondary-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
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
                <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-secondary-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'billing', label: 'Billing', icon: CreditCard }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Alert */}
            {message.text && (
              <Alert type={message.type as 'success' | 'error'} className="mb-6">
                {message.text}
              </Alert>
            )}

            {/* Tab Content */}
            <div className="max-w-2xl">
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <Input
                        label="Full Name"
                        name="name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        leftIcon={<User className="w-5 h-5 text-secondary-400" />}
                        required
                      />

                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        leftIcon={<Mail className="w-5 h-5 text-secondary-400" />}
                        required
                      />

                      <Input
                        label="Law Firm"
                        name="lawFirm"
                        type="text"
                        value={profileForm.lawFirm}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lawFirm: e.target.value }))}
                        leftIcon={<Building className="w-5 h-5 text-secondary-400" />}
                      />

                      <div className="pt-4">
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <Input
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        leftIcon={<Lock className="w-5 h-5 text-secondary-400" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="text-secondary-400 hover:text-secondary-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        }
                        required
                      />

                      <Input
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        leftIcon={<Lock className="w-5 h-5 text-secondary-400" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="text-secondary-400 hover:text-secondary-600"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        }
                        required
                      />

                      <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        leftIcon={<Lock className="w-5 h-5 text-secondary-400" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-secondary-400 hover:text-secondary-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        }
                        required
                      />

                      <div className="pt-4">
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleNotificationUpdate} className="space-y-6">
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-secondary-900">Email Notifications</p>
                              <p className="text-sm text-secondary-500">Receive email updates about your account</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.emailNotifications}
                              onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-secondary-900">Case Updates</p>
                              <p className="text-sm text-secondary-500">Get notified when cases are updated</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.caseUpdates}
                              onChange={(e) => setNotifications(prev => ({ ...prev, caseUpdates: e.target.checked }))}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-secondary-900">AI Responses</p>
                              <p className="text-sm text-secondary-500">Receive notifications when AI responds</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.aiResponses}
                              onChange={(e) => setNotifications(prev => ({ ...prev, aiResponses: e.target.checked }))}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-secondary-900">Marketing Emails</p>
                              <p className="text-sm text-secondary-500">Receive product updates and offers</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.marketingEmails}
                              onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                          </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${planInfo.color}`}>
                            {planInfo.name} Plan
                          </span>
                          <p className="mt-2 text-2xl font-bold text-secondary-900">{planInfo.price}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-secondary-500">Cases Used</p>
                          <p className="text-lg font-semibold text-secondary-900">
                            {user.currentCases} / {user.planLimit}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(user.currentCases / user.planLimit) * 100}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Upgrade Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-secondary-600">
                          Need more cases? Upgrade your plan to unlock additional features and higher limits.
                        </p>
                        <Link href="/dashboard/upgrade">
                          <Button>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Billing History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-secondary-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                        <p>No billing history available</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
