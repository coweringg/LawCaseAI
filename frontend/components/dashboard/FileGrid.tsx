import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, File, FileSpreadsheet, Play, Check, Star, Headphones, Video } from 'lucide-react';
import { format } from 'date-fns';

interface FileGridProps {
    files: any[];
    onFileSelect: (file: any) => void;
    onToggleStar: (file: any) => void;
    selectedFileId?: string;
}

export default function FileGrid({ files, onFileSelect, onToggleStar, selectedFileId }: FileGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {files.map((file, idx) => (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={file._id}
                    onClick={() => onFileSelect(file)}
                    className={`group relative flex flex-col premium-glass border rounded-[2rem] p-6 cursor-pointer transition-all duration-500 overflow-hidden shadow-2xl ${
                        selectedFileId === file._id 
                        ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/[0.03]' 
                        : 'border-white/10 hover:border-primary/40 hover:bg-white/[0.04]'
                    }`}
                >
                    
                    <div className={`aspect-[4/3] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-500 group-hover:scale-105 ${
                        selectedFileId === file._id ? 'bg-primary/10 shadow-inner' : 'bg-white/[0.02] border border-white/5'
                    }`}>
                        <div className={`absolute inset-0 bg-current opacity-0 blur-2xl group-hover:opacity-10 transition-opacity ${
                            file.type.includes('pdf') ? 'text-red-500' : 
                            file.type.includes('word') ? 'text-blue-500' : 
                            file.type.includes('audio') ? 'text-amber-500' :
                            file.type.includes('video') ? 'text-purple-500' :
                            'text-slate-500'
                        }`}></div>
                        
                        <div className="relative z-10 scale-125">
                            {file.type.includes('pdf') ? <FileText size={48} className="text-red-500/80" /> : 
                             file.type.includes('word') ? <File size={48} className="text-blue-500/80" /> : 
                             file.type.includes('sheet') ? <FileSpreadsheet size={48} className="text-emerald-500/80" /> :
                             file.type.includes('audio') ? <Headphones size={48} className="text-amber-500/80" /> :
                             file.type.includes('video') ? <Video size={48} className="text-purple-500/80" /> :
                             file.type.includes('image') ? <ImageIcon size={48} className="text-emerald-500/80" /> :
                             <File size={48} className="text-slate-500/80" />}
                        </div>

                        {selectedFileId === file._id && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg border border-white/20"
                            >
                                <Check size={16} className="text-white" />
                            </motion.div>
                        )}
                    </div>

                    <div className="flex flex-col relative z-10">
                        <div className="flex items-center justify-between gap-2 overflow-hidden mb-1">
                            <span className="text-[13px] font-black text-white truncate tracking-tightest group-hover:text-primary transition-colors" title={file.name}>
                                {file.name}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={(e) => { e.stopPropagation(); onToggleStar(file); }}
                                className={`p-1.5 rounded-lg transition-all flex-none ${file.isStarred ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white/5'}`}
                            >
                                <Star size={14} fill={file.isStarred ? "currentColor" : "none"} />
                            </motion.button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {file.type.split('/').pop()}
                            </span>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                                {new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}

        </div>
    );
}
