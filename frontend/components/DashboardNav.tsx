import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="sidebar w-64">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-3 mb-8 group">
          <Image src="/logo.png" alt="LawCaseAI" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-law-charcoal-900">LawCaseAI</span>
        </Link>
        
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`sidebar-item ${
              currentPage === 'cases' 
                ? 'sidebar-item-active' 
                : 'sidebar-item-inactive'
            }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Cases
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`sidebar-item ${
              currentPage === 'settings' 
                ? 'sidebar-item-active' 
                : 'sidebar-item-inactive'
            }`}
          >
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
            <p className="text-sm font-medium text-law-charcoal-900">{user?.name}</p>
            <p className="text-xs text-law-charcoal-500">{user?.email}</p>
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
  )
}
