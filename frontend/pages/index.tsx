import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function Home() {
  return (
    <PublicLayout>
      <Head>
        <title>LawCaseAI - Enterprise AI Legal Case Management</title>
        <meta name="description" content="Professional AI-driven legal case management for US lawyers. Secure, subscription-based platform for modern law firms." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundColor: '#f5f6f8',
          backgroundImage: 'radial-gradient(#0a44b8 0.5px, transparent 0.5px), radial-gradient(#0a44b8 0.5px, #f5f6f8 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl dark:bg-primary/10 z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl dark:bg-primary/10 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-blue-300 text-sm font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Professional Legal Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight max-w-4xl mx-auto">
            The Standard for AI-Driven <span className="text-primary relative inline-block">
              Legal Practice
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Empower your firm with elite case management and document automation. LawCaseAI provides immediate operational efficiency for professional US law firms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/register">
              <button className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover focus:ring-4 focus:ring-primary/30 transition-all shadow-lg shadow-primary/25">
                Subscribe Now
                <span className="material-icons-round ml-2 text-lg">arrow_forward</span>
              </button>
            </Link>
            <Link href="/pricing">
              <button className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 transition-all">
                <span className="material-symbols-outlined mr-2 text-lg text-primary">payments</span>
                View Plans
              </button>
            </Link>
          </div>

          {/* Application Preview */}
          <div className="relative max-w-5xl mx-auto mt-12">
            <div className="relative rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-2xl lg:p-3 shadow-2xl shadow-primary/20">
              <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative h-[400px] md:h-[500px] lg:h-[600px]">
                <div className="h-14 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 justify-between bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">AI</div>
                  </div>
                </div>
                <div className="flex h-full">
                  <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 hidden md:block">
                    <div className="space-y-3">
                      <div className="h-8 bg-primary/10 text-primary rounded-md flex items-center px-3 text-sm font-medium w-full">
                        <span className="material-icons-round text-sm mr-2">dashboard</span> Dashboard
                      </div>
                      <div className="h-8 text-slate-500 dark:text-slate-400 rounded-md flex items-center px-3 text-sm font-medium w-full">
                        <span className="material-icons-round text-sm mr-2">folder</span> Cases
                      </div>
                      <div className="h-8 text-slate-500 dark:text-slate-400 rounded-md flex items-center px-3 text-sm font-medium w-full">
                        <span className="material-icons-round text-sm mr-2">description</span> Documents
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 p-6 overflow-hidden text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Cases</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">124</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pages Processed</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">8,402</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Billable Hours</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">342.5</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Priority Files</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <span className="material-icons-round text-sm">gavel</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">Smith v. Jones Corp</div>
                              <div className="text-xs text-slate-500">Civil Litigation</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">Analysis Ready</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">Enterprise Compliance & Security</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-lg">
                <span className="material-icons-round text-2xl">verified_user</span> SOC2 Type II
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-lg">
                <span className="material-icons-round text-2xl">lock</span> HIPAA
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-lg">
                <span className="material-icons-round text-2xl">shield</span> GDPR
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-lg">
                <span className="material-icons-round text-2xl">gavel</span> ABA Standards
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Professional Infrastructure for Elite Firms</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Immediate access to powerful AI tools designed for high-stakes litigation and transactional law.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-background-light dark:bg-slate-800 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-icons-round text-3xl">psychology</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Discovery Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Scale your processing capacity. Analyze thousands of pages of evidence instantly to extract key timelines and contradictions.
              </p>
            </div>
            <div className="group relative bg-background-light dark:bg-slate-800 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-icons-round text-3xl">topic</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Enterprise Knowledge Bank</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                A proprietary semantic search layer for your firm's entire case history. Find precedents in seconds, not hours.
              </p>
            </div>
            <div className="group relative bg-background-light dark:bg-slate-800 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-icons-round text-3xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Attorney-Client Privilege</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Built with a zero-knowledge architecture. Your data is encrypted at rest and in transit, ensuring absolute confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Upgrade to Modern Legal Management</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Secure your firm's competitive edge with the most advanced AI case management system on the market.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-all duration-300 text-lg hover:scale-105 hover:shadow-2xl hover:shadow-white/50">
                Get LawCaseAI
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg">
                Contact Sales
              </button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-200 opacity-80">
            Contact us for custom seat licensing and firm-wide migration assistance.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
