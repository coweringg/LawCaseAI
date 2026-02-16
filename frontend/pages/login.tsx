import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        toast.success('Welcome back to LawCaseAI!')
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
        <button className="flex-1 py-2 text-sm font-semibold rounded text-primary dark:text-white bg-blue-50 dark:bg-primary/20 shadow-sm transition-all">
          Sign In
        </button>
        <Link href="/register" className="flex-1">
          <button className="w-full py-2 text-sm font-semibold rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            Create Account
          </button>
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your credentials to access your workspace.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Work Email</label>
          <div className="relative">
            <input
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@firm.com"
              required
              type="email"
            />
            <span className="material-icons-round absolute right-3 top-3 text-slate-400 text-xl pointer-events-none">mail</span>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-hover">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all outline-none"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
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
        </div>

        {/* Submit Button */}
        <button
          className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : 'Log In to Workspace'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background-light dark:bg-background-dark text-slate-400">Or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-surface-dark text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
          Google
        </button>
        <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-surface-dark text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/448239/microsoft.svg" alt="Microsoft logo" />
          Microsoft
        </button>
      </div>
    </AuthLayout>
  )
}
