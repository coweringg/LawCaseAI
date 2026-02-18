import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import api from '@/utils/api'

interface User {
  id: string
  name: string
  email: string
  lawFirm: string
  role: string
  plan: 'basic' | 'professional' | 'enterprise'
  planLimit: number
  currentCases: number
  status: string
  createdAt: string
  lastLogin: string
}

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

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(parsedUser)
          // Profile will be refreshed by fetchProfile in the next block
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Refresh profile only if we have a token
      const storedToken = localStorage.getItem('token')
      if (token || storedToken) {
        fetchProfile()
      }
    }
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) {
      const currentPath = router.pathname
      const authenticated = !!user || !!token // user might be null but token in cookies

      if (authenticated && restrictedRoutes.includes(currentPath)) {
        router.push('/dashboard')
        return
      }

      if (!authenticated && !publicRoutes.includes(currentPath)) {
        router.push('/login')
        return
      }
    }
  }, [router.pathname, user, token, isLoading])

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

  const fetchProfile = async (): Promise<void> => {
    const storedToken = localStorage.getItem('token')
    if (!token && !storedToken) return

    try {
      const response = await api.get('/user/profile')
      if (response.data.success) {
        setUser(response.data.data)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (error) {
      // Silently fail if just checking session, or log if debugging
      console.error('Failed to fetch profile:', error)
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
        localStorage.setItem('user', JSON.stringify(response.data.data))
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
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const isAuthenticated = !!user || !!token

  return (
    <AuthContext.Provider value={{
      user,
      token,
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
