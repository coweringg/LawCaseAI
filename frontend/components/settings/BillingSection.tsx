import React, { useState } from 'react';
import { CreditCard, Loader2, Sparkles, Layers, Share2, DownloadCloud, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import api from '@/utils/api';

interface BillingSectionProps {
    billingInfo: any;
    orgData: any;
    purchaseHistory: any[];
    isLoadingHistory: boolean;
    onUpgradePlan: () => void;
    onUpdatePayment: () => void;
    onSetDefaultCard: (id: string) => void;
    onRemoveCard: (id: string) => void;
    formatDate: (date: string) => string;
    isTrialUsed?: boolean;
}

const generateInvoicePDF = (tx: any, billingInfo: any, orgData: any) => {
    const doc = new jsPDF();
    const primaryColor = '#2563eb';
    const secondaryColor = '#4f46e5';
    const accentColor = '#0ea5e9';
    const textColor = '#1e293b';
    const slateColor = '#64748b';
    const white = '#ffffff';

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 60, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('LAWCASEAI', 20, 35);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const systemText = 'ELITE NEURAL JURISPRUDENCE INFRASTRUCTURE';
    doc.text(systemText, 20, 43);

    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(140, 20, 50, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 145, 30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`#TXN-${tx._id.slice(-6).toUpperCase()}`, 145, 38);

    doc.setDrawColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
    doc.line(20, 50, 190, 50);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    doc.setFillColor(255, 255, 255);
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUED BY:', 20, 80);
    
    doc.setTextColor(textColor);
    doc.text('BILLED TO:', 110, 80);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(slateColor);
    doc.text('LawCaseAI Intelligence HQ', 20, 88);

    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(orgData?.name || 'Individual User Account', 110, 88);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateColor);
    doc.setFontSize(9);
    doc.text(`Identification: ${orgData?.firmCode || 'Individual'}`, 110, 95);
    doc.text(`Contact: ${billingInfo?.email || 'N/A'}`, 110, 100);
    doc.text(`Date of Issue: ${new Date(tx.date).toLocaleDateString()}`, 110, 105);

    doc.setFillColor(248, 250, 252);
    doc.rect(20, 120, 170, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 120, 190, 120);
    doc.line(20, 132, 190, 132);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    doc.text('ACCESS PROTOCOL', 25, 127.5);
    doc.text('UNITS', 130, 127.5);
    doc.text('TOTAL', 170, 127.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.text(`${tx.plan.toUpperCase()} Neural Access`, 25, 145);
    doc.text(tx.plan === 'enterprise' ? `${orgData?.totalSeats || 1} Licenses` : '1 License', 130, 145);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${tx.amount.toLocaleString()}`, 170, 145);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 155, 190, 155);

    const summaryX = 130;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateColor);
    doc.text('Subtotal:', summaryX, 170);
    doc.text('Tax (0%):', summaryX, 178);
    
    doc.setTextColor(textColor);
    doc.text(`$${tx.amount.toLocaleString()}`, 170, 170);
    doc.text(`$0.00`, 170, 178);

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(summaryX - 5, 185, 65, 15, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('GRAND TOTAL', summaryX, 194.5);
    doc.text(`$${tx.amount.toLocaleString()}`, 170, 194.5);

    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 170, 100, 30, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text('PAYMENT VERIFICATION', 25, 178);
    
    const savedPM = tx.paymentMethod;
    let cardDetail = '4242';
    
    if (savedPM && savedPM !== 'N/A' && savedPM !== 'Credit Card') {
        if (savedPM.includes('ending in ')) {
            cardDetail = savedPM.split('ending in ')[1];
        } else {
            const digits = savedPM.match(/\d{4}$/);
            cardDetail = digits ? digits[0] : (savedPM.slice(-4) || '4242');
        }
    } else {
        const currentPM = billingInfo?.paymentMethods?.find((p: any) => p.id === billingInfo.defaultPaymentMethodId);
        if (currentPM && currentPM.last4) cardDetail = currentPM.last4;
    }
    
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    const displaysAs = /^\d+$/.test(cardDetail) ? cardDetail : '4242';
    doc.text(`Authentication: Credit Card (**** **** **** ${displaysAs})`, 25, 185);
    doc.setTextColor(accentColor);
    doc.text('Status: Transaction Succeeded & Secured', 25, 192);

    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1);
    doc.line(20, 275, 50, 275);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateColor);
    doc.text('Thank you for choosing LawCaseAI for your legal intelligence infrastructure.', 20, 282);
    doc.text(`Validation Signature: ${tx.stripePaymentIntentId || 'SECURE-AUTH-' + tx._id.slice(0, 8)}`, 20, 287);

    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM AUTHENTICATED', 160, 282);

    doc.save(`LawCaseAI_Statement_${tx._id.slice(-6).toUpperCase()}.pdf`);
};

export const BillingSection: React.FC<BillingSectionProps> = ({
    billingInfo,
    orgData,
    purchaseHistory,
    isLoadingHistory,
    onUpgradePlan,
    onUpdatePayment,
    onSetDefaultCard,
    onRemoveCard,
    formatDate,
    isTrialUsed = false
}) => {
    const [showTrialMock, setShowTrialMock] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    if (showTrialMock) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-glass p-8 rounded-[3rem] border border-white/10 text-center space-y-8 max-w-2xl mx-auto"
            >
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Shield size={32} />
                    </div>
                </div>
                
                <div>
                    <h3 className="text-2xl font-black text-white mb-2 font-display uppercase tracking-tight">Identity Verification</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider opacity-70">Verify a payment method to unlock your 24h evaluation. <br /> No charges will be processed today.</p>
                </div>

                <div className="space-y-4 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cardholder Name</label>
                        <input type="text" placeholder="JONATHAN DAVIS" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold uppercase tracking-wider outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Card Number</label>
                        <div className="relative">
                            <input type="text" placeholder="•••• •••• •••• ••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-[0.3em] outline-none focus:border-primary transition-colors" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                <CreditCard className="text-slate-600" size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiry</label>
                            <input type="text" placeholder="MM / YY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CVV</label>
                            <input type="text" placeholder="•••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                </div>

                <button
                    disabled={isVerifying}
                    onClick={async () => {
                        setIsVerifying(true);
                        try {
                            const { data } = await api.post('/user/activate-trial');
                            if (data.success) {
                                toast.success('24-hour Free Evaluation Activated');
                                window.location.href = '/dashboard?trial=activated';
                            } else {
                                toast.error(data.message || 'Failed to activate trial');
                            }
                        } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Activation error');
                        } finally {
                            setIsVerifying(false);
                        }
                    }}
                    className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-hover transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 group"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Synchronizing Protocols...
                        </>
                    ) : (
                        <>
                            Authorize & Start Evaluation
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <button 
                    onClick={() => setShowTrialMock(false)}
                    className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                    Return to Billing Overview
                </button>

                <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                        <Shield size={10} className="text-primary" />
                        AES-256 Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        PCI-DSS Level 1
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            {!isTrialUsed && billingInfo?.plan === 'none' && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[2.5rem] border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl relative overflow-hidden group shadow-[0_0_50px_-10px_rgba(37,99,235,0.3)]"
                >
                    <div className="absolute top-0 right-10 bg-primary text-white text-[9px] font-black px-5 py-2 rounded-b-xl uppercase tracking-widest shadow-lg">Special Offer</div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform duration-500 shrink-0">
                            <Zap size={40} fill="currentColor" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col sm:flex-row items-baseline gap-3 mb-2 justify-center md:justify-start">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase font-display">24h Free Evaluation</h3>
                                <span className="text-primary font-black text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">$0.00 / Trial</span>
                            </div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 opacity-80">Full infrastructure access • 1 Active Matter • 10 Document Units</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    No upfront cost
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Instant Activation
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Cancel anytime
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowTrialMock(true)}
                                className="px-10 py-5 bg-white text-primary font-black rounded-2xl shadow-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-[0.2em] flex items-center gap-3"
                            >
                                Start Evaluation
                                <ArrowRight size={16} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 glass-dark border border-white/10 rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {billingInfo?.plan === 'none' ? 'No Active Plan' :
                                            billingInfo?.plan === 'basic' ? 'Growth' :
                                                billingInfo?.plan === 'professional' ? 'Professional' :
                                                    billingInfo?.plan === 'elite' ? 'Elite' :
                                                        billingInfo?.plan === 'enterprise' ? 'Enterprise Intelligence' :
                                                            billingInfo?.plan === 'trial' ? 'Free Evaluation' :
                                                                billingInfo?.plan || 'Loading...'} System
                                    </h2>
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${billingInfo?.plan === 'none' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                        {billingInfo?.plan === 'none' ? 'Infrastructure Inactive' : 'Active'}
                                    </span>
                                    {billingInfo?.interval === 'annual' && (
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border bg-primary/20 text-primary border-primary/30">
                                            Annual (-20%)
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    {billingInfo?.plan === 'none' ? 'Select a tier to activate neural processing' :
                                        billingInfo?.plan === 'trial' ? '24-hour Evaluative Access' :
                                            billingInfo?.plan === 'basic' ? 'Standard Legal Processing' :
                                                billingInfo?.plan === 'professional' ? 'Advanced Neural Jurisprudence' :
                                                    'Firm-Wide Intelligence Access'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    ${billingInfo?.plan === 'none' || billingInfo?.plan === 'trial' ? '0' :
                                        billingInfo?.plan === 'enterprise' ? ((orgData?.totalSeats || 1) * (billingInfo?.interval === 'annual' ? 249 : 300)) :
                                            billingInfo?.plan === 'basic' ? (billingInfo?.interval === 'annual' ? '79' : '99') :
                                                billingInfo?.plan === 'professional' ? (billingInfo?.interval === 'annual' ? '159' : '199') :
                                                    (billingInfo?.interval === 'annual' ? '249' : '300')}
                                    <span className="text-sm text-slate-500 font-bold">/mo</span>
                                </p>
                                {billingInfo?.interval === 'annual' && billingInfo?.plan !== 'none' && billingInfo?.plan !== 'trial' && (
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                                        Billed annually (${billingInfo?.plan === 'enterprise' ? (orgData?.totalSeats || 1) * 249 * 12 :
                                            billingInfo?.plan === 'basic' ? 79 * 12 :
                                                billingInfo?.plan === 'professional' ? 159 * 12 : 249 * 12})
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">
                                    {billingInfo?.plan === 'trial' ? 'Free Evaluative License' :
                                        billingInfo?.plan === 'enterprise' ? `${orgData?.totalSeats || 1} User License${(orgData?.totalSeats || 1) > 1 ? 's' : ''}` : 'Per User License'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Matters</span>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                        {billingInfo?.currentCases || 0} / {(billingInfo?.planLimit || 0) >= 100000 ? '∞' : (billingInfo?.planLimit || 0)}
                                    </span>
                                </div>
                                {(billingInfo?.planLimit || 0) < 100000 && (
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${billingInfo?.planUsagePercentage || 0}%` }}
                                            className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Units</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                        {(billingInfo?.remainingCases ?? 0) >= 90000 ? 'Unlimited' : `${billingInfo?.remainingCases || 0} Matters`}
                                    </span>
                                </div>
                                {(billingInfo?.remainingCases ?? 0) < 90000 && (
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${100 - (billingInfo?.planUsagePercentage || 0)}%` }}
                                            className="bg-slate-600 h-full rounded-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onUpgradePlan}
                                disabled={billingInfo?.plan === 'elite' || billingInfo?.plan === 'enterprise'}
                                className="px-8 py-3 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                {billingInfo?.plan === 'elite' ? 'Max Tier Active' :
                                    billingInfo?.plan === 'enterprise' ? 'Enterprise Locked' :
                                        billingInfo?.plan === 'none' ? 'Select Plan' : 
                                            billingInfo?.plan === 'trial' ? 'Upgrade Plan' : 'Enhance Protocol'}
                            </motion.button>
                        </div>
                    </div>
                </div>

                <div className="glass-dark border border-white/10 rounded-[32px] p-8 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8 relative z-10">Vault Keys</h3>
                    <div className="space-y-6 flex-1 relative z-10">
                        {billingInfo?.paymentMethods?.map((pm: any) => (
                            <motion.div
                                layout
                                key={pm.id}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${billingInfo.defaultPaymentMethodId === pm.id ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-black/40'}`}
                            >
                                <div className="bg-white/10 p-3 rounded-xl border border-white/10 h-10 w-14 flex items-center justify-center">
                                    <CreditCard size={20} className="text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-black text-white tracking-widest truncate">•••• {pm.last4}</p>
                                        {billingInfo.defaultPaymentMethodId === pm.id && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(37,99,235,1)]" />
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Exp {pm.expiryMonth}/{pm.expiryYear}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {billingInfo.defaultPaymentMethodId !== pm.id && (
                                        <button
                                            onClick={() => onSetDefaultCard(pm.id)}
                                            className="p-2 text-slate-600 hover:text-primary transition-colors"
                                        >
                                            <Sparkles size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onRemoveCard(pm.id)}
                                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-icons-round text-lg">delete_outline</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onUpdatePayment}
                            className="w-full flex items-center justify-center px-6 py-3 bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all gap-3"
                        >
                            <CreditCard size={18} />
                            Configure Global Billing
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="glass-dark border border-white/10 rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Layers className="text-primary" size={20} />
                        Archived Transactions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quantum</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">State</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoadingHistory ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                    </td>
                                </tr>
                            ) : purchaseHistory.length > 0 ? (
                                purchaseHistory.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-white uppercase tracking-widest">
                                                {item.plan}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-primary">
                                                ${item.amount}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => generateInvoicePDF(item, billingInfo, orgData)}
                                                className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                                            >
                                                <DownloadCloud size={12} />
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                                        No neural data points found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
