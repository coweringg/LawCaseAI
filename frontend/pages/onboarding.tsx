import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Onboarding() {
    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
                <nav className="w-full py-6 px-8 flex justify-between items-center bg-white dark:bg-background-dark border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-white">gavel</span>
                        </div>
                        <span className="text-2xl font-extrabold text-primary tracking-tight">LawCaseAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Account: john.doe@firm.law</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            JD
                        </div>
                    </div>
                </nav>

                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 overflow-hidden border border-primary/5">
                        <div className="bg-primary/5 dark:bg-primary/10 p-10 text-center border-b border-primary/10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
                                <span className="material-icons-round text-white text-3xl">check</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                                Payment Confirmed. Let&apos;s Set Up Your First Case.
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Welcome to LawCaseAI. Your subscription is active. Follow these three quick steps to begin automating your legal workflow.
                            </p>
                        </div>

                        <div className="p-10">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-icons-round text-primary group-hover:text-white text-2xl">create_new_folder</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Create Case</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Enter case names, client details, and jurisdictions to build your workspace.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-icons-round text-primary group-hover:text-white text-2xl">cloud_upload</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Upload Docs</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Securely upload PDFs, transcripts, and discovery files for processing.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-icons-round text-primary group-hover:text-white text-2xl">auto_awesome</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Chat with AI</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Use our legal-tuned LLM to find insights and draft motions in seconds.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col items-center">
                                <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-12 rounded-lg text-lg shadow-lg shadow-primary/25 transform transition active:scale-95 flex items-center gap-2">
                                    Start Managing Cases
                                    <span className="material-icons-round">arrow_forward</span>
                                </Link>
                                <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 font-medium">
                                    <a className="hover:text-primary flex items-center gap-1 transition-colors" href="#">
                                        <span className="material-icons-round text-lg">calendar_today</span>
                                        Schedule an Onboarding Demo
                                    </a>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <a className="hover:text-primary flex items-center gap-1 transition-colors" href="#">
                                        <span className="material-icons-round text-lg">help_outline</span>
                                        Visit Help Center
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 py-4 px-10 flex flex-wrap justify-center gap-8 border-t border-primary/5">
                            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <span className="material-icons-round text-primary text-sm">security</span>
                                <span className="text-xs uppercase font-bold tracking-widest text-slate-700 dark:text-slate-300">Bank-Level Security</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <span className="material-icons-round text-primary text-sm">lock</span>
                                <span className="text-xs uppercase font-bold tracking-widest text-slate-700 dark:text-slate-300">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <span className="material-icons-round text-primary text-sm">verified_user</span>
                                <span className="text-xs uppercase font-bold tracking-widest text-slate-700 dark:text-slate-300">ABA Rule 1.6 Ready</span>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="py-8 text-center text-slate-400 dark:text-slate-600 text-sm">
                    <p>© 2026 LawCaseAI. All rights reserved. 256-bit AES Encryption Active.</p>
                </footer>
            </div>
        </ProtectedRoute>
    );
}
