import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Puzzle, 
  Loader2, 
  BookOpen,
  ChevronRight,
  BrainCircuit,
  Zap,
  Layers,
  Search
} from 'lucide-react';
import api from '@/utils/api';

interface GlobalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalAuditModal: React.FC<GlobalAuditModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    strategicInsights: string[];
    identifiedPatterns: string[];
    riskVectors: string[];
    isEmpty: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleAudit();
    }
  }, [isOpen]);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/global-audit');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 lg:p-10 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto shadow-primary/10"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 crystallography-pattern opacity-[0.05] pointer-events-none" />

        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
              <BrainCircuit className="text-primary animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase">Deep Audit Command</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Global Intelligence Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative mb-8">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={20} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Intelligence Active</h3>
                <div className="max-w-md space-y-3">
                  <p className="text-slate-400 text-sm animate-pulse">Scanning cross-case cross-case vectors...</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Constructing semantic relationship matrix</p>
                </div>
                
                {/* Simulated progress bars */}
                <div className="w-full max-w-xs mt-10 space-y-4">
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-1/2 h-full bg-primary"
                      />
                   </div>
                </div>
              </motion.div>
            ) : data?.isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex items-center gap-5">
                   <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                      <ShieldAlert className="text-red-500" size={28} />
                   </div>
                   <div>
                      <h4 className="text-white font-black uppercase text-sm tracking-wider">Insufficient Data</h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">System cannot execute deep audit. You don&apos;t have enough active cases or documents in the platform to initialize the neural processing layer.</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-white font-black text-lg uppercase tracking-widest flex items-center gap-3">
                    <BookOpen size={20} className="text-primary" />
                    How to initialize audit
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="premium-glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="text-3xl font-black text-primary/20 absolute -right-2 -top-2 group-hover:text-primary/40 transition-colors">01</div>
                      <Layers className="text-primary mb-4" size={24} />
                      <h5 className="text-white font-bold text-sm mb-2">Create Cases</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-bold">Register at least 2 active legal cases to compare.</p>
                    </div>
                    
                    <div className="premium-glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="text-3xl font-black text-primary/20 absolute -right-2 -top-2 group-hover:text-primary/40 transition-colors">02</div>
                      <Zap className="text-amber-400 mb-4" size={24} />
                      <h5 className="text-white font-bold text-sm mb-2">Inject Docs</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-bold">Upload jurisprudence or contracts into your cases.</p>
                    </div>

                    <div className="premium-glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="text-3xl font-black text-primary/20 absolute -right-2 -top-2 group-hover:text-primary/40 transition-colors">03</div>
                      <Search className="text-emerald-400 mb-4" size={24} />
                      <h5 className="text-white font-bold text-sm mb-2">Execute Audit</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-bold">Click deep audit to find cross-case insights.</p>
                    </div>
                  </div>

                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                  >
                    Enter Registry to Begin
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pb-10"
              >
                {/* Insights Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-emerald-400" size={20} />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Strategic Insights</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.strategicInsights.map((insight, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 hover:border-emerald-500/40 transition-all"
                      >
                         <div className="w-1.5 h-full rounded-full bg-emerald-500 mt-1 shrink-0" />
                         <p className="text-[13px] text-white/90 leading-relaxed font-medium">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Patterns Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Puzzle className="text-primary" size={20} />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Identified Patterns</h3>
                  </div>
                  <div className="space-y-4">
                    {data?.identifiedPatterns.map((pattern, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        key={i}
                        className="p-5 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 transition-colors"
                      >
                         <div className="flex items-center gap-3 mb-2">
                            <Layers className="text-primary" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">Correlation Found</span>
                         </div>
                         <p className="text-[13px] text-white/90 leading-relaxed">{pattern}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Risks Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="text-red-500" size={20} />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Risk Vectors</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.riskVectors.map((risk, i) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        key={i}
                        className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl hover:border-red-500/40 transition-all"
                      >
                         <p className="text-[13px] text-red-200/90 leading-relaxed font-medium">
                            <span className="text-red-500 mr-2">●</span>
                            {risk}
                         </p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-5 bg-slate-950/50 border-t border-white/5 flex items-center justify-between relative z-10">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Real-time Analysis active</span>
           </div>
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">LawCaseAI Neural Core v4.0.2</p>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalAuditModal;
