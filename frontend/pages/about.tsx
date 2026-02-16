import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PublicLayout from '@/components/layouts/PublicLayout';

export default function About() {
    return (
        <PublicLayout>
            <Head>
                <title>About Us - LawCaseAI</title>
                <meta name="description" content="Learn about LawCaseAI's mission to revolutionize legal practice management through artificial intelligence." />
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
                        About LawCaseAI
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight max-w-4xl mx-auto">
                        Transforming Legal Practice with <span className="text-primary relative inline-block">
                            Intelligent Technology
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
                            </svg>
                        </span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        We're on a mission to empower legal professionals with AI-driven tools that enhance efficiency, accuracy, and client outcomes.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Story</h2>
                        <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="prose prose-lg max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                        <p className="text-lg mb-6">
                            LawCaseAI was founded by a team of legal professionals and AI engineers who recognized a critical gap in the legal industry: the need for intelligent, purpose-built technology that truly understands the complexities of legal work.
                        </p>
                        <p className="text-lg mb-6">
                            Traditional case management systems were built for generic workflows, not the nuanced demands of legal practice. We set out to change that by creating a platform that combines cutting-edge artificial intelligence with deep legal domain expertise.
                        </p>
                        <p className="text-lg">
                            Today, LawCaseAI serves thousands of legal professionals across the United States, helping them manage cases more efficiently, analyze documents with unprecedented speed, and deliver better outcomes for their clients.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-background-light dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            The principles that guide everything we do at LawCaseAI
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg">
                            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <span className="material-icons-round text-3xl">verified_user</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Trust & Security</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Your data is sacred. We employ bank-level encryption and zero-knowledge architecture to ensure absolute confidentiality.
                            </p>
                        </div>

                        <div className="group relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg">
                            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <span className="material-icons-round text-3xl">psychology</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Innovation</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                We leverage the latest AI breakthroughs to solve real legal challenges, not just chase trends.
                            </p>
                        </div>

                        <div className="group relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg">
                            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <span className="material-icons-round text-3xl">groups</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Client Success</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Your success is our success. We're committed to delivering measurable value and exceptional support.
                            </p>
                        </div>

                        <div className="group relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg">
                            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <span className="material-icons-round text-3xl">balance</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Legal Excellence</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Built by legal professionals who understand the stakes. We respect the gravity of your work.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Legal Professionals</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Numbers that speak to our commitment and impact
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">12,000+</div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Legal Professionals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">85,000+</div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Cases Managed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">2.5M+</div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Documents Analyzed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">99.9%</div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Uptime SLA</div>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Practice?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of legal professionals who trust LawCaseAI to power their practice.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/register">
                            <button className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-all duration-300 text-lg hover:scale-105 hover:shadow-2xl hover:shadow-white/50">
                                Get Started
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg">
                                View Pricing
                            </button>
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-blue-200 opacity-80">
                        Enterprise plans available with custom seat licensing and dedicated support.
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
