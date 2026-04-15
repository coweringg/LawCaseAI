"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, CheckCircle2, Gavel, FolderPlus, CloudUpload, Sparkles, ArrowRight, HelpCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingClient() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated || !mounted) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-dark min-h-screen flex flex-col font-sans transition-colors duration-500 text-slate-100">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]"></div>
            </div>

            <nav className="w-full py-6 px-8 flex justify-between items-center bg-background-dark/80 backdrop-blur-md border-b border-white/5 relative z-10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Gavel size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tightest font-display">LawCaseAI</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authenticated as</p>
                        <p className="text-sm font-bold text-slate-300">{user?.email}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20 shadow-xl">
                        {user?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full premium-glass rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
                >
                    <div className="bg-primary/5 p-12 lg:p-16 text-center border-b border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-2xl mb-8 shadow-2xl shadow-emerald-500/40"
                        >
                            <CheckCircle2 size={40} />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 font-display tracking-tightest leading-tight text-balance">
                            System Access <span className="text-primary italic">Enabled.</span> <br />
                            Deploy Your First Matter.
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed text-balance">
                            Welcome to LawCaseAI. Your firm infrastructure is active. Complete these three steps to begin your high-precision analysis.
                        </p>
                    </div>

                    <div className="p-12 lg:p-16">
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                { 
                                    title: "1. Create Matter", 
                                    desc: "Initialize your workspace with case details and jurisdictional data.",
                                    icon: FolderPlus,
                                    color: "bg-blue-500/20 text-blue-400"
                                },
                                { 
                                    title: "2. Secure Upload", 
                                    desc: "Deploy discovery files and PDFs to our encrypted processing cluster.",
                                    icon: CloudUpload,
                                    color: "bg-primary/20 text-primary"
                                },
                                { 
                                    title: "3. Run Analysis", 
                                    desc: "Leverage legal-tuned intelligence to extract insights and risks.",
                                    icon: Sparkles,
                                    color: "bg-indigo-500/20 text-indigo-400"
                                }
                            ].map((step, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex flex-col items-center text-center group cursor-default"
                                >
                                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                                        <step.icon size={28} />
                                    </div>
                                    <h3 className="text-sm font-black text-white mb-3 uppercase tracking-widest">{step.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-16 flex flex-col items-center">
                            <Link href="/dashboard">
                                <button className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-16 rounded-2xl text-lg shadow-2xl shadow-primary/30 transform transition-all hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-[0.2em] text-[11px] h-16">
                                    Initialize Dashboard
                                    <ArrowRight size={18} />
                                </button>
                            </Link>
                            
                            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <a className="hover:text-primary flex items-center gap-2 transition-colors group" href="#">
                                    <Calendar size={14} className="group-hover:scale-110 transition-transform" />
                                    Schedule concierge Onboarding
                                </a>
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                                <a className="hover:text-primary flex items-center gap-2 transition-colors group" href="#">
                                    <HelpCircle size={14} className="group-hover:scale-110 transition-transform" />
                                    Security & Access Center
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] py-6 px-12 flex flex-wrap justify-center gap-10 border-t border-white/5">
                        {[
                            { icon: Shield, label: "AES-256 Active" },
                            { icon: Lock, label: "HIPAA Compliant" },
                            { icon: Shield, label: "SOC2-Ready Infrastructure" }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-400 transition-colors cursor-default">
                                <badge.icon size={14} className="text-primary/50" />
                                <span className="text-[9px] uppercase font-black tracking-[0.2em]">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 text-center text-slate-700 text-[10px] font-bold uppercase tracking-widest relative z-10">
                <p>© 2026 LawCaseAI · Dedicated Legal Infrastructure · Case Node Active</p>
            </footer>
        </div>
    );
}
