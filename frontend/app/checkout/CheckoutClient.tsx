"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const plan = searchParams?.get('plan');
    const seats = searchParams?.get('seats');
    const interval = searchParams?.get('interval') || 'monthly';
    const type = searchParams?.get('type');

    if (mounted) {
      const billingUrl = `/settings?tab=billing&openPlan=true&planId=${plan || ''}&seats=${seats || ''}&interval=${interval}${type ? `&type=${type}` : ''}`;
      router.replace(billingUrl);
    }
  }, [mounted, searchParams, router]);

  return (
    <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 relative">
            <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <Loader2 className="animate-spin h-10 w-10" />
        </div>
        
        <div className="text-center">
            <h2 className="text-2xl font-black text-white font-display tracking-tightest mb-2">Secure Gateway</h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Initializing Billing Infrastructure...</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
