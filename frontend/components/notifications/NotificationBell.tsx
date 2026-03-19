import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  X, 
  ArrowRight, 
  Calendar, 
  Folder, 
  AlertTriangle, 
  CreditCard,
  History,
  Trash
} from 'lucide-react'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'case_update' | 'calendar_event' | 'system' | 'billing' | 'deadline'
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  link?: string
  createdAt: string
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setLoading(true)
      const response = await api.get('/notifications?limit=10')
      if (response.data.success) {
        setNotifications(response.data.data.notifications)
        setUnreadCount(response.data.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_update': return <Folder className="w-4 h-4" />
      case 'calendar_event': return <Calendar className="w-4 h-4" />
      case 'deadline': return <AlertTriangle className="w-4 h-4 text-rose-500" />
      case 'billing': return <CreditCard className="w-4 h-4 text-emerald-500" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      if (!notifications.find(n => n._id === id)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all')
      setNotifications([])
      setUnreadCount(0)
      setIsConfirmModalOpen(false)
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-amber-500 bg-amber-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group"
      >
        <Bell className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0c14] shadow-[0_0_15px_rgba(10,68,184,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-[#0a0c14]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Notifications</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-tighter">
                  {notifications.length} {notifications.length === 1 ? 'ALERT' : 'ALERTS'} &bull; {unreadCount} UNREAD
                </p>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg bg-white/5 text-primary hover:text-white hover:bg-primary/20 transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setIsConfirmModalOpen(true)}
                    title="Clear all"
                    className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accessing Intelligence...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center opacity-40">
                  <span className="material-icons-round text-4xl text-slate-600 mb-3">notifications_none</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Recent Logs</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id}
                      className={`p-4 hover:bg-white/5 transition-all cursor-pointer relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => !notification.isRead && markAsRead(notification._id)}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${getPriorityColor(notification.priority)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-[11px] font-black uppercase tracking-wider truncate pe-6 ${!notification.isRead ? 'text-white' : 'text-slate-400'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[9px] text-slate-600 font-bold uppercase shrink-0">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed mb-2 ${!notification.isRead ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <button
                              onClick={(e) => deleteNotification(notification._id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:hidden">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(10,68,184,0.8)]"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
              <div className="flex items-center justify-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                <History className="w-3 h-3 opacity-50" />
                System events are logged for persistence
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
 
      {mounted && isConfirmModalOpen && createPortal(
        <AnimatePresence mode="wait">
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0c14] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden z-[100000]"
            >
              <div className="p-8 text-center text-white">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Clear notifications?</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                  This action will permanently delete all logs from your activity center. This cannot be undone.
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all outline-none border-none cursor-pointer"
                >
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
