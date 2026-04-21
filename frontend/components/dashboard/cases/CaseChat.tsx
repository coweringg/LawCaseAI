"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, FileText, Clock, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

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
    files
}: CaseChatProps) {
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
            
            <div className="h-14 border-b border-white/10 flex items-center px-8 justify-between bg-white/[0.02] backdrop-blur-2xl z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isSending ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
                        {isSending && <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-40"></div>}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Assistant Status: {isSending ? 'Analyzing...' : 'Ready'}</span>
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
                                    <div className={`max-w-[80%] rounded-[2rem] px-8 py-6 shadow-2xl text-[14px] leading-relaxed relative group transition-all duration-200 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-primary to-blue-700 text-white rounded-tr-sm border border-white/20'
                                        : 'premium-glass border border-white/10 text-slate-200 rounded-tl-sm'
                                        }`}>
                                        {msg.content.includes('[Attached Unit:') ? (
                                            <div className="flex flex-col gap-3">
                                                <div 
                                                    onClick={() => {
                                                        const fileName = msg.content.match(/\[Attached Unit: (.*?)\]/)?.[1];
                                                        const file = files.find(f => f.name === fileName);
                                                        if (file) onOpenFile(file.url);
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
                                                    onClick={() => onSaveSummary(msg.content, msg.relatedFileType || 'text/markdown')}
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

            <div className="p-6 border-t border-white/10 bg-white/[0.01] backdrop-blur-3xl z-20">
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
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Ready</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={onRemoveAttach}
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
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
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
