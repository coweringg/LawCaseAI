import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ArrowLeft, ChevronRight, Scale, Gavel, Cpu, AlertTriangle, HelpCircle, DollarSign, RefreshCcw } from 'lucide-react'

export default function RefundPolicy() {
  const lastUpdated = 'March 10, 2026'

  return (
    <div className="min-h-screen bg-[#060910] text-slate-200 selection:bg-primary/30 selection:text-white">
      <Head>
        <title>Refund Policy | LawCaseAI</title>
        <meta name="description" content="LawCaseAI Refund Policy - Professional transparency regarding our billing and neural processing credits." />
      </Head>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <DollarSign size={12} />
              Billing Transparency
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white mb-6 font-display tracking-tightest leading-tight">
              Refund <span className="text-primary italic">Policy</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
              Clear protocols regarding our billing cycles, cancellation terms, and refund eligibility for our legal data processing services.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Effective Date: {lastUpdated}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Version 1.0.0</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: RefreshCcw, title: 'Service Credits', desc: 'Account credit resets' },
              { icon: Shield, title: 'Secure Ledger', desc: 'Encrypted transaction logs' },
              { icon: HelpCircle, title: 'Dispute Flow', desc: 'Direct resolution protocol' }
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
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Refund Eligibility</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  At LawCaseAI (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), we provide a sophisticated legal application that incurs significant costs upon activation. To maintain high-quality service, we adhere to the following refund criteria:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold font-display">48h</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Deployment Window</p>
                      <p className="text-slate-500 text-xs">Refund requests must be submitted within 48 hours of the initial subscription activation if no significant AI processing has occurred.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold font-display">0%</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Usage Threshold</p>
                      <p className="text-slate-500 text-xs">Accounts that have utilized significant AI data processing or performed document analysis are ineligible for refunds due to service utilization.</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">02</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cancellation Protocol</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  You may cancel your Professional, Elite, or Enterprise subscription at any time through your dashboard settings. Upon cancellation:
                </p>
                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em] mb-2 font-display">Service Continuity</p>
                  <p className="text-slate-300 text-sm italic">
                    Access to premium features will remain active until the end of your current billing period. No partial refunds are issued for unused days within a billing cycle.
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary/20">03</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Enterprise Agreements</h2>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Custom Enterprise Intelligence agreements may have specific refund and termination clauses that supersede this general policy. Please refer to your specific firm&apos;s Service Level Agreement (SLA).
                </p>
              </section>

              <section className="space-y-6 border-t border-white/5 pt-8">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Billing Disputes</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  If you notice an unauthorized charge or have a billing discrepancy, please contact our financial desk immediately. We commit to investigating and resolving all billing queries within 5 business days.
                </p>
              </section>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Merchant of Record</p>
              <p className="text-slate-400 text-xs mb-6">Our order process is conducted by our online reseller Paddle.com. Paddle is the Merchant of Record for all our orders.</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Financial Support Desk</p>
              <a href="mailto:lawcaseai@gmail.com" className="text-primary font-bold hover:underline">lawcaseai@gmail.com</a>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              <ArrowLeft size={14} />
              Return to Infrastructure Index
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
            <Link href="/terms" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="text-primary text-[10px] font-black uppercase tracking-widest">Refund Policy</Link>
            <Link href="/login?support=true" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
