"use client";

import React, { useState, useEffect, useCallback } from 'react'
import { 
  BookOpen,
  Search,
  Filter,
  Download,
  Building,
  Globe,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface KnowledgeDocument {
    _id: string
    name: string
    category: string
    assignedTo: string
    fileUrl: string
    fileSize: number
    fileType: string
    uploadDate: string
    accessCount: number
}

interface RequestFormData {
    description: string
    category: string
}

const CATEGORIES = ['Jurisprudence', 'Contracts', 'Regulation', 'Templates', 'Doctrine', 'Other']

export default function KnowledgeBaseClient() {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RequestFormData>()

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchLibrary = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedCategory !== 'all') params.append('category', selectedCategory.toLowerCase())
            if (searchQuery) params.append('search', searchQuery)

            const response = await api.get(`/knowledge-base/library?${params.toString()}`)
            if (response.data.success) {
                setDocuments(response.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch legal library:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedCategory, searchQuery])

    useEffect(() => {
        if (mounted) fetchLibrary()
    }, [fetchLibrary, mounted])

    const handleDownload = async (doc: KnowledgeDocument) => {
        try {
            await api.post(`/knowledge-base/documents/${doc._id}/access`)
            window.open(doc.fileUrl, '_blank')
        } catch (error) {
            console.error('Failed to register access:', error)
            window.open(doc.fileUrl, '_blank')
        }
    }

    const onSubmitRequest = async (data: RequestFormData) => {
        setIsSubmitting(true)
        try {
            const response = await api.post('/knowledge-base/requests', {
                ...data,
                category: data.category.toLowerCase()
            })
            if (response.data.success) {
                toast.success('Your request has been uplinked to the vault administrators.')
                reset()
                setIsRequestModalOpen(false)
            }
        } catch (error) {
            toast.error('Failed to process document request.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatSize = (bytes: number) => {
        return (bytes / 1024).toFixed(1) + ' KB'
    }

    if (!mounted) return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <BookOpen className="text-primary w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Corporate Intelligence</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tightest">
                            Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Library</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-xl">
                            Secure access to master jurisprudence, templates, and firm-specific doctrine.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-3"
                    >
                        <div className="premium-glass px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Shield className="text-emerald-400 w-4 h-4" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Access Level</p>
                                <p className="text-xs font-bold text-white mt-1">Authorized Counsel</p>
                            </div>
                        </div>
                        <div className="premium-glass px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Layers className="text-primary w-4 h-4" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Repository</p>
                                <p className="text-xs font-bold text-white mt-1">Multi-Layer Sync</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="premium-glass p-8 rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col md:flex-row gap-6 items-center"
                >
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors w-5 h-5" />
                        <input 
                            type="text"
                            placeholder="Search in knowledge vault..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary/50 appearance-none cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all shadow-xl"
                            >
                                <option value="all" className="bg-slate-900">All Disciplines</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <RotateCcw size={14} className="rotate-90" />
                            </div>
                        </div>
                        <Button 
                            variant="secondary"
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory('all')
                            }}
                            className="bg-white/5 border border-white/10 py-4 px-4 rounded-2xl hover:bg-white/10 transition-all text-slate-400"
                        >
                            <RotateCcw size={18} />
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="premium-glass p-6 rounded-[2rem] border border-white/10 h-64 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <Skeleton width="100px" height="20px" borderRadius="999px" />
                                            <Skeleton width="80px" height="16px" />
                                        </div>
                                        <div className="space-y-3">
                                            <Skeleton width="100%" height="24px" />
                                            <Skeleton width="60%" height="24px" />
                                            <Skeleton width="40%" height="16px" className="mt-4" />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Skeleton width="60px" height="10px" />
                                            <Skeleton width="100px" height="14px" />
                                        </div>
                                        <Skeleton width="40px" height="40px" borderRadius="12px" />
                                    </div>
                                </div>
                            ))
                        ) : documents.length === 0 ? (
                            <div className="col-span-full py-32 text-center relative overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-10"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
                                        <BookOpen className="text-primary w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Library synchronized, but empty</h3>
                                    <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                                        There are no documents available in your library at the moment. Your administrator has not yet published any legal resources. Please check back later.
                                    </p>
                                    <div className="mt-8 flex justify-center gap-4">
                                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            Status: Offline
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            Role: Authorized
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            documents.map((doc, index) => (
                                <motion.div
                                    key={doc._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] -z-10 blur-xl" />
                                    <div className="premium-glass p-6 rounded-[2rem] border border-white/10 hover:border-primary/40 transition-all duration-500 h-full flex flex-col justify-between overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-20 transition-opacity">
                                            <Globe className="w-24 h-24 text-white -rotate-12" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                    {doc.assignedTo === 'all' ? (
                                                        <Globe size={10} className="text-primary" />
                                                    ) : (
                                                        <Building size={10} className="text-primary" />
                                                    )}
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                                        {doc.assignedTo === 'all' ? 'Global Access' : 'Firm Restricted'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                    <BookOpen size={10} />
                                                    {doc.category}
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <h3 className="text-xl font-black text-white leading-tight tracking-tight mb-2 line-clamp-2">
                                                    {doc.name}
                                                </h3>
                                                <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                    <span>{formatSize(doc.fileSize)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span>{doc.fileType.split('/').pop()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Added to Core</p>
                                                <p className="text-xs font-bold text-white mt-0.5">{formatDate(doc.uploadDate)}</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(10,68,184,0.15)" }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDownload(doc)}
                                                className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 transition-all"
                                            >
                                                <Download size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 mt-12 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Need a customized document?</h3>
                            <p className="text-slate-400 font-medium mt-1">Contact your firm administrator to add specialized templates to this library.</p>
                        </div>
                    </div>
                    
                    <Button 
                        variant="primary"
                        onClick={() => setIsRequestModalOpen(true)}
                        className="relative z-10 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-3 overflow-hidden"
                    >
                        Contact Support
                        <ChevronRight size={14} />
                    </Button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isRequestModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg premium-glass border border-white/10 rounded-[2.5rem] p-10 shadow-3xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">Request <span className="text-primary">Artifact</span></h2>
                                    <p className="text-slate-500 text-sm mt-2 font-medium">Signal a missing document to vault administrators.</p>
                                </div>
                                <button 
                                    onClick={() => setIsRequestModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500"
                                >
                                    <RotateCcw size={20} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Specialized Category</label>
                                    <div className="relative">
                                        <select
                                            {...register('category', { required: true })}
                                            className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-6 pr-10 text-white text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] shadow-xl"
                                        >
                                            <option value="" className="bg-slate-900">Select category...</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <RotateCcw size={14} className="rotate-90" />
                                        </div>
                                    </div>
                                    {errors.category && <span className="text-xs text-rose-500 mt-1 block font-bold">Selection required</span>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Document Description</label>
                                    <textarea
                                        {...register('description', { required: true, minLength: 10 })}
                                        placeholder="Describe the document you need (e.g. Specific case law about rental defaults in Barcelona)..."
                                        rows={4}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 resize-none font-medium"
                                    />
                                    {errors.description && <span className="text-xs text-rose-500 mt-1 block">Detailed description required (min 10 chars)</span>}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl"
                                    >
                                        Abort
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                                    >
                                        {isSubmitting ? 'Uplinking...' : 'Send Request'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .tracking-tightest { letter-spacing: -0.04em; }
                .tracking-tighter { letter-spacing: -0.02em; }
                .shadow-3xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
            `}</style>
        </DashboardLayout>
    )
}
