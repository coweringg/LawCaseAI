"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  Loader2,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isAuthLoading) return (
    <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
    </div>
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    }
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-white flex flex-col font-display selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="w-full py-8 px-8 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary/20 border border-white/10">
            <span className="material-icons-round text-white text-2xl">gavel</span>
          </div>
          <span className="text-2xl font-black tracking-tightest">LawCase<span className="text-primary">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Support Priority • Global Compliance</span>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
             <Globe size={14} />
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10 py-12 lg:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl w-full"
        >
          <div className="premium-glass rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-indigo-500"></div>
            
            <div className="p-12 md:p-16 flex flex-col items-center text-center">
              <motion.div 
                variants={itemVariants}
                className="mb-8 relative"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full scale-[2.5] blur-3xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/20 ring-4 ring-primary/5">
                  <CheckCircle2 size={48} className="text-primary" />
                </div>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tightest leading-tight"
              >
                Intelligence Layer <span className="text-primary italic">Activated</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto font-medium"
              >
                Welcome to LawCaseAI, <span className="text-white font-bold">{user?.name || 'Counsel'}</span>. 
                Your {user?.plan || 'Professional'} subscription has been successfully provisioned.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="w-full mt-12 p-8 bg-black/40 rounded-[2rem] border border-white/5 relative group transition-all hover:border-primary/20"
              >
                <div className="absolute top-4 right-6 opacity-20">
                   <ShieldCheck size={40} className="text-primary" />
                </div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 text-left">Internal Transaction Receipt</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center group/row">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Access Protocol</span>
                    <span className="text-sm font-mono font-medium text-white px-2 py-0.5 rounded bg-white/5 border border-white/5">#{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active License</span>
                    <span className="text-sm font-black text-white uppercase tracking-tightest">{user?.plan || 'Standard'} • {user?.billingInterval || 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Neural Units</span>
                    <span className="text-sm font-black text-emerald-400">UNLIMITED OPS</span>
                  </div>
                  <div className="pt-5 mt-2 border-t border-white/5 flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Status</span>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Deployed</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="w-full flex flex-col sm:flex-row gap-4 mt-12"
              >
                <Link 
                  href="/dashboard" 
                  className="flex-1 bg-primary text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] text-[11px] uppercase tracking-[0.2em] group"
                >
                  Enter Command Center
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] group active:scale-[0.98]">
                  <Download size={18} className="text-primary group-hover:-translate-y-0.5 transition-transform" />
                  View History
                </button>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="mt-12 flex items-center justify-center gap-6"
              >
                 <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Priority Support Enabled</span>
                 </div>
                 <span className="text-slate-800">•</span>
                 <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary transition-colors">Documentation</span>
                    <ExternalLink size={12} className="text-slate-700" />
                 </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 px-8 text-center relative z-10">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 LawCaseAI Systems • Secure Legal Computing</p>
        <div className="flex justify-center gap-6 mt-4 opacity-40 hover:opacity-100 transition-opacity">
          {['Privacy', 'Service', 'Compliance'].map(item => (
            <a key={item} href="#" className="text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors">{item} Protocol</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function SuccessClient() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
         <Loader2 className="animate-spin text-primary h-12 w-12" />
       </div>
    }>
      <SuccessClientContent />
    </Suspense>
  )
}

function SuccessClientContent() {
    return <SuccessContent />;
}
