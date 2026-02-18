import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import api from '@/utils/api'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: any) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (userData: { name: string; lawFirm: string; email: string }) => Promise<{ success: boolean; message: string }>
  changePassword: (passwordData: any) => Promise<{ success: boolean; message: string }>
  fetchProfile: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicRoutes = ['/', '/login', '/register', '/pricing', '/about', '/features', '/privacy', '/terms']
const restrictedRoutes = ['/pricing', '/about', '/features', '/register', '/login']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await api.get('/user/profile')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error: any) {
      // Silently fail — user is not authenticated
      if (error?.response?.status !== 401) {
        console.warn('Profile fetch failed:', error?.message)
      }
      setUser(null)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        await fetchProfile()
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const currentPath = router.pathname
      // Check auth state based on user presence
      const authenticated = !!user

      if (authenticated && restrictedRoutes.includes(currentPath)) {
        router.push('/dashboard')
        return
      }

      if (!authenticated && !publicRoutes.includes(currentPath)) {
        router.push('/login')
        return
      }
    }
  }, [router.pathname, user, isLoading])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { data, message } = response.data

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, message: message || 'Login successful' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (userData: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/auth/register', userData)
      const { data, message } = response.data

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, message: message || 'Registration successful' }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    api.post('/auth/logout').finally(() => {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
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

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      token, // Kept for interface compatibility but null
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
