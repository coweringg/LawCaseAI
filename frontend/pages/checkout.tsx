import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
    const router = useRouter();
    const { plan } = router.query;
    const { token, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const planDetails = {
        basic: { name: 'Associate', price: '49.00', cases: '5' },
        professional: { name: 'Partner', price: '149.00', cases: '20' },
        enterprise: { name: 'Enterprise', price: 'Custom', cases: 'Unlimited' }
    };

    const selectedPlan = (plan as string) || 'professional';
    const activePlan = (planDetails as any)[selectedPlan] || planDetails.professional;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/payments/confirm', { planId: selectedPlan });
            const data = response.data;

            if (data.success) {
                toast.success('Subscription activated!');
                updateUser(data.data.user);
                router.push('/success');
            } else {
                toast.error(data.message || 'Payment failed');
            }
        } catch (error) {
            toast.error('Network error during payment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            {/* Header / Navigation */}
            <nav className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                        <span className="material-icons-round text-white text-lg">gavel</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">LawCase<span className="text-primary">AI</span></span>
                </Link>
                <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-icons-round text-sm">arrow_back</span>
                    Back to Dashboard
                </Link>
            </nav>

            {/* Main Checkout Container */}
            <main className="max-w-xl mx-auto px-6 pb-24">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2"></div>
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-4 border-background-light dark:border-background-dark">
                            <span className="material-icons-round text-sm">check</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Account</span>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold ring-4 ring-primary/20 border-4 border-background-light dark:border-background-dark">
                            2
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Payment</span>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold border-4 border-background-light dark:border-background-dark">
                            3
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Activation</span>
                    </div>
                </div>

                {/* Checkout Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Secure Payment</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Professional firm billing for LawCaseAI {activePlan.name}.</p>

                        {/* Express Pay Options */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-black text-white hover:bg-slate-800 transition-all">
                                <span className="font-medium text-sm">Apple Pay</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                <span className="font-medium text-sm">Google Pay</span>
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                            </div>
                            <span className="relative px-4 bg-white dark:bg-slate-900 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Or pay with card</span>
                        </div>

                        {/* Card Form */}
                        <form className="space-y-4" onSubmit={handleCheckout}>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                                <input className="w-full px-4 py-3 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm" placeholder="e.g. Jonathan Aris" type="text" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                                <div className="relative">
                                    <input className="w-full px-4 py-3 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm" placeholder="0000 0000 0000 0000" type="text" required />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                        <span className="material-icons-round text-slate-300">credit_card</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                                    <input className="w-full px-4 py-3 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm" placeholder="MM / YY" type="text" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVV</label>
                                    <input className="w-full px-4 py-3 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm" placeholder="123" type="text" required />
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">{activePlan.name} Plan</span>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                            {activePlan.price === 'Custom' ? 'Contact Us' : `$${activePlan.price}`}
                                            {activePlan.price !== 'Custom' && <span className="text-sm font-normal text-slate-400">/mo</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400">Taxes calculated at next step</span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        'Processing...'
                                    ) : (
                                        <>
                                            <span className="material-icons-round text-sm">lock</span>
                                            Complete Secure Purchase
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Benefits Summary Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Plan Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="material-icons-round text-primary text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">20 Active Cases</p>
                                    <p className="text-[11px] text-slate-500">Full lifecycle management</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-icons-round text-primary text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unlimited AI Chat</p>
                                    <p className="text-[11px] text-slate-500">Legal research assistant</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-icons-round text-primary text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Advanced OCR</p>
                                    <p className="text-[11px] text-slate-500">High-speed document parsing</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-icons-round text-primary text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">SOC2 Compliant</p>
                                    <p className="text-[11px] text-slate-500">Enterprise grade security</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-icons-round text-sm">verified_user</span>
                        <span className="text-xs font-medium">Secure 256-bit SSL Encrypted Connection</span>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        By completing this purchase, you agree to LawCaseAI's Terms of Service and Data Processing Agreement.<br />
                        Your data is protected under legal-grade encryption standards.
                    </p>
                </div>
            </main>

            {/* Footer Support Link */}
            <footer className="fixed bottom-0 left-0 w-full p-6 text-center">
                <a className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors" href="#">
                    Need help? Contact our Firm Concierge Team
                </a>
            </footer>
        </div>
    );
}
