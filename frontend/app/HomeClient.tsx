"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import TypewriterText from '@/components/ui/TypewriterText';
import MonolithLogo from '@/components/ui/MonolithLogo';
import { Shield, Gavel, FileText, Zap, CheckCircle2 } from 'lucide-react';

export default function HomeClient() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <PublicLayout>
      <main className="flex-grow bg-background-dark min-h-screen relative overflow-hidden font-sans text-slate-100 selection:bg-primary/30">
        
        <div className="absolute inset-0 micro-grid z-0"></div>
        <div className="hero-glow"></div>

        <section className="relative pt-28 px-8 overflow-hidden pb-0 min-h-screen flex flex-col">
          <div className="absolute inset-0 micro-grid pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1200px] hero-glow pointer-events-none blur-[100px]"></div>
          
          <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto text-center relative z-10 py-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm self-center mx-auto"
            >
              <span className="material-symbols-outlined text-amber-400 text-[14px]">shield</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Secure Legal Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.05]"
            >
              The Standard for<br/>
              <span className="block text-primary min-h-[2.2em] lg:min-h-[1.1em]">
                <TypewriterText
                  phrases={[
                    'AI-Driven Legal Practice',
                    'Intelligent Case Management',
                    'Smart Document Analysis',
                    'Automated Legal Research',
                  ]}
                  typingSpeed={70}
                  deletingSpeed={35}
                  pauseDuration={2500}
                />
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/50 text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
            >
              AI-powered case management and document intelligence platform for US law firms. 
              Immediate operational efficiency and secure analysis for professional legal teams.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/register" className="bg-primary text-background-dark px-8 py-3 rounded-lg font-bold text-sm hover:brightness-110 hover:shadow-[0_0_40px_-5px_rgba(0,230,118,0.6)] transition-all duration-300">
                Start Free Trial
              </Link>
              <Link href="/pricing" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300">
                View Plans
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-5xl mx-auto perspective-container shrink-0 mt-auto"
          >
            <div className="dashboard-3d relative group rounded-t-2xl rounded-b-none border-b-0">
              <div className="absolute -inset-20 bg-primary/10 blur-[180px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>
              <div className="glass-panel rounded-t-2xl rounded-b-none overflow-hidden p-[1px] relative border-b-0">
                <div className="specular-highlight rounded-t-2xl rounded-b-none"></div>
                <div className="bg-[#080808]/98 rounded-t-xl rounded-b-none overflow-hidden flex flex-col md:flex-row h-auto md:h-[420px]">

                  <div className="hidden md:flex w-56 border-r border-white/5 p-5 flex-col gap-6 bg-black/60 relative">
                    <div className="absolute inset-0 micro-grid opacity-10 pointer-events-none"></div>
                    <div className="flex items-center gap-2.5 relative z-10">
                      <MonolithLogo size={24} glowIntensity="sm" />
                      <span className="font-bold tracking-tight text-sm text-white">LawCase<span className="text-primary">AI</span></span>
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      {[
                        { icon: 'dashboard', label: 'Dashboard', active: true },
                        { icon: 'folder_open', label: 'My Cases', active: false },
                        { icon: 'menu_book', label: 'Legal Library', active: false },
                        { icon: 'calendar_today', label: 'Calendar', active: false },
                        { icon: 'settings', label: 'Settings', active: false },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          item.active 
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,230,118,0.08)]' 
                            : 'text-slate-600 hover:text-slate-400'
                        }`}>
                          <span className="material-icons-round text-[16px]">{item.icon}</span>
                          <span>{item.label}</span>
                          {item.active && <div className="absolute left-0 w-0.5 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(0,230,118,0.6)]"></div>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto relative z-10">
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Plan Usage</span>
                          <span className="text-[8px] font-bold text-primary">67%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '67%' }} 
                            transition={{ duration: 2, delay: 1.2, ease: 'easeOut' }}
                            className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(0,230,118,0.5)]"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-3 sm:p-5 flex flex-col overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-tight">Operational Command</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(0,230,118,0.8)]"></span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Counsel Status • Active Layer</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                          <span className="material-icons-round text-[14px]">search</span>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                          <span className="material-icons-round text-[14px]">notifications</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-primary text-background-dark text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                          <span className="material-icons-round text-[12px]">add</span>
                          New Case
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      {[
                        { label: 'Active Cases', value: '24', change: '+3', icon: 'folder_open', color: 'primary' },
                        { label: 'Documents', value: '1,847', change: '+127', icon: 'description', color: 'primary' },
                        { label: 'AI Queries', value: '12.4k', change: '+2.1k', icon: 'psychology', color: 'primary' },
                        { label: 'Win Rate', value: '94%', change: '+6%', icon: 'trending_up', color: 'primary' },
                      ].map((stat, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-3 group/card hover:border-primary/20 transition-all relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                              <span className="material-icons-round text-[12px] text-slate-600">{stat.icon}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-white tracking-tight">{stat.value}</span>
                              <span className="text-[8px] font-bold text-primary">{stat.change}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 min-h-0 pb-4 md:pb-0">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                        className="col-span-1 md:col-span-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 relative overflow-hidden min-h-[120px] md:min-h-0"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Case Resolution Velocity</span>
                          <div className="flex gap-1">
                            {['7D', '30D', '90D'].map((period, i) => (
                              <span key={i} className={`text-[7px] font-bold px-2 py-0.5 rounded ${i === 1 ? 'bg-primary/20 text-primary' : 'text-slate-600'}`}>{period}</span>
                            ))}
                          </div>
                        </div>
                        <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00e676" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#00e676" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <motion.path 
                            d="M0,90 C30,85 60,70 100,60 C140,50 160,65 200,45 C240,25 270,35 300,20 C330,10 360,15 400,5"
                            fill="none" 
                            stroke="#00e676" 
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.5, ease: 'easeInOut' }}
                            filter="drop-shadow(0 0 6px rgba(0,230,118,0.4))"
                          />
                          <motion.path 
                            d="M0,90 C30,85 60,70 100,60 C140,50 160,65 200,45 C240,25 270,35 300,20 C330,10 360,15 400,5 L400,120 L0,120 Z"
                            fill="url(#chartGradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 2.5 }}
                          />
                          {[30, 60, 90].map(y => (
                            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeOpacity="0.03" strokeDasharray="4 4"/>
                          ))}
                        </svg>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="col-span-1 md:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col"
                      >
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Activity</span>
                        <div className="space-y-2 flex-1">
                          {[
                            { title: 'Williams v. TechCorp', status: 'AI Analysis Complete', time: '2m ago', dot: 'bg-primary' },
                            { title: 'Martinez Settlement', status: 'Document Uploaded', time: '15m ago', dot: 'bg-primary' },
                            { title: 'Chen IP Dispute', status: 'Deadline Approaching', time: '1h ago', dot: 'bg-amber-500' },
                            { title: 'Federal Brief #847', status: 'Review Pending', time: '3h ago', dot: 'bg-slate-500' },
                          ].map((item, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.8 + i * 0.15, duration: 0.4 }}
                              className="flex items-center gap-2 py-1.5 border-b border-white/[0.03] last:border-0"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dot} ${i === 0 ? 'animate-pulse shadow-[0_0_6px_rgba(0,230,118,0.6)]' : ''}`}></span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-white truncate">{item.title}</p>
                                <p className="text-[7px] text-slate-600 font-bold uppercase tracking-wider">{item.status}</p>
                              </div>
                              <span className="text-[7px] text-slate-600 font-bold whitespace-nowrap">{item.time}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>


        <section className="py-24 relative z-10 border-t border-white/5 bg-background-dark/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-4 font-display">
                Professional <span className="text-primary">Infrastructure</span>
              </h2>
              <p className="text-slate-400 max-w-2xl">
                Immediate access to powerful AI tools designed for high-stakes litigation and transactional law.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "AI Document Insights",
                  desc: "Analyze thousands of pages instantly. AI highlights risks and contradictions in contract law.",
                  icon: FileText
                },
                {
                  title: "Legal Research Assistant",
                  desc: "Technical analysis across extensive jurisprudence. Identify precedents with precision and speed.",
                  icon: Gavel
                },
                {
                  title: "Automated Chronology",
                  desc: "Auto-extract dates from scattered documents to build complete case timelines instantly.",
                  icon: Zap
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-panel p-8 rounded-xl hover:border-primary/50 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 font-display text-white">
                Trusted by <span className="scalability-gradient">Legal Teams</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Built to meet the rigorous security and compliance standards of modern US law firms.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { title: "SOC2 Type II Ready", desc: "Rigorous security, availability, and confidentiality standards." },
                { title: "HIPAA Compliant", desc: "Secure handling of sensitive client data and health information." },
                { title: "GDPR Aligned", desc: "Strict data privacy controls and sovereignty for international professionals." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center text-center p-6"
                >
                  <Shield className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        <section className="py-24 relative z-10 border-t border-white/5">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">
              Ready to Upgrade your <br/>
              <span className="text-primary">Legal Intelligence?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Secure your firm&apos;s competitive edge with the most advanced AI case management system on the market.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-background-dark bg-primary rounded hover:bg-white transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(0,230,118,0.3)]">
              Get Started Now
            </Link>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <CheckCircle2 size={16} className="text-primary" />
              <span>Early access for US Law Firms</span>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
