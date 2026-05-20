"use client";

import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, Clock, Copy, Edit2, FileText, Gavel, GitCompare, Hash, Loader2, MessageSquare, PenTool, Plus, RefreshCw, Trash2, X, Zap } from 'lucide-react';
import React, { useState } from 'react';

const PROMPT_TEMPLATES = [
    { label: 'Summarize this case', icon: FileText },
    { label: 'Find legal risks', icon: AlertTriangle },
    { label: 'Extract key dates', icon: Clock },
    { label: 'Identify relevant precedents', icon: Gavel },
    { label: 'Compare uploaded documents', icon: GitCompare },
    { label: 'Draft response strategy', icon: PenTool },
];

interface CaseChatProps {
    chatMessages: any[];
    userInput: string;
    isSending: boolean;
    isDraggingChat: boolean;
    isCaseLocked: boolean;
    attachingFile: File | null;
    isUploadingTemp: boolean;
    temporaryFileId: string | null;
    onSendMessage: () => void;
    onInputChange: (val: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onAttachClick: () => void;
    onRemoveAttach: () => void;
    onSaveSummary: (content: string, type: string) => void;
    onOpenFile: (url: string) => void;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
    files: any[];
    threads?: any[];
    activeThreadId?: string | null;
    onSwitchThread?: (threadId: string) => void;
    onCreateThread?: (title: string) => void;
    onRenameThread?: (thread: any) => void;
    onDeleteThread?: (threadId: string) => void;
    onRegenerateLastMessage?: () => void;
}

export function CaseChat({
    chatMessages,
    userInput,
    isSending,
    isDraggingChat,
    isCaseLocked,
    attachingFile,
    isUploadingTemp,
    temporaryFileId,
    onSendMessage,
    onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onAttachClick,
    onRemoveAttach,
    onSaveSummary,
    onOpenFile,
    chatEndRef,
    files,
    threads = [],
    activeThreadId,
    onSwitchThread,
    onCreateThread,
    onRenameThread,
    onDeleteThread,
    onRegenerateLastMessage
}: CaseChatProps) {
    const [isThreadPanelOpen, setIsThreadPanelOpen] = useState(false);
    const [isCreatingThread, setIsCreatingThread] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [threadMenuId, setThreadMenuId] = useState<string | null>(null);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const activeThread = threads.find(t => t._id === activeThreadId);

    const handleCreateThread = () => {
        if (newThreadTitle.trim() && onCreateThread) {
            onCreateThread(newThreadTitle.trim());
            setNewThreadTitle('');
            setIsCreatingThread(false);
        }
    };

    return (
        <section 
            className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <AnimatePresence>
                {isDraggingChat && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-xl border-4 border-dashed border-primary/40 z-[100] flex flex-col items-center justify-center gap-6 text-primary pointer-events-none"
                    >
                        <div className="w-32 h-32 bg-primary/20 rounded-[3rem] flex items-center justify-center animate-pulse border border-primary/30 shadow-[0_0_50px_rgba(0,230,118,0.3)]">
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
            
            <div className="h-14 border-b border-white/10 flex items-center px-8 justify-between bg-white/[0.02] backdrop-blur-2xl z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isSending ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-primary shadow-[0_0_10px_rgba(0,230,118,0.8)]'}`}></div>
                        {isSending && <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-40"></div>}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Assistant Status: {isSending ? 'Analyzing...' : 'Ready'}</span>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsThreadPanelOpen(!isThreadPanelOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 hover:bg-white/[0.06] transition-all group"
                    >
                        <Hash size={12} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors max-w-[120px] truncate">
                            {activeThread?.title || 'General'}
                        </span>
                        <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${isThreadPanelOpen ? 'rotate-180' : ''}`} />
                        {threads.length > 1 && (
                            <span className="ml-1 w-5 h-5 rounded-lg bg-primary/20 text-primary text-[9px] font-black flex items-center justify-center">
                                {threads.length}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isThreadPanelOpen && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => { setIsThreadPanelOpen(false); setThreadMenuId(null); }}></div>
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-72 bg-[#0B0E14] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[91] overflow-hidden"
                                >
                                    <div className="p-3 border-b border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Threads</span>
                                            <button 
                                                onClick={() => setIsCreatingThread(true)}
                                                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isCreatingThread && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            value={newThreadTitle}
                                                            onChange={(e) => setNewThreadTitle(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateThread(); if (e.key === 'Escape') setIsCreatingThread(false); }}
                                                            placeholder="Thread name..."
                                                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-primary/30 placeholder-slate-600"                                                        />
                                                        <button 
                                                            onClick={handleCreateThread}
                                                            className="px-3 py-2 bg-primary text-background-dark rounded-xl text-[9px] font-black uppercase tracking-wider"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide p-2">
                                        {threads.map((thread: any) => (
                                            <div
                                                key={thread._id}
                                                className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                                                    activeThreadId === thread._id 
                                                        ? 'bg-primary/10 border border-primary/20' 
                                                        : 'hover:bg-white/[0.04] border border-transparent'
                                                }`}
                                                onClick={() => {
                                                    if (onSwitchThread) onSwitchThread(thread._id);
                                                    setIsThreadPanelOpen(false);
                                                    setThreadMenuId(null);
                                                }}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-none ${
                                                    activeThreadId === thread._id ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'
                                                }`}>
                                                    {thread.isDefault ? <Zap size={14} /> : <MessageSquare size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] font-black truncate ${activeThreadId === thread._id ? 'text-white' : 'text-slate-300'}`}>
                                                            {thread.title}
                                                        </span>
                                                        {thread.isDefault && (
                                                            <span className="text-[7px] font-black uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded-md flex-none">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-slate-600 font-bold">
                                                        {thread.messageCount || 0} messages
                                                        {thread.lastMessage && ` • ${thread.lastMessage.content.substring(0, 30)}...`}
                                                    </span>
                                                </div>

                                                {!thread.isDefault && (
                                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity flex-none">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (onRenameThread) onRenameThread(thread); setIsThreadPanelOpen(false); }}
                                                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                                                        >
                                                            <Edit2 size={11} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (onDeleteThread) onDeleteThread(thread._id); }}
                                                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
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
                                <Zap className="text-primary relative z-10 group-hover:scale-110 transition-transform duration-200" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 font-display tracking-tightest">Directive Core Ready</h3>
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-2">
                                {activeThread && !activeThread.isDefault 
                                    ? `Thread "${activeThread.title}" initialized. Start your conversation.`
                                    : 'Input query protocols to analyze case repositories, extract legal precedents, and synthesize defense strategies.'}
                            </p>
                            {threads.length > 1 && (
                                <p className="text-[10px] text-primary/60 font-bold mb-8">
                                    Cross-thread intelligence active across {threads.length} threads
                                </p>
                            )}
                            <div className="flex flex-wrap justify-center gap-4">
                                {PROMPT_TEMPLATES.map((action, idx) => (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        key={idx}
                                        onClick={() => onInputChange(action.label)}
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
                                    <div className={`rounded-[2rem] px-8 py-6 shadow-2xl text-[14px] leading-relaxed relative group transition-all duration-200 ${msg.role === 'user'
                                        ? 'max-w-[75%] bg-gradient-to-br from-primary/[0.12] to-primary/[0.04] text-white rounded-tr-sm border border-primary/20'
                                        : 'max-w-[80%] premium-glass border border-white/10 text-slate-200 rounded-tl-sm'
                                        }`}>
                                        {msg.content.includes('[Attached Unit:') ? (
                                            <div className="flex flex-col gap-3">
                                                <div 
                                                    onClick={() => {
                                                        const fileName = msg.content.match(/\[Attached Unit: (.*?)\]/)?.[1];
                                                        const file = files.find(f => f.name === fileName);
                                                        if (file) onOpenFile(file.url);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-transform ${msg.role === 'user' ? 'bg-primary/10 border-primary/20 hover:bg-primary/20 text-white' : 'bg-primary/5 border-primary/20'}`}
                                                >
                                                    <div className={`p-2 rounded-xl ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
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
                                        <div className={`mt-4 pt-3 border-t ${msg.role === 'user' ? 'border-primary/10' : 'border-white/5'} flex items-center justify-between`}>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-primary/50' : 'text-slate-500'}`}>
                                                {msg.role === 'user' ? (msg.isPending ? 'Transmitting...' : 'Authorized Operator') : 'AI Assistant'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await navigator.clipboard.writeText(msg.content);
                                                        setCopiedIdx(i);
                                                        setTimeout(() => setCopiedIdx(null), 2000);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-600 hover:text-primary transition-all"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedIdx === i ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                                                </button>
                                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-primary/40' : 'text-slate-600'}`}>
                                                    {format(new Date(msg.timestamp), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </div>
                                        {msg.role === 'ai' && i === chatMessages.length - 1 && !isSending && !isCaseLocked && onRegenerateLastMessage && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <button
                                                    onClick={onRegenerateLastMessage}
                                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all px-3 py-1.5 rounded-xl hover:bg-white/5"
                                                >
                                                    <RefreshCw size={12} />
                                                    Regenerate Response
                                                </button>
                                            </div>
                                        )}
                                        {msg.suggestsSaving && (
                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                <button
                                                    onClick={() => onSaveSummary(msg.content, msg.relatedFileType || 'text/markdown')}
                                                    className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2 w-fit shadow-xl"
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

            <div className="p-6 border-t border-white/10 bg-white/[0.01] backdrop-blur-3xl z-20">
                {!isCaseLocked && chatMessages.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                        {PROMPT_TEMPLATES.map((tpl, idx) => (
                            <button
                                key={idx}
                                onClick={() => onInputChange(tpl.label)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[9px] font-bold text-slate-500 hover:text-white hover:border-primary/40 hover:bg-white/[0.06] transition-all whitespace-nowrap flex-none"
                            >
                                <tpl.icon size={12} className="text-primary" />
                                {tpl.label}
                            </button>
                        ))}
                    </div>
                )}
                <div className="relative premium-glass border border-white/10 rounded-[2rem] shadow-2xl focus-within:border-primary/50 transition-all duration-200 group/input flex flex-col">
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
                                            <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Ready</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={onRemoveAttach}
                                        className="text-primary/60 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded-lg transition-all z-10"
                                        disabled={isUploadingTemp}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <textarea
                        className={`w-full bg-transparent text-[13px] font-medium text-white placeholder-slate-600 border-none focus:ring-0 resize-none pt-4 pb-16 px-6 outline-none scrollbar-hide ${isCaseLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                        placeholder={isCaseLocked ? "Workspace status: Restricted. Restore access to initialize terminal." : (attachingFile ? "Awaiting input for staged unit..." : "Awaiting directive commands...")}
                        rows={2}
                        value={userInput}
                        disabled={isCaseLocked}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }}
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex gap-2">
                            <motion.button 
                                whileHover={isCaseLocked ? {} : { scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                                onClick={onAttachClick}
                                disabled={isUploadingTemp || isCaseLocked}
                                className={`p-2 text-slate-500 rounded-xl transition-all ${isCaseLocked ? 'opacity-30 cursor-not-allowed' : attachingFile ? 'text-primary' : 'hover:text-primary'}`}
                            >
                                <Plus size={18} />
                            </motion.button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,230,118,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onSendMessage}
                            disabled={isCaseLocked || (!userInput.trim() && !temporaryFileId) || isSending || isUploadingTemp}
                            className={`bg-primary text-white pl-6 pr-4 py-3 rounded-2xl flex items-center gap-3 transition-all shadow-2xl text-[11px] font-bold tracking-wider ${(isCaseLocked || (!userInput.trim() && !temporaryFileId) || isSending || isUploadingTemp) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            {isSending ? 'Synthesizing...' : 'Transmit'}
                            {!isSending && <Zap size={14} fill="currentColor" />}
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
}
