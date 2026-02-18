import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Check, Star, Shield, Zap, Info } from 'lucide-react';

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

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
        <meta name="description" content="Simple, transparent pricing for law firms of all sizes. Choice between Growth, Professional and Enterprise plans." />
      </Head>

      <section className="relative pt-32 pb-24 bg-background-dark overflow-hidden">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03]"></div>
        <div className="container-stitch relative z-10 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display">
              Invest in your <br />
              <span className="text-primary italic">Firm's Future</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Transparent, professional-tier subscriptions. <br className="hidden md:block" />
              Scale your intelligence as you scale your practice.
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
              <div className="flex flex-col items-start">
                <span className={`text-sm font-bold tracking-widest uppercase ${billingInterval === 'annual' ? 'text-primary' : 'text-slate-500'}`}>Annual</span>
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">SAVE 20%</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
            {/* Associate Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 p-10 text-left shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Growth</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold dark:text-white">${billingInterval === 'annual' ? '49' : '59'}</span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>
                <p className="text-xs text-slate-400">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
              </div>
              <ul className="space-y-4 mb-10 min-h-[220px]">
                {[
                  "5 Active AI Cases",
                  "Standard Discovery Suite",
                  "Knowledge Base Search",
                  "SOC2 Type II Security",
                  "Email Support (24h)"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-400 text-sm">
                    <Check size={18} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Select Growth
              </button>
            </motion.div>

            {/* Partner Plan */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-primary p-10 text-left shadow-2xl shadow-primary/10 relative transform md:-translate-y-8"
            >
              <div className="absolute top-0 right-10 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-b-xl uppercase tracking-widest">Recommended</div>
              <div className="mb-8">
                <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Professional</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold dark:text-white">${billingInterval === 'annual' ? '149' : '179'}</span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>
                <p className="text-xs text-slate-400">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
              </div>
              <ul className="space-y-4 mb-10 min-h-[220px]">
                {[
                  "20 Active AI Cases",
                  "Deep Discovery Insights",
                  "Elite Jurisprudence Bank",
                  "Team Collaboration Portal",
                  "Auto-Chronology Engine",
                  "Priority Support (1h)",
                  "HIPAA Compliance"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm font-medium">
                    <Check size={18} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all">
                Go Professional
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 p-10 text-left shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold dark:text-white">Custom</span>
                </div>
                <p className="text-xs text-slate-400">Firm-wide licensing</p>
              </div>
              <ul className="space-y-4 mb-10 min-h-[220px]">
                {[
                  "Unlimited AI Cases",
                  "Full API Access",
                  "Dedicated AI Training",
                  "Custom Compliance Rules",
                  "On-premise Options",
                  "White-label Portals"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-400 text-sm">
                    <Check size={18} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-background-dark text-white dark:bg-white dark:text-background-dark rounded-xl font-bold hover:opacity-90 transition-opacity">
                Contact Sales
              </button>
            </motion.div>
          </div>
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
      <section className="py-24 bg-slate-50 dark:bg-background-dark border-y border-white/5">
        <div className="container-stitch max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-display">Financial Precision</h2>
          <div className="space-y-6">
            {[
              { q: "Can I switch plans mid-cycle?", a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the next cycle." },
              { q: "Is there a trial available?", a: "We don't offer generic trials. Contact sales for a live demo on your firm's complex data." },
              { q: "What is a 'Priority Case'?", a: "A priority case is an active litigation or matter receiving top-tier GPU priority for AI analysis and storage." }
            ].map((faq, i) => (
              <div key={i} className="p-6 glass rounded-2xl border border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">{faq.q}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
