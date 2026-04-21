"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, UploadCloud, MoreVertical, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface CaseSidebarProps {
    files: any[];
    isDraggingSidebar: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onOpenFile: (url: string) => void;
    onFileMenuClick: (e: React.MouseEvent, file: any) => void;
    activeFileMenuId?: string;
    id: string;
}

export function CaseSidebar({
    files,
    isDraggingSidebar,
    onDragOver,
    onDragLeave,
    onDrop,
    onOpenFile,
    onFileMenuClick,
    activeFileMenuId,
    id
}: CaseSidebarProps) {
    return (
        <aside 
            className="w-64 flex-none flex flex-col bg-white/[0.01] border-r border-white/10 backdrop-blur-3xl overflow-hidden group/sidebar relative"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
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
                    whileHover={{ rotate: 180, transition: { duration: 0.15 } }}
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
                                onClick={() => onOpenFile(f.url)}
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
                                    className={`opacity-0 group-hover/file:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg cursor-pointer max-md:opacity-100 ${activeFileMenuId === f._id ? 'opacity-100' : ''}`}
                                    onClick={(e) => onFileMenuClick(e, f)}
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
                <Link href={`/dashboard/cases/${id}/documents`}>
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)", transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/10 shadow-xl premium-glass"
                    >
                        <Zap size={14} className="text-primary animate-pulse" />
                        Command Center
                    </motion.button>
                </Link>
            </div>
        </aside>
    );
}
