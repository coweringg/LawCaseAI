import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Success() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
            {/* Navigation / Header */}
            <header className="w-full py-6 px-8 flex justify-between items-center border-b border-primary/10 bg-white dark:bg-background-dark/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                        <span className="material-icons-round text-white text-xl">gavel</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary dark:text-white">LawCaseAI</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Support: support@lawcaseai.com</span>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 mb-20">
                {/* Main Success Card */}
                <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Top Accent Gradient */}
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-400"></div>
                    <div className="p-8 md:p-12 flex flex-col items-center text-center">

                        {/* Success Icon */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full scale-150 blur-xl"></div>
                            <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                <span className="material-icons-round text-green-500 text-5xl">check_circle</span>
                            </div>
                        </div>

                        {/* Header Content */}
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                            Your Subscription is Active
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                            Welcome to LawCaseAI, <span className="text-slate-900 dark:text-white font-semibold">Attorney Sarah Jenkins</span>. Your Partner Plan has been successfully activated.
                        </p>

                        {/* Transaction Summary Box */}
                        <div className="w-full mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 dark:text-primary/90 mb-4 text-left">Transaction Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</span>
                                    <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-200">#LCA-882910</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Amount Paid</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">$149.00 / Month</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Next Billing Date</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">October 24, 2023</span>
                                </div>
                                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method</span>
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons-round text-slate-400 text-base">credit_card</span>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">Visa ending in 4242</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col sm:flex-row gap-4 mt-10">
                            <Link href="/dashboard" className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                <span>Go to Dashboard</span>
                                <span className="material-icons-round text-lg">arrow_forward</span>
                            </Link>
                            <button className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                <span className="material-icons-round text-lg">download</span>
                                <span>Download Receipt</span>
                            </button>
                        </div>

                        {/* Assistance Text */}
                        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                            Need help setting up your firm's profile?
                            <a className="text-primary hover:underline font-semibold ml-1" href="#">Visit our Onboarding Guide</a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <p>© 2023 LawCaseAI Inc. All rights reserved. Professional legal tools for modern attorneys.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <span>•</span>
                    <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                    <span>•</span>
                    <a className="hover:text-primary transition-colors" href="#">Security</a>
                </div>
            </footer>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
}
