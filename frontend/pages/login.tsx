import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { login } = useAuth()
  const router = useRouter()

  if (!mounted) {
    return (
      <AuthLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 text-primary border-4 border-primary/20 border-t-primary rounded-full" />
        </div>
      </AuthLayout>
    )
  }

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
      <Head>
        <title>Login - LawCaseAI | Secure Workspace</title>
      </Head>

      {/* Tab Switcher */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex mb-8 border border-slate-200 dark:border-white/5">
        <button className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-white bg-primary shadow-lg shadow-primary/20 transition-all">
          Sign In
        </button>
        <Link href="/register" className="flex-1">
          <button className="w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            Join Now
          </button>
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Access your high-stakes intelligence workspace.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="email">Work Email</label>
          <div className="relative group">
            <input
              className="block w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@firm.com"
              required
              type="email"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="password">Password</label>
            <Link href="/forgot-password" hidden className="text-[10px] font-bold text-primary uppercase tracking-tighter hover:underline">Forgot password?</Link>
          </div>
          <div className="relative group">
            <input
              className="block w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              type={showPassword ? 'text' : 'password'}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-xl shadow-primary/25 transition-all group disabled:opacity-70"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Standardizing...
            </div>
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

    </AuthLayout>
  )
}
