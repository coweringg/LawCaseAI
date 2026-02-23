import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Mail,
  Building,
  CreditCard,
  Shield,
  ShieldCheck,
  ShieldAlert,
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
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/utils/api'
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
      const response = await api.put('/user/profile', profileForm)

      if (response.status === 200) {
        const data = response.data
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
        const error = response.data
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
      const response = await api.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'Password updated successfully' })
        toast.success('Password updated successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = response.data
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
      const response = await api.put('/user/notifications', notifications)

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'Notification preferences updated' })
        toast.success('Notification preferences updated')
      } else {
        const error = response.data
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
        return { name: 'Enterprise', price: '$999', color: 'bg-law-accent-100 text-law-accent-800' }
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
      <Head>
        <title>LawCaseAI - Settings</title>
      </Head>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden relative">
          <div className="flex-1 overflow-hidden bg-transparent relative">


            {/* Main Content */}

              <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
              
              {/* Header */}
              <header className="px-6 py-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent pointer-events-none"></div>
                <div className="flex flex-col relative z-10">
                  <h1 className="text-2xl font-black text-white tracking-tightest font-display leading-tight">Configuration Matrix</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.2 h-1.2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">System Preferences &bull; Identity Synchronization Active</p>
                  </div>
                </div>
              </header>
  
              <main className="p-4 max-w-6xl mx-auto">
                {/* Tabs */}
                <div className="mb-4">
                  <div className="premium-glass p-1 rounded-[2rem] border border-white/10 shadow-2xl inline-flex flex-wrap gap-1.5">
                    {[
                      { id: 'profile', label: 'Identity', icon: User },
                      { id: 'security', label: 'Security Crypt', icon: Shield },
                      { id: 'notifications', label: 'Transmission', icon: Bell },
                      { id: 'billing', label: 'Treasury', icon: CreditCard }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-500 ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20'
                          : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        <tab.icon size={12} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
  
                {/* Alert */}
                <AnimatePresence mode="wait">
                  {message.text && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className={`mb-4 p-4 rounded-3xl border backdrop-blur-2xl shadow-2xl flex items-center gap-4 ${
                        message.type === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {message.type === 'success' ? <Shield size={16} /> : <ShieldAlert size={16} />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">{message.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

              {/* Tab Content */}
              <div className="max-w-3xl">
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="premium-glass border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-500">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white font-display tracking-tightest uppercase">Core Identity</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel Matrix Synchronization</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                        <Input
                          name="name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          leftIcon={<User className="w-5 h-5 text-primary/50" />}
                          className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-4 h-14"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural Mailbox</label>
                        <Input
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          leftIcon={<Mail className="w-5 h-5 text-primary/50" />}
                          className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-3 h-12"
                          required
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consortium / Law Firm</label>
                        <Input
                          name="lawFirm"
                          type="text"
                          value={profileForm.lawFirm}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lawFirm: e.target.value }))}
                          leftIcon={<Building className="w-5 h-5 text-primary/50" />}
                          className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-3 h-12"
                        />
                      </div>

                      <div className="md:col-span-2 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full h-12 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center gap-3"
                        >
                          <Save size={16} />
                          Synchronize Identity
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="premium-glass border border-white/10 rounded-[2.5rem] p-6 shadow-2xl group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white font-display tracking-tightest uppercase">Security Protocols</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Access Credential Re-Authorization</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Cipher</label>
                        <Input
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          leftIcon={<Lock className="w-5 h-5 text-primary/50" />}
                          rightIcon={
                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-slate-500 hover:text-white transition-colors">
                              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          }
                          className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-3 h-12"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Hash Pattern</label>
                          <Input
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            leftIcon={<Shield size={18} className="text-primary/50" />}
                            rightIcon={
                              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-slate-500 hover:text-white transition-colors">
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            }
                            className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-4 h-14"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Hash</label>
                          <Input
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            leftIcon={<ShieldCheck size={18} className="text-primary/50" />}
                            rightIcon={
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            }
                            className="premium-glass bg-white/[0.03] border-white/10 text-white rounded-2xl p-3 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center gap-3"
                        >
                          <Save size={16} />
                          Upgrade Security Layers
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="premium-glass border border-white/10 rounded-[2.5rem] p-6 shadow-2xl group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                        <Bell size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white font-display tracking-tightest uppercase">Neural Transmission</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Data Flow & Notification Matrix</p>
                      </div>
                    </div>

                    <form onSubmit={handleNotificationUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { id: 'emailNotifications', label: 'Email Relay', desc: 'Secure asynchronous data delivery' },
                          { id: 'caseUpdates', label: 'Case Synchronization', desc: 'Real-time repository change alerts' },
                          { id: 'aiResponses', label: 'Cognitive Insights', desc: 'Neural processing completion pings' },
                          { id: 'marketingEmails', label: 'Strategic Intel', desc: 'Consortium updates and releases' }
                        ].map((item) => (
                          <div key={item.id} className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-primary/30 transition-all duration-500 flex items-center justify-between group/item">
                            <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1 group-hover/item:text-primary transition-colors">{item.label}</p>
                              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.desc}</p>
                            </div>
                            <div 
                              onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-500 relative ${notifications[item.id as keyof typeof notifications] ? 'bg-primary' : 'bg-slate-800'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-500 transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center gap-3"
                        >
                          <Save size={18} />
                          Calibrate Data Stream
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'billing' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="premium-glass border border-white/10 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] to-transparent pointer-events-none"></div>
                          <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                                <CreditCard size={20} />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white font-display tracking-tightest uppercase">Subscription Core</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Resource Allocation Tier: {planInfo.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly Tribute</p>
                              <p className="text-2xl font-black text-white font-display">{planInfo.price}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end relative z-10">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Capacity</span>
                                <span className="text-[11px] font-black text-emerald-400 font-display">{user.currentCases} / {user.planLimit >= 100000 ? '∞' : user.planLimit}</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5 p-0.5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((user.currentCases / (user.planLimit || 1)) * 100, 100)}%` }}
                                  transition={{ duration: 1.5, ease: "circOut" }}
                                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                ></motion.div>
                              </div>
                            </div>
                            <Link href="/dashboard/upgrade">
                              <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-12 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-3"
                              >
                                <CreditCard size={16} />
                                Expand Resources
                              </motion.button>
                            </Link>
                          </div>
                        </div>

                        <div className="premium-glass border border-white/10 rounded-[2.5rem] p-4 shadow-2xl group opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
                              <FileText size={18} />
                            </div>
                            <h3 className="text-md font-black text-white font-display tracking-tightest uppercase">Transaction Ledger</h3>
                          </div>
                          <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CreditCard className="w-6 h-6 text-slate-700" />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">No Historical Ledger Entries Found</p>
                          </div>
                        </div>
                      </div>
                  </motion.div>
                )}
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
