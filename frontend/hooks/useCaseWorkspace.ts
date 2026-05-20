"use client";

import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

export function useCaseWorkspace() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id;
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'summary' | 'search' | 'notes'>('summary');
    const [mounted, setMounted] = useState(false);
    const [isUploadingTemp, setIsUploadingTemp] = useState(false);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isTrialCase, setIsTrialCase] = useState(false);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [renameThreadModalOpen, setRenameThreadModalOpen] = useState(false);
    const [threadToRename, setThreadToRename] = useState<any>(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');

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

    const { data: caseData, isLoading: isCaseLoading } = useQuery({
        queryKey: ['case', id],
        queryFn: async () => {
            const response = await api.get(`/cases/${id}`);
            return response.data.data;
        },
        enabled: !!id && isAuthenticated,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true
    });

    const { data: files = [], isLoading: isFilesLoading } = useQuery({
        queryKey: ['caseFiles', id],
        queryFn: async () => {
            const response = await api.get(`/files/case/${id}`);
            return response.data.data || [];
        },
        enabled: !!id && isAuthenticated,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true
    });

    const { data: threads = [] } = useQuery({
        queryKey: ['caseThreads', id],
        queryFn: async () => {
            const response = await api.get(`/chat-threads/case/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            return [];
        },
        enabled: !!id && isAuthenticated
    });

    useEffect(() => {
        if (threads.length > 0 && !activeThreadId) {
            const defaultThread = threads.find((t: any) => t.isDefault) || threads[0];
            setActiveThreadId(defaultThread._id);
        }
    }, [threads, activeThreadId]);

    const { data: chatMessages = [], isLoading: isChatLoading } = useQuery({
        queryKey: ['caseChat', id, activeThreadId],
        queryFn: async () => {
            if (!activeThreadId) return [];
            const response = await api.get(`/chat-threads/${activeThreadId}/messages`);
            if (response.data.success) {
                return response.data.data.map((m: any) => ({
                    role: m.sender,
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                    model: m.metadata?.model,
                    suggestsSaving: m.metadata?.suggestsSaving,
                    relatedFileType: m.metadata?.relatedFileType
                }));
            }
            return [];
        },
        enabled: !!id && isAuthenticated && !!activeThreadId
    });

    const isTrialExpired = caseData?.error === 'TRIAL_EXPIRED' || caseData?.error === 'TRIAL_LOCKED';
    const isCaseLocked = isTrialExpired || (caseData?.status && caseData.status !== 'active');
    const caseSummary = caseData?.summary || null;
    const isLoading = isCaseLoading || isFilesLoading || isAuthLoading;

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
            const link = document.createElement('a');
            link.href = getFullFileUrl(url);
            link.setAttribute('download', fileName);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
        }, 100);
    };

    useEffect(() => {
        if (!isLoading && chatMessages.length > 0) {
            if (!initialLoadDone.current) {
                scrollToBottom("auto");
                initialLoadDone.current = true;
            } else {
                scrollToBottom("smooth");
            }
        }
    }, [chatMessages, isLoading]);

    const sendMessageMutation = useMutation({
        mutationFn: async ({ content, tempFileId, threadId, regenerate }: { content: string, tempFileId: string | null, threadId: string | null, regenerate?: boolean }) => {
            return api.post('/ai/chat', {
                message: content,
                caseId: id,
                temporaryFileId: tempFileId,
                threadId,
                regenerate
            });
        },
        onMutate: async ({ content, threadId, regenerate }) => {
            const qk = ['caseChat', id, threadId];
            await queryClient.cancelQueries({ queryKey: qk });
            const previousChat = queryClient.getQueryData(qk);
            queryClient.setQueryData(qk, (old: any) => {
                const existing = old || [];
                const withoutLastAi = regenerate && existing[existing.length - 1]?.role === 'ai' ? existing.slice(0, -1) : existing;
                if (regenerate) return withoutLastAi;
                const userMessage = { role: 'user', content, timestamp: new Date(), isPending: true };
                return [...withoutLastAi, userMessage];
            });
            setUserInput('');
            return { previousChat, threadId };
        },
        onSuccess: (response, variables) => {
            const data = response.data;
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['caseChat', id, variables.threadId] });
                queryClient.invalidateQueries({ queryKey: ['caseThreads', id] });
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            }
        },
        onError: (err, variables, context) => {
            if (context?.previousChat && context.threadId) {
                queryClient.setQueryData(['caseChat', id, context.threadId], context.previousChat);
            }
            toast.error('Failed to transmit signal');
        }
    });

    const createThreadMutation = useMutation({
        mutationFn: async (title: string) => {
            return api.post(`/chat-threads/case/${id}`, { title });
        },
        onSuccess: (response) => {
            if (response.data.success) {
                const newThread = response.data.data;
                queryClient.invalidateQueries({ queryKey: ['caseThreads', id] });
                setActiveThreadId(newThread._id);
                initialLoadDone.current = false;
            }
        },
        onError: () => toast.error('Failed to create thread')
    });

    const renameThreadMutation = useMutation({
        mutationFn: async ({ threadId, title }: { threadId: string, title: string }) => {
            return api.patch(`/chat-threads/${threadId}`, { title });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseThreads', id] });
            setRenameThreadModalOpen(false);
            setThreadToRename(null);
        },
        onError: () => toast.error('Failed to rename thread')
    });

    const deleteThreadMutation = useMutation({
        mutationFn: async (threadId: string) => {
            return api.delete(`/chat-threads/${threadId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseThreads', id] });
            const defaultThread = threads.find((t: any) => t.isDefault);
            if (defaultThread) setActiveThreadId(defaultThread._id);
            initialLoadDone.current = false;
        },
        onError: () => toast.error('Failed to delete thread')
    });

    const handleSwitchThread = (threadId: string) => {
        setActiveThreadId(threadId);
        initialLoadDone.current = false;
    };

    const handleCreateThread = (title: string) => {
        createThreadMutation.mutate(title);
    };

    const handleRenameThread = () => {
        if (threadToRename && newThreadTitle.trim()) {
            renameThreadMutation.mutate({ threadId: threadToRename._id, title: newThreadTitle.trim() });
        }
    };

    const handleDeleteThread = (threadId: string) => {
        deleteThreadMutation.mutate(threadId);
    };

    const uploadFileMutation = useMutation({
        mutationFn: async ({ file, isTemporary }: { file: File, isTemporary: boolean }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', id as string);
            formData.append('isTemporary', isTemporary.toString());
            return api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (res, { isTemporary }) => {
            if (res.data.success) {
                if (isTemporary) {
                    setTemporaryFileId(res.data.data.id);
                    toast.success('Analysis unit ready');
                } else {
                    queryClient.invalidateQueries({ queryKey: ['caseFiles', id] });
                    toast.success('Unit saved to repository');
                    setAttachingFile(null);
                }
                queryClient.invalidateQueries({ queryKey: ['case', id] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            } else {
                toast.error(res.data.message || 'Failed to stage unit');
                setAttachingFile(null);
                setTemporaryFileId(null);
            }
        },
        onError: () => {
            setAttachingFile(null);
            setTemporaryFileId(null);
        },
        onSettled: () => {
            setIsUploadingTemp(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    });

    const commitFileMutation = useMutation({
        mutationFn: async () => {
            if (summaryToSave) {
                return api.post('/files/create-from-text', {
                    caseId: id,
                    name: commitFileName || 'Case Summary',
                    content: summaryToSave.content,
                    type: summaryToSave.type
                });
            } else {
                return api.post('/files/commit', {
                    fileId: fileToCommit,
                    newFileName: commitFileName
                });
            }
        },
        onSuccess: (res) => {
            const data = res.data;
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: ['caseFiles', id] });
                setCommitModalOpen(false);
                setFileToCommit(null);
                setSummaryToSave(null);
                queryClient.invalidateQueries({ queryKey: ['case', id] });
            } else {
                toast.error(data.message);
            }
        }
    });

    const deleteFileMutation = useMutation({
        mutationFn: async (fileId: string) => {
            return api.delete(`/files/${fileId}`);
        },
        onSuccess: () => {
            toast.success('Unit purged');
            queryClient.invalidateQueries({ queryKey: ['caseFiles', id] });
            setDeleteModalOpen(false);
            setFileToDelete(null);
        }
    });

    const renameFileMutation = useMutation({
        mutationFn: async ({ fileId, name }: { fileId: string, name: string }) => {
            return api.put(`/files/${fileId}`, { name });
        },
        onSuccess: () => {
            toast.success('Unit updated');
            queryClient.invalidateQueries({ queryKey: ['caseFiles', id] });
            setRenameModalOpen(false);
            setFileToRename(null);
        }
    });

    const summaryMutation = useMutation({
        mutationFn: async () => {
            return api.get(`/ai/summary/${id}`);
        },
        onSuccess: (res) => {
            if (res.data.success) {
                const newSummary = res.data.data.summary;
                toast.success('Summary updated');
                
                queryClient.setQueryData(['case', id], (old: any) => {
                    if (!old) return old;
                    return { ...old, summary: newSummary };
                });
                
                setIsSummaryModalOpen(true);
            }
        }
    });

    const closeCaseMutation = useMutation({
        mutationFn: async () => {
            return api.put(`/cases/${id}`, { status: 'closed' });
        },
        onSuccess: (response) => {
            if (response.data.success) {
                toast.success('Case closed');
                setTimeout(() => router.push('/cases'), 1500);
            }
        }
    });

    const handleSendMessage = async () => {
        if (isCaseLocked) {
            toast.error('This case is locked.');
            return;
        }
        if ((!userInput.trim() && !temporaryFileId) || sendMessageMutation.isPending || !id) return;

        let content = userInput.trim();
        if (attachingFile) {
            content = `[Attached Unit: ${attachingFile.name}] ${content}`.trim();
        }
        if (!content && attachingFile) {
            content = `[Attached Unit: ${attachingFile.name}] Please process this incoming signal.`;
        }

        const tempFileId = temporaryFileId;
        setAttachingFile(null);
        setTemporaryFileId(null);
        
        sendMessageMutation.mutate({ content, tempFileId, threadId: activeThreadId });
    };

    const handleRegenerateLastMessage = () => {
        if (isCaseLocked || sendMessageMutation.isPending || !id) return;
        const lastUserMessage = [...chatMessages].reverse().find((message: any) => message.role === 'user');
        if (!lastUserMessage?.content) {
            toast.error('No previous prompt found to regenerate.');
            return;
        }

        sendMessageMutation.mutate({
            content: lastUserMessage.content,
            tempFileId: null,
            threadId: activeThreadId,
            regenerate: true
        });
    };

    const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isTrialCase && files.length >= 10) {
            toast.error('Trial limit reached.');
            return;
        }
        if (isCaseLocked) {
            toast.error('Case locked.');
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;
        setAttachingFile(file);
        setIsUploadingTemp(true);
        uploadFileMutation.mutate({ file, isTemporary: true });
    };

    const handleDrop = async (e: React.DragEvent, isTemporary: boolean, setter: (val: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setter(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (isTrialCase && files.length >= 10) {
                toast.error('Trial limit reached. Purge units to continue.');
                return;
            }
            if (isTemporary) {
                setAttachingFile(file);
                setIsUploadingTemp(true);
            }
            uploadFileMutation.mutate({ file, isTemporary });
        }
    };

    const handleSaveSummary = (content: string, type: string) => {
        setSummaryToSave({ content, type });
        setFileToCommit(null);
        setCommitFileName('');
        setCommitModalOpen(true);
    };

    return {
        activeTab, setActiveTab,
        isLoading,
        isAuthLoading,
        mounted,
        isSending: sendMessageMutation.isPending,
        isLoadingSummary: summaryMutation.isPending,
        isSavingSummary: commitFileMutation.isPending,
        isUploadingTemp,
        isDraggingChat, setIsDraggingChat,
        isDraggingSidebar, setIsDraggingSidebar,
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

        threads, activeThreadId, setActiveThreadId,
        handleSwitchThread, handleCreateThread, handleRenameThread, handleDeleteThread,
        renameThreadModalOpen, setRenameThreadModalOpen,
        threadToRename, setThreadToRename,
        newThreadTitle, setNewThreadTitle,

        handleOpenFile, handleDownloadFile,
        handleAttachFile,
        handleDragOver: (e: React.DragEvent, s: (v: boolean) => void) => { e.preventDefault(); s(true); },
        handleDragLeave: (e: React.DragEvent, s: (v: boolean) => void) => { e.preventDefault(); s(false); },
        handleDrop,
        handleSaveSummary,
        executeCommitFile: () => commitFileMutation.mutate(),
        handleDeleteFile: () => deleteFileMutation.mutate(fileToDelete?._id),
        handleRenameFile: () => renameFileMutation.mutate({ fileId: fileToRename?._id, name: newFileName }),
        handleSendMessage,
        handleRegenerateLastMessage,
        handleGenerateSummary: () => summaryMutation.mutate(),
        handleCloseCase: () => closeCaseMutation.mutate(),
        id
    };
}
