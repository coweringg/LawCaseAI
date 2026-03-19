import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Building, CheckCircle2, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const [registrationMode, setRegistrationMode] = useState<'individual' | 'empresa'>('individual')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    lawFirm: '',
    password: '',
    confirmPassword: '',
    firmCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register, user } = useAuth()
  const router = useRouter()
  const { plan, seats: seatsQuery, type } = router.query

  useEffect(() => {
    if (user && !registrationSuccess) {
      router.push('/dashboard')
    } else if (user && registrationSuccess && user.organizationId) {
      router.push('/dashboard')
    }
  }, [user, registrationSuccess, router])

  useEffect(() => {
    if (router.isReady) {
      if (type === 'empresa') {
        setRegistrationMode('empresa')
      }
    }
  }, [router.isReady, type])

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address'
    
    if (registrationMode === 'individual') {
      if (!formData.lawFirm.trim()) newErrors.lawFirm = 'Law firm name is required'
    } else {
      if (!formData.firmCode.trim()) newErrors.firmCode = 'Firm code is required'
    }

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
        lawFirm: registrationMode === 'individual' ? formData.lawFirm : 'Company User',
        password: formData.password,
        firmCode: registrationMode === 'empresa' ? formData.firmCode : undefined
      })

      if (result.success) {
        toast.success('Account created successfully!')
        setRegistrationSuccess(true);
      } else {
        if (result.error && Array.isArray(result.error)) {
          const newErrors: Record<string, string> = {};
          result.error.forEach((err: any) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
          toast.error('Please check the highlighted fields');
        } else {
          toast.error(result.message || 'Registration failed. Please verify your information.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  if (registrationSuccess) {
    return (
      <AuthLayout>
        <Head>
          <title>Account Ready - LawCaseAI</title>
        </Head>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="text-center mb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-2xl shadow-primary/40 mb-5"
            >
              <CheckCircle2 size={32} />
            </motion.div>
            <h2 className="text-2xl font-black text-white font-display tracking-tight leading-tight">Account Created</h2>
            <p className="text-slate-400 text-xs font-medium mt-1.5 leading-relaxed">
              Your AI workspace is ready. Configure billing to begin.
            </p>
          </div>

          <div className="premium-glass rounded-2xl border border-white/10 p-5 mb-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Zap size={16} />, label: 'AI Engine', color: 'text-amber-500' },
                { icon: <Shield size={16} />, label: 'Encrypted', color: 'text-emerald-500' },
                { icon: <CheckCircle2 size={16} />, label: 'Verified', color: 'text-primary' }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => router.push('/settings?tab=billing')}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
            >
              Configure Billing & Start Trial
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 premium-glass border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-white hover:border-white/20 transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Head>
        <title>Join LawCaseAI | Secure Legal Intelligence</title>
      </Head>

      <div className="premium-glass p-1.5 rounded-2xl flex mb-6 border border-white/10 shadow-xl">
        <Link href="/login" className="flex-1">
          <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-slate-500 hover:text-slate-200 transition-all duration-500">
            Sign In
          </button>
        </Link>
        <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-white bg-primary shadow-[0_0_20px_rgba(10,68,184,0.4)] transition-all duration-500">
          Join Now
        </button>
      </div>

      <div className="flex justify-center mb-8">
        <div className="premium-glass p-1 rounded-2xl border border-white/10 flex gap-1 w-full">
          <button
            type="button"
            onClick={() => setRegistrationMode('individual')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${registrationMode === 'individual' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Individual Registration
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMode('empresa')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${registrationMode === 'empresa' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Join a Firm
          </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-white mb-2 font-display tracking-tightest">
          {registrationMode === 'individual' ? 'Setup Your Firm' : 'Link Your Account'}
        </h2>
        <p className="text-slate-400 text-xs font-medium">
          {registrationMode === 'individual' 
            ? 'Deploy your professional AI infrastructure today.' 
            : 'Join your firm\'s Elite workspace with an access code.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="name">Full Name</label>
          <div className="relative group">
            <input
              className={`block w-full pl-12 pr-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jonathan Davis"
              type="text"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          </div>
          {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="email">Work Email</label>
          <div className="relative group">
            <input
              className={`block w-full pl-12 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@firm.com"
              type="email"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          </div>
          {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.email}</p>}
        </div>

        {registrationMode === 'individual' ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="lawFirm">Organization</label>
            <div className="relative group">
              <input
                className={`block w-full pl-12 pr-4 py-3 rounded-xl border ${errors.lawFirm ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
                id="lawFirm"
                name="lawFirm"
                value={formData.lawFirm}
                onChange={handleChange}
                placeholder="Davis & Partners"
                type="text"
              />
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            </div>
            {errors.lawFirm && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.lawFirm}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="firmCode">Firm Access Code</label>
            <div className="relative group">
              <input
                className={`block w-full pl-12 pr-4 py-3 rounded-xl border ${errors.firmCode ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono tracking-widest`}
                id="firmCode"
                name="firmCode"
                value={formData.firmCode}
                onChange={handleChange}
                placeholder="ELITE-XXXX-XXXX"
                type="text"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            </div>
            {errors.firmCode && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.firmCode}</p>}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="password">Password</label>
          <div className="relative group">
            <input
              className={`block w-full pl-12 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            Requirement: 8+ chars, Uppercase, Lowercase, & Number
          </p>
          {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative group">
            <input
              className={`block w-full pl-12 pr-12 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              type={showConfirmPassword ? 'text' : 'password'}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{errors.confirmPassword}</p>}
        </div>

        <div className="group flex items-start gap-3 py-4 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              required
              className="w-5 h-5 text-primary bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 rounded-lg focus:ring-primary/20 focus:ring-2 transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal cursor-pointer select-none">
            I have read and agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link>
            {' '}and the{' '}
            <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link> of LawCaseAI.
          </label>
        </div>

        <button
          className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-hover shadow-[0_0_30px_rgba(10,68,184,0.4)] transition-all group disabled:opacity-70 mt-6"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deploying...
            </div>
          ) : (
            <>
              Create Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
