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
import { Loader2, ArrowLeft, Search, Folder, Grid, List as ListIcon, Upload, Trash2, MoreVertical, Zap, CheckCircle, Info, FileText, Image as ImageIcon, File, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function CaseDocuments() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated } = useAuth();
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
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
                <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] -m-8">
                    {/* Header */}
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
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">Intelligence Matrix</span>
                                <h1 className="text-xl font-black text-white tracking-tightest font-display">Document Repository</h1>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-lg px-12 hidden md:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white/[0.05] focus:border-primary/50 transition-all outline-none text-white placeholder-slate-600" 
                                    placeholder="QUERY REPOSITORY..." 
                                    type="text" 
                                />
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar: Folder Tree */}
                        <aside className="w-80 flex-none flex flex-col bg-white/[0.01] border-r border-white/10 backdrop-blur-3xl overflow-hidden relative group/sidebar">
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/sidebar:scale-[1.6] transition-transform duration-1000"></div>
                            
                            <div className="p-6 border-b border-white/10 bg-white/[0.02] relative z-10 flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Navigation Matrix</span>
                                <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">File Directory</h2>
                            </div>
                            
                            <nav className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scrollbar-hide">
                                <div className="space-y-4">
                                    <motion.div
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-black text-primary bg-primary/10 rounded-2xl border border-primary/20 shadow-xl cursor-not-allowed group/link uppercase tracking-[0.15em]"
                                    >
                                        <div className="p-1.5 rounded-lg bg-primary/20">
                                            <Folder size={14} />
                                        </div>
                                        All Documents
                                    </motion.div>
                                    
                                    <div className="mt-8 px-2">
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">System States</span>
                                        <div className="mt-4 space-y-2">
                                            {['Active Vault', 'Archive Node', 'Encryption Deck'].map((item, i) => (
                                                <div key={item} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors cursor-pointer group">
                                                    <div className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            <div className="p-6 border-t border-white/10 bg-white/[0.02] relative z-10">
                                <div className="premium-glass p-4 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Storage Mass</span>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">74.2%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '74.2%' }}
                                            className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Workspace */}
                        <section className="flex-1 flex flex-col bg-transparent overflow-hidden relative">
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                            
                            <div className="p-8 pb-4 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Node: Files</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white tracking-tightest font-display uppercase italic">Repository Units</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
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
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="h-12 px-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-hover transition-all flex items-center gap-3 shadow-2xl border border-white/20 disabled:opacity-50"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                                            {isUploading ? 'INGESTING...' : 'INGEST DATA'}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Dropzone */}
                                <motion.div
                                    whileHover={{ scale: 1.005, borderColor: "rgba(37,99,235,0.5)", backgroundColor: "rgba(255,255,255,0.03)" }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-dashed border-white/10 rounded-[2rem] p-8 flex items-center justify-center bg-white/[0.01] group transition-all duration-500 cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-primary relative z-10">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                                            <Upload className="group-hover:scale-110 transition-transform duration-500" size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em]">Data Ingestion Portal</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Authorized formats only &bull; AES-256 Encryption Active</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Document List/Grid */}
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
                                                        <input className="rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                                                    </th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Unit Identifier</th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Encoding</th>
                                                    <th className="py-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mass</th>
                                                    <th className="py-6 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Synchronization Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                <AnimatePresence>
                                                    {files.map((file, idx) => (
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
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border relative transition-all duration-500 group-hover:scale-110 ${file.type.includes('pdf') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                        file.type.includes('word') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                        }`}>
                                                                        {file.type.includes('pdf') ? <FileText size={20} /> : file.type.includes('word') ? <File size={20} /> : <ImageIcon size={20} />}
                                                                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 blur-md transition-opacity"></div>
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate max-w-[240px] tracking-tightest leading-tight">{file.name}</span>
                                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Authorized Data Stream</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-5 px-4">
                                                                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                    {file.type.split('/').pop()}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 px-4 text-[11px] font-black text-slate-200 tracking-widest">{formatSize(file.size)}</td>
                                                            <td className="py-5 px-6 text-[10px] font-black text-slate-400 text-right uppercase tracking-widest italic">{format(new Date(file.createdAt), 'MMM d, yyyy')}</td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                                {files.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-32 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Void Terminal &bull; No Pulse Detected in Repository</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mb-12">
                                        <FileGrid
                                            files={files}
                                            onFileSelect={handleFileClick}
                                            selectedFileId={selectedFile?._id}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Right Panel: Context Details or AI Summary */}
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
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2">Neural Observation</h3>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                                            Select a data unit to initiate <br /> deep logical synthesis & insights.
                                        </p>
                                    </div>
                                </aside>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
