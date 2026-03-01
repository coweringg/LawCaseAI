import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { 
    Loader2, 
    Folder, 
    Download, 
    Search, 
    Info, 
    ArrowLeft, 
    Shield, 
    Clock, 
    CheckCircle, 
    Zap, 
    MessageSquare, 
    List, 
    Plus,
    Lock,
    MoreVertical,
    FileText,
    Settings as SettingsIcon,
    X,
    UploadCloud,
    Edit2,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/modals/ConfirmModal';

export default function CaseWorkspace() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'summary' | 'search' | 'notes'>('summary');
    const [caseData, setCaseData] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [caseSummary, setCaseSummary] = useState<string | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [attachingFile, setAttachingFile] = useState<File | null>(null);
    const [temporaryFileId, setTemporaryFileId] = useState<string | null>(null);
    const [isUploadingTemp, setIsUploadingTemp] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
    const initialLoadDone = React.useRef(false);

    // Summary Saving State
    const [isSavingSummary, setIsSavingSummary] = useState(false);
    const [summaryToSave, setSummaryToSave] = useState<{ content: string, type: string } | null>(null);

    // File Access Functions
    const getFullFileUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return `${API_URL}${url}`;
    };

    const handleOpenFile = (url: string) => {
        window.open(getFullFileUrl(url), '_blank');
    };

    const handleDownloadFile = async (url: string, fileName: string) => {
        try {
            const response = await fetch(getFullFileUrl(url));
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        chatEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (chatMessages.length > 0) {
            if (!initialLoadDone.current) {
                scrollToBottom("auto");
                initialLoadDone.current = true;
            } else {
                scrollToBottom("smooth");
            }
        }
    }, [chatMessages, isSending]);
    // Commit File Modal State
    const [commitModalOpen, setCommitModalOpen] = useState(false);
    const [fileToCommit, setFileToCommit] = useState<string | null>(null);
    const [commitFileName, setCommitFileName] = useState('');

    // File Management States
    const [activeFileMenu, setActiveFileMenu] = useState<{ id: string, x: number, y: number } | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [fileToRename, setFileToRename] = useState<any>(null);
    const [newFileName, setNewFileName] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<any>(null);

    useEffect(() => {
        const fetchCaseData = async () => {
            if (!id || !isAuthenticated) return;
            try {
                const [caseRes, filesRes, chatRes] = await Promise.all([
                    api.get(`/cases/${id}`),
                    api.get(`/files/case/${id}`),
                    api.get(`/chat/case/${id}`)
                ]);

                const cData = caseRes.data;
                const fData = filesRes.data;
                const chData = chatRes.data;

                if (cData.success) {
                    setCaseData(cData.data);
                    // If case already has a summary in the DB, use it
                    if (cData.data.summary) {
                        setCaseSummary(cData.data.summary);
                    }
                }
                if (fData.success) setFiles(fData.data);
                if (chData.success) {
                    const formattedMessages = chData.data.map((m: any) => ({
                        role: m.sender,
                        content: m.content,
                        timestamp: new Date(m.timestamp),
                        model: m.metadata?.model,
                        suggestsSaving: m.metadata?.suggestsSaving,
                        relatedFileType: m.metadata?.relatedFileType
                    }));
                    setChatMessages(formattedMessages);
                }
            } catch (error) {
                console.error('Error fetching case workspace data:', error);
                // Don't toast for chat history fails to avoid noise, but log it
            } finally {
                setIsLoading(false);
            }
        };

        fetchCaseData();
    }, [id, isAuthenticated]);

    const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFileProtocol(file, true);
    };

    const uploadFileProtocol = async (file: File, isTemporary: boolean) => {
        if (!id || !isAuthenticated) return;

        if (isTemporary) {
            setAttachingFile(file);
            setIsUploadingTemp(true);
        } else {
            setIsLoading(true); // Reuse loading for sidebar
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', id as string);
        formData.append('isTemporary', isTemporary.toString());

        try {
            const res = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                if (isTemporary) {
                    setTemporaryFileId(res.data.data.id);
                    toast.success('Analysis unit ready');
                } else {
                    setFiles(prev => [res.data.data, ...prev]);
                    toast.success('Unit saved to repository');
                }
            } else {
                toast.error(res.data.message || 'Failed to stage unit');
                if (isTemporary) setAttachingFile(null);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Network error during upload');
            if (isTemporary) setAttachingFile(null);
        } finally {
            if (isTemporary) setIsUploadingTemp(false);
            else setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent, setter: (val: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setter(true);
    };

    const handleDragLeave = (e: React.DragEvent, setter: (val: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setter(false);
    };

    const handleDrop = async (e: React.DragEvent, isTemporary: boolean, setter: (val: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setter(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await uploadFileProtocol(file, isTemporary);
        }
    };

    const handleCommitFile = (fileId: string) => {
        setFileToCommit(fileId);
        setSummaryToSave(null);
        setCommitFileName('');
        setCommitModalOpen(true);
    };

    const handleSaveSummary = (content: string, type: string) => {
        setSummaryToSave({ content, type });
        setFileToCommit(null);
        setCommitFileName('');
        setCommitModalOpen(true);
    };

    const executeCommitFile = async () => {
        if ((!fileToCommit && !summaryToSave) || !id || isSavingSummary) return;

        setIsSavingSummary(true);
        try {
            let res;
            if (summaryToSave) {
                res = await api.post('/files/create-from-text', {
                    caseId: id,
                    name: commitFileName || 'Case Summary',
                    content: summaryToSave.content,
                    type: summaryToSave.type
                });
            } else {
                res = await api.post('/files/commit', {
                    fileId: fileToCommit,
                    newFileName: commitFileName
                });
            }

            const data = res.data;
            if (data.success) {
                toast.success(data.message);
                setFiles(prev => [data.data, ...prev]);
                setCommitModalOpen(false);
                setFileToCommit(null);
                setSummaryToSave(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to save to repository');
        } finally {
            setIsSavingSummary(false);
            setCommitModalOpen(false);
            setFileToCommit(null);
            setCommitFileName('');
        }
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete || !id || !isAuthenticated) return;
        try {
            const res = await api.delete(`/files/${fileToDelete._id}`);
            if (res.data.success) {
                toast.success('Unit purged from repository');
                setFiles(prev => prev.filter(f => f._id !== fileToDelete._id));
            } else {
                toast.error(res.data.message || 'Failed to purge unit');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error('Network error during deletion');
        } finally {
            setDeleteModalOpen(false);
            setFileToDelete(null);
        }
    };

    const handleRenameFile = async () => {
        if (!fileToRename || !newFileName.trim() || !id || !isAuthenticated) return;
        try {
            const endpoint = `/files/${fileToRename._id}`;
            const res = await api.put(endpoint, { name: newFileName.trim() });
            if (res.data.success) {
                toast.success('Unit identity updated');
                setFiles(prev => prev.map(f => f._id === fileToRename._id ? { ...f, name: newFileName.trim() } : f));
            } else {
                toast.error(res.data.message || 'Failed to update identity');
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            toast.error('Network error during rename');
        } finally {
            setRenameModalOpen(false);
            setFileToRename(null);
        }
    };

    const handleSendMessage = async () => {
        if ((!userInput.trim() && !temporaryFileId) || isSending || !id || !isAuthenticated) return;

        let content = userInput.trim();
        if (attachingFile) {
            content = `[Attached Unit: ${attachingFile.name}] ${content}`.trim();
        }
        if (!content && attachingFile) {
             content = `[Attached Unit: ${attachingFile.name}] Please process this incoming signal.`;
        }

        const userMessage = { role: 'user', content, timestamp: new Date(), isPending: true };
        
        setChatMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsSending(true);

        const currentTempFileId = temporaryFileId;
        const currentTempFileType = attachingFile?.type || 'text/markdown';
        setAttachingFile(null);
        setTemporaryFileId(null);

        try {
            const response = await api.post('/ai/chat', {
                message: content,
                caseId: id,
                temporaryFileId: currentTempFileId
            });

            const data = response.data;
            if (data.success) {
                const aiMessage = {
                    role: 'ai',
                    content: data.data.response,
                    timestamp: new Date(),
                    model: data.data.model,
                    suggestsSaving: data.data.suggestsSaving,
                    relatedFileType: data.data.relatedFileType || currentTempFileType
                };
                setChatMessages(prev => {
                    const withoutPending = prev.map(m => m.isPending ? { ...m, isPending: false } : m);
                    return [...withoutPending, aiMessage];
                });
            } else {
                toast.error(data.message || 'AI failed to respond');
                setChatMessages(prev => prev.map(m => m.isPending ? { ...m, isPending: false } : m));
            }
        } catch (error) {
            toast.error('Network error during AI chat');
        } finally {
            setIsSending(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!id || !isAuthenticated) return;
        setIsLoadingSummary(true);
        try {
            const response = await api.get(`/ai/summary/${id}`);
            const data = response.data;
            if (data.success) {
                setCaseSummary(data.data.summary);
                toast.success('Summary updated');
            }
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handleCloseCase = async () => {
        if (!id || !isAuthenticated) return;

        try {
            const response = await api.put(`/cases/${id}`, { status: 'closed' });
            const data = response.data;
            if (data.success) {
                setCaseData(data.data);
                toast.success('Case closed successfully');
                setTimeout(() => {
                    router.push('/cases');
                }, 1500);
            }
        } catch (error) {
            toast.error('Failed to close case');
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden relative">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                    
                    {/* Case Specific Header */}
                    <header className="h-20 flex-none border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between px-8 relative overflow-hidden z-20">
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <Link href="/cases">
                                <motion.div
                                    whileHover={{ x: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    className="p-3 text-slate-400 hover:text-primary rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                                >
                                    <ArrowLeft size={20} />
                                </motion.div>
                            </Link>
                            <div className="h-10 w-px bg-white/10 mx-2"></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[11px] font-bold text-slate-500 tracking-wider">{caseData?.client || 'Matrix Client'}</span>
                                    <span className="w-1 h-1 bg-primary/40 rounded-full"></span>
                                    <span className="text-[11px] font-bold text-primary tracking-wider">{caseData?.practiceArea || 'Neural Analysis'}</span>
                                </div>
                                <h2 className="text-xl font-black text-white truncate max-w-[400px] font-display tracking-tightest leading-none">{caseData?.name || 'Loading Intelligence...'}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 relative z-10">
                            <AnimatePresence>
                                {caseData?.status === 'active' && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,50,50,0.1)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                        className="px-6 py-2.5 premium-glass border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-2.5 shadow-xl"
                                    >
                                        <Lock size={12} />
                                        Seal Case
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <div className={`flex items-center gap-2.5 text-[10px] font-black px-5 py-2.5 rounded-xl border tracking-[0.2em] uppercase shadow-2xl backdrop-blur-2xl transition-all duration-500 ${caseData?.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-white/10'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${caseData?.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'}`}></div>
                                {caseData?.status || 'Active'}
                            </div>
                        </div>
                    </header>

                    {/* Main Content Areas */}
                    <div className="flex-1 flex overflow-hidden relative z-10">
                        {/* LEFT PANE: Quick Files */}
                        <aside 
                            className="w-64 flex-none flex flex-col bg-white/[0.01] border-r border-white/10 backdrop-blur-3xl overflow-hidden group/sidebar relative"
                            onDragOver={(e) => handleDragOver(e, setIsDraggingSidebar)}
                            onDragLeave={(e) => handleDragLeave(e, setIsDraggingSidebar)}
                            onDrop={(e) => handleDrop(e, false, setIsDraggingSidebar)}
                        >
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/sidebar:scale-[1.6] transition-transform duration-1000"></div>
                            
                            <AnimatePresence>
                                {isDraggingSidebar && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-primary/20 backdrop-blur-md border-2 border-dashed border-primary/50 z-[100] flex flex-col items-center justify-center gap-3 text-primary pointer-events-none"
                                    >
                                        <UploadCloud size={40} className="animate-bounce" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-6">Upload to Repository</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02] relative z-10">
                                <h2 className="text-[11px] font-bold text-slate-500 tracking-wider">Intelligence Repository</h2>
                                <motion.button 
                                    whileHover={{ rotate: 180 }}
                                    className="p-2 text-slate-500 hover:text-primary transition-all rounded-xl"
                                    onClick={() => window.location.reload()}
                                >
                                    <span className="material-icons-round text-lg">sync</span>
                                </motion.button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 relative z-10 scrollbar-hide">

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <Folder size={16} className="text-primary" />
                                            <span className="text-[11px] font-black text-white uppercase tracking-wider">All Units</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{files.length}</span>
                                    </div>
                                    
                                    <div className="space-y-1.5 ml-2 border-l border-white/5 pl-4">
                                        {files.map((f, idx) => (
                                            <motion.button 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={f._id} 
                                                onClick={() => handleOpenFile(f.url)}
                                                className="w-full flex items-center gap-3 px-3 py-3 text-[11px] text-slate-400 hover:text-white bg-transparent hover:bg-white/[0.05] border border-transparent hover:border-white/10 rounded-2xl group/file text-left transition-all duration-300 relative overflow-hidden"
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${f.type.includes('pdf') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                    <span className="material-icons-round text-base">{f.type.includes('pdf') ? 'picture_as_pdf' : 'description'}</span>
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="truncate font-black tracking-tightest leading-none mb-1 group-hover/file:text-primary transition-colors">{f.name}</span>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(f.createdAt), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div 
                                                    className="opacity-0 group-hover/file:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg cursor-pointer max-md:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (activeFileMenu?.id === f._id) {
                                                            setActiveFileMenu(null);
                                                        } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setActiveFileMenu({ id: f._id, x: rect.right + 10, y: rect.top - 10 });
                                                        }
                                                    }}
                                                >
                                                    <MoreVertical size={14} className="text-slate-500 hover:text-primary" />
                                                </div>
                                            </motion.button>
                                        ))}
                                        {files.length === 0 && (
                                            <div className="py-10 px-4 text-center">
                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Void Terminal &bull; No Intelligence Uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/[0.02] relative z-10">
                                <Link href={`/cases/${id}/documents`}>
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/10 shadow-xl premium-glass"
                                    >
                                        <Zap size={14} className="text-primary animate-pulse" />
                                        Command Center
                                    </motion.button>
                                </Link>
                            </div>
                        </aside>

                        {/* MIDDLE PANE: AI Assistant & Context */}
                        <section 
                            className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden"
                            onDragOver={(e) => handleDragOver(e, setIsDraggingChat)}
                            onDragLeave={(e) => handleDragLeave(e, setIsDraggingChat)}
                            onDrop={(e) => handleDrop(e, true, setIsDraggingChat)}
                        >
                            <AnimatePresence>
                                {isDraggingChat && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-primary/20 backdrop-blur-xl border-4 border-dashed border-primary/40 z-[100] flex flex-col items-center justify-center gap-6 text-primary pointer-events-none"
                                    >
                                            <div className="w-32 h-32 bg-primary/20 rounded-[3rem] flex items-center justify-center animate-pulse border border-primary/30 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                                            <Plus size={64} />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-xl font-black uppercase tracking-[0.3em] text-white">Drop for Analysis</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Attaching Document for AI Analysis</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none"></div>
                            
                            {/* Assistant Status Bar */}
                            <div className="h-14 border-b border-white/10 flex items-center px-8 justify-between bg-white/[0.02] backdrop-blur-2xl z-20 sticky top-0">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isSending ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
                                        {isSending && <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-40"></div>}
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Assistant Status: {isSending ? 'Analyzing...' : 'Ready'}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">

                                <AnimatePresence mode="popLayout">
                                    {chatMessages.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto"
                                        >
                                            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex items-center justify-center mb-8 relative group">
                                                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all opacity-40"></div>
                                                <Zap className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" size={40} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-4 font-display tracking-tightest">Directive Core Ready</h3>
                                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-10">
                                                Input query protocols to analyze case repositories, extract legal precedents, and synthesize defense strategies.
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {[
                                                    { label: 'Synthesize Case Overview', icon: FileText, delay: 0 },
                                                    { label: 'Audit Timeline Discrepancies', icon: Clock, delay: 0.1 },
                                                    { label: 'Generate Discovery Report', icon: Zap, delay: 0.2 }
                                                ].map((action, idx) => (
                                                    <motion.button
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: action.delay }}
                                                        key={idx}
                                                        onClick={() => { setUserInput(action.label); handleSendMessage(); }}
                                                        className="px-6 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-[9px] font-black text-slate-400 hover:text-white hover:border-primary/40 hover:bg-white/[0.06] transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl"
                                                    >
                                                        <action.icon size={14} className="text-primary" />
                                                        {action.label}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-8 pb-10">
                                            {chatMessages.map((msg, i) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    key={i} 
                                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-6'}`}
                                                >
                                                    {msg.role === 'ai' && (
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex-none flex items-center justify-center shadow-2xl relative">
                                                            <div className="absolute inset-0 bg-primary/20 blur-md rounded-2xl"></div>
                                                            <Zap className="text-primary relative z-10" size={20} />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[80%] rounded-[2rem] px-8 py-6 shadow-2xl text-[14px] leading-relaxed relative group transition-all duration-500 ${msg.role === 'user'
                                                        ? 'bg-gradient-to-br from-primary to-blue-700 text-white rounded-tr-sm border border-white/20'
                                                        : 'premium-glass border border-white/10 text-slate-200 rounded-tl-sm'
                                                        }`}>
                                                        {msg.content.includes('[Attached Unit:') ? (
                                                            <div className="flex flex-col gap-3">
                                                                <div 
                                                                    onClick={() => {
                                                                        const fileName = msg.content.match(/\[Attached Unit: (.*?)\]/)?.[1];
                                                                        const file = files.find(f => f.name === fileName);
                                                                        if (file) handleOpenFile(file.url);
                                                                    }}
                                                                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-transform ${msg.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-primary/5 border-primary/20'}`}
                                                                >
                                                                    <div className={`p-2 rounded-xl ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div className="flex flex-col overflow-hidden">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Analysis Unit Attached</span>
                                                                        <span className="text-xs font-bold truncate">
                                                                            {msg.content.match(/\[Attached Unit: (.*?)\]/)?.[1] || 'Unknown Document'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="whitespace-pre-wrap font-medium tracking-tightest leading-relaxed">
                                                                    {msg.content.replace(/\[Attached Unit: .*?\]\s*/, '') || 'Processing attached intelligence...'}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="whitespace-pre-wrap font-medium tracking-tightest leading-relaxed">
                                                                {msg.content}
                                                            </p>
                                                        )}
                                                        <div className={`mt-4 pt-4 border-t ${msg.role === 'user' ? 'border-white/10' : 'border-white/5'} flex items-center justify-between`}>
                                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                                                                {msg.role === 'user' ? (msg.isPending ? 'Transmitting...' : 'Authorized Operator') : 'AI Assistant'}
                                                            </span>
                                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-blue-200/60' : 'text-slate-600'}`}>
                                                                {format(new Date(msg.timestamp), 'HH:mm:ss')}
                                                            </span>
                                                        </div>
                                                        {msg.suggestsSaving && (
                                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                                <button
                                                                    onClick={() => {
                                                                        handleSaveSummary(msg.content, msg.relatedFileType || 'text/markdown');
                                                                    }}
                                                                    className="text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2 w-fit shadow-xl"
                                                                >
                                                                    <Zap size={12} />
                                                                    Commit Summary to Repository
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {isSending && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex gap-6"
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex-none flex items-center justify-center">
                                                        <Loader2 className="text-primary animate-spin" size={20} />
                                                    </div>
                                                    <div className="premium-glass border border-white/10 rounded-3xl rounded-tl-sm px-8 py-5 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                                        <span className="ml-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Request...</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-white/10 bg-white/[0.01] backdrop-blur-3xl z-20">
                                <div className="relative premium-glass border border-white/10 rounded-[2rem] shadow-2xl focus-within:border-primary/50 transition-all duration-500 group/input flex flex-col">
                                    <AnimatePresence>
                                        {attachingFile && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: 10, height: 0 }}
                                                className="flex flex-col mx-4 mt-4"
                                            >
                                                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 relative overflow-hidden group/attach">
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/attach:opacity-100 transition-opacity"></div>
                                                    <div className="flex items-center gap-3 overflow-hidden z-10">
                                                        <FileText size={14} className="text-primary shrink-0" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[300px]">
                                                            {attachingFile.name}
                                                        </span>
                                                        {isUploadingTemp ? (
                                                            <Loader2 size={12} className="text-primary animate-spin" />
                                                        ) : (
                                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Ready</span>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => { setAttachingFile(null); setTemporaryFileId(null); }}
                                                        className="text-primary/60 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg transition-all z-10"
                                                        disabled={isUploadingTemp}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <textarea
                                        className="w-full bg-transparent text-[13px] font-medium text-white placeholder-slate-600 border-none focus:ring-0 resize-none pt-4 pb-16 px-6 outline-none scrollbar-hide"
                                        placeholder={attachingFile ? "Input command protocols for attached unit..." : "Input command protocols..."}
                                        rows={2}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-white/5 pt-4">
                                        <div className="flex gap-2">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleAttachFile}
                                            />
                                            <motion.button 
                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingTemp}
                                                className={`p-2 text-slate-500 rounded-xl transition-all ${attachingFile ? 'text-primary' : 'hover:text-primary'}`}
                                            >
                                                <Plus size={18} />
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                className="p-2 text-slate-500 hover:text-primary rounded-xl transition-all"
                                            >
                                                <Search size={18} />
                                            </motion.button>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSendMessage}
                                            disabled={(!userInput.trim() && !temporaryFileId) || isSending || isUploadingTemp}
                                            className={`bg-primary text-white pl-6 pr-4 py-3 rounded-2xl flex items-center gap-3 transition-all shadow-2xl text-[11px] font-bold tracking-wider ${((!userInput.trim() && !temporaryFileId) || isSending || isUploadingTemp) ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        >
                                            {isSending ? 'Synthesizing' : 'Transmit'}
                                            {!isSending && <Zap size={14} fill="currentColor" />}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* RIGHT PANE: Summary & Info */}
                        <aside className="w-64 flex-none flex flex-col bg-white/[0.01] border-l border-white/10 backdrop-blur-3xl overflow-hidden relative group/right">
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none group-hover/right:scale-[1.6] transition-transform duration-1000"></div>
                            
                            <div className="grid grid-cols-2 bg-white/[0.02] border-b border-white/10 p-1.5 m-3 rounded-[1.5rem] premium-glass relative z-10">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'summary' ? 'bg-primary text-white shadow-xl border border-white/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <List size={12} />
                                    Abstract
                                </button>
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className={`py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'search' ? 'bg-primary text-white shadow-xl border border-white/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <CheckCircle size={12} />
                                    Metrics
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'summary' && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* AI Summary Card */}
                                            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 shadow-2xl relative overflow-hidden group/card hover:border-primary/30 transition-all duration-500">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                                <div className="flex items-center justify-between mb-6 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                                            <Zap size={14} fill="currentColor" />
                                                        </div>
                                                        <h3 className="text-[11px] font-bold text-white tracking-wider">Case Synopsis</h3>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ rotate: 180 }}
                                                        onClick={handleGenerateSummary}
                                                        disabled={isLoadingSummary}
                                                        className="p-2 text-slate-500 hover:text-primary transition-all disabled:opacity-30"
                                                    >
                                                        <span className={`material-icons-round text-sm ${isLoadingSummary ? 'animate-spin' : ''}`}>sync</span>
                                                    </motion.button>
                                                </div>

                                                {caseSummary ? (
                                                    <div className="space-y-4 relative z-10">
                                                        <div className="text-[10px] text-slate-400 font-medium leading-relaxed tracking-tightest line-clamp-3">
                                                            {caseSummary}
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(37,99,235,0.1)" }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setIsSummaryModalOpen(true)}
                                                            className="w-full py-2.5 border border-primary/30 rounded-xl text-[10px] font-bold text-primary tracking-widest hover:border-primary transition-all"
                                                        >
                                                            View Full Analysis
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 relative z-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                                        <p className="text-[11px] font-bold text-slate-600 tracking-wider mb-6">No Analysis Available</p>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleGenerateSummary}
                                                            className="px-6 py-3 bg-primary text-white text-[10px] font-bold tracking-widest rounded-xl shadow-xl transition-all"
                                                        >
                                                            Analyze Case
                                                        </motion.button>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                                    <span className="text-[9px] font-bold text-slate-600 tracking-widest">Confidence Index</span>
                                                    <span className="text-[11px] font-bold text-emerald-400">98.4%</span>
                                                </div>
                                            </div>

                                            {/* Details Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-bold text-slate-500 tracking-widest px-2">System Metadata</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[
                                                        { label: 'Created On', val: format(new Date(caseData?.createdAt || Date.now()), 'MMM d, yyyy'), icon: Clock },
                                                        { label: 'Practice Domain', val: caseData?.practiceArea || 'General', icon: Shield },
                                                        { label: 'Priority Level', val: 'High', icon: Zap }
                                                    ].map((it, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 premium-glass border border-white/5 rounded-2xl shadow-lg">
                                                            <div className="flex items-center gap-3">
                                                                <it.icon size={12} className="text-slate-500" />
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{it.label}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-tightest">{it.val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'search' && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="premium-glass border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                                                    <CheckCircle size={32} />
                                                </div>
                                                <h3 className="text-[11px] font-black text-white mb-2 uppercase tracking-[0.3em] relative z-10">Neural Readiness</h3>
                                                <p className="text-[9px] font-black text-slate-500 mb-8 uppercase tracking-widest relative z-10 leading-relaxed">
                                                    {files.length > 0 ? `${files.length} Units Analyzed & Successfully Indexed` : 'Waiting for Data Ingestion...'}
                                                </p>
                                                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5 p-0.5 relative z-10">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: files.length > 0 ? '100%' : '0%' }}
                                                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </aside>
                    </div>

                    <ConfirmModal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={handleCloseCase}
                        title="Close Case"
                        message={`Are you sure you want to close "${caseData?.name}"? This will mark the case as inactive and move it to the closed section.`}
                        confirmLabel="Close Case"
                        cancelLabel="Keep Open"
                        isDestructive={true}
                    />

                    <ConfirmModal
                        isOpen={deleteModalOpen}
                        onClose={() => { setDeleteModalOpen(false); setFileToDelete(null); }}
                        onConfirm={handleDeleteFile}
                        title="Delete Document"
                        message={`Are you sure you want to permanently delete the document "${fileToDelete?.name}"? This action cannot be reversed and will remove it from the Assistant's context.`}
                        confirmLabel="Delete"
                        cancelLabel="Cancel"
                        isDestructive={true}
                    />

                    {/* Rename Modal */}
                    <AnimatePresence>
                        {renameModalOpen && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setRenameModalOpen(false)}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                ></motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="bg-[#0B1121] border border-white/10 p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center">
                                            <Edit2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Update Identity</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Change Database Alias</p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mb-6">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">New Unit Name</label>
                                        <input
                                            type="text"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameFile() }}
                                            autoFocus
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="flex gap-3 relative z-10">
                                        <button
                                            onClick={() => setRenameModalOpen(false)}
                                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRenameFile}
                                            disabled={!newFileName.trim()}
                                            className="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Commit Modal */}
                    <AnimatePresence>
                        {commitModalOpen && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => { setCommitModalOpen(false); setFileToCommit(null); }}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                ></motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="bg-[#0B1121] border border-white/10 p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                                            {summaryToSave ? <Zap size={20} /> : <Folder size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">
                                                {summaryToSave ? 'Save Analysis Summary' : 'Commit to Repository'}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                                {summaryToSave ? 'Create Permanent Intelligence Unit' : 'Save as Permanent Record'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mb-6">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign Custom Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={commitFileName}
                                            onChange={(e) => setCommitFileName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') executeCommitFile() }}
                                            placeholder="Leave blank to use original filename"
                                            autoFocus
                                            disabled={isSavingSummary}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="flex gap-3 relative z-10">
                                        <button
                                            onClick={() => { setCommitModalOpen(false); setFileToCommit(null); }}
                                            disabled={isSavingSummary}
                                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={executeCommitFile}
                                            disabled={isSavingSummary}
                                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSavingSummary ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Unit'
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* File Dropdown Menu */}
                    <AnimatePresence>
                        {activeFileMenu && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setActiveFileMenu(null)}></div>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                    className="fixed z-[101] w-48 bg-[#0B1121] border border-white/10 rounded-2xl shadow-2xl p-2 premium-glass"
                                    style={{ top: activeFileMenu.y, left: activeFileMenu.x }}
                                >
                                    <button 
                                        onClick={() => {
                                            const file = files.find(f => f._id === activeFileMenu.id);
                                            setFileToRename(file);
                                            setNewFileName(file?.name || '');
                                            setRenameModalOpen(true);
                                            setActiveFileMenu(null);
                                        }} 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    >
                                       <Edit2 size={14} className="text-primary" />
                                       Update Identity
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const file = files.find(f => f._id === activeFileMenu.id);
                                            if (file) handleDownloadFile(file.url, file.name);
                                            setActiveFileMenu(null);
                                        }} 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all mt-1"
                                     >
                                        <Zap size={14} className="text-primary" />
                                        Download Unit
                                     </button>
                                     <button 
                                        onClick={() => {
                                            const file = files.find(f => f._id === activeFileMenu.id);
                                            setFileToDelete(file);
                                            setDeleteModalOpen(true);
                                            setActiveFileMenu(null);
                                        }} 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                                     >
                                        <Trash2 size={14} />
                                        Purge Data
                                     </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Summary Modal */}
                    <AnimatePresence>
                        {isSummaryModalOpen && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                                ></motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                    className="bg-[#0B1121] border border-white/10 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                                    
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10 flex-none bg-white/[0.02]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-2xl">
                                                <Zap size={24} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white tracking-tightest">Neural Synopsis Details</h3>
                                                <p className="text-[11px] text-slate-500 font-medium tracking-wider">Comprehensive intelligence synthesis from your case units</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsSummaryModalOpen(false)}
                                            className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-hide text-slate-200 leading-relaxed font-medium">
                                        <div className="whitespace-pre-wrap text-[15px] space-y-4">
                                            {caseSummary}
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-white/5 flex gap-4 relative z-10 bg-white/[0.01] flex-none">
                                        <button
                                            onClick={() => setIsSummaryModalOpen(false)}
                                            className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-bold tracking-widest transition-all border border-white/5"
                                        >
                                            CLOSE
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSummaryModalOpen(false);
                                                handleSaveSummary(caseSummary || '', 'application/pdf');
                                            }}
                                            className="flex-1 px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl text-[11px] font-bold tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
                                        >
                                            <Zap size={14} fill="currentColor" />
                                            SAVE AS PDF UNIT
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
