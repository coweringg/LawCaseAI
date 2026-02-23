import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import api from '@/utils/api'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; error?: any }>
  register: (userData: any) => Promise<{ success: boolean; message: string; error?: any }>
  logout: () => void
  updateProfile: (userData: { name: string; lawFirm: string; email: string }) => Promise<{ success: boolean; message: string }>
  changePassword: (passwordData: any) => Promise<{ success: boolean; message: string }>
  fetchProfile: () => Promise<User | null>
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicRoutes = ['/', '/login', '/register', '/pricing', '/about', '/features', '/privacy', '/terms']
const restrictedRoutes = ['/pricing', '/about', '/features', '/login']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get('/user/profile')
      if (response.data.success) {
        setUser(response.data.data)
        return response.data.data
      }
      return null
    } catch (error: any) {
      // Silently fail — user is not authenticated
      if (error?.response?.status !== 401) {
        console.warn('Profile fetch failed:', error?.message)
      }
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      // In cookie-based auth, we simply try to fetch the profile.
      // If the cookie is present and valid, the backend will return the user.
      await fetchProfile()
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Global polling for state sync (membership changes, plan resets)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    // Polling removed to prevent 429 Too Many Requests errors.
    // Instead of polling every 10s, critical state updates should rely on explicit actions 
    // or WebSocket events in the future.
    
    // Initial fetch to sync state on load
    fetchProfile();
    
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const currentPath = router.pathname
      // Check auth state based on user presence
      const authenticated = !!user

      if (authenticated && restrictedRoutes.includes(currentPath)) {
        router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard')
        return
      }

      if (!authenticated && !publicRoutes.includes(currentPath)) {
        router.push('/login')
        return
      }
    }
  }, [router, user, isLoading])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; error?: any }> => {
    try {
      const response = await api.post('/auth/login', { email, password })

      // Check for soft failures first (e.g. 429/503 resolved by interceptor)
      if (!response.data.success) {
        return { success: false, message: response.data.message || 'Login failed' }
      }

      const { data, message } = response.data

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, message: message || 'Login successful' }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data?.error
      }
    }
  }

  const register = async (userData: any): Promise<{ success: boolean; message: string; error?: any }> => {
    try {
      const response = await api.post('/auth/register', userData)

      // Check for soft failures first (e.g. 429/503 resolved by interceptor)
      if (!response.data.success) {
        return { success: false, message: response.data.message || 'Registration failed' }
      }

      const { data, message } = response.data

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, message: message || 'Registration successful' }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data?.error
      }
    }
  }

  const logout = () => {
    api.post('/auth/logout').finally(() => {
      setUser(null)
      localStorage.removeItem('user')
      router.push('/login')
    })
  }

  const updateProfile = async (userData: { name: string; lawFirm: string; email: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put('/user/profile', userData)
      if (response.data.success) {
        setUser(response.data.data)
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message || 'Failed to update profile' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Network error' }
    }
  }

  const changePassword = async (passwordData: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put('/user/password', passwordData)
      return { success: true, message: response.data.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to change password' }
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser as User)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      fetchProfile,
      updateUser,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
