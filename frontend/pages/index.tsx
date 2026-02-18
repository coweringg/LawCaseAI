import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Star, Shield, Gavel, Zap, Users } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
        <meta name="description" content="Professional AI-driven legal case management for US lawyers. Secure, subscription-based platform for modern law firms." />
      </Head>

      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background-dark py-20">
        {/* Crystallography Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 rotate-12"></div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -5, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"
          ></motion.div>
        </div>

        <div className="relative z-10 container-stitch">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1] font-display"
              >
                The Standard for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">
                  AI-Driven Legal Practice
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed"
              >
                Empower your firm with elite case management and document automation. LawCaseAI provides immediate operational efficiency for professional US law firms.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Link href="/register">
                  <button className="h-14 px-10 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 group">
                    Subscribe Now
                    <span className="material-icons-round transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="h-14 px-10 text-lg font-bold text-slate-300 glass hover:bg-white/5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    View Plans
                  </button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-8 items-center"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 w-full mb-2">Compliance & Security</p>
                <div className="flex items-center gap-2 text-slate-400 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all font-display font-medium text-sm">
                  <Shield size={16} className="text-primary" /> SOC2 TYPE II
                </div>
                <div className="flex items-center gap-2 text-slate-400 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all font-display font-medium text-sm">
                  <Shield size={16} className="text-primary" /> HIPAA
                </div>
                <div className="flex items-center gap-2 text-slate-400 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all font-display font-medium text-sm">
                  <Shield size={16} className="text-primary" /> GDPR
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden glass border-white/10 shadow-[0_0_100px_rgba(10,68,184,0.3)] aspect-[4/3]">
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
                    <div className="h-32 rounded-xl bg-white/5 border border-white/5 p-5 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Gavel size={20} />
                      </div>
                      <div className="h-2 w-24 bg-white/20 rounded"></div>
                      <div className="h-5 w-12 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-32 rounded-xl bg-primary border border-primary/20 p-5 space-y-3 shadow-2xl shadow-primary/20">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                        <Users size={20} />
                      </div>
                      <div className="h-2 w-20 bg-white/40 rounded"></div>
                      <div className="h-5 w-16 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="h-48 rounded-xl bg-white/5 border border-white/5 p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-4 w-32 bg-white/10 rounded"></div>
                      <div className="h-6 w-20 bg-primary/30 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded bg-white/5"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-1.5 bg-white/10 rounded w-full"></div>
                            <div className="h-1.5 bg-white/5 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-[60px] z-0"></div>
              <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview (Points to the new Features page) */}
      <section className="py-24 bg-slate-50 dark:bg-[#0d121d] relative">
        <div className="container-stitch">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-display">Professional Infrastructure</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Immediate access to powerful AI tools designed for high-stakes litigation and transactional law.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Document Insights",
                desc: "Analyze thousands of pages instantly. AI highlights risks and contradictions in contract law.",
                icon: "psychology",
                link: "/features#insights"
              },
              {
                title: "Legal Research Assistant",
                desc: "Search jurisprudence across millions of records. Find precedents in seconds, not hours.",
                icon: "gavel",
                link: "/features#research"
              },
              {
                title: "Automated Chronology",
                desc: "Auto-extract dates from scattered documents to build complete case timelines instantly.",
                icon: "event_repeat",
                link: "/features#chronology"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="group p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 transition-colors group-hover:bg-primary group-hover:text-white">
                  <span className="material-icons-round text-3xl font-bold">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-display">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{feature.desc}</p>
                <Link href={feature.link} className="text-primary font-bold text-sm flex items-center gap-1 group/link">
                  Learn more <span className="material-icons-round text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-background-dark border-y border-slate-100 dark:border-white/5">
        <div className="container-stitch">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 font-display">Trusted by Elite Partners</h2>
            <div className="flex justify-center gap-1 text-primary">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "LawCaseAI transformed our discovery process. What used to take junior associates weeks now takes minutes with higher accuracy.",
                author: "Senior Partner",
                firm: "Top-Tier NYC Litigation Firm"
              },
              {
                text: "The security architecture is what sold us. Professional standards for zero-knowledge data management are non-negotiable for us.",
                author: "Head of Operations",
                firm: "International Transactional Law"
              },
              {
                text: "Finally, an AI tool that actually understands the nuances of US case law rather than just generating generic summaries.",
                author: "Lead Counsel",
                firm: "Federal Practice Group"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 glass rounded-2xl border border-slate-100 dark:border-white/5 italic text-slate-600 dark:text-slate-400 flex flex-col justify-between">
                <p className="mb-6 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-primary/10 not-italic"></span>
                  {t.text}
                </p>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold not-italic text-sm">{t.author}</p>
                  <p className="text-primary font-medium not-italic text-xs uppercase tracking-wider">{t.firm}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Comparison Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#0d121d]">
        <div className="container-stitch">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 font-display">Choose Your Edge</h2>
            <p className="text-slate-600 dark:text-slate-400">Scale your firm with the most advanced legal intelligence on the market.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Plan */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-500 mb-2 uppercase tracking-widest">Growth</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold dark:text-white">$49</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">Perfect for solo practitioners and small boutique firms.</p>
              <ul className="space-y-4 mb-10">
                {['100 Priority Cases', 'Standard Discovery AI', 'Core Research Tool', 'SOC2 Compliance'].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check size={18} className="text-primary flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="w-full py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
              <h3 className="text-lg font-bold text-primary mb-2 uppercase tracking-widest">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold dark:text-white">$149</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">Integrated intelligence for high-volume litigation firms.</p>
              <ul className="space-y-4 mb-10">
                {['Unlimited Priority Cases', 'Advanced AI Insights', 'Elite Jurisprudence Bank', 'HIPAA compliant storage', 'Team collaboration portal'].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check size={18} className="text-primary flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/25">
                  Go Professional
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-background-dark">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.05]"></div>
        <div className="relative z-10 container-stitch text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl h-auto md:text-5xl font-bold text-white mb-8 font-display">Upgrade to Modern Legal Management</h2>
            <p className="text-xl text-slate-400 mb-12">
              Secure your firm's competitive edge with the most advanced AI case management system on the market.
            </p>
            <Link href="/register">
              <button className="px-12 py-4 bg-primary text-white font-bold rounded-xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all text-lg">
                Subscribe Now
              </button>
            </Link>
            <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-bold">
              Trusted by 500+ US Law Firms
            </p>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
