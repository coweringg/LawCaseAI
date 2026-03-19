import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import FileGrid from '@/components/FileGrid';
import FileAISummary from '@/components/FileAISummary';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Search, Folder, Grid, List as ListIcon, Upload, Trash2, MoreVertical, Zap, CheckCircle, Info, FileText, Image, File, Clock, Shield, Download, Star, Film, Headphones, Play, Video } from 'lucide-react';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStats, useBillingInfo, useCaseData } from '@/hooks/useSettings';

export default function CaseDocuments() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const { data: dashboardData } = useDashboardStats(!!user && isAuthenticated);
    const { data: billingInfo } = useBillingInfo();
    const { data: caseData } = useCaseData(id as string, !!user && isAuthenticated);
    const isCaseLocked = caseData?.status && caseData.status !== 'active';
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [fileToRename, setFileToRename] = useState<any>(null);
    const [newFileName, setNewFileName] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<any>(null);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        if (!id || !isAuthenticated) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/files/case/${id}`);
            if (response.data.success) {
                setFiles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id, isAuthenticated]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id || !isAuthenticated) return;
        if (isCaseLocked) {
            toast.error('This case is locked. Reactivate it to upload files.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', id as string);

        try {
            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = response.data;
            if (data.success) {
                toast.success('File uploaded successfully');
                fetchFiles();
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('Network error during upload');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleSelect = (docId: string) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(i => i !== docId));
        } else {
            setSelectedDocs([...selectedDocs, docId]);
        }
    };

    const handleFileClick = (file: any) => {
        setSelectedFile(file);
    };

    const getFileUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handleView = (file: any) => {
        window.open(getFileUrl(file.url), '_blank');
    };

    const handleDownload = async (file: any) => {
        try {
            const fullUrl = getFileUrl(file.url);
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            toast.error('Failed to sync data unit');
        }
    };

    const toggleStar = async (file: any) => {
        try {
            const res = await api.patch(`/files/${file._id}/star`);
            if (res.data.success) {
                setFiles(prev => prev.map(f => f._id === file._id ? { ...f, isStarred: !f.isStarred } : f));
                if (selectedFile?._id === file._id) setSelectedFile({ ...selectedFile, isStarred: !selectedFile.isStarred });
            }
        } catch (error) {
            toast.error('Failed to update star status');
        }
    };

    const executeRename = async () => {
        if (!fileToRename || !newFileName.trim()) return;
        setIsProcessing(true);
        try {
            const res = await api.put(`/files/${fileToRename._id}`, { name: newFileName.trim() });
            if (res.data.success) {
                toast.success('Identity updated');
                setFiles(prev => prev.map(f => f._id === fileToRename._id ? res.data.data : f));
                setRenameModalOpen(false);
            }
        } catch (error) {
            toast.error('Failed to update identity');
        } finally {
            setIsProcessing(false);
        }
    };

    const executeDelete = async () => {
        if (!fileToDelete) return;
        setIsProcessing(true);
        try {
            const res = await api.delete(`/files/${fileToDelete._id}`);
            if (res.data.success) {
                toast.success('Unit purged');
                setFiles(prev => prev.filter(f => f._id !== fileToDelete._id));
                if (selectedFile?._id === fileToDelete._id) setSelectedFile(null);
                setDeleteModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
            }
        } catch (error) {
            toast.error('Purge failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const executeBulkDelete = async () => {
        if (selectedDocs.length === 0) return;
        setIsProcessing(true);
        try {
            const res = await api.post('/files/bulk-delete', { fileIds: selectedDocs });
            if (res.data.success) {
                toast.success(res.data.message);
                setFiles(prev => prev.filter(f => !selectedDocs.includes(f._id)));
                setSelectedDocs([]);
                if (selectedFile && selectedDocs.includes(selectedFile._id)) setSelectedFile(null);
                setBulkDeleteModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
            }
        } catch (error) {
            toast.error('Bulk purge failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (activeFilter === 'all') return true;
        
        if (activeFilter === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(f.createdAt) > sevenDaysAgo;
        }

        if (activeFilter === 'starred') {
            return f.isStarred || false;
        }

        if (activeFilter === 'pdf') {
            return f.type.includes('pdf');
        }

        if (activeFilter === 'image') {
            return f.type.includes('image');
        }

        if (activeFilter === 'mp3') {
            return f.type.includes('audio') || f.name.toLowerCase().endsWith('.mp3');
        }

        if (activeFilter === 'video') {
            return f.type.includes('video');
        }

        if (activeFilter === 'media') {
            return f.type.includes('image') || f.type.includes('video') || f.type.includes('audio') || f.name.toLowerCase().endsWith('.mp3');
        }

        return true;
    });

    const plan = user?.plan || 'basic';
    const limits = billingInfo?.limits || { maxTotalStorage: 50 * 1024 * 1024, maxTokens: 400000 };
    
    const currentStorageUsed = caseData?.totalStorageUsed || files.reduce((acc, f) => acc + (f.size || 0), 0);
    const storageLimit = limits.maxTotalStorage || 100 * 1024 * 1024;
    const storagePercent = Math.min(100, Math.max(0, parseFloat(((currentStorageUsed / storageLimit) * 100).toFixed(1))));

    const caseTokensUsed = caseData?.totalTokensConsumed || 0;
    const tokenLimit = limits.maxTokens || 400000;
    const tokenPercent = Math.min(100, Math.max(0, parseFloat(((caseTokensUsed / tokenLimit) * 100).toFixed(1))));

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 relative z-10 overflow-hidden">
                    <header className="h-20 flex-none border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between px-8 relative overflow-hidden z-20">
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <Link href={`/cases/${id}`}>
                                <motion.div 
                                    whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    className="p-3 text-slate-400 hover:text-primary rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                                >
                                    <ArrowLeft size={20} />
                                </motion.div>
                            </Link>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">Case Files</span>
                                <h1 className="text-xl font-black text-white tracking-tightest font-display">Document Repository</h1>
                            </div>
                        </div>

                        <div className="flex-1 max-w-lg px-12 hidden md:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all outline-none text-white placeholder-slate-600" 
                                    placeholder="Search files..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden">
                        <aside className="w-80 flex-none flex flex-col bg-white/[0.01] border-r border-white/10 backdrop-blur-3xl overflow-hidden relative group/sidebar">
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/sidebar:scale-[1.6] transition-transform duration-1000"></div>
                            
                            <div className="p-6 border-b border-white/10 bg-white/[0.02] relative z-10 flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Explorer</span>
                                <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">File Directory</h2>
                            </div>
                            
                            <nav className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scrollbar-hide">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Smart Filters</div>
                                        <div className="space-y-1">
                                            <motion.div
                                                onClick={() => setActiveFilter('all')}
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                                className={`flex items-center gap-3 px-4 py-3 text-[11px] font-black rounded-2xl border shadow-xl cursor-pointer group/link uppercase tracking-[0.15em] transition-all ${
                                                    activeFilter === 'all' 
                                                    ? 'text-primary bg-primary/10 border-primary/20' 
                                                    : 'text-slate-400 hover:text-white border-transparent'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${activeFilter === 'all' ? 'bg-primary/20' : 'bg-white/5'}`}>
                                                    <Folder size={14} />
                                                </div>
                                                All Documents
                                            </motion.div>
                                            
                                            <motion.div
                                                onClick={() => setActiveFilter('recent')}
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)", x: 4 }}
                                                className={`flex items-center gap-3 px-4 py-3 text-[11px] font-black rounded-2xl border cursor-pointer group/link uppercase tracking-[0.15em] transition-all ${
                                                    activeFilter === 'recent'
                                                    ? 'text-primary bg-primary/10 border-primary/20'
                                                    : 'text-slate-400 hover:text-white border-transparent'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${activeFilter === 'recent' ? 'bg-primary/20' : 'bg-white/5 group-hover/link:bg-primary/10'} transition-colors`}>
                                                    <Clock size={14} />
                                                </div>
                                                Recently Added
                                            </motion.div>

                                            <motion.div
                                                onClick={() => setActiveFilter('starred')}
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)", x: 4 }}
                                                className={`flex items-center gap-3 px-4 py-3 text-[11px] font-black rounded-2xl border cursor-pointer group/link uppercase tracking-[0.15em] transition-all ${
                                                    activeFilter === 'starred'
                                                    ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                    : 'text-slate-400 hover:text-white border-transparent'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${activeFilter === 'starred' ? 'bg-amber-500/20' : 'bg-white/5 group-hover/link:bg-amber-500/10'} transition-colors`}>
                                                    <Star size={14} />
                                                </div>
                                                Starred Items
                                            </motion.div>

                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Categories</div>
                                        <div className="space-y-1">
                                            {[
                                                { id: 'pdf', label: 'PDF Documents', icon: FileText, color: 'text-red-400', activeColor: 'bg-red-500/10 border-red-500/20 text-red-400' },
                                                { id: 'image', label: 'Images & Photos', icon: Image, color: 'text-emerald-400', activeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                                                { id: 'mp3', label: 'Audio / MP3', icon: Headphones, color: 'text-amber-400', activeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                                                { id: 'video', label: 'Video Files', icon: Video, color: 'text-purple-400', activeColor: 'bg-purple-500/10 border-purple-400/20 text-purple-400' },
                                                { id: 'media', label: 'All Media', icon: Film, color: 'text-blue-400', activeColor: 'bg-blue-500/10 border-blue-400/20 text-blue-400' },
                                            ].map((cat) => (
                                                <motion.div
                                                    key={cat.id}
                                                    onClick={() => setActiveFilter(cat.id)}
                                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)", x: 4 }}
                                                    className={`flex items-center gap-3 px-4 py-2.5 text-[10px] font-black rounded-xl cursor-pointer group/cat uppercase tracking-[0.15em] transition-all border ${
                                                        activeFilter === cat.id 
                                                        ? cat.activeColor
                                                        : 'text-slate-500 hover:text-slate-200 border-transparent'
                                                    }`}
                                                >
                                                    <cat.icon size={12} className={`${cat.color} ${activeFilter === cat.id ? 'opacity-100' : 'opacity-60 group-hover/cat:opacity-100'} transition-opacity`} />
                                                    {cat.label}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            <div className="p-6 border-t border-white/10 bg-white/[0.02] relative z-10 flex flex-col gap-4">
                                <div className="premium-glass p-4 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Storage Usage</span>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{storagePercent}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${storagePercent}%` }}
                                            className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                        ></motion.div>
                                    </div>
                                </div>
                                {(!user?.plan || !['elite', 'enterprise'].includes(user?.plan.toLowerCase())) && (
                                <div className="premium-glass p-4 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Token Usage</span>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{tokenPercent}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tokenPercent}%` }}
                                            className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                        ></motion.div>
                                    </div>
                                </div>
                                )}
                            </div>
                        </aside>

                        <section className="flex-1 flex flex-col bg-transparent overflow-hidden relative">
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                            
                            <div className="p-8 pb-4 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Files</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white tracking-tightest font-display uppercase italic">Documents</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {selectedDocs.length > 0 && !isCaseLocked && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => setBulkDeleteModalOpen(true)}
                                                className="h-12 px-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all flex items-center gap-3 shadow-xl"
                                            >
                                                <Trash2 size={16} />
                                                Delete Selection ({selectedDocs.length})
                                            </motion.button>
                                        )}

                                        <div className="flex items-center gap-1.5 premium-glass p-1.5 rounded-2xl border border-white/10 shadow-xl">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <Grid size={16} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViewMode('list')}
                                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <ListIcon size={16} />
                                            </motion.button>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleUpload}
                                            className="hidden"
                                        />

                                        <motion.button
                                            whileHover={isCaseLocked ? {} : { scale: 1.02, boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
                                            whileTap={isCaseLocked ? {} : { scale: 0.98 }}
                                            onClick={() => !isCaseLocked && fileInputRef.current?.click()}
                                            disabled={isUploading || isCaseLocked}
                                            className={`h-12 px-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-hover transition-all flex items-center gap-3 shadow-2xl border border-white/20 disabled:opacity-50 ${isCaseLocked ? 'cursor-not-allowed' : ''}`}
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                                            {isCaseLocked ? 'CASE LOCKED' : isUploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                                        </motion.button>
                                    </div>
                                </div>

                            </div>

                            {isCaseLocked && (
                                <div className="mx-8 mt-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 relative z-10">
                                    <Shield size={18} className="text-amber-500 shrink-0" />
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                        This case is not active &bull; Read-only mode &bull; Reactivate from your case list to resume operations
                                    </p>
                                </div>
                            )}

                            <div className="flex-1 overflow-auto px-8 mt-4 relative z-10 scrollbar-hide">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decrypting Repository...</span>
                                    </div>
                                ) : viewMode === 'list' ? (
                                    <div className="premium-glass border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl mb-12">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/[0.03] border-b border-white/10">
                                                    <th className="py-6 px-6 w-10">
                                                        <input 
                                                            className="rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0" 
                                                            type="checkbox" 
                                                            checked={selectedDocs.length === filteredFiles.length && filteredFiles.length > 0}
                                                            onChange={() => {
                                                                if (selectedDocs.length === filteredFiles.length) setSelectedDocs([]);
                                                                else setSelectedDocs(filteredFiles.map(f => f._id));
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Name</th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Type</th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Size</th>
                                                    <th className="py-6 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Date Added</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                <AnimatePresence>
                                                    {filteredFiles.map((file, idx) => (
                                                        <motion.tr
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            key={file._id}
                                                            onClick={() => handleFileClick(file)}
                                                            className={`group hover:bg-white/[0.03] transition-all cursor-pointer relative ${selectedFile?._id === file._id ? 'bg-primary/[0.05]' : ''}`}
                                                        >
                                                            <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                                                                <input 
                                                                    className="rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 h-5 w-5 transition-all group-hover:scale-110" 
                                                                    type="checkbox" 
                                                                    checked={selectedDocs.includes(file._id)} 
                                                                    onChange={() => toggleSelect(file._id)} 
                                                                />
                                                            </td>
                                                            <td className="py-5 px-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border relative transition-all duration-500 group-hover:scale-110 ${
                                                                        file.type.includes('pdf') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                        file.type.includes('word') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                        file.type.includes('audio') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                        file.type.includes('video') ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                                    }`}>
                                                                        {file.type.includes('pdf') ? <FileText size={20} /> : 
                                                                         file.type.includes('word') ? <File size={20} /> : 
                                                                         file.type.includes('audio') ? <Headphones size={20} /> :
                                                                         file.type.includes('video') ? <Video size={20} /> :
                                                                         <Image size={20} />}
                                                                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 blur-md transition-opacity"></div>
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate max-w-[240px] tracking-tightest leading-tight">{file.name}</span>
                                                                            <motion.button
                                                                                whileTap={{ scale: 0.8 }}
                                                                                onClick={(e) => { e.stopPropagation(); toggleStar(file); }}
                                                                                className={`p-1 rounded-lg transition-all ${file.isStarred ? 'text-amber-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 hov:text-slate-400'}`}
                                                                            >
                                                                                <Star size={12} fill={file.isStarred ? "currentColor" : "none"} />
                                                                            </motion.button>
                                                                        </div>
                                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Authorized Data</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-5 px-4">
                                                                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                    {file.type.split('/').pop()}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 px-4 text-[11px] font-black text-slate-200 tracking-widest">{formatSize(file.size)}</td>
                                                            <td className="py-5 px-6 text-[10px] font-black text-slate-400 text-right uppercase tracking-widest italic relative">
                                                                <div className="flex items-center justify-end gap-4 overflow-hidden">
                                                                    <span className="group-hover:opacity-0 transition-opacity uppercase tracking-[0.1em]">{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                                                                    <div className="absolute right-6 flex items-center gap-2 opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                                        <button 
                                                                            onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                                            className="p-2 hover:bg-white/10 rounded-lg text-primary transition-all"
                                                                            title="Sync Unit"
                                                                        >
                                                                            <Clock size={14} />
                                                                        </button>
                                                                        {!isCaseLocked && (
                                                                            <>
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); setFileToRename(file); setNewFileName(file.name); setRenameModalOpen(true); }}
                                                                                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-all"
                                                                                    title="Update Identity"
                                                                                >
                                                                                    <Zap size={14} />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); setDeleteModalOpen(true); }}
                                                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                                                                                    title="Purge Unit"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                                 {files.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-32 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">No documents found in this case</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mb-12">
                                        <FileGrid
                                            files={filteredFiles}
                                            onFileSelect={handleFileClick}
                                            onToggleStar={toggleStar}
                                            selectedFileId={selectedFile?._id}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <AnimatePresence mode="wait">
                            {selectedFile ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="w-96 flex-none bg-white/[0.01] border-l border-white/10 backdrop-blur-3xl overflow-hidden relative"
                                >
                                    <FileAISummary file={selectedFile} onClose={() => setSelectedFile(null)} />
                                </motion.div>
                            ) : (
                                <aside className="w-96 flex-none flex flex-col bg-white/[0.01] border-l border-white/10 backdrop-blur-3xl overflow-hidden relative group/right">
                                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/right:scale-[1.6] transition-transform duration-1000"></div>
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-700">
                                            <Shield className="text-slate-600 group-hover:text-primary transition-colors duration-700 group-hover:scale-110" size={32} />
                                        </div>
                                         <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2">File Analysis</h3>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                                            Select a file to view <br /> automated summary and details.
                                        </p>
                                    </div>
                                </aside>
                            )}
                        </AnimatePresence>
                    </div>
                     <ConfirmModal 
                        isOpen={renameModalOpen}
                        onClose={() => setRenameModalOpen(false)}
                        onConfirm={executeRename}
                        title="Rename File"
                        message="Provide a new name for this file."
                        confirmLabel={isProcessing ? "Renaming..." : "Rename"}
                    >
                        <div className="mt-4 px-8 pb-4">
                            <input 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white/10 outline-none text-white transition-all"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </ConfirmModal>

                    <ConfirmModal 
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={executeDelete}
                        title="Delete File"
                        message="This process will permanently erase the document. Proceed with caution."
                        confirmLabel={isProcessing ? "Deleting..." : "Delete File"}
                        isDestructive
                    />

                    <ConfirmModal 
                        isOpen={bulkDeleteModalOpen}
                        onClose={() => setBulkDeleteModalOpen(false)}
                        onConfirm={executeBulkDelete}
                        title="Bulk Delete"
                        message={`You are about to permanently erase ${selectedDocs.length} documents. This action is irreversible.`}
                        confirmLabel={isProcessing ? "Deleting..." : "Execute Bulk Delete"}
                        isDestructive
                    />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
