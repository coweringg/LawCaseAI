import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const isPublicPage = ['/', '/login', '/register', '/pricing', '/about', '/privacy', '/terms'].includes(router.pathname)

  // Script para verificar componentes faltantes
  useEffect(() => {
    const checkComponents = async () => {
      try {
        // Verificar si los componentes UI existen
        const components = ['Button', 'Card', 'Alert', 'Input', 'Modal', 'Table']
        const missingComponents = []
        
        for (const component of components) {
          try {
            await import(`@/components/ui/${component}`)
          } catch (error) {
            missingComponents.push(component)
          }
        }
        
        if (missingComponents.length > 0) {
          console.warn(`Missing components: ${missingComponents.join(', ')}`)
          // Mostrar mensaje amigable
          const existingMessage = document.querySelector('.missing-components-message')
          if (!existingMessage) {
            const message = document.createElement('div')
            message.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm'
            message.innerHTML = `
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h-6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm">Missing UI components detected</span>
              </div>
              <div class="text-xs mt-1">Please restart the dev server</div>
              <button onclick="location.reload()" class="mt-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs">Reload</button>
            </div>
            `
            document.body.appendChild(message)
            
            // Recargar automáticamente después de 3 segundos
            setTimeout(() => {
              location.reload()
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error checking components:', error)
      }
    }

    checkComponents()
  }, [])

  // Redirección para usuarios logueados que intentan acceder a páginas públicas
  useEffect(() => {
    if (isAuthenticated && isPublicPage) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isPublicPage, router])

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      {!isPublicPage && (
        <nav className="bg-white shadow-sm border-b border-secondary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/settings" className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-secondary-200">
                  <span className="text-sm text-secondary-700">{user?.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-secondary-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/settings" className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50">
                    Settings
                  </Link>
                  <div className="border-t border-secondary-200 mt-3 pt-3">
                    <div className="flex items-center justify-between px-3">
                      <span className="text-sm text-secondary-700">{user?.name}</span>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Public Navigation */}
      {isPublicPage && !isAuthenticated && (
        <nav className="bg-white shadow-sm border-b border-secondary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Link href="/pricing" className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/about" className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-secondary-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50">
                    Pricing
                  </Link>
                  <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50">
                    About
                  </Link>
                  <div className="border-t border-secondary-200 mt-3 pt-3 space-y-1">
                    <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50">
                      Log In
                    </Link>
                    <Link href="/register">
                      <Button className="w-full justify-center">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={isPublicPage ? '' : 'pt-0'}>
        {children}
      </main>
    </div>
  )
}
