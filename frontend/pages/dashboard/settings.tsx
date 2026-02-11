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

    // Check if name is being changed
    if (user && profileForm.name !== user.name) {
      // For now, we'll let the backend handle this validation
      // In a real app with more users, you might want to check this on the frontend too
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
        // Update the form with the new data from the server
        setProfileForm({
          name: data.data.name,
          email: data.data.email,
          lawFirm: data.data.lawFirm
        })
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

    // Check if new password is the same as current password
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from your current password' })
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
        return { name: 'Basic', price: '$29', color: 'bg-law-charcoal-100 text-law-charcoal-800' }
      case 'professional':
        return { name: 'Professional', price: '$79', color: 'bg-law-blue-100 text-law-blue-800' }
      case 'enterprise':
        return { name: 'Enterprise', price: '$199', color: 'bg-law-accent-100 text-law-accent-800' }
      default:
        return { name: 'Basic', price: '$29', color: 'bg-law-charcoal-100 text-law-charcoal-800' }
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

  const planInfo = getPlanInfo(user.plan)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-law-charcoal-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="sidebar w-64">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-3 mb-8 group">
              <img src="/logo.png" alt="LawCaseAI" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-law-charcoal-900">LawCaseAI</span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard" className="sidebar-item sidebar-item-inactive">
                <FileText className="w-5 h-5 mr-3" />
                Cases
              </Link>
              <Link href="/dashboard/settings" className="sidebar-item sidebar-item-active">
                <SettingsIcon className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-64 p-6 border-t border-law-charcoal-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-law-charcoal-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-law-charcoal-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-law-charcoal-900">{user.name}</p>
                <p className="text-xs text-law-charcoal-500">{user.email}</p>
              </div>
            </div>
            <Button
              className="btn-secondary w-full justify-start"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-law border-b border-law-charcoal-200">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className="heading-3 text-law-charcoal-900">Account Settings</h1>
              </div>
            </div>
          </header>

          <main className="p-8">
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-law-charcoal-200">
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
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-law-blue-500 text-law-blue-600'
                          : 'border-transparent text-law-charcoal-500 hover:text-law-charcoal-700 hover:border-law-charcoal-300'
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
              <div className={`alert alert-${message.type as 'success' | 'error'} mb-8 animate-fade-in-up`}>
                {message.text}
              </div>
            )}

            {/* Tab Content */}
            <div className="max-w-3xl">
              {activeTab === 'profile' && (
                <div className="card-premium">
                  <CardHeader className="pb-4">
                    <CardTitle className="heading-4">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="form-group">
                        <Input
                          label="Full Name"
                          name="name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          leftIcon={<User className="w-5 h-5 text-law-charcoal-400" />}
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <Input
                          label="Email Address"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          leftIcon={<Mail className="w-5 h-5 text-law-charcoal-400" />}
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <Input
                          label="Law Firm"
                          name="lawFirm"
                          type="text"
                          value={profileForm.lawFirm}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lawFirm: e.target.value }))}
                          leftIcon={<Building className="w-5 h-5 text-law-charcoal-400" />}
                          className="input-field"
                        />
                      </div>

                      <div className="pt-6">
                        <Button type="submit" className="btn-primary">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="card-premium">
                  <CardHeader className="pb-4">
                    <CardTitle className="heading-4">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="form-group">
                        <Input
                          label="Current Password"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          leftIcon={<Lock className="w-5 h-5 text-law-charcoal-400" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="text-law-charcoal-400 hover:text-law-charcoal-600 transition-colors"
                            >
                              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          }
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <Input
                          label="New Password"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          leftIcon={<Lock className="w-5 h-5 text-law-charcoal-400" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="text-law-charcoal-400 hover:text-law-charcoal-600 transition-colors"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          }
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <Input
                          label="Confirm New Password"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          leftIcon={<Lock className="w-5 h-5 text-law-charcoal-400" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-law-charcoal-400 hover:text-law-charcoal-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          }
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="pt-6">
                        <Button type="submit" className="btn-primary">
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="card-premium">
                  <CardHeader className="pb-4">
                    <CardTitle className="heading-4">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleNotificationUpdate} className="space-y-6">
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 border border-law-charcoal-200 rounded-law-lg hover:bg-law-charcoal-50 transition-colors duration-200">
                            <div>
                              <p className="font-medium text-law-charcoal-900">Email Notifications</p>
                              <p className="text-sm text-law-charcoal-500">Receive email updates about your account</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.emailNotifications}
                              onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                              className="h-4 w-4 text-law-blue-600 focus:ring-law-blue-500 border-law-charcoal-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-law-charcoal-200 rounded-law-lg hover:bg-law-charcoal-50 transition-colors duration-200">
                            <div>
                              <p className="font-medium text-law-charcoal-900">Case Updates</p>
                              <p className="text-sm text-law-charcoal-500">Get notified when cases are updated</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.caseUpdates}
                              onChange={(e) => setNotifications(prev => ({ ...prev, caseUpdates: e.target.checked }))}
                              className="h-4 w-4 text-law-blue-600 focus:ring-law-blue-500 border-law-charcoal-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-law-charcoal-200 rounded-law-lg hover:bg-law-charcoal-50 transition-colors duration-200">
                            <div>
                              <p className="font-medium text-law-charcoal-900">AI Responses</p>
                              <p className="text-sm text-law-charcoal-500">Receive notifications when AI responds</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.aiResponses}
                              onChange={(e) => setNotifications(prev => ({ ...prev, aiResponses: e.target.checked }))}
                              className="h-4 w-4 text-law-blue-600 focus:ring-law-blue-500 border-law-charcoal-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-law-charcoal-200 rounded-law-lg hover:bg-law-charcoal-50 transition-colors duration-200">
                            <div>
                              <p className="font-medium text-law-charcoal-900">Marketing Emails</p>
                              <p className="text-sm text-law-charcoal-500">Receive product updates and offers</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.marketingEmails}
                              onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                              className="h-4 w-4 text-law-blue-600 focus:ring-law-blue-500 border-law-charcoal-300 rounded"
                            />
                          </div>
                      </div>

                      <div className="pt-6">
                        <Button type="submit" className="btn-primary">
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  <div className="card-premium">
                    <CardHeader className="pb-4">
                      <CardTitle className="heading-4">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className={`badge ${planInfo.color}`}>
                            {planInfo.name} Plan
                          </span>
                          <p className="mt-3 text-3xl font-bold text-law-charcoal-900">{planInfo.price}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-law-charcoal-500">Cases Used</p>
                          <p className="text-2xl font-semibold text-law-charcoal-900">
                            {user.currentCases} / {user.planLimit}
                          </p>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(user.currentCases / user.planLimit) * 100}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="card-premium">
                    <CardHeader className="pb-4">
                      <CardTitle className="heading-4">Upgrade Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-law-charcoal-600 leading-relaxed">
                          Need more cases? Upgrade your plan to unlock additional features and higher limits.
                        </p>
                        <Link href="/dashboard/upgrade">
                          <Button className="btn-primary">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>

                  <div className="card-premium">
                    <CardHeader className="pb-4">
                      <CardTitle className="heading-4">Billing History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-law-charcoal-100 rounded-law-lg flex items-center justify-center mx-auto mb-6">
                          <CreditCard className="w-8 h-8 text-law-charcoal-400" />
                        </div>
                        <p className="text-law-charcoal-600">No billing history available</p>
                      </div>
                    </CardContent>
                  </div>
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
