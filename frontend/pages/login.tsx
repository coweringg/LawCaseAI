import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        toast.success('Welcome back to LawCaseAI!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-law-charcoal-50 via-white to-law-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-4 mb-8 group">
            <Image src="/logo.png" alt="LawCaseAI" width={40} height={40} className="object-contain drop-shadow-md" priority />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-law-charcoal-900">LawCaseAI</span>
              <span className="text-xs text-law-charcoal-500 font-medium tracking-wider uppercase">Legal Case Management</span>
            </div>
          </Link>
          
          <div className="inline-flex items-center px-4 py-2 bg-law-blue-100 text-law-blue-800 rounded-law text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Secure Legal Platform
          </div>
          
          <h1 className="heading-2 mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-law-charcoal-600 mb-8">
            Sign in to access your secure case management platform
          </p>
          <p className="text-law-charcoal-500">
            New to LawCaseAI?{' '}
            <Link href="/register" className="font-medium text-law-blue-600 hover:text-law-blue-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="card-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <Input
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john@lawfirm.com"
                leftIcon={<Mail className="w-5 h-5 text-law-charcoal-400" />}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your secure password"
                leftIcon={<Lock className="w-5 h-5 text-law-charcoal-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-law-charcoal-400 hover:text-law-charcoal-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-law-blue-600 focus:ring-law-blue-500 border-law-charcoal-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-law-charcoal-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-law-blue-600 hover:text-law-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="btn-primary w-full py-3"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-law-charcoal-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              End-to-End Encrypted
            </div>
          </div>
          <p className="text-law-charcoal-400 text-sm">
            Protected by bank-level encryption and industry-leading security standards.
          </p>
        </div>
      </div>
    </div>
  )
}
