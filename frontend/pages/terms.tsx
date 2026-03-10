import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ArrowLeft, ChevronRight, Scale, Gavel, Cpu, AlertTriangle, HelpCircle } from 'lucide-react'

export default function TermsOfService() {
  const lastUpdated = 'February 25, 2026'

  return (
    <div className="min-h-screen bg-[#060910] text-slate-200 selection:bg-primary/30 selection:text-white">
      <Head>
        <title>Terms of Service | LawCaseAI</title>
        <meta name="description" content="LawCaseAI Terms of Service - The professional agreement for legal infrastructure usage." />
      </Head>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
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
              <Scale size={12} />
              Professional Governance
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white mb-6 font-display tracking-tightest leading-tight">
              Terms of <span className="text-primary italic">Service</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
              The professional agreement governing the use of LawCaseAI&apos;s legal application and data processing services.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Effective Date: {lastUpdated}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Version 3.1.2</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Cpu, title: 'AI Usage', desc: 'Acceptable neural interaction' },
              { icon: FileText, title: 'Ownership', desc: 'Case work & intellectual property' },
              { icon: AlertTriangle, title: 'Limitations', desc: 'System liability protocols' }
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
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Agreement Scope</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  By accessing the LawCaseAI platform, you enter into a legally binding agreement with LawCaseAI (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;). This agreement governs your use of our proprietary AI models, cloud infrastructure, and search systems.
                </p>
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 font-display">Usage Proviso</p>
                  <p className="text-slate-300 text-sm italic">
                    &ldquo;Unauthorized access to the system&apos;s internal weights or direct API manipulation is strictly prohibited.&rdquo;
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">02</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Infrastructure Access</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Users are responsible for maintaining the confidentiality of their biometric and cryptographic login credentials. Any security breach originating from compromised user accounts is the sole responsibility of the respective law firm.
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">03</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Intellectual Property Rights</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">A. User Content</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      You retain 100% ownership of Case Content, evidence, and legal strategy documents uploaded to the system. LawCaseAI claims no ownership of your legal work.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">B. AI Intelligence</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      LawCaseAI owns all algorithms, UI designs, neural architectures, and software code provided through the platform.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6 text-center py-8">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">AI Advisory Disclosure</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                  LawCaseAI is a professional indexing and analysis tool. It does not provide legal advice. All AI-generated outputs, summaries, and predictions must be reviewed and validated by a qualified attorney before use in legal proceedings.
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">04</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Subscription Protocol</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Subscriptions are billed in advance on a monthly or annual cycle. Fees are non-refundable after the first 48 hours of service activation. LawCaseAI reserves the right to suspend accounts with delinquent payment status.
                </p>
              </section>

              <section className="space-y-6 border-t border-white/5 pt-8">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Limitation of Liability</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  IN NO EVENT SHALL LAWCASEAI BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, OR SPECIAL DAMAGES ARISING FROM SYSTEM DOWNTIME, DATA PROCESSING DELAYS, OR LOSS OF CASE DATA. OUR ENTIRE LIABILITY IS LIMITED TO THE AMOUNT PAID FOR SERVICES IN THE PRECEDING 3 MONTHS.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Governing Law</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where the Service operates, without regard to its conflict of law provisions.
                </p>
              </section>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Agreement Queries</p>
              <a href="mailto:lawcaseai@gmail.com" className="text-primary font-bold hover:underline">lawcaseai@gmail.com</a>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/privacy" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              <Shield size={14} />
              Review Privacy Protocol
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
          <div className="flex items-center gap-8 text-center flex-wrap justify-center">
            <Link href="/terms" className="text-primary text-[10px] font-black uppercase tracking-widest">Terms of Service</Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Refund Policy</Link>
            <Link href="/login?support=true" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
