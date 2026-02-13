import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    lawFirm: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('basic')
  const { register } = useAuth()

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$49',
      features: ['Up to 5 active cases', 'Basic document storage (1GB)', 'Email support']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$149',
      features: ['Up to 25 active cases', 'Enhanced storage (10GB)', 'Priority support', 'AI features']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$399',
      features: ['Unlimited cases', 'Unlimited storage', '24/7 support', 'Custom features']
    }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.lawFirm.trim()) {
      newErrors.lawFirm = 'Law firm name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const result = await register({
        name: formData.name,
        email: formData.email,
        lawFirm: formData.lawFirm,
        password: formData.password
      })
      
      if (result.success) {
        toast.success('Registration successful! Welcome to LawCaseAI!')
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-4 mb-6 group">
            <Image src="/logo.png" alt="LawCaseAI" width={40} height={40} className="object-contain drop-shadow-md" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-law-charcoal-900">LawCaseAI</span>
              <span className="text-xs text-law-charcoal-500 font-medium tracking-wider uppercase">Legal Case Management</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Create your account to get started.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Smith"
              leftIcon={<User className="w-5 h-5 text-secondary-400" />}
              required
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@example.com"
              leftIcon={<Mail className="w-5 h-5 text-secondary-400" />}
              required
            />

            <Input
              label="Law firm name"
              name="lawFirm"
              type="text"
              autoComplete="organization"
              value={formData.lawFirm}
              onChange={handleChange}
              error={errors.lawFirm}
              placeholder="Smith & Associates"
              leftIcon={<Building className="w-5 h-5 text-secondary-400" />}
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a strong password"
              leftIcon={<Lock className="w-5 h-5 text-secondary-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
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

            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-5 h-5 text-secondary-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              required
            />

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                required
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-secondary-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

        </div>

        <p className="text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>

        <p className="text-center text-sm text-secondary-600">
          Protected by bank-level encryption and security.
        </p>
      </div>
    </div>
  )
}
