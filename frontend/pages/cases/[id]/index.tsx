import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Folder, Download, Search, Info } from 'lucide-react';
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

    useEffect(() => {
        const fetchCaseData = async () => {
            if (!id || !isAuthenticated) return;
            try {
                const [caseRes, filesRes] = await Promise.all([
                    api.get(`/cases/${id}`),
                    api.get(`/files/case/${id}`)
                ]);

                const cData = caseRes.data;
                const fData = filesRes.data;

                if (cData.success) {
                    setCaseData(cData.data);
                    // If case already has a summary in the DB, use it
                    if (cData.data.summary) {
                        setCaseSummary(cData.data.summary);
                    }
                }
                if (fData.success) setFiles(fData.data);
            } catch (error) {
                console.error('Error fetching case workspace data:', error);
                toast.error('Failed to load case data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCaseData();
    }, [id, isAuthenticated]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isSending || !id || !isAuthenticated) return;

        const userMessage = { role: 'user', content: userInput, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsSending(true);

        try {
            const response = await api.post('/ai/chat', {
                message: userInput,
                caseId: id
            });

            const data = response.data;
            if (data.success) {
                const aiMessage = {
                    role: 'ai',
                    content: data.data.response,
                    timestamp: new Date(),
                    model: data.data.model
                };
                setChatMessages(prev => [...prev, aiMessage]);
            } else {
                toast.error(data.message || 'AI failed to respond');
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
                <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] -m-8">
                    {/* Case Specific Header */}
                    <header className="h-14 flex-none border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-between px-6 shadow-sm z-10">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <Link href="/cases" className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <span className="material-icons-round text-lg">arrow_back</span>
                                </Link>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{caseData?.client || 'Direct Client'}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">{caseData?.practiceArea || 'General Legal'}</span>
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[300px]">{caseData?.name || 'Loading case...'}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {caseData?.status === 'active' && (
                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons-round text-sm">lock</span>
                                    Close Case
                                </button>
                            )}
                            <span className={`flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-widest ${caseData?.status === 'active'
                                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40'
                                : 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${caseData?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                {(caseData?.status || 'Active').toUpperCase()}
                            </span>
                        </div>
                    </header>

                    {/* Main Content Areas */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* LEFT PANE: Quick Files */}
                        <aside className="w-72 flex-none flex flex-col bg-slate-50 dark:bg-background-dark border-r border-slate-200 dark:border-slate-800">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-surface-dark">
                                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case Files</h2>
                                <div className="flex gap-1">
                                    <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors" title="Refresh" onClick={() => window.location.reload()}>
                                        <span className="material-icons-round text-lg">refresh</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                                <div className="group">
                                    <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="material-icons-round text-slate-400 text-lg">folder_open</span>
                                        <span className="truncate font-medium">All Documents</span>
                                    </div>
                                    <div className="ml-6 border-l border-slate-200 dark:border-slate-700 pl-2 mt-1 space-y-1">
                                        {files.map(f => (
                                            <button key={f._id} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded group/file text-left transition-all">
                                                <div className={`w-6 h-6 rounded flex items-center justify-center ${f.type.includes('pdf') ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                                                    <span className="material-icons-round text-base">{f.type.includes('pdf') ? 'picture_as_pdf' : 'description'}</span>
                                                </div>
                                                <span className="truncate flex-1 font-medium">{f.name}</span>
                                            </button>
                                        ))}
                                        {files.length === 0 && (
                                            <p className="text-[10px] text-slate-400 py-2 italic">No files uploaded yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
                                <Link href={`/cases/${id}/documents`}>
                                    <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-icons-round text-base">folder_open</span>
                                        Open Document Manager
                                    </button>
                                </Link>
                            </div>
                        </aside>

                        {/* MIDDLE PANE: AI Assistant & Context */}
                        <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface-dark relative">
                            {/* Assistant Status Bar */}
                            <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-white dark:bg-surface-dark z-10 sticky top-0">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isSending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Assistant: {isSending ? 'Thinking...' : 'Ready'}</span>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 dark:bg-black/20">
                                {chatMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                            <span className="material-icons-round text-primary text-3xl">smart_toy</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to assist with {caseData?.name}</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                            Upload documents to start analyzing legal patterns, finding discrepancies, and generating case summaries.
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                onClick={() => { setUserInput('Summarize this case'); handleSendMessage(); }}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 hover:border-primary transition-all"
                                            >
                                                &quot;Summarize this case&quot;
                                            </button>
                                            <button
                                                onClick={() => { setUserInput('Check for deadlines'); handleSendMessage(); }}
                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 hover:border-primary transition-all"
                                            >
                                                &quot;Check for deadlines&quot;
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-4'}`}>
                                                {msg.role === 'ai' && (
                                                    <div className="w-8 h-8 rounded-lg bg-primary flex-none flex items-center justify-center shadow-lg">
                                                        <span className="material-icons-round text-white text-sm">smart_toy</span>
                                                    </div>
                                                )}
                                                <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm text-[13px] leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-primary text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider opacity-60 ${msg.role === 'user' ? 'text-blue-100 text-right' : 'text-slate-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {isSending && (
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary flex-none flex items-center justify-center shadow-lg">
                                                    <span className="material-icons-round text-white text-sm">smart_toy</span>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
                                <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                                    <textarea
                                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-0 resize-none py-3 px-4 outline-none"
                                        placeholder="Ask your AI assistant about this case..."
                                        rows={2}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    />
                                    <div className="flex items-center justify-between px-2 pb-2">
                                        <div className="flex gap-1">
                                            <button className="p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Attach File">
                                                <span className="material-icons-round text-xl">attach_file</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!userInput.trim() || isSending}
                                            className={`bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md text-sm font-bold ${(!userInput.trim() || isSending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSending ? 'Sending...' : 'Send'}
                                            {!isSending && <span className="material-icons-round text-base">send</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* RIGHT PANE: Summary & Info */}
                        <aside className="w-80 flex-none flex flex-col bg-slate-50 dark:bg-background-dark border-l border-slate-200 dark:border-slate-800">
                            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`flex-1 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors ${activeTab === 'summary' ? 'border-primary text-primary bg-blue-50/50 dark:bg-primary/10' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className={`flex-1 py-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors ${activeTab === 'search' ? 'border-primary text-primary bg-blue-50/50 dark:bg-primary/10' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    Status
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeTab === 'summary' && (
                                    <div className="space-y-4">
                                        {/* AI Summary Card */}
                                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/5 rounded-xl border border-primary/20 p-4 shadow-sm relative overflow-hidden group">
                                            <div className="flex items-center justify-between mb-3 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons-round text-primary text-lg">auto_awesome</span>
                                                    <h3 className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-widest">AI Case Summary</h3>
                                                </div>
                                                <button
                                                    onClick={handleGenerateSummary}
                                                    disabled={isLoadingSummary}
                                                    className="p-1 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                                                    title="Regenerate"
                                                >
                                                    <span className={`material-icons-round text-sm ${isLoadingSummary ? 'animate-spin' : ''}`}>refresh</span>
                                                </button>
                                            </div>

                                            {caseSummary ? (
                                                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed relative z-10">
                                                    {caseSummary}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 relative z-10">
                                                    <p className="text-[10px] text-slate-500 mb-4">No AI summary generated yet.</p>
                                                    <button
                                                        onClick={handleGenerateSummary}
                                                        className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg shadow-md hover:bg-primary-hover transition-all"
                                                    >
                                                        Generate Summary
                                                    </button>
                                                </div>
                                            )}

                                            {/* Decorative element */}
                                            <div className="absolute -bottom-8 -right-8 text-primary/5 dark:text-primary/10 group-hover:scale-110 transition-transform">
                                                <span className="material-icons-round text-8xl">auto_awesome</span>
                                            </div>
                                        </div>

                                        {/* Key Facts Card */}
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Info size={14} className="text-slate-400" />
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Case Profile</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Client Name</div>
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{caseData?.client || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Created On</div>
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{caseData ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Description</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">{caseData?.description || 'No description provided.'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'search' && (
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="material-icons-round text-2xl">check_circle</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wide">AI Readiness</h3>
                                            <p className="text-xs text-slate-500 mb-4">{files.length > 0 ? `${files.length} documents analyzed & indexed` : 'Waiting for documents...'}</p>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: files.length > 0 ? '100%' : '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
