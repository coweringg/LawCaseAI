import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ArrowLeft, ChevronRight, Scale, Gavel, Database, Cpu } from 'lucide-react'

export default function PrivacyPolicy() {
  const lastUpdated = 'February 25, 2026'

  return (
    <div className="min-h-screen bg-[#060910] text-slate-200 selection:bg-primary/30 selection:text-white">
      <Head>
        <title>Privacy Policy | LawCaseAI</title>
        <meta name="description" content="LawCaseAI Privacy Policy - How we protect your legal data and intellectual property." />
      </Head>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 crystallography-pattern opacity-[0.02]" />
      </div>

      <nav className="fixed top-0 inset-x-0 h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Gavel size={18} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LawCaseAI</span>
          </Link>

          <Link href="/register">
            <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Initialize System
            </button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={12} />
              Secured Infrastructure
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white mb-6 font-display tracking-tightest leading-tight">
              Privacy <span className="text-primary italic">Protocol</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
              Our commitment to the absolute confidentiality and technical security of your firm&apos;s legal intelligence and client data.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Last Updated: {lastUpdated}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Version 2.4.0</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Database, title: 'Data Collection', desc: 'What points we analyze' },
              { icon: Cpu, title: 'AI Processing', desc: 'Neural layer security' },
              { icon: Lock, title: 'Encryption', desc: 'Military-grade protocols' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="premium-glass p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group"
              >
                <item.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">{item.title}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="premium-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-12 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">01</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Information Architecture</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  LawCaseAI operates on a principle of &ldquo;Least-Privilege Discovery.&rdquo; We collect information necessary to deploy and maintain your professional AI infrastructure. This includes:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">A</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Professional Credentials</p>
                      <p className="text-slate-500 text-xs">Name, email, and law firm identification for authentication protocols.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">B</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Case Metadata</p>
                      <p className="text-slate-500 text-xs">Structural data required for indexation and neural search optimization.</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">02</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Neural Processing Security</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Our AI models are trained and deployed within an isolated, zero-knowledge environment. We do not use your private case data to train global models. Your firm&apos;s data stay within your dedicated semantic layer.
                </p>
                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                  <Scale className="text-blue-400 shrink-0" size={24} />
                  <div>
                    <h4 className="text-blue-200 font-bold text-sm mb-2 uppercase tracking-widest">Attorney-Client Privilege Protocol</h4>
                    <p className="text-slate-400 text-sm">LawCaseAI technical staff never access the raw content of your uploaded documents unless explicitly authorized for emergency system recovery.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">03</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Global Data Retention</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  We hold data only as long as your subscription is active. Upon account termination, all neural indexes and document shards are purged following a 30-day graceful recovery period.
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">04</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Your Rights</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Consistent with GDPR and CCPA standards, you maintain the right to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Full Data Export', 'Neural Index Purge', 'Processing Restriction', 'Access Logs Review'].map((right, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {right}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Request Compliance Review</p>
              <a href="mailto:privacy@lawcaseai.io" className="text-primary font-bold hover:underline">legal-compliance@lawcaseai.io</a>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/terms" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              <FileText size={14} />
              Review Terms of Service
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <Gavel size={16} />
              <span className="font-bold tracking-tight">LawCaseAI</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              © 2026 LawCaseAI Infrastructure. All Rights Reserved.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-primary text-[10px] font-black uppercase tracking-widest">Privacy Policy</Link>
            <Link href="/login?support=true" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
