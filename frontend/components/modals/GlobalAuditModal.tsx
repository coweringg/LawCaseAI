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
import api from '@/lib/api';

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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[60px] pointer-events-auto overflow-hidden"
      >
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[80vh] bg-[#0c1117] border border-white/10 rounded-[2rem] shadow-[0_20px_100px_-15px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col pointer-events-auto backdrop-blur-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 micro-grid opacity-[0.05] pointer-events-none" />
        
        <div className="absolute -right-32 -top-32 w-[25rem] h-[25rem] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-32 -bottom-32 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <BrainCircuit className="animate-pulse" size={28} />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">Deep Audit Command</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                </span>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">Intelligence Layer Active</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-500 text-slate-400 border border-white/10 hover:border-emerald-500/50 shadow-xl group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="relative mb-10 scale-125">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                  <Loader2 className="w-20 h-20 text-emerald-500 animate-spin relative z-10" />
                  <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-bounce z-20" size={28} />
                </div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tightest uppercase">Initializing Intelligence</h3>
                <div className="max-w-md space-y-4">
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest animate-pulse">Scanning cross-case vectors...</p>
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">Constructing semantic relationship matrix</p>
                </div>
                
                <div className="w-full max-w-sm mt-12 space-y-4">
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                      />
                   </div>
                </div>
              </motion.div>
            ) : data?.isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="premium-glass bg-[#121820]/40 border border-rose-500/30 rounded-2xl p-6 mb-10 flex items-start gap-6 relative overflow-hidden group shadow-[0_0_40px_rgba(244,63,94,0.05)]">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50" />
                   <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 shadow-inner">
                      <ShieldAlert className="text-rose-500" size={24} />
                   </div>
                   <div className="relative z-10">
                      <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1.5">Insufficient Intelligence Data</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-bold">
                        The neural processing layer requires a larger dataset to execute a deep audit. 
                        Please ensure you have at least 2 cases and synchronized case documentation to initialize the audit matrix.
                      </p>
                   </div>
                </div>

                <div className="space-y-10">
                  <h3 className="text-white font-black text-xl uppercase tracking-[0.3em] flex items-center gap-4">
                    <BookOpen size={24} className="text-emerald-500" />
                    Protocol for Initialization
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="premium-glass p-7 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent pointer-events-none" />
                      <div className="text-4xl font-black text-sky-500/10 absolute right-4 top-4 group-hover:text-sky-500/30 transition-colors">01</div>
                      <Layers className="text-sky-400 mb-6 relative z-10" size={32} />
                      <h5 className="text-white font-black text-sm uppercase tracking-widest mb-3 relative z-10">Create Cases</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-black tracking-wider relative z-10">Register at least 2 active cases to begin comparison.</p>
                    </div>
                    
                    <div className="premium-glass p-7 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                      <div className="text-4xl font-black text-amber-500/10 absolute right-4 top-4 group-hover:text-amber-500/30 transition-colors">02</div>
                      <Zap className="text-amber-400 mb-6 relative z-10" size={32} />
                      <h5 className="text-white font-black text-sm uppercase tracking-widest mb-3 relative z-10">Inject Docs</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-black tracking-wider relative z-10">Upload jurisprudence into the case management layer.</p>
                    </div>

                    <div className="premium-glass p-7 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-fuchsia-500/30 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-transparent pointer-events-none" />
                      <div className="text-4xl font-black text-fuchsia-500/10 absolute right-4 top-4 group-hover:text-fuchsia-500/30 transition-colors">03</div>
                      <Search className="text-fuchsia-400 mb-6 relative z-10" size={32} />
                      <h5 className="text-white font-black text-sm uppercase tracking-widest mb-3 relative z-10">Execute Audit</h5>
                      <p className="text-slate-500 text-[10px] uppercase leading-relaxed font-black tracking-wider relative z-10">Initialize the neural audit to find cross-case insights.</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="w-full py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl hover:shadow-emerald-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-3"
                    >
                      Enter Registry to Begin
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pb-10"
              >
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

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="text-rose-500" size={20} />
                    <h3 className="text-white font-black uppercase tracking-widest text-sm">Risk Vectors</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.riskVectors.map((risk, i) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        key={i}
                        className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl hover:border-rose-500/40 transition-all"
                      >
                         <p className="text-[13px] text-rose-200/90 leading-relaxed font-medium">
                            <span className="text-rose-500 mr-2">• </span>
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
