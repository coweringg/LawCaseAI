import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'
import { validateEmail, validatePassword } from '@/utils/helpers'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    lawFirm: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address'
    if (!formData.lawFirm.trim()) newErrors.lawFirm = 'Law firm name is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (!validatePassword(formData.password)) newErrors.password = 'At least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        lawFirm: formData.lawFirm,
        password: formData.password
      })

      if (result.success) {
        toast.success('Account created successfully!')
        router.push('/dashboard')
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
    <AuthLayout>
      {/* Tab Switcher */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-1 rounded-lg flex mb-8">
        <Link href="/login" className="flex-1">
          <button className="w-full py-2 text-sm font-semibold rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            Sign In
          </button>
        </Link>
        <button className="flex-1 py-2 text-sm font-semibold rounded text-primary dark:text-white bg-blue-50 dark:bg-primary/20 shadow-sm transition-all">
          Create Account
        </button>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Setup Your Firm</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Create your professional account to get started.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">Full Name</label>
          <div className="relative">
            <input
              className={`block w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jonathan Davis"
              type="text"
            />
            <span className="material-icons-round absolute right-3 top-3 text-slate-400 text-xl pointer-events-none">person</span>
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Work Email</label>
          <div className="relative">
            <input
              className={`block w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@firm.com"
              type="email"
            />
            <span className="material-icons-round absolute right-3 top-3 text-slate-400 text-xl pointer-events-none">mail</span>
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Law Firm */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="lawFirm">Law Firm / Organization</label>
          <div className="relative">
            <input
              className={`block w-full px-4 py-3 rounded-lg border ${errors.lawFirm ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none`}
              id="lawFirm"
              name="lawFirm"
              value={formData.lawFirm}
              onChange={handleChange}
              placeholder="e.g. Davis & Partners"
              type="text"
            />
            <span className="material-icons-round absolute right-3 top-3 text-slate-400 text-xl pointer-events-none">business</span>
          </div>
          {errors.lawFirm && <p className="text-xs text-red-500">{errors.lawFirm}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
          <div className="relative">
            <input
              className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-icons-round text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <input
              className={`block w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none`}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              type="password"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <div className="flex items-center h-5">
            <input id="terms" type="checkbox" required className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2" />
          </div>
          <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
            I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Get Started'}
        </button>
      </form>
    </AuthLayout>
  )
}
