import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import TypewriterText from '@/components/TypewriterText';
import FloatingGlassCard from '@/components/ui/FloatingGlassCard';
import { Check, Star, Shield, Gavel, Zap, Users } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');

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
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <PublicLayout>
      <Head>
        <title>LawCaseAI - Enterprise AI Legal Case Management</title>
        <meta name="description" content="Professional AI-driven legal case management for US lawyers. Secure, subscription-based platform for modern law firm infrastructure." />
        <link rel="canonical" href={siteUrl} />
      </Head>

      <main className="flex-grow pt-24 font-sans text-slate-100 bg-background-dark min-h-screen relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-slow-glow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-slow-glow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-slow-glow" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 container-stitch">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="text-left"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-xl shadow-primary/5"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Professional Legal Intelligence
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 lg:mb-8 leading-[1.1] font-display"
              >
                The Standard for <br />
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
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400"
                />
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-400 max-w-xl mb-4 leading-relaxed"
              >
                AI-powered case management and document intelligence platform for US law firms. LawCaseAI provides immediate operational efficiency and secure analysis for professional legal teams.
              </motion.p>
              

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-12"
              >
                <div className="w-4 h-px bg-primary/30" />
                Secure AI infrastructure built for professional legal workflows
                <div className="w-4 h-px bg-primary/30" />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Link href="/register">
                  <button className="h-14 px-10 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-hover hover:scale-[1.03] will-change-transform transform-gpu transition-all duration-150 shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 group">
                    Subscribe Now
                    <span className="material-icons-round transition-transform duration-150 group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="h-14 px-10 text-lg font-bold text-slate-300 glass hover:bg-white/5 hover:scale-[1.03] will-change-transform transform-gpu rounded-xl transition-all duration-150 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    View Plans
                  </button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="mt-10 lg:mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-6 lg:gap-10 items-center"
              >
                <div className="flex flex-col gap-1 w-full mb-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Compliance & Trust</p>
                    <div className="h-0.5 w-12 bg-primary/30 rounded-full"></div>
                </div>
                {['SOC2-READY', 'HIPAA-READY', 'GDPR-ALIGNED'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors duration-150 cursor-default group/badge">
                    <Shield size={16} className="text-primary group-hover/badge:scale-125 transition-transform duration-150 will-change-transform transform-gpu" />
                    <span className="font-display font-black text-[11px] tracking-widest">{badge}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, transition: { duration: 1.2, ease: "easeOut", delay: 0.2 } }}
              className="relative hidden lg:block perspective-1000"
            >
              <div className="absolute -top-12 -right-12 z-20 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 12, transition: { delay: 0.8, duration: 0.8, type: "spring", stiffness: 100 } }}
                  className="relative cursor-default pointer-events-auto will-change-transform transform-gpu"
                >
                  <div className="group/badge transition-transform duration-200 hover:scale-110 hover:rotate-3 will-change-transform">
                      <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-2xl group-hover/badge:bg-primary/60 transition-colors duration-150"></div>
                      
                      <div className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white px-9 py-4 rounded-2xl shadow-[0_25px_60px_-15px_rgba(10,68,184,0.7)] border border-white/30 backdrop-blur-md overflow-hidden min-w-[140px]">
                        <motion.div 
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] z-10"
                        />
                        
                        <div className="relative z-20 flex flex-col items-center group-hover/badge:scale-105 transition-transform duration-150 will-change-transform transform-gpu">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={14} className="fill-current text-blue-200" />
                            <span className="text-3xl font-black tracking-tighter leading-none italic drop-shadow-md">FREE</span>
                          </div>
                          <div className="h-px w-full bg-white/20 mb-2"></div>
                          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-100 whitespace-nowrap">24h Case Evaluation</span>
                        </div>

                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-3xl translate-x-4 -translate-y-4"></div>
                      </div>
                      
                      <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                      </div>
                  </div>
                </motion.div>
                
                <div className="absolute top-12 right-12 w-[1px] h-12 bg-gradient-to-t from-primary/40 to-transparent -rotate-[15deg] opacity-50"></div>
              </div>

              <div className="relative z-10 rounded-[2.5rem] overflow-hidden premium-glass border-white/10 shadow-[0_0_80px_-20px_rgba(10,68,184,0.4)] aspect-[4/3] group/card">
                <div className="h-12 border-b border-white/5 bg-slate-900/50 flex items-center px-6 gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20"></div>
                  </div>
                  <div className="h-5 w-48 bg-white/5 rounded-full flex items-center px-3">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <div className="h-1 w-full bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <FloatingGlassCard delay={0.2} duration={4} yOffset={5} className="!h-auto !bg-transparent !border-0 !shadow-none !rounded-xl">
                      <div className="h-32 rounded-xl bg-white/5 border border-white/5 p-5 space-y-3 relative group-hover/inner:bg-white/10 transition-colors duration-150 transform-gpu">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary transition-transform duration-150 group-hover/inner:scale-110 will-change-transform">
                          <Gavel size={20} />
                        </div>
                        <div className="h-2 w-24 bg-white/20 rounded"></div>
                        <div className="h-5 w-12 bg-white/5 rounded"></div>
                      </div>
                    </FloatingGlassCard>
                    <FloatingGlassCard delay={0.4} duration={5} yOffset={6} className="!h-auto !bg-transparent !border-0 !shadow-none !rounded-xl">
                      <div className="h-32 rounded-xl bg-primary border border-primary/20 p-5 space-y-3 shadow-2xl shadow-primary/20 relative group-hover/inner:bg-primary-hover transition-colors duration-150 transform-gpu">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white transition-transform duration-150 group-hover/inner:scale-110 will-change-transform">
                          <Users size={20} />
                        </div>
                        <div className="h-2 w-20 bg-white/40 rounded"></div>
                        <div className="h-5 w-16 bg-white/20 rounded"></div>
                      </div>
                    </FloatingGlassCard>
                  </div>
                  <FloatingGlassCard delay={0.6} duration={6} yOffset={4} className="!h-auto !bg-transparent !border-0 !shadow-none !rounded-xl">
                    <div className="h-48 rounded-xl bg-white/5 border border-white/5 p-6 relative overflow-hidden group-hover/inner:bg-white/10 transition-colors duration-150">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-4 w-32 bg-white/10 rounded"></div>
                        <div className="h-6 w-20 bg-primary/30 rounded-full"></div>
                      </div>
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4 group/item cursor-pointer">
                            <div className="w-8 h-8 rounded bg-white/5 group-hover/item:bg-primary/20 transition-colors duration-150"></div>
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-1.5 bg-white/10 rounded w-full group-hover/item:bg-white/20 transition-colors duration-150"></div>
                              <div className="h-1.5 bg-white/5 rounded w-3/4 group-hover/item:bg-white/10 transition-colors duration-150"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FloatingGlassCard>
                </div>
              </div>

              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/30 rounded-full blur-[80px] z-0 pointer-events-none"></div>
              <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-secondary/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
            </motion.div>
          </div>
        </div>
      </main>

      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="container-stitch">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20 px-4">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 font-display tracking-tightest">
                Professional <span className="text-primary">Infrastructure</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
                Immediate access to powerful AI tools designed for high-stakes litigation and transactional law.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "AI Document Insights",
                desc: "Analyze thousands of pages instantly. AI highlights risks and contradictions in contract law.",
                icon: "psychology",
                link: "/features#insights",
                color: "from-blue-500/20 to-transparent"
              },
              {
                title: "Legal Research Assistant",
                desc: "Technical analysis across extensive jurisprudence. Identify precedents with precision and speed.",
                icon: "gavel",
                link: "/features#research",
                color: "from-primary/20 to-transparent"
              },
              {
                title: "Automated Chronology",
                desc: "Auto-extract dates from scattered documents to build complete case timelines instantly.",
                icon: "event_repeat",
                link: "/features#chronology",
                color: "from-indigo-500/20 to-transparent"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }}
                viewport={{ once: true }}
                className="will-change-transform"
              >
                  <div className="group relative p-10 bg-white/[0.02] premium-border rounded-[2.5rem] border border-white/5 transition-all duration-200 backdrop-blur-sm shadow-2xl overflow-hidden hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(30,58,138,0.2)] will-change-transform transform-gpu">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_30px_rgba(10,68,184,0.5)] will-change-transform transform-gpu">
                        <span className="material-icons-round text-3xl font-bold">{feature.icon}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 font-display tracking-tight">{feature.title}</h3>
                        <p className="text-slate-400 leading-relaxed mb-8 font-medium">{feature.desc}</p>
                        <Link href={feature.link} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group/link">
                        Explore Feature <span className="material-icons-round text-sm transition-transform duration-200 group-hover/link:translate-x-2 will-change-transform transform-gpu">arrow_forward</span>
                        </Link>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-background-dark/50 relative border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.02]"></div>
        <div className="container-stitch relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight">Trusted Infrastructure for <span className="text-primary">Legal Teams</span></h2>
            <p className="text-lg text-slate-400 font-medium">Built to meet the rigorous security and compliance standards of modern US law firms.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "SOC2 Type II Ready",
                desc: "Our systems are designed to comply with rigorous security, availability, and confidentiality standards.",
                icon: Shield
              },
              {
                title: "HIPAA Compliant",
                desc: "Secure handling of sensitive client data and health information with full encryption end-to-end.",
                icon: Shield
              },
              {
                title: "GDPR Aligned",
                desc: "Strict data privacy controls and sovereignty for international legal professionals and clients.",
                icon: Shield
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }}
                viewport={{ once: true }}
              >
                <div className="p-10 premium-glass rounded-[2rem] border border-white/5 h-full hover:bg-white/[0.04] transition-all duration-300 group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <item.icon size={24} />
                    </div>
                    <h3 className="text-white font-black text-lg mb-4 uppercase tracking-widest">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 relative overflow-hidden flex-grow-0">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="relative z-10 container-stitch text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto premium-glass p-8 sm:p-12 lg:p-16 rounded-2xl lg:rounded-[3rem] border border-white/10 shadow-2xl relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/50">
                <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-white mb-8 font-display tracking-tightest leading-tight">
                Ready to Upgrade your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Legal Intelligence?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Secure your firm&apos;s competitive edge with the most advanced AI case management system on the market. Trusted by industry leaders.
            </p>
            <Link href="/register">
              <button className="h-16 px-16 bg-primary text-white font-black rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:scale-[1.03] hover:bg-primary-hover transition-all duration-150 text-xl uppercase tracking-widest will-change-transform transform-gpu">
                Get Started Now
              </button>
            </Link>
            <div className="mt-12 flex items-center justify-center gap-6">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                            <Users size={18} className="text-slate-500" />
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black">
                    Early access for US Law Firms
                </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
