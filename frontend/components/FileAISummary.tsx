import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileAISummaryProps {
    file: any;
    onClose: () => void;
}

export default function FileAISummary({ file, onClose }: FileAISummaryProps) {
    const { token } = useAuth();
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const analyzeFile = async () => {
            if (!file?._id || !token) return;
            setIsAnalyzing(true);
            setAnalysis(null);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/analyze/${file._id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
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
    }, [file?._id, token]);

    if (!file) return null;

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <aside className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black text-slate-900 dark:text-white">Selected Document</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                        <span className="material-icons-round text-slate-400">close</span>
                    </button>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className={`w-16 h-20 rounded flex items-center justify-center flex-shrink-0 ${file.type.includes('pdf') ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        <span className={`material-icons-round text-3xl ${file.type.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`}>description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 uppercase">{file.type.split('/').pop()} • {formatSize(file.size)}</p>
                        <div className="flex gap-2 mt-2">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline uppercase">Preview</a>
                            <span className="text-slate-300">•</span>
                            <a href={file.url} download className="text-[10px] font-bold text-primary hover:underline uppercase">Download</a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Uploaded On</p>
                        <p className="text-slate-700 dark:text-slate-200">{new Date(file.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Status</p>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <p className="text-slate-700 dark:text-slate-200">{isAnalyzing ? 'Analyzing...' : 'Ready'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Section */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary text-lg">auto_awesome</span>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Summary</h2>
                    </div>
                    {analysis && <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase">Analysis Complete</span>}
                </div>

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-xs text-slate-500">Processing document for legal insights...</p>
                    </div>
                ) : analysis ? (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                                <span className="material-icons-round text-xs">short_text</span> Executive Summary
                            </h4>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                {analysis.summary}
                            </p>
                        </div>

                        {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1 text-primary">
                                    <span className="material-icons-round text-xs">list</span> Key Points
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.keyPoints.map((point: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                                    <span className="material-icons-round text-xs">assignment</span> Suggested Actions
                                </h4>
                                <div className="space-y-2">
                                    {analysis.suggestedActions.map((action: string, i: number) => (
                                        <div key={i} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { setAnalysis(null); /* Re-trigger useEffect via some state if needed, but here simple reset works if we add a 'refresh' dependency or just call analyzeFile again */ }}
                            className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-sm">refresh</span> Regenerate Insights
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xs text-slate-400 italic">Select a document to begin AI analysis.</p>
                    </div>
                )}
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
