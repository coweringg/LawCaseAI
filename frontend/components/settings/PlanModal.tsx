import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, Building, Loader2, Shield, Info } from 'lucide-react';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    step: 'selection' | 'checkout';
    setStep: (step: 'selection' | 'checkout') => void;
    category: 'personal' | 'enterprise';
    setCategory: (category: 'personal' | 'enterprise') => void;
    interval: 'monthly' | 'annual';
    setInterval: (interval: 'monthly' | 'annual') => void;
    selectedPlanId: string | null;
    setSelectedPlanId: (id: string | null) => void;
    planSeats: number;
    setPlanSeats: (seats: number) => void;
    paymentData: any;
    setPaymentData: (data: any) => void;
    isProcessing: boolean;
    onConfirm: (planId?: string) => void;
    billingInfo: any;
    user: any;
}

export const PlanModal: React.FC<PlanModalProps> = ({
    isOpen,
    onClose,
    step,
    setStep,
    category,
    setCategory,
    interval,
    setInterval,
    selectedPlanId,
    setSelectedPlanId,
    planSeats,
    setPlanSeats,
    paymentData,
    setPaymentData,
    isProcessing,
    onConfirm,
    billingInfo,
    user
}) => {
    const PLAN_PRICES: Record<string, number> = { basic: 99, professional: 199, elite: 300, enterprise: 300 };
    const ANNUAL_PRICES: Record<string, number> = { basic: 79, professional: 159, elite: 249, enterprise: 249 };
    const ANNUAL_TOTALS: Record<string, number> = { basic: 79 * 12, professional: 159 * 12, elite: 249 * 12, enterprise: 249 * 12 };

    const currentUserPlan = user?.plan || billingInfo?.plan;
    const currentUserInterval = user?.billingInterval || 'monthly';
    const currentPlanCost = (currentUserPlan && currentUserPlan !== 'none')
        ? (currentUserInterval === 'annual' ? (ANNUAL_TOTALS[currentUserPlan] || 0) : (PLAN_PRICES[currentUserPlan] || 0))
        : 0;

    const getProratedPrice = (planId: string) => {
        const basePrice = interval === 'annual' ? (ANNUAL_TOTALS[planId] || 0) : (PLAN_PRICES[planId] || 0);
        if (!currentUserPlan || currentUserPlan === 'none' || planId === currentUserPlan || currentPlanCost >= basePrice) return basePrice;
        return Math.max(0, basePrice - currentPlanCost);
    };

    const hasProratedDiscount = (planId: string) => {
        const basePrice = interval === 'annual' ? (ANNUAL_TOTALS[planId] || 0) : (PLAN_PRICES[planId] || 0);
        return currentUserPlan && currentUserPlan !== 'none' && currentPlanCost > 0 && currentPlanCost < basePrice;
    };

    React.useEffect(() => {
        if (category === 'personal' && currentUserPlan && currentUserPlan !== 'none') {
            if (interval !== currentUserInterval) {
                setInterval(currentUserInterval as 'monthly' | 'annual');
            }
        }
    }, [category, currentUserPlan, currentUserInterval, interval, setInterval]);
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24 pb-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl glass-dark rounded-[40px] shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>

                        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <Layers className="text-primary" />
                                    {'Neural Tier Selection'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                    {'Select your processing infrastructure'}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-6 md:p-8 relative z-10">
                            <AnimatePresence mode="wait">
                                    <motion.div
                                        key="selection"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-5">
                                            <div className="flex justify-center">
                                                <div className="p-1 bg-black/40 rounded-3xl border border-white/5 flex items-center relative w-full max-w-[500px] overflow-hidden">
                                                    <motion.div
                                                        className="absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-[1.25rem] z-0 shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                                                        initial={false}
                                                        animate={{
                                                            x: category === 'personal' ? '4px' : 'calc(100% - 4px)'
                                                        }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    />
                                                    <button
                                                        onClick={() => setCategory('personal')}
                                                        className={`flex-1 relative z-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${category === 'personal' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                                                    >
                                                        Personal Firm
                                                    </button>
                                                    <button
                                                        onClick={() => setCategory('enterprise')}
                                                        className={`flex-1 relative z-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${category === 'enterprise' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                                                    >
                                                        Enterprise Infrastructure
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-center items-center gap-6">
                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${interval === 'monthly' ? 'text-primary' : 'text-slate-500'}`}>Monthly Billing</span>
                                                <button
                                                    onClick={() => {
                                                        if (category === 'personal' && currentUserPlan && currentUserPlan !== 'none') return;
                                                        setInterval(interval === 'monthly' ? 'annual' : 'monthly');
                                                    }}
                                                    disabled={category === 'personal' && !!(currentUserPlan && currentUserPlan !== 'none')}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${interval === 'annual' ? 'bg-primary' : 'bg-slate-800'} ${category === 'personal' && currentUserPlan && currentUserPlan !== 'none' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className={`h-4 w-4 transform rounded-full bg-white transition-transform ${interval === 'annual' ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                                </button>
                                                <div className="flex flex-col items-start leading-none">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${interval === 'annual' ? 'text-primary' : 'text-slate-500'}`}>Annual Selection</span>
                                                    {category === 'personal' && currentUserPlan && currentUserPlan !== 'none' ? (
                                                        <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter mt-0.5">Locked to {currentUserInterval}</span>
                                                    ) : (
                                                        <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter mt-0.5">Save 20%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {category === 'personal' && (user?.isOrgAdmin || user?.organizationId) && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-amber-500 max-w-2xl mx-auto mb-10"
                                            >
                                                <Info size={24} className="flex-shrink-0" />
                                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                                    Your account is associated with an Enterprise organization. Individual plans are restricted. Please manage your subscription via &quot;Enterprise Infrastructure&quot;.
                                                </p>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {category === 'personal' ? (
                                                [
                                                    { id: 'basic', name: 'Growth', price: interval === 'annual' ? '$79' : '$99', cases: '8 Cases', features: ['Standard Support', '8 Case Files', 'Basic AI Analysis'], color: 'bg-emerald-500', iconBg: 'bg-emerald-500/20' },
                                                    { id: 'professional', name: 'Professional', price: interval === 'annual' ? '$159' : '$199', cases: '18 Cases', features: ['Priority Support', '18 Case Files', 'Advanced AI Search'], color: 'bg-primary', iconBg: 'bg-primary/20' },
                                                    { id: 'elite', name: 'Elite', price: interval === 'annual' ? '$249' : '$300', cases: 'Unlimited', features: ['24/7 Neural Support', 'Unlimited Cases', 'Enterprise Firm Hub'], color: 'bg-amber-500', iconBg: 'bg-amber-500/20' }
                                                ].map((tier) => {
                                                    const isRestricted = user?.isOrgAdmin || user?.organizationId;
                                                    return (
                                                        <button
                                                            key={tier.id}
                                                            onClick={() => {
                                                                if (isRestricted || isProcessing) return;
                                                                setSelectedPlanId(tier.id);
                                                                setPlanSeats(5);
                                                                onConfirm(tier.id);
                                                            }}
                                                            disabled={billingInfo?.plan === tier.id || isRestricted || isProcessing}
                                                            className={`group text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex flex-col h-full ${billingInfo?.plan === tier.id
                                                                    ? 'border-white/20 bg-white/5 scale-[0.98] opacity-50 cursor-default'
                                                                    : 'border-white/5 bg-black/40 hover:border-primary/50 hover:bg-primary/5 hover:translate-y-[-4px]'
                                                                }`}
                                                        >
                                                            <div className="relative z-10 flex flex-col h-full">
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white border border-white/20 ${tier.iconBg}`}>
                                                                        {tier.name.charAt(0)}
                                                                    </div>
                                                                    {billingInfo?.plan === tier.id && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 text-white px-2 py-1 rounded-full">Current</span>
                                                                    )}
                                                                </div>
                                                                <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{tier.name}</h4>
                                                                <div className="flex items-baseline gap-1 mb-1">
                                                                    {hasProratedDiscount(tier.id) && (
                                                                        <span className="text-lg font-bold text-slate-500 line-through mr-1">${interval === 'annual' ? ANNUAL_TOTALS[tier.id] : PLAN_PRICES[tier.id]}</span>
                                                                    )}
                                                                    <span className="text-3xl font-black text-white">${interval === 'annual' ? tier.price.replace('$', '') : tier.price.replace('$', '')}</span>
                                                                    <span className="text-xs text-slate-500 font-bold">/mo</span>
                                                                </div>
                                                                {interval === 'annual' && (
                                                                    <div className="text-[10px] text-slate-500 font-bold mb-1 -mt-1 block">
                                                                        Billed annually (${ANNUAL_TOTALS[tier.id]})
                                                                    </div>
                                                                )}
                                                                {hasProratedDiscount(tier.id) && (
                                                                    <div className="text-[8px] font-black text-primary uppercase tracking-widest mb-4">Upgrade Credit Applied</div>
                                                                )}
                                                                {!hasProratedDiscount(tier.id) && <div className="mb-6" />}
                                                                <div className="space-y-3 mb-8 flex-1">
                                                                    {tier.features.map((f, i) => (
                                                                        <div key={i} className="flex items-center gap-2 text-slate-500">
                                                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-tight">{f}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-auto w-full py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all bg-white/10 text-white group-hover:bg-primary flex items-center justify-center">
                                                                    {billingInfo?.plan === tier.id ? 'Active' : (isProcessing && selectedPlanId === tier.id ? <Loader2 className="animate-spin mr-2" size={14} /> : 'Select Tier')}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full md:col-span-3 group p-8 md:p-10 rounded-[3rem] border border-primary/20 bg-primary/5 relative overflow-hidden">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
                                                        <div className="space-y-4">
                                                            <div className="w-14 h-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40">
                                                                <Building size={28} />
                                                            </div>
                                                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise Firm Infrastructure</h4>
                                                            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-sm">Acquire unlimited capacity for your entire organization. Get an exclusive firm code for instant network-wide access.</p>
                                                        </div>
                                                        <div className="bg-black/40 rounded-[2.5rem] p-8 border border-white/5 space-y-5">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Lawyers</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <input 
                                                                            type="number"
                                                                            min={billingInfo?.organization?.totalSeats || 5}
                                                                            max="200"
                                                                            value={planSeats}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                const min = billingInfo?.organization?.totalSeats || 5;
                                                                                if (!isNaN(val)) setPlanSeats(Math.max(min, Math.min(val, 200)));
                                                                            }}
                                                                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-primary font-black text-[14px] outline-none focus:border-primary/50 transition-all text-center"
                                                                        />
                                                                        <span className="text-sm font-black text-primary">Seats</span>
                                                                    </div>
                                                                </div>
                                                                <input 
                                                                    type="range" 
                                                                    min={billingInfo?.organization?.totalSeats || 5} 
                                                                    max="200" 
                                                                    value={planSeats > 200 ? 200 : planSeats} 
                                                                    onChange={(e) => setPlanSeats(parseInt(e.target.value))}
                                                                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary border border-white/5"
                                                                />
                                                                {billingInfo?.organization?.totalSeats > 0 && (
                                                                    <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest text-center mt-2">
                                                                        Minimum seats required: {billingInfo.organization.totalSeats} (Your current infrastructure)
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Firm Infrastructure Name</label>
                                                                    <span className="text-[8px] text-primary/70 font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Required</span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. DARWIN CASE AI SOLUTIONS"
                                                                    value={paymentData.firmName}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, firmName: e.target.value })}
                                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-sm focus:border-primary/50 outline-none placeholder:text-white/20"
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-baseline gap-2">
                                                                <div className="text-right">
                                                                    <span className="text-3xl font-black text-white tracking-tighter">${(planSeats * (interval === 'annual' ? 249 : 300)).toLocaleString()}</span>
                                                                    <span className="text-[10px] text-slate-500 font-black block">Total /mo</span>
                                                                    {interval === 'annual' && (
                                                                        <span className="text-[10px] text-slate-500 font-bold block mt-1">Billed annually (${(planSeats * 249 * 12).toLocaleString()})</span>
                                                                    )}
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        if (!paymentData.firmName || isProcessing) return;
                                                                        setSelectedPlanId('enterprise');
                                                                        onConfirm('enterprise');
                                                                    }}
                                                                    disabled={!paymentData.firmName || isProcessing}
                                                                    className="flex-1 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl text-center hover:scale-[1.02] transition-all flex items-center justify-center disabled:opacity-50"
                                                                >
                                                                    {isProcessing && selectedPlanId === 'enterprise' ? <Loader2 className="animate-spin" size={14} /> : 'Get Firm Code'}
                                                                </button>
                                                            </div>
                                                            <div className="pt-3 border-t border-white/5 space-y-2">
                                                                <p className="text-[9px] text-slate-500 font-medium leading-snug italic text-center">
                                                                    <span className="text-primary font-bold uppercase tracking-tighter">Onboarding:</span> Firm Management unlocks upon acquisition.
                                                                </p>
                                                                <p className="text-[9px] text-slate-500 font-medium leading-snug italic text-center">
                                                                    <span className="text-primary font-bold uppercase tracking-tighter">Capacity:</span> You can scale successfully beyond 200 seats from your dashboard.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
