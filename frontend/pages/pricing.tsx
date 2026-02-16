import React, { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

  return (
    <PublicLayout>
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center" id="pricing">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Simple, transparent pricing for <br className="hidden md:block" />
            <span className="text-primary">law firms of all sizes</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Get immediate access to AI-driven case management. Select your subscription plan below to modernize your firm today.
          </p>

          <div className="flex justify-center items-center gap-4 mb-16">
            <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>Monthly</span>
            <button
              role="switch"
              aria-checked={billingInterval === 'annual'}
              onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${billingInterval === 'annual' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${billingInterval === 'annual' ? 'translate-x-7' : 'translate-x-1'}`}></span>
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              Annual
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Save 20%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Assoicate Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full text-left">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center md:text-left">Associate</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Essential tools for solo practitioners to automate workflows.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${billingInterval === 'annual' ? '49' : '59'}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-slate-900 dark:text-white font-semibold">5 Active AI Cases</strong> limit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Basic Document Analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Email Support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Secure Data Encryption</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    window.location.href = '/register?plan=basic';
                  } else {
                    window.location.href = '/checkout?plan=basic';
                  }
                }}
                className="w-full block text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Select Plan
              </button>
            </div>

            {/* Partner Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-primary shadow-xl shadow-primary/10 p-8 relative flex flex-col h-full transform md:-translate-y-4 z-10 text-left">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wide py-1 px-3 rounded-full">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary mb-2 text-center md:text-left">Partner</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Best for growing small firms needing higher capacity.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${billingInterval === 'annual' ? '149' : '179'}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-slate-900 dark:text-white font-semibold">20 Active AI Cases</strong> limit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Advanced Legal Research</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Priority Support (24/7)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Client Portal Access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Case Timeline Generation</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    window.location.href = '/register?plan=professional';
                  } else {
                    window.location.href = '/checkout?plan=professional';
                  }
                }}
                className="w-full block text-center bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/25"
              >
                Subscribe Now
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full text-left">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center md:text-left">Enterprise</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">For large firms with high volume and custom requirements.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">Custom</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Contact for volume pricing</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-slate-900 dark:text-white font-semibold">Unlimited Active AI Cases</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Full API Access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Dedicated Account Manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">SSO & Custom Integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary text-xl mt-0.5">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">On-premise Deployment Option</span>
                </li>
              </ul>
              <button className="w-full block text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold py-3 px-4 rounded-lg transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-2 block">Enterprise-Grade Security</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trusted by modern law firms</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 group">
              <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary transition-colors">verified_user</span>
              <div className="text-left">
                <div className="font-bold text-slate-700 dark:text-slate-200 leading-tight">SOC2</div>
                <div className="text-xs text-slate-500 uppercase">Compliant</div>
              </div>
            </div>
            <div className="flex items-center gap-2 group">
              <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary transition-colors">lock</span>
              <div className="text-left">
                <div className="font-bold text-slate-700 dark:text-slate-200 leading-tight">AES-256</div>
                <div className="text-xs text-slate-500 uppercase">Encryption</div>
              </div>
            </div>
            <div className="flex items-center gap-2 group">
              <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary transition-colors">shield</span>
              <div className="text-left">
                <div className="font-bold text-slate-700 dark:text-slate-200 leading-tight">GDPR</div>
                <div className="text-xs text-slate-500 uppercase">Ready</div>
              </div>
            </div>
            <div className="flex items-center gap-2 group">
              <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary transition-colors">cloud_done</span>
              <div className="text-left">
                <div className="font-bold text-slate-700 dark:text-slate-200 leading-tight">99.9%</div>
                <div className="text-xs text-slate-500 uppercase">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 dark:text-slate-400">Have questions about billing, security, or implementation? We have answers.</p>
        </div>
        <div className="space-y-4">
          <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 [&_summary::-webkit-details-marker]:hidden open:ring-1 open:ring-primary/20">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg">
              <h3 className="text-lg">How quickly can I start using LawCaseAI?</h3>
              <span className="material-icons-round shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400 group-hover:text-primary">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>Access is immediate upon registration and completion of your subscription. Once your payment is confirmed, you will be redirected to your dashboard where you can start managing your cases right away.</p>
            </div>
          </details>
          <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg">
              <h3 className="text-lg">Is my client data secure?</h3>
              <span className="material-icons-round shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400 group-hover:text-primary">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>Absolutely. Security is our top priority. We use bank-grade AES-256 encryption for all data at rest and in transit. We are SOC2 Type II compliant and conduct regular third-party security audits. Your client data is isolated and never used to train our public models without explicit consent.</p>
            </div>
          </details>
          <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg">
              <h3 className="text-lg">What happens if I exceed my case limit?</h3>
              <span className="material-icons-round shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400 group-hover:text-primary">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>If you reach your case limit on the Associate (5 cases) or Partner (20 cases) plans, you can upgrade your plan at any time to instantly increase your limit, or archive old cases to free up slots for new active matters.</p>
            </div>
          </details>
          <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg">
              <h3 className="text-lg">Can I change my plan later?</h3>
              <span className="material-icons-round shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400 group-hover:text-primary">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>Yes, you can change your subscription plan at any time from your account settings. Upgrades are prorated and take effect immediately. Downgrades take effect at the end of your current billing cycle.</p>
            </div>
          </details>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary/5 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto bg-primary rounded-2xl overflow-hidden shadow-xl relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-primary to-transparent"></div>
          <div className="relative p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to modernize your practice?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Join over 500+ forward-thinking law firms using LawCaseAI to save hours every week.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#pricing" className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
                Select a Plan
              </Link>
              <button className="bg-primary border border-white/30 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary/80 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
