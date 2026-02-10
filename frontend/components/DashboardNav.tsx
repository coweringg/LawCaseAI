import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FileText, Settings as SettingsIcon, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardNavProps {
  currentPage?: string
}

export function DashboardNav({ currentPage = 'cases' }: DashboardNavProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="w-64 bg-white shadow-sm min-h-screen">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
        </Link>
        
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'cases' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
            }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Cases
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'settings' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
            }`}
          >
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
            <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
            <p className="text-xs text-secondary-500">{user?.email}</p>
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
  )
}
