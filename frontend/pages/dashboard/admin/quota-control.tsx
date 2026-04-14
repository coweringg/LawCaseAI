import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Settings2 as Tune, 
    Search, 
    Filter, 
    Edit2 as Edit, 
    RotateCcw as RotateLeft, 
    CheckCircle2 as CheckCircle, 
    BarChart3 as BarChart, 
    Folder as Cases, 
    Zap as Token, 
    Cloud as CloudQueue, 
    FileText as Description,
    Mail as Email,
    User as Person,
    History as HistoryIcon,
    X as Close,
    Save,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import api from '@/utils/api'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'

interface UserQuota {
    _id: string
    name: string
    email: string
    plan: string
    usage: {
        cases: number
        tokens: number
        storage: number
    }
    limits: {
        cases: number
        tokens: number
        storage: number
        filesPerCase: number
    }
    isCustom: boolean
}

const QuotaControl: React.FC = () => {
    const [users, setUsers] = useState<UserQuota[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [planFilter, setPlanFilter] = useState('all')
    const [customFilter, setCustomFilter] = useState('all')
    const [selectedUser, setSelectedUser] = useState<UserQuota | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editData, setEditData] = useState({
        maxCases: 0,
        maxTokens: 0,
        maxTotalStorage: 0,
        maxFilesPerCase: 0
    })

    const fetchUsers = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('limit', '10')
            if (search) params.append('search', search)
            if (planFilter !== 'all') params.append('plan', planFilter)
            if (customFilter === 'custom') params.append('customOnly', 'true')
            
            const res = await api.get(`/admin/quotas?${params.toString()}`)
            if (res.data.success) {
                setUsers(res.data.data.users || [])
                setTotalPages(res.data.data.pages || 1)
            }
        } catch (error) {
            toast.error('Failed to synchronize user metrics')
        } finally {
            setLoading(false)
        }
    }, [search, planFilter, customFilter, page])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleEditClick = (user: UserQuota) => {
        setSelectedUser(user)
        setEditData({
            maxCases: user.limits.cases,
            maxTokens: user.limits.tokens,
            maxTotalStorage: user.limits.storage,
            maxFilesPerCase: user.limits.filesPerCase
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateQuota = async () => {
        if (!selectedUser) return
        try {
            const res = await api.put(`/admin/quotas/${selectedUser._id}`, editData)
            if (res.data.success) {
                toast.success('Resource orchestration finalized')
                setIsEditModalOpen(false)
                fetchUsers()
            }
        } catch (error) {
            toast.error('Adjustment protocol failed')
        }
    }

    const handleResetQuota = async (userId: string) => {
        try {
            const res = await api.post(`/admin/quotas/${userId}/reset`)
            if (res.data.success) {
                toast.success('Quota synchronization reset')
                fetchUsers()
            }
        } catch (error) {
            toast.error('Sync reset failed')
        }
    }

    const formatStorage = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const formatTokens = (tokens: number) => {
        if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M'
        if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K'
        return tokens.toString()
    }

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 pb-20">
            <Head>
                <title>Quota Control | LawCaseAI Administrative Panel</title>
            </Head>

            <div className="max-w-[1600px] mx-auto px-6 pt-8">
                <Link href="/dashboard/admin" className="inline-block group mb-6">
                    <motion.div 
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-3 bg-white/5 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-xl group"
                    >
                        <ArrowLeft size={16} className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">Back to Dashboard</span>
                    </motion.div>
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                <Tune className="text-primary text-3xl" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
                                Quota <span className="text-primary not-italic">Control</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium tracking-wide ml-16">Advanced resource orchestration and limit synchronization protocols</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 relative z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search by identity..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all w-72 shadow-xl"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <select 
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:border-white/20 shadow-xl"
                            >
                                <option value="all" className="bg-slate-900">All Tiers</option>
                                <option value="basic" className="bg-slate-900">Basic</option>
                                <option value="professional" className="bg-slate-900">Professional</option>
                                <option value="elite" className="bg-slate-900">Elite</option>
                                <option value="enterprise" className="bg-slate-900">Enterprise</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Tune className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <select 
                                value={customFilter}
                                onChange={(e) => setCustomFilter(e.target.value)}
                                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:border-white/20 shadow-xl"
                            >
                                <option value="all" className="bg-slate-900">Synchronized All</option>
                                <option value="custom" className="bg-slate-900">Custom Manual Only</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[40px] border border-white/10 animate-pulse">
                            <Tune className="text-white/20 text-6xl mb-4 animate-spin" />
                            <p className="text-white/20 font-black uppercase tracking-[0.2em]">Synchronizing data streams...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {users?.map((user, idx) => (
                                <motion.div 
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all group shadow-2xl relative overflow-hidden"
                                >
                                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                                        <div className="flex items-center gap-6 min-w-[300px]">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center border border-white/10 shadow-lg">
                                                    <Person className="text-white text-3xl" />
                                                </div>
                                                {user.isCustom && (
                                                    <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-lg border border-white/20 shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                                                        <Tune size={12} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-black text-white">{user.name}</h3>
                                                    <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full border tracking-widest ${
                                                        user.plan === 'elite' ? 'bg-amber-500/10 border-amber-500 text-amber-500' :
                                                        user.plan === 'professional' ? 'bg-purple-500/10 border-purple-500 text-purple-500' :
                                                        'bg-primary/10 border-primary text-primary'
                                                    } shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                                        {user.plan}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
                                            <div className="space-y-3 p-4 bg-black/40 rounded-3xl border border-white/5">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                                                    <span>Cases</span>
                                                    <Cases size={14} className="text-primary" />
                                                </div>
                                                <div className="text-2xl font-black text-white">
                                                    {user.usage.cases} <span className="text-slate-600 text-sm font-medium">/ {user.limits.cases}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (user.usage.cases / user.limits.cases) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 p-4 bg-black/40 rounded-3xl border border-white/5">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                                                    <span>AI Tokens</span>
                                                    <Token size={14} className="text-purple-500" />
                                                </div>
                                                <div className="text-2xl font-black text-white">
                                                    {formatTokens(user.usage.tokens)} <span className="text-slate-600 text-sm font-medium">/ {formatTokens(user.limits.tokens)}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (user.usage.tokens / user.limits.tokens) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 p-4 bg-black/40 rounded-3xl border border-white/5">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                                                    <span>Storage</span>
                                                    <CloudQueue size={14} className="text-blue-500" />
                                                </div>
                                                <div className="text-2xl font-black text-white">
                                                    {formatStorage(user.usage.storage)} <span className="text-slate-600 text-sm font-medium">/ {formatStorage(user.limits.storage)}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (user.usage.storage / user.limits.storage) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 p-4 bg-black/40 rounded-3xl border border-white/5 text-center">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                                                    <span>Artifacts/Case</span>
                                                    <Description size={14} className="text-emerald-500" />
                                                </div>
                                                <div className="text-2xl font-black text-white pt-1">
                                                    {user.limits.filesPerCase}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">PER CASE LIMIT</div>
                                            </div>
                                        </div>

                                        <div className="flex xl:flex-col gap-3">
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleEditClick(user)}
                                                className="!bg-white/[0.03] !border-white/10 hover:!bg-primary/20 hover:!border-primary/40 group/btn !w-14 !h-14 !p-0 !rounded-2xl"
                                            >
                                                <Edit className="text-white group-hover/btn:text-primary" />
                                            </Button>
                                            {user.isCustom && (
                                                <Button 
                                                    variant="secondary"
                                                    onClick={() => handleResetQuota(user._id)}
                                                    className="!bg-white/[0.03] !border-white/10 hover:!bg-rose-500/20 hover:!border-rose-500/40 group/btn !w-14 !h-14 !p-0 !rounded-2xl"
                                                >
                                                    <RotateLeft className="text-white group-hover/btn:text-rose-500" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-2xl mt-6">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                Synchronized Result Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 h-12 px-8 rounded-2xl"
                                >
                                    Previous Stream
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 h-12 px-8 rounded-2xl"
                                >
                                    Next Stream
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="ORCHESTRATE RESOURCE QUOTAS"
                size="md"
                variant="glass"
            >
                <div className="space-y-8 p-2">
                    <div className="mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest px-1">
                        Adjusting limits for: {selectedUser?.email}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Cases size={14} className="text-primary" /> Case Capacity
                            </label>
                            <input 
                                type="number"
                                value={editData.maxCases}
                                onChange={(e) => setEditData({...editData, maxCases: parseInt(e.target.value)})}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-primary/50 shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Description size={14} className="text-emerald-500" /> Artifacts Per Case
                            </label>
                            <input 
                                type="number"
                                value={editData.maxFilesPerCase}
                                onChange={(e) => setEditData({...editData, maxFilesPerCase: parseInt(e.target.value)})}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-emerald-500/50 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                            <Token size={14} className="text-purple-500" /> AI Token Allowance (Total)
                        </label>
                        <div className="relative">
                            <input 
                                type="number"
                                value={editData.maxTokens}
                                onChange={(e) => setEditData({...editData, maxTokens: parseInt(e.target.value)})}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-purple-500/50 shadow-inner"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                Tokens
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                            <CloudQueue size={14} className="text-blue-500" /> Aggregate Storage (Bytes)
                        </label>
                        <div className="relative">
                            <input 
                                type="number"
                                value={editData.maxTotalStorage}
                                onChange={(e) => setEditData({...editData, maxTotalStorage: parseInt(e.target.value)})}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-blue-500/50 shadow-inner"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                {formatStorage(editData.maxTotalStorage)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button 
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 !bg-white/5 hover:!bg-white/10 !py-6 !rounded-[20px] !text-[11px] font-black tracking-widest uppercase border border-white/10"
                        >
                            Abort protocol
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={handleUpdateQuota}
                            className="flex-1 !shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] !py-6 !rounded-[20px] !text-[11px] font-black tracking-widest uppercase"
                        >
                            Finalize Orchestration
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default QuotaControl
