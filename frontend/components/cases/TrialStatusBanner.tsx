import React from 'react';
import { Clock, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrialStatusBannerProps {
  hoursRemaining: number;
  docsCount: number;
  maxDocs: number;
}

export const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({ 
  hoursRemaining, 
  docsCount, 
  maxDocs 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-primary/20 via-blue-500/10 to-transparent backdrop-blur-md border-b border-primary/20 py-3 px-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(10,68,184,0.3)] anim-pulse">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Trial Access Active</span>
            <span className="text-white font-bold text-xs tracking-tight">Time Remaining: <span className="text-primary font-black ml-1">{hoursRemaining}h</span></span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Workspace Capacity</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs">{docsCount} / {maxDocs}</span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Files</span>
              </div>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(docsCount / maxDocs) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
               <Zap size={16} fill="currentColor" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">AI Intelligence</span>
               <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Evaluation Credits Active</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
