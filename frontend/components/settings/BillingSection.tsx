import React from 'react';
import { CreditCard, Loader2, Sparkles, Layers, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export const BillingSection: React.FC<BillingSectionProps> = ({
    billingInfo,
    orgData,
    purchaseHistory,
    isLoadingHistory,
    onUpgradePlan,
    onUpdatePayment,
    onSetDefaultCard,
    onRemoveCard,
    formatDate
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Current Plan Card */}
                <div className="md:col-span-2 glass-dark border border-white/10 rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="p-10 relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {billingInfo?.plan === 'none' ? 'No Active Plan' :
                                            billingInfo?.plan === 'basic' ? 'Growth' :
                                                billingInfo?.plan === 'professional' ? 'Professional' :
                                                    billingInfo?.plan === 'elite' ? 'Elite' :
                                                        billingInfo?.plan === 'enterprise' ? 'Enterprise Intelligence' :
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
                                        billingInfo?.plan === 'basic' ? 'Standard Legal Processing' :
                                            billingInfo?.plan === 'professional' ? 'Advanced Neural Jurisprudence' :
                                                'Firm-Wide Intelligence Access'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    ${billingInfo?.plan === 'none' ? '0' :
                                        billingInfo?.plan === 'enterprise' ? ((orgData?.totalSeats || 1) * (billingInfo?.interval === 'annual' ? 249 : 300)) :
                                            billingInfo?.plan === 'basic' ? (billingInfo?.interval === 'annual' ? '79' : '99') :
                                                billingInfo?.plan === 'professional' ? (billingInfo?.interval === 'annual' ? '159' : '199') :
                                                    '300'}
                                    <span className="text-sm text-slate-500 font-bold">/mo</span>
                                </p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">
                                    {billingInfo?.plan === 'enterprise' ? `${orgData?.totalSeats || 1} User License${(orgData?.totalSeats || 1) > 1 ? 's' : ''}` : 'Per User License'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
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

                        <div className="pt-10 border-t border-white/5">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onUpgradePlan}
                                disabled={billingInfo?.plan === 'elite' || billingInfo?.plan === 'enterprise'}
                                className="px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                {billingInfo?.plan === 'elite' ? 'Max Tier Active' :
                                    billingInfo?.plan === 'enterprise' ? 'Enterprise Locked' :
                                        billingInfo?.plan === 'none' ? 'Select Plan' : 'Enhance Protocol'}
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
                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${billingInfo.defaultPaymentMethodId === pm.id ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-black/40'}`}
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
                            className="w-full flex items-center justify-center px-6 py-4 bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all gap-3"
                        >
                            <CreditCard size={18} />
                            Configure Global Billing
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Purchase History Section */}
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
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quantum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">State</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Data</th>
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
                                        <td className="px-8 py-6 text-xs font-bold text-slate-400">
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
                                        <td className="px-8 py-6 text-right">
                                            <a href={item.invoiceUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                                                <Share2 size={12} />
                                                PDF
                                            </a>
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
