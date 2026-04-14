import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { 
  BookOpen, 
  CloudUpload, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Building, 
  Globe, 
  FileText,
  RotateCcw,
  MoreVertical,
  File
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, cn } from '@/utils/helpers'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { toast } from 'react-hot-toast'

interface KnowledgeDocument {
    _id: string
    name: string
    category: 'jurisprudence' | 'contracts' | 'regulations' | 'templates' | 'other'
    assignedTo: 'all' | string
    fileUrl: string
    fileSize: number
    fileType: string
    uploadDate: string
    accessCount: number
    uploadedBy: {
        name: string
        email: string
    }
}

interface Organization {
    _id: string
    name: string
}

interface KnowledgeRequest {
    _id: string
    userId: { name: string; email: string }
    organizationId?: { name: string }
    description: string
    category: string
    status: 'pending' | 'resolved'
    createdAt: string
}

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [requests, setRequests] = useState<KnowledgeRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'vault' | 'requests'>('vault')
    const [isUploading, setIsUploading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [orgFilter, setOrgFilter] = useState('')
    
    const [docPage, setDocPage] = useState(1)
    const [docTotalPages, setDocTotalPages] = useState(1)
    const [reqPage, setReqPage] = useState(1)
    const [reqTotalPages, setReqTotalPages] = useState(1)

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean
        title: string
        message: string
        icon: React.ReactNode
        action: () => Promise<void>
        type: 'danger' | 'success' | 'warning'
    }>({
        open: false,
        title: '',
        message: '',
        icon: null,
        action: async () => {},
        type: 'warning'
    })

    const [uploadData, setUploadData] = useState({
        name: '',
        category: 'other',
        assignedTo: 'all',
        file: null as File | null
    })

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true)
        try {
            const query = new URLSearchParams({
                page: docPage.toString(),
                limit: '10',
                ...(searchQuery ? { search: searchQuery } : {}),
                ...(categoryFilter ? { category: categoryFilter } : {}),
                ...(orgFilter ? { assignedTo: orgFilter } : {})
            })
            const response = await api.get(`/admin/knowledge-base?${query.toString()}`)
            if (response.data.success) {
                setDocuments(response.data.data.documents || [])
                setDocTotalPages(response.data.data.pages || 1)
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error)
            toast.error('Failed to load knowledge archives')
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, categoryFilter, orgFilter, docPage])

    const [pendingCount, setPendingCount] = useState(0)

    const fetchRequests = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await api.get(`/admin/knowledge-requests?page=${reqPage}&limit=10`)
            if (response.data.success) {
                setRequests(response.data.data.requests || [])
                setReqTotalPages(response.data.data.pages || 1)
                setPendingCount(response.data.data.pendingCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error)
            toast.error('Failed to load documentation signals')
        } finally {
            setIsLoading(false)
        }
    }, [reqPage])

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/admin/organizations?limit=1000')
            if (response.data.success) {
                setOrganizations(response.data.data.organizations || [])
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error)
        }
    }

    useEffect(() => {
        if (activeTab === 'vault') {
            fetchDocuments()
        } else {
            fetchRequests()
        }
        fetchOrganizations()
    }, [activeTab, fetchDocuments, fetchRequests])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadData.file || !uploadData.name) {
            toast.error('Document metadata incomplete')
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', uploadData.file)
        formData.append('name', uploadData.name)
        formData.append('category', uploadData.category)
        formData.append('assignedTo', uploadData.assignedTo)

        try {
            const response = await api.post('/admin/knowledge-base', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (response.data.success) {
                toast.success('Document uplink successful')
                setShowUploadModal(false)
                setUploadData({ name: '', category: 'other', assignedTo: 'all', file: null })
                fetchDocuments()
            }
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error('Document uplink failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setConfirmModal({
            open: true,
            title: 'Confirm Purge',
            message: 'Are you sure you want to permanently purge this document from the knowledge vault?',
            type: 'danger',
            icon: <Trash2 className="text-rose-500" size={32} />,
            action: async () => {
                try {
                    const response = await api.delete(`/admin/knowledge-base/${id}`)
                    if (response.data.success) {
                        toast.success('Document purged')
                        fetchDocuments()
                    }
                } catch (error) {
                    toast.error('Purge operation failed')
                }
            }
        })
    }

    const handleRequestAction = async (id: string, action: 'resolve' | 'delete') => {
        if (action === 'resolve') {
            setConfirmModal({
                open: true,
                title: 'Resolve Signal',
                message: 'Mark this documentation requirement as resolved? This assumes the artifact is now available and synchronized.',
                type: 'warning',
                icon: <CheckCircle2 className="text-emerald-500" size={32} />,
                action: async () => {
                    try {
                        await api.put(`/admin/knowledge-requests/${id}/status`, { status: 'resolved' })
                        toast.success('Artifact signal marked as resolved')
                        fetchRequests()
                    } catch (error) {
                        toast.error('Status modification failed')
                    }
                }
            })
        } else {
            setConfirmModal({
                open: true,
                title: 'Purge Signal',
                message: 'Remove this documentation request from history? This action cannot be reversed.',
                type: 'danger',
                icon: <XCircle className="text-rose-500" size={32} />,
                action: async () => {
                    try {
                        await api.delete(`/admin/knowledge-requests/${id}`)
                        toast.success('Signal records purged')
                        fetchRequests()
                    } catch (error) {
                        toast.error('Signal elimination failed')
                    }
                }
            })
        }
    }

    const handleBulkAction = async (action: 'resolve' | 'clear') => {
        setConfirmModal({
            open: true,
            title: action === 'resolve' ? 'Mass Resolution' : 'Vault Clearance',
            message: action === 'resolve' 
                ? 'Mark all pending signals as resolved? This will synchronize all outstanding documentation requirements.' 
                : 'Permanently clear all documentation request logs from the system? This action is destructive.',
            type: action === 'resolve' ? 'warning' : 'danger',
            icon: action === 'resolve' 
                ? <CheckCircle2 className="text-emerald-500" size={32} />
                : <AlertTriangle className="text-rose-500" size={32} />,
            action: async () => {
                try {
                    const endpoint = action === 'resolve' 
                        ? '/admin/knowledge-requests/bulk-resolve' 
                        : '/admin/knowledge-requests/bulk-clear'
                    
                    await api.post(endpoint)
                    toast.success('Batch operation finalized')
                    fetchRequests()
                } catch (error) {
                    toast.error('Batch operation failed')
                }
            }
        })
    }

    const handleDownload = async (doc: KnowledgeDocument) => {
        try {
            await api.post(`/admin/knowledge-base/${doc._id}/access`)
            window.open(doc.fileUrl, '_blank')
            fetchDocuments()
        } catch (error) {
            console.error('Access sync failed:', error)
        }
    }

    const documentColumns = [
        {
            key: 'name' as keyof KnowledgeDocument,
            title: 'Document Identity',
            render: (v: string, item: KnowledgeDocument) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <File className="text-primary w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold text-white tracking-tight">{v}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                            {(item.fileSize / 1024).toFixed(1)} KB &bull; {item.fileType.split('/').pop()}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'category' as keyof KnowledgeDocument,
            title: 'Taxonomy',
            render: (v: string) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/10">
                    {v}
                </span>
            )
        },
        {
            key: 'assignedTo' as keyof KnowledgeDocument,
            title: 'Deployment Scope',
            render: (v: string) => {
                if (v === 'all') return (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Globe size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Access</span>
                    </div>
                )
                const org = organizations?.find(o => o._id === v)
                return (
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Building size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{org?.name || 'Assigned Firm'}</span>
                    </div>
                )
            }
        },
        {
            key: 'accessCount' as keyof KnowledgeDocument,
            title: 'Sync Metrics',
            render: (v: number) => (
                <div className="flex flex-col">
                    <span className="text-white font-bold">{v}</span>
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Total Accesses</span>
                </div>
            )
        },
        {
            key: 'uploadDate' as keyof KnowledgeDocument,
            title: 'Uplink Date',
            render: (v: string) => (
                <span className="text-slate-400 text-sm whitespace-nowrap">{formatDate(v)}</span>
            )
        },
        {
            key: '_id' as keyof KnowledgeDocument,
            title: 'Vault Ops',
            render: (v: string, item: KnowledgeDocument) => (
                <div className="flex gap-2">
                    <Button variant="none" size="sm" onClick={() => handleDownload(item)} className="p-2 hover:bg-primary/10 text-primary transition-all">
                        <Download size={18} />
                    </Button>
                    <Button variant="none" size="sm" onClick={() => handleDelete(v)} className="p-2 hover:bg-error-500/10 text-error-500 transition-all">
                        <Trash2 size={18} />
                    </Button>
                </div>
            )
        }
    ] as any

    const requestColumns = [
        {
            key: 'userId' as keyof KnowledgeRequest,
            title: 'Requester Identity',
            render: (v: any) => (
                <div className="flex flex-col">
                    <span className="text-white font-bold tracking-tight">{v?.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium lowercase tracking-normal">{v?.email}</span>
                </div>
            )
        },
        {
            key: 'organizationId' as keyof KnowledgeRequest,
            title: 'Firm Context',
            render: (v: any) => (
                <div className="flex items-center gap-2 text-indigo-400">
                    <Building size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{v?.name || 'Independent'}</span>
                </div>
            )
        },
        {
            key: 'category' as keyof KnowledgeRequest,
            title: 'Taxon',
            render: (v: string) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/10">
                    {v}
                </span>
            )
        },
        {
            key: 'description' as keyof KnowledgeRequest,
            title: 'Requirement Signal',
            render: (v: string) => (
                <p className="text-slate-400 text-xs font-medium max-w-xs line-clamp-2 leading-relaxed">{v}</p>
            )
        },
        {
            key: 'status' as keyof KnowledgeRequest,
            title: 'Vault Status',
            render: (v: string) => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                    v === 'pending' 
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/10 animate-pulse" 
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/10"
                )}>
                    {v}
                </span>
            )
        },
        {
            key: 'createdAt' as keyof KnowledgeRequest,
            title: 'Signal Time',
            render: (v: string) => (
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{formatDate(v)}</span>
            )
        },
        {
            key: '_id' as keyof KnowledgeRequest,
            title: 'Ops',
            render: (v: string, item: KnowledgeRequest) => (
                <div className="flex gap-2">
                    {item.status === 'pending' && (
                        <Button 
                            variant="none" 
                            size="sm" 
                            onClick={() => handleRequestAction(v, 'resolve')}
                            className="p-2 hover:bg-emerald-500/10 text-emerald-500 transition-all"
                        >
                            <RotateCcw size={18} />
                        </Button>
                    )}
                    <Button 
                        variant="none" 
                        size="sm" 
                        onClick={() => handleRequestAction(v, 'delete')}
                        className="p-2 hover:bg-error-500/10 text-error-500 transition-all"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            )
        }
    ] as any

    return (
        <DashboardLayout>
            <Head>
                <title>Knowledge Base | LawCaseAI Admin</title>
            </Head>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tightest mb-2 uppercase">Knowledge <span className="text-primary">Base</span></h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Master Legal Archives & Global Jurisprudence</p>
                    </div>
                    
                    <div className="flex gap-4">
                        {activeTab === 'requests' && (
                            <div className="flex gap-3">
                                <Button
                                    variant="none"
                                    onClick={() => handleBulkAction('resolve')}
                                    className="px-6 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"
                                >
                                    Resolve All
                                </Button>
                                <Button
                                    variant="none"
                                    onClick={() => handleBulkAction('clear')}
                                    className="px-6 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all duration-300"
                                >
                                    Purge All
                                </Button>
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(10,68,184,0.6)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl border border-white/20 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <CloudUpload size={20} className="relative z-10" />
                            <span className="relative z-10">Uplink Document</span>
                        </motion.button>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl w-fit">
                    <button
                        onClick={() => setActiveTab('vault')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500",
                            activeTab === 'vault' 
                                ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(10,68,184,0.4)] border border-white/10" 
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        Knowledge Vault
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 relative",
                            activeTab === 'requests' 
                                ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(10,68,184,0.4)] border border-white/10" 
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        Document Requests
                        {pendingCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-slate-900 font-black animate-bounce shadow-lg shadow-rose-500/40">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'vault' ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative col-span-1 md:col-span-2 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search document archives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-white/[0.02] border border-white/10 rounded-3xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all uppercase tracking-widest backdrop-blur-xl"
                                />
                            </div>
                            
                            <div className="relative">
                                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full pl-14 pr-10 py-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl text-[11px] font-black text-white outline-none focus:ring-1 focus:ring-primary/40 appearance-none uppercase tracking-widest cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all shadow-2xl"
                                >
                                    <option value="" className="bg-slate-900 text-white">All Taxonomies</option>
                                    <option value="jurisprudence" className="bg-slate-900 text-white">Jurisprudence</option>
                                    <option value="contracts" className="bg-slate-900 text-white">Contracts</option>
                                    <option value="regulations" className="bg-slate-900 text-white">Regulations</option>
                                    <option value="templates" className="bg-slate-900 text-white">Templates</option>
                                    <option value="other" className="bg-slate-900 text-white">Other</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <RotateCcw size={14} className="rotate-90" />
                                </div>
                            </div>

                            <div className="relative">
                                <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select
                                    value={orgFilter}
                                    onChange={(e) => setOrgFilter(e.target.value)}
                                    className="w-full pl-14 pr-10 py-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl text-[11px] font-black text-white outline-none focus:ring-1 focus:ring-primary/40 appearance-none uppercase tracking-widest cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all shadow-2xl"
                                >
                                    <option value="" className="bg-slate-900 text-white">Global Visibility</option>
                                    <option value="all" className="bg-slate-900 text-white">Unrestricted</option>
                                    {organizations?.map(org => (
                                        <option key={org._id} value={org._id} className="bg-slate-900 text-white">{org.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <RotateCcw size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden">
                            <Table
                                data={documents}
                                columns={documentColumns}
                                loading={isLoading}
                                emptyMessage="No documents found in knowledge vault."
                            />
                            {docTotalPages > 1 && (
                                <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Vault Page {docPage} of {docTotalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={docPage === 1}
                                            onClick={() => setDocPage(p => p - 1)}
                                            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={docPage === docTotalPages}
                                            onClick={() => setDocPage(p => p + 1)}
                                            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="premium-glass border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden">
                        <Table
                            data={requests}
                            columns={requestColumns}
                            loading={isLoading}
                            emptyMessage="No documentation signals detected."
                        />
                        {reqTotalPages > 1 && (
                            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Signals Page {reqPage} of {reqTotalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={reqPage === 1}
                                        onClick={() => setReqPage(p => p - 1)}
                                        className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={reqPage === reqTotalPages}
                                        onClick={() => setReqPage(p => p + 1)}
                                        className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            <Modal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Document Uplink Protocol"
                variant="glass"
                size="lg"
            >
                <form onSubmit={handleUpload} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <File className="w-3 h-3" />
                            Document Identity
                        </label>
                        <Input
                            value={uploadData.name}
                            onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                            placeholder="Master Document Title"
                            required
                            className="bg-black/40 border-white/10 text-white p-6 rounded-2xl focus:border-primary/50 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" />
                                Archive Taxonomy
                            </label>
                            <div className="relative">
                                <select
                                    value={uploadData.category}
                                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                                    className="w-full p-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white outline-none focus:border-primary/50 uppercase text-[11px] font-black tracking-widest appearance-none cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all shadow-xl"
                                >
                                    <option value="jurisprudence" className="bg-slate-900">Jurisprudence</option>
                                    <option value="contracts" className="bg-slate-900">Contracts</option>
                                    <option value="regulations" className="bg-slate-900">Regulations</option>
                                    <option value="templates" className="bg-slate-900">Templates</option>
                                    <option value="other" className="bg-slate-900">Other</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <RotateCcw size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Globe className="w-3 h-3" />
                                Deployment Scope
                            </label>
                            <div className="relative">
                                <select
                                    value={uploadData.assignedTo}
                                    onChange={(e) => setUploadData({ ...uploadData, assignedTo: e.target.value })}
                                    className="w-full p-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white outline-none focus:border-primary/50 uppercase text-[11px] font-black tracking-widest appearance-none cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all shadow-xl"
                                >
                                    <option value="all" className="bg-slate-900">Global Access</option>
                                    {organizations?.map(org => (
                                        <option key={org._id} value={org._id} className="bg-slate-900">{org.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <RotateCcw size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <CloudUpload className="w-3 h-3" />
                            File Transmission
                        </label>
                        <div 
                            className="mt-1 flex justify-center px-8 pt-10 pb-10 border-2 border-white/10 border-dashed rounded-[2.5rem] hover:border-primary/60 transition-all bg-white/[0.01] hover:bg-primary/[0.02] group/upload cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                if (e.dataTransfer.files[0]) setUploadData({ ...uploadData, file: e.dataTransfer.files[0] })
                            }}
                        >
                            <div className="space-y-3 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover/upload:border-primary/40 group-hover/upload:text-primary transition-all">
                                    <CloudUpload size={32} className="text-slate-500 group-hover/upload:text-primary transition-all" />
                                </div>
                                <div className="flex text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
                                    <label className="relative cursor-pointer rounded-md font-black text-primary hover:text-blue-400 transition-all">
                                        <span>Select Artifact</span>
                                        <input 
                                            type="file" 
                                            className="sr-only" 
                                            onChange={(e) => e.target.files && setUploadData({ ...uploadData, file: e.target.files[0] })}
                                        />
                                    </label>
                                    <p className="pl-2">or carry into vault</p>
                                </div>
                                <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em]">
                                    {uploadData.file ? uploadData.file.name : 'PDF, DOCX up to 10MB'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isUploading}
                        className="w-full py-6 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 transition-all border border-white/10"
                    >
                        {isUploading ? 'Executing Uplink...' : 'Synchronize Master Document'}
                    </Button>
                </form>
            </Modal>

            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                title={confirmModal.title}
                variant="glass"
                size="sm"
            >
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
                            {confirmModal.icon}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-300 font-medium leading-relaxed">
                            {confirmModal.message}
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/10"
                        >
                            Abort
                        </Button>
                        <Button
                            variant="none"
                            onClick={async () => {
                                await confirmModal.action()
                                setConfirmModal({ ...confirmModal, open: false })
                            }}
                            className={cn(
                                "flex-1 py-4 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all border border-white/10",
                                confirmModal.type === 'danger' 
                                    ? "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600" 
                                    : "bg-primary text-white shadow-primary/20 hover:bg-blue-600"
                            )}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
