import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layouts/AuthLayout'
import { validateEmail, validatePassword } from '@/utils/helpers'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Building, CheckCircle2 } from 'lucide-react'
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
      // If they joined via firm code, skip the plan selection screen
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
        // Handle validation errors from backend
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 py-8"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
              <CheckCircle2 size={40} />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-white mb-3 font-display tracking-tight">System Initialized</h2>
            <p className="text-slate-400 text-sm font-medium">Your professional AI workspace is ready. <br /> How would you like to proceed?</p>
          </div>

          <div className="flex justify-center items-center gap-6 py-4">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${billingInterval === 'monthly' ? 'text-primary' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${billingInterval === 'annual' ? 'bg-primary' : 'bg-slate-800'}`}
            >
              <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${billingInterval === 'annual' ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
            <div className="flex flex-col items-start">
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${billingInterval === 'annual' ? 'text-primary' : 'text-slate-500'}`}>Annual Selection</span>
              <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Save 20%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Select Your Infrastructure Tier</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'basic', name: 'Growth Tier', price: billingInterval === 'annual' ? '$79' : '$99', cases: '8 Case Capacity', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
                { id: 'professional', name: 'Professional Tier', price: billingInterval === 'annual' ? '$159' : '$199', cases: '18 Case Capacity', color: 'from-primary/20 to-primary/5', iconColor: 'text-primary', border: 'border-primary/20' },
                { id: 'elite', name: 'Elite Infrastructure', price: billingInterval === 'annual' ? '$249' : '$300', cases: '∞ Unlimited Matters', color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', border: 'border-purple-500/20' },
                { id: 'enterprise', name: 'Enterprise Intelligence', price: billingInterval === 'annual' ? '$249' : '$300', cases: '∞ Unlimited Capacity', color: 'from-rose-500/20 to-rose-500/5', iconColor: 'text-rose-400', border: 'border-rose-500/20' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const settingsUrl = `/settings?tab=billing&openPlan=true&planId=${p.id}${seatsQuery ? `&seats=${seatsQuery}` : ''}&interval=${billingInterval}`;
                    router.push(settingsUrl);
                  }}
                  className={`w-full p-5 rounded-3xl border ${p.border} flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-br ${p.color} backdrop-blur-md relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 pointer-events-none"></div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-black/20 ${p.iconColor} shadow-inner`}>
                      {p.id === 'elite' || p.id === 'enterprise' ? '∞' : p.id.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-black text-base tracking-tight mb-0.5">{p.name}</p>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${p.id === 'elite' || p.id === 'enterprise' ? p.iconColor : 'text-slate-500'}`}>{p.cases}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-white font-black text-xl font-display">
                      {p.price}
                      <span className="text-[10px] text-slate-500 ml-1">
                        {p.id === 'enterprise' ? '/user/mo' : '/mo'}
                      </span>
                    </p>
                    <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-[10px] font-black uppercase tracking-widest">Select Tier</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors border-t border-white/5 mt-4"
            >
              Skip for now, explore dashboard
            </button>
          </div>

          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-4">
            You can always configure your subscription in Settings
          </p>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Head>
        <title>Join LawCaseAI | Secure Legal Intelligence</title>
      </Head>

      {/* Tab Switcher */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex mb-8 border border-slate-200 dark:border-white/5">
        <Link href="/login" className="flex-1">
          <button className="w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            Sign In
          </button>
        </Link>
        <button className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-white bg-primary shadow-lg shadow-primary/20 transition-all">
          Join Now
        </button>
      </div>

      {/* Dual Registration Mode Selector */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5 flex gap-1 w-full">
          <button
            type="button"
            onClick={() => setRegistrationMode('individual')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registrationMode === 'individual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            Individual Registration
          </button>
          <button
            type="button"
            onClick={() => setRegistrationMode('empresa')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registrationMode === 'empresa' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            Join a Firm
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">
          {registrationMode === 'individual' ? 'Setup Your Firm' : 'Link Your Account'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {registrationMode === 'individual' 
            ? 'Deploy your professional AI infrastructure today.' 
            : 'Join your firm\'s Elite workspace using your unique access code.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
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

        {/* Email */}
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
          /* Law Firm - Individual Mode */
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
          /* Firm Code - Empresa Mode */
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

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Checkbox */}
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
            I have read and agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and the <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link> of LawCaseAI.
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-xl shadow-primary/25 transition-all group disabled:opacity-70 mt-4"
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
              Initialize Workspace
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
