import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function AISetup() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    // Mock progress simulation
    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 1500);
        const timer2 = setTimeout(() => setStep(2), 3500);
        const timer3 = setTimeout(() => setStep(3), 5500);
        const timer4 = setTimeout(() => router.push('/dashboard'), 7500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [router]);

    return (
        <div className="bg-[#f5f6f8] dark:bg-[#101622] font-display min-h-screen flex flex-col">
            <Head>
                <title>Step 3: AI Initialization - LawCaseAI</title>
            </Head>

            {/* Top Navigation / Breadcrumbs */}
            <header className="w-full py-6 px-8 flex justify-between items-center bg-white dark:bg-[#101622] border-b border-blue-600/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0d59f2] rounded-lg flex items-center justify-center">
                        <span className="material-icons-round text-white">gavel</span>
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">LawCase<span className="text-[#0d59f2]">AI</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-[#0d59f2]/30"></div>
                            <div className="w-2 h-2 rounded-full bg-[#0d59f2]/30"></div>
                            <div className="w-8 h-2 rounded-full bg-[#0d59f2]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#0d59f2]/30"></div>
                        </div>
                        <span className="text-xs font-semibold text-[#0d59f2] uppercase ml-2">Step 3 of 4</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-xl w-full">
                    {/* Main Loading Card */}
                    <div className="bg-white dark:bg-[#151b2d] rounded-xl shadow-xl shadow-[#0d59f2]/5 p-12 text-center border border-[#0d59f2]/5">
                        {/* Animated Spinner */}
                        <div className="relative flex justify-center mb-10">
                            <div className="w-20 h-20 rounded-full border-4 border-[#0d59f2]/10 border-t-[#0d59f2] animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-icons-round text-[#0d59f2] text-3xl">auto_awesome</span>
                            </div>
                        </div>

                        {/* Status Information */}
                        <div className="space-y-2 mb-10">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Initializing Case AI</h1>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0d59f2]/5 dark:bg-[#0d59f2]/10 rounded-full border border-[#0d59f2]/10">
                                <span className="w-2 h-2 rounded-full bg-[#0d59f2] animate-pulse"></span>
                                <span className="text-sm font-medium text-[#0d59f2] uppercase tracking-wider">Case: Smith vs. Global Tech</span>
                            </div>
                        </div>

                        {/* Detailed Progress Steps */}
                        <div className="max-w-xs mx-auto text-left space-y-6">
                            {/* Step 1 */}
                            <div className={`flex items-start gap-4 transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className="mt-1">
                                    {step > 1 ? (
                                        <span className="material-icons-round text-[#0d59f2] text-lg">check_circle</span>
                                    ) : step === 1 ? (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <span className="material-icons-round text-[#0d59f2]/30 text-lg animate-spin">sync</span>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Setting up secure environment...</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Establishing end-to-end encrypted instance</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className={`flex items-start gap-4 transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className="mt-1">
                                    {step > 2 ? (
                                        <span className="material-icons-round text-[#0d59f2] text-lg">check_circle</span>
                                    ) : step === 2 ? (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <span className="material-icons-round text-[#0d59f2]/30 text-lg animate-spin">sync</span>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Contextualizing AI...</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mapping case entities and legal precedents</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className={`flex items-start gap-4 transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className="mt-1">
                                    {step > 3 ? ( // Never technically happens in this mock before redirect
                                        <span className="material-icons-round text-[#0d59f2] text-lg">check_circle</span>
                                    ) : step === 3 ? (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <span className="material-icons-round text-[#0d59f2]/30 text-lg animate-spin">sync</span>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Indexing legal documents...</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Preparing workspace for discovery</p>
                                </div>
                            </div>

                        </div>

                        {/* Footer Disclaimer */}
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                                <span className="material-icons-round text-sm">lock</span>
                                <p className="text-[10px] uppercase tracking-widest font-bold">Military-Grade Encryption Active</p>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">This may take a few moments. Please do not close your browser tab.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 px-8 border-t border-[#0d59f2]/5 bg-white/50 dark:bg-[#101622]/50 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">© 2024 LawCaseAI Systems Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs font-semibold text-slate-500 hover:text-[#0d59f2] transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs font-semibold text-slate-500 hover:text-[#0d59f2] transition-colors">Security Protocol</a>
                        <a href="#" className="text-xs font-semibold text-slate-500 hover:text-[#0d59f2] transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
