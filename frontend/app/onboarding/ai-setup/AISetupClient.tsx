"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gavel, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Globe, 
  Loader2,
  Cpu,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AISetupContent() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 1500);
        const timer2 = setTimeout(() => setStep(2), 3500);
        const timer3 = setTimeout(() => setStep(3), 5500);
        const timer4 = setTimeout(() => router.push('/dashboard'), 7500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [router]);

    const steps = [
        {
            title: "Security & Encryption",
            desc: "Establishing end-to-end encrypted instance",
            icon: <Lock size={18} />
        },
        {
            title: "Neural Contextualization",
            desc: "Mapping case entities and legal precedents",
            icon: <Brain size={18} />
        },
        {
            title: "Intelligence Indexing",
            desc: "Preparing workspace for expert discovery",
            icon: <Cpu size={18} />
        }
    ];

    return (
        <div className="bg-[#05060a] font-display min-h-screen flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>

            <header className="w-full py-6 px-10 flex justify-between items-center border-b border-white/5 relative z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                        <span className="material-icons-round text-white">gavel</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tightest">LawCase<span className="text-primary">AI</span></span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 3 ? 'w-8 bg-primary shadow-[0_0_10px_rgba(13,89,242,0.5)]' : 'w-2 bg-white/10'}`}></div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-2">Protocol Step 03</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full"
                >
                    <div className="premium-glass rounded-[3rem] border border-white/10 shadow-3xl p-12 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                        
                        <div className="relative flex justify-center mb-10">
                            <div className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center relative">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-t-2 border-primary rounded-full"
                                />
                                <Sparkles className="text-primary w-10 h-10 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-12">
                            <h1 className="text-3xl font-black text-white tracking-tightest leading-tight">Initializing Deep <span className="text-primary italic">Intelligence</span></h1>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/20">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(13,89,242,1)]"></span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Environment: Unified Counsel</span>
                            </div>
                        </div>

                        <div className="max-w-xs mx-auto text-left space-y-6">
                            {steps.map((s, idx) => {
                                const active = step >= idx + 1;
                                const completed = step > idx + 1;

                                return (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: active ? 1 : 0.2, x: 0 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="mt-1">
                                            {completed ? (
                                                <div className="w-5 h-5 flex items-center justify-center text-primary">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            ) : active ? (
                                                <div className="w-5 h-5 flex items-center justify-center">
                                                    <Loader2 size={18} className="text-primary animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                                                    {s.icon}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-slate-500'}`}>{s.title}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">{s.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-center gap-3 text-slate-600">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <p className="text-[10px] uppercase font-black tracking-[0.3em]">Quantum-Ready Encryption Protocol</p>
                            </div>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-3 italic animate-pulse">Syncing matrix filters... Do not disconnect.</p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="w-full py-8 px-10 border-t border-white/5 relative z-10 bg-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 LawCaseAI Systems Inc. • Professional Intelligence</p>
                    <div className="flex gap-8">
                        {['Security', 'Privacy', 'Network'].map(item => (
                            <a key={item} href="#" className="text-[10px] font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.2em]">{item}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function AISetupClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary h-12 w-12" />
            </div>
        }>
            <AISetupClientContent />
        </Suspense>
    );
}

function AISetupClientContent() {
    return <AISetupContent />;
}
