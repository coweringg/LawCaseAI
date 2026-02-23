import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, X, FileText, Download, ExternalLink, RefreshCw, Zap, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/utils/api';

interface FileAISummaryProps {
    file: any;
    onClose: () => void;
}

export default function FileAISummary({ file, onClose }: FileAISummaryProps) {
    const { isAuthenticated } = useAuth();
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const analyzeFile = async () => {
            if (!file?._id || !isAuthenticated) return;
            setIsAnalyzing(true);
            setAnalysis(null);
            try {
                const response = await api.post(`/ai/analyze/${file._id}`);
                const data = response.data;
                if (response.status === 200 || response.status === 201) {
                    setAnalysis(data.data);
                } else {
                    toast.error(data.message || 'Analysis failed');
                }
            } catch (error) {
                console.error('Error analyzing file:', error);
                toast.error('Network error during analysis');
            } finally {
                setIsAnalyzing(false);
            }
        };

        analyzeFile();
    }, [file?._id, isAuthenticated]);

    if (!file) return null;

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <aside className="w-full flex flex-col overflow-hidden h-full relative">
            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
            
            {/* Header */}
            <div className="p-8 border-b border-white/10 bg-white/[0.02] relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Unit Diagnostics</span>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Selected Repository Unit</h2>
                    </div>
                    <motion.button 
                        whileHover={{ rotate: 90, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        className="p-2 text-slate-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                    >
                        <X size={18} />
                    </motion.button>
                </div>
                
                <div className="flex gap-6 mb-8">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`w-20 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border relative overflow-hidden group/thumb ${file.type.includes('pdf') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}
                    >
                        <div className="absolute inset-0 bg-current opacity-0 group-hover/thumb:opacity-20 blur-xl transition-opacity"></div>
                        <FileText size={32} className="relative z-10" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-black text-white truncate leading-tight tracking-tightest mb-1" title={file.name}>{file.name}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-4">{file.type.split('/').pop()} &bull; {formatSize(file.size)}</p>
                        <div className="flex gap-3">
                            <motion.a 
                                whileHover={{ scale: 1.05, color: "#fff" }}
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all"
                            >
                                <ExternalLink size={10} />
                                View
                            </motion.a>
                            <motion.a 
                                whileHover={{ scale: 1.05, color: "#fff" }}
                                href={file.url} 
                                download 
                                className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all"
                            >
                                <Download size={10} />
                                Download
                            </motion.a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-4 premium-glass border border-white/5 rounded-2xl">
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5">Established</p>
                        <p className="text-[11px] font-black text-slate-300 tracking-widest">{format(new Date(file.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1.5">Unit Status</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{isAnalyzing ? 'Synthesizing...' : 'Calibrated'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                            <Zap className="text-primary" size={16} />
                        </div>
                        <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Neural Synthesis</h2>
                    </div>
                    {analysis && <span className="text-[9px] font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-widest">Logic Stream Primed</span>}
                </div>

                <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Executing deep logical extraction protocols...</p>
                        </motion.div>
                    ) : analysis ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <div className="premium-glass p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <FileText size={12} className="text-primary" /> Executive Abstract
                                </h4>
                                <p className="text-[12px] font-bold leading-relaxed text-slate-300">
                                    {analysis.summary}
                                </p>
                            </div>

                            {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Shield size={12} className="text-primary" /> Critical Logic Points
                                    </h4>
                                    <div className="space-y-3">
                                        {analysis.keyPoints.map((point: string, i: number) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={i} 
                                                className="flex gap-4 text-[11px] font-bold text-slate-400 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-[0_0_5px_rgba(37,99,235,0.5)] group-hover:scale-125 transition-transform"></div>
                                                <span className="leading-relaxed group-hover:text-slate-200 transition-colors">{point}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Zap size={12} className="text-amber-500" /> Strategic Response
                                    </h4>
                                    <div className="space-y-3">
                                        {analysis.suggestedActions.map((action: string, i: number) => (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={i} 
                                                className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl text-[11px] font-black text-slate-300 shadow-xl uppercase tracking-widest flex items-center gap-4 group hover:border-primary/30 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                                                    <CheckCircle size={14} className="text-primary" />
                                                </div>
                                                {action}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(37,99,235,0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setAnalysis(null); }}
                                className="w-full h-14 bg-white/[0.03] border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-4 hover:bg-white/[0.06] hover:border-primary/40 shadow-2xl"
                            >
                                <RefreshCw size={18} className="animate-spin-slow" />
                                Re-calibrate Neural Engine
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                            <Shield size={48} className="text-slate-700 mb-6" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Awaiting unit assignment &bull; Command Input Required</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/cases/${file.caseId}`}>
                    <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                        <span className="material-icons-round text-sm">forum</span> Open Case Workspace
                    </button>
                </Link>
            </div>
        </aside>
    );
}
