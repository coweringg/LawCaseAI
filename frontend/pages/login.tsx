import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogOut, X, MessageCircle } from 'lucide-react'
import PublicSupportModal from '@/components/modals/PublicSupportModal'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loggingInAccountIndex, setLoggingInAccountIndex] = useState<number | null>(null)
  const [showMainForm, setShowMainForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  
  const { login, savedAccounts = [], loginWithSavedAccount, removeSavedAccount } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (router.query.support === 'true') {
      setIsSupportModalOpen(true)
    }
  }, [router.query.support])

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
        toast.error(result.message || 'Verification failed. Please check your credentials.')
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'An unexpected error occurred. Please try again.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavedAccountLogin = async (index: number) => {
    setLoggingInAccountIndex(index)
    
    try {
      const result = await loginWithSavedAccount(index)
      if (result.success) {
        toast.success('Welcome back to LawCaseAI!')
        router.push('/dashboard')
      } else {
        toast.error('Session expired or credentials changed. Please login manually.')
        setShowMainForm(true)
      }
    } catch (e) {
      toast.error('Failed to log in securely. Please use the main form.')
      setShowMainForm(true)
    } finally {
      setLoggingInAccountIndex(null)
    }
  }

  const hasSavedAccounts = savedAccounts.length > 0
  const isFormVisible = !hasSavedAccounts || showMainForm

  return (
    <>
    <AuthLayout>
      <Head>
        <title>Login - LawCaseAI | Secure Workspace</title>
      </Head>

      <div className="premium-glass p-1.5 rounded-2xl flex mb-6 border border-white/10 shadow-xl">
        <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-white bg-primary shadow-[0_0_20px_rgba(10,68,184,0.4)] transition-all duration-500">
          Sign In
        </button>
        <Link href="/register" className="flex-1">
          <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-slate-500 hover:text-slate-200 transition-all duration-500">
            Join Now
          </button>
        </Link>
      </div>

      {hasSavedAccounts && !showMainForm && (
        <div className="mb-8">
          <h2 className="text-xl font-black text-white mb-6 font-display tracking-tight text-center">Select an account</h2>
          <div className="space-y-3">
            {savedAccounts.map((acc: any, index: number) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => loggingInAccountIndex === null && handleSavedAccountLogin(index)}
                onKeyDown={(e) => e.key === 'Enter' && loggingInAccountIndex === null && handleSavedAccountLogin(index)}
                className={`w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer ${loggingInAccountIndex !== null ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {acc.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">{acc.name}</p>
                    <p className="text-slate-400 text-xs">{acc.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loggingInAccountIndex === index ? (
                    <div className="animate-spin h-5 w-5 text-primary border-2 border-primary/20 border-t-primary rounded-full mr-2" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSavedAccount(index);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Remove account"
                      >
                        <X size={18} />
                      </button>
                      <ArrowRight className="text-slate-500 group-hover:text-white transition-colors mr-2 w-5 h-5 hidden sm:block" />
                    </>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowMainForm(true)}
              className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <UserPlus size={16} />
              Use another account
            </button>
          </div>
        </div>
      )}

      {isFormVisible && (
        <>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white mb-2 font-display tracking-tightest">Welcome Back</h2>
            <p className="text-slate-400 text-xs font-medium">Access your professional intelligence workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <button
              className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-hover shadow-[0_0_30px_rgba(10,68,184,0.4)] transition-all group disabled:opacity-70 mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {hasSavedAccounts && (
              <button
                 type="button"
                 onClick={() => setShowMainForm(false)}
                 className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Back to saved accounts
              </button>
            )}

            <div className="pt-6 border-t border-white/5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                <MessageCircle size={14} />
                Need System Support?
              </button>
            </div>
          </form>
        </>
      )}

    </AuthLayout>

    <PublicSupportModal 
      isOpen={isSupportModalOpen} 
      onClose={() => setIsSupportModalOpen(false)} 
    />
    </>
  )
}
