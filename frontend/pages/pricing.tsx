import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Check, Star, Shield, Zap, Info } from 'lucide-react';

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [pricingType, setPricingType] = useState<'personal' | 'empresa'>('personal');
  const [seats, setSeats] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const businessPrice = seats * (billingInterval === 'annual' ? 249 : 300);

  if (!mounted) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background-dark" />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Head>
        <title>Pricing - LawCaseAI | Invest in Your Practice</title>
        <meta name="description" content="Simple, transparent pricing for law firms of all sizes. Choice between Personal and Business plans." />
      </Head>

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container-stitch relative z-10 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 font-display leading-tight tracking-tightest">
              Invest in your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Firm&apos;s Future</span>
            </h1>

            {/* Main Toggle: Personal vs Empresa */}
            <div className="flex justify-center mb-16">
              <div className="premium-glass p-2 rounded-2xl border border-white/10 flex gap-2">
                <button
                  onClick={() => setPricingType('personal')}
                  className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${pricingType === 'personal' ? 'bg-primary text-white shadow-[0_0_30px_rgba(10,68,184,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Personal Firm
                </button>
                <button
                  onClick={() => setPricingType('empresa')}
                  className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${pricingType === 'empresa' ? 'bg-primary text-white shadow-[0_0_30px_rgba(10,68,184,0.4)]' : 'text-slate-500 hover:text-white'}`}
                >
                  Business Firm
                </button>
              </div>
            </div>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              {pricingType === 'personal' 
                ? 'Professional subscriptions billed per individual practitioner. Scale your intelligence as you scale your practice.'
                : 'Corporate solutions with centralized billing. Empower your entire team with unlimited Elite access.'}
            </p>

            <div className="flex justify-center items-center gap-6 mb-16">
              <span className={`text-sm font-bold tracking-widest uppercase ${billingInterval === 'monthly' ? 'text-primary' : 'text-slate-500'}`}>Monthly</span>
              <button
                role="switch"
                aria-checked={billingInterval === 'annual'}
                onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all focus:ring-4 focus:ring-primary/20 ${billingInterval === 'annual' ? 'bg-primary' : 'bg-slate-800'}`}
              >
                <div className={`h-7 w-7 transform rounded-full bg-white shadow-xl transition-transform ${billingInterval === 'annual' ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
              <div className="flex flex-col items-start leading-none">
                <span className={`text-sm font-bold tracking-widest uppercase ${billingInterval === 'annual' ? 'text-primary' : 'text-slate-500'}`}>Annual</span>
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">SAVE 20%</span>
              </div>
            </div>
          </motion.div>

          {pricingType === 'personal' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
              {/* Growth Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-dark rounded-[2rem] border border-white/5 p-10 text-left hover:shadow-2xl transition-all"
              >
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Growth</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-white">${billingInterval === 'annual' ? '79' : '99'}</span>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-sm">/mo</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 min-h-[220px]">
                  {["8 Active AI Matters", "Automated Chronology Suite", "Knowledge Base Search", "SOC2 Type II Security", "Standard AI Discovery"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                      <Check size={18} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register?plan=growth"
                  className="w-full py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors text-center block"
                >
                  Select Growth
                </Link>
              </motion.div>

              {/* Professional Plan */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="premium-glass rounded-[2.5rem] border-2 border-primary/50 p-10 text-left shadow-[0_0_80px_-20px_rgba(10,68,184,0.4)] relative transform md:-translate-y-8 group"
              >
                <div className="absolute top-0 right-10 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-b-xl uppercase tracking-[0.2em] shadow-lg">Recommended</div>
                <div className="mb-8">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4">Professional</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-black text-white tracking-tighter">${billingInterval === 'annual' ? '159' : '199'}</span>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">/mo</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 min-h-[220px]">
                  {["18 Active AI Matters", "Advanced AI Jurisprudence", "Team Collaboration Portal", "Premium Matter Analytics", "Priority GPU Allocation", "HIPAA & GDPR Compliance"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                      <Check size={18} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register?plan=professional"
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all text-center block"
                >
                  Go Professional
                </Link>
              </motion.div>

              {/* Elite Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 premium-border rounded-[2.5rem] border border-white/5 p-10 text-left hover:bg-white/[0.08] transition-all duration-500"
              >
                <div className="mb-8">
                  <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Elite</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-black text-white tracking-tighter">${billingInterval === 'annual' ? '249' : '300'}</span>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">/mo</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-emerald-500/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="text-2xl">∞</span> Active Matters
                  </div>
                </div>
                <ul className="space-y-4 mb-10 min-h-[220px]">
                  {["Unlimited Active Matters", "Cross-Matter AI Intelligence", "Dedicated Success Manager", "Bulk Neural Transcription", "Firm-wide Knowledge Bank", "White-label Client Portals"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                      <Check size={18} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register?plan=elite"
                  className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-center block"
                >
                  Select Elite
                </Link>
              </motion.div>
            </div>
          ) : (
            /* Business / Empresa Track */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-dark rounded-[3rem] border border-white/10 p-12 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">ENTERPRISE FIRM INFRASTRUCTURE</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                      Acquire <span className="text-primary font-bold italic">∞ unlimited capacity</span> for your entire organization. Get an exclusive firm code for instant network-wide access.
                    </p>
                    
                    <div className="space-y-8 mb-12">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Lawyers</span>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number"
                              min="5"
                              max="200"
                              value={seats}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) setSeats(Math.max(5, Math.min(val, 200)));
                              }}
                              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-primary font-black text-xl outline-none focus:border-primary/50 transition-all text-center"
                            />
                            <span className="text-xl font-black text-primary">Seats</span>
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="200" 
                          value={seats} 
                          onChange={(e) => setSeats(parseInt(e.target.value))}
                          className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary border border-white/5"
                        />
                        <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          <span>5 Users</span>
                          <span>200 Users</span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {["Centralized Firm Billing", "Global Knowledge Bank", "Enterprise-Grade Security", "24/7 Priority Concierge"].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <Check size={16} className="text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 text-center">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Monthly Total</p>
                    <div className="flex justify-center items-baseline gap-2 mb-8">
                      <span className="text-6xl font-black text-white tracking-tighter">${businessPrice.toLocaleString()}</span>
                      <span className="text-sm font-bold text-slate-500 uppercase">/mo</span>
                    </div>
                    
                    <Link 
                      href={`/register?plan=elite&seats=${seats}&type=empresa`}
                      className="w-full py-5 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all mb-4 text-center block"
                    >
                      Get Firm Code
                    </Link>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.1em]">
                      Corporate Billing · Wire or Card
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Security & Compliance Grid */}
      <section className="py-24 bg-white dark:bg-[#0a0f18]">
        <div className="container-stitch">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: "Zero Knowledge", desc: "We can't see your data." },
              { icon: Zap, label: "Sub-second", desc: "Analysis at light speed." },
              { icon: Star, label: "Compliance", desc: "SOC2, HIPAA, GDPR." },
              { icon: Info, label: "Insurance", desc: "Cyber-liability coverage." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon size={24} />
                </div>
                <h4 className="font-bold dark:text-white font-display uppercase tracking-widest text-xs">{item.label}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified FAQ */}
      <section className="py-32 relative border-y border-white/5">
        <div className="container-stitch max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-20 font-display tracking-tightest text-white">Financial <span className="text-primary">Precision</span></h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: "Can I switch plans mid-cycle?", a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the next cycle." },
              { q: "Is there a trial available?", a: "We don't offer generic trials. Contact sales for a live demo on your firm's complex data." },
              { q: "What is a 'Priority Case'?", a: "A priority case is an active litigation or matter receiving top-tier GPU priority for AI analysis and storage." },
              { q: "Security standards enforced?", a: "All transactions and data processing inherit firm-wide SOC2 Type II and HIPAA compliance standards." }
            ].map((faq, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 premium-glass rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <h4 className="font-black text-white mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {faq.q}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
