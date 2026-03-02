import React from 'react';
import Link from 'next/link';

interface CaseLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseCount: number;
    caseLimit: number;
}

export default function CaseLimitModal({ isOpen, onClose, caseCount, caseLimit }: CaseLimitModalProps) {
    const isUnlimited = caseLimit >= 10000;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative z-10">
                {/* Close Icon */}
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-8 md:p-10 text-center">
                    {/* Header Icon & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <span className="material-icons-round text-primary text-3xl">account_balance_wallet</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                            Plan Limit Reached
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            You&apos;ve reached your maximum capacity on the <span className="font-bold text-slate-800 dark:text-slate-200">Starter Plan</span>.
                        </p>
                    </div>

                    {/* Usage Progress Section */}
                    {!isUnlimited && (
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 mb-8 border border-primary/10 text-left">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Global Capacity</span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{caseCount} / {caseLimit >= 10000 ? '∞' : caseLimit}</span>
                            </div>
                            <div className="w-full h-3 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-full rounded-full"></div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
                                All {caseLimit} case slots are currently active. Close a case or upgrade to continue.
                            </p>
                        </div>
                    )}

                    {isUnlimited && (
                        <div className="bg-emerald-500/5 rounded-xl p-8 mb-8 border border-emerald-500/20 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-emerald-500 font-bold">∞</span>
                            </div>
                            <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">Unlimited Quota</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Your current plan allows for virtually unlimited case management. 
                                You shouldn&apos;t be seeing this message unless there&apos;s a specific system constraint.
                            </p>
                        </div>
                    )}

                    {/* Benefits List */}
                    <div className="mb-10 text-left">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 uppercase tracking-widest flex items-center">
                            <span className="w-8 h-[1px] bg-primary/30 mr-3"></span>
                            Upgrade to Partner Plan
                            <span className="ml-2 px-2 py-0.5 bg-primary text-[10px] text-white rounded uppercase">Recommended</span>
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="material-icons-round text-primary mr-3 text-xl">check_circle</span>
                                <div>
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200">Expand Your Reach</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Up to 20 active cases and unlimited archiving.</span>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="material-icons-round text-primary mr-3 text-xl">check_circle</span>
                                <div>
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200">Advanced AI Analytics</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Deep-dive legal reasoning and precedent mapping.</span>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="material-icons-round text-primary mr-3 text-xl">check_circle</span>
                                <div>
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200">Priority Processing</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Reduce document analysis time by up to 60%.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <Link href="/settings?tab=billing" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                             <span>Upgrade to Partner</span>
                             <span className="material-icons-round text-sm">arrow_forward</span>
                         </Link>
                        <button onClick={onClose} className="w-full bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold py-2 transition-colors">
                            Maybe Later
                        </button>
                    </div>

                    {/* Secure Checkout Badge */}
                    <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-tighter">
                            <span className="material-icons-round text-xs">lock</span>
                            Secure Checkout
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-tighter">
                            <span className="material-icons-round text-xs">verified</span>
                            Satisfaction Guaranteed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
