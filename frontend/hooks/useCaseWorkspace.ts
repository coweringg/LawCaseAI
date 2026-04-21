"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useCaseWorkspace() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id;
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'summary' | 'search' | 'notes'>('summary');
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isSavingSummary, setIsSavingSummary] = useState(false);
    const [isUploadingTemp, setIsUploadingTemp] = useState(false);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

    const [caseData, setCaseData] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [userInput, setUserInput] = useState('');
    const [caseSummary, setCaseSummary] = useState<string | null>(null);
    const [isTrialCase, setIsTrialCase] = useState(false);
    const [isTrialExpired, setIsTrialExpired] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [commitModalOpen, setCommitModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const [attachingFile, setAttachingFile] = useState<File | null>(null);
    const [temporaryFileId, setTemporaryFileId] = useState<string | null>(null);
    const [fileToCommit, setFileToCommit] = useState<string | null>(null);
    const [commitFileName, setCommitFileName] = useState('');
    const [summaryToSave, setSummaryToSave] = useState<{ content: string, type: string } | null>(null);
    const [fileToRename, setFileToRename] = useState<any>(null);
    const [newFileName, setNewFileName] = useState('');
    const [fileToDelete, setFileToDelete] = useState<any>(null);
    const [activeFileMenu, setActiveFileMenu] = useState<{ id: string, x: number, y: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const initialLoadDone = useRef(false);

    const isCaseLocked = isTrialExpired || (caseData?.status && caseData.status !== 'active');

    useEffect(() => {
        setMounted(true);
        if (searchParams?.get('trial') === 'activated') {
            setIsTrialCase(true);
        }
    }, [searchParams]);

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

                if (cData.error === 'TRIAL_EXPIRED' || cData.error === 'TRIAL_LOCKED') {
                    setIsTrialExpired(true);
                }

                if (cData.success) {
                    setCaseData(cData.data);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchCaseData();
    }, [id, isAuthenticated, queryClient]);

    const uploadFileProtocol = async (file: File, isTemporary: boolean) => {
        if (!id || !isAuthenticated) return;

        if (isTemporary) {
            setAttachingFile(file);
            setIsUploadingTemp(true);
        } else {
            setIsLoading(true);
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
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
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

    const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isTrialCase && files.length >= 10) {
            toast.error('Trial limit reached: Maximum 10 units per evaluation matter.');
            return;
        }
        if (isCaseLocked) {
            toast.error('This case is locked. Reactivate it to continue.');
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFileProtocol(file, true);
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

    const handleSaveSummary = (content: string, type: string) => {
        setSummaryToSave({ content, type });
        setFileToCommit(null);
        setCommitFileName('');
        setCommitModalOpen(true);
    };

    const executeCommitFile = async () => {
        if ((!fileToCommit && !summaryToSave) || !id || isSavingSummary) return;

        if (isCaseLocked) {
            toast.error('This case is locked. Reactivate it to continue.');
            setCommitModalOpen(false);
            return;
        }
        if (isTrialCase && files.length >= 10) {
            toast.error('Trial limit reached: Maximum 10 units per evaluation matter.');
            setCommitModalOpen(false);
            return;
        }

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
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
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
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
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
        if (isCaseLocked) {
            toast.error('This case is locked. Reactivate it to continue.');
            return;
        }
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
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
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
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
                queryClient.invalidateQueries({ queryKey: ['billing'] });
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

    return {
        activeTab, setActiveTab,
        isLoading, isAuthLoading, mounted,
        isSending, isLoadingSummary, isSavingSummary, isUploadingTemp,
        isDraggingChat, setIsDraggingChat, isDraggingSidebar, setIsDraggingSidebar,
        caseData, files, chatMessages, userInput, setUserInput,
        caseSummary, isTrialCase, isTrialExpired, isCaseLocked,
        isConfirmModalOpen, setIsConfirmModalOpen,
        commitModalOpen, setCommitModalOpen,
        renameModalOpen, setRenameModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        isSummaryModalOpen, setIsSummaryModalOpen,
        attachingFile, setAttachingFile,
        temporaryFileId, setTemporaryFileId,
        fileToCommit, setFileToCommit,
        commitFileName, setCommitFileName,
        summaryToSave, setSummaryToSave,
        fileToRename, setFileToRename,
        newFileName, setNewFileName,
        fileToDelete, setFileToDelete,
        activeFileMenu, setActiveFileMenu,

        fileInputRef, chatEndRef,

        handleOpenFile, handleDownloadFile,
        handleAttachFile, handleDragOver, handleDragLeave, handleDrop,
        handleSaveSummary, executeCommitFile, handleDeleteFile, handleRenameFile,
        handleSendMessage, handleGenerateSummary, handleCloseCase,
        id
    };
}
