import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { getPaddleInstance } from '@/utils/paddle';
import { Paddle } from '@paddle/paddle-js';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  User as UserIcon,
  ChevronLeft,
  Globe,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface OrderSummary {
  plan: string;
  seats: number;
  pricePerUser: number;
  totalPrice: number;
  interval: 'monthly' | 'annual';
  isBusiness: boolean;
}

export default function Checkout() {
  const router = useRouter();
  const { plan, seats, type } = router.query;
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    setMounted(true);
    getPaddleInstance().then(p => {
      if (p) setPaddle(p);
    });

    if (router.isReady) {
      const settingsUrl = `/settings?tab=billing&openPlan=true&planId=${plan || ''}${seats ? `&seats=${seats}` : ''}`;
      router.replace(settingsUrl);
    }
  }, [router.isReady, plan, seats, type, router]);

  const handleCompletePurchase = async () => {
    if (!order || !user || !paddle) {
      toast.error("Preparation incomplete or Paddle failed to load.");
      return;
    }

    setIsLoading(true);

    try {
      const { data: response } = await api.post('/api/payments/checkout', {
        planId: order.plan,
        seats: order.seats,
        interval: order.interval
      });

      if (!response.success || !response.data?.transactionId) {
        throw new Error(response.message || 'Failed to initialize payment gateway');
      }

      paddle.Checkout.open({
        transactionId: response.data.transactionId,
        settings: {
           displayMode: "overlay",
           theme: "dark",
           successUrl: `${window.location.origin}/dashboard?status=${order.isBusiness ? 'success_org' : 'success'}`
        }
      });

    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Transaction error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !order) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
       <div className="animate-spin h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full" />
    </div>
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Checkout - Secure Payment | LawCaseAI</title>
      </Head>

      <div className="max-w-6xl mx-auto pt-8 pb-16 px-4">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Pricing & Tiers</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>

              <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 font-display tracking-tight">
                    Cross-Border <span className="text-primary italic">Checkout</span>
                  </h1>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Compliance Enabled via Paddle</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                  <ShieldCheck size={28} />
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-xs font-black text-white uppercase tracking-widest">Secure Connection Verified</span>
                   </div>
                   <p className="text-slate-400 text-sm leading-relaxed">
                      You are using our global payment infrastructure. This allows for seamless USD transactions from the United States with full regulatory compliance in Uruguay.
                   </p>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleCompletePurchase}
                    disabled={isLoading}
                    className="w-full py-6 bg-primary text-white text-sm font-black uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-6 w-6 border-4 border-white/20 border-t-white rounded-full" />
                    ) : (
                      <>
                        Initialize Secure Payment
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-8 pt-4">
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Paddle Verified Merchant</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Globe size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">International Compliance</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark border border-white/5 rounded-[2.5rem] p-10 sticky top-24 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-10 bg-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-b-2xl uppercase tracking-[0.2em] border border-t-0 border-primary/30">
                L-C-AI Global
              </div>

              <h2 className="text-2xl font-black text-white mb-8 font-display">Provisioning <span className="text-primary italic">Plan</span></h2>
              
              <div className="space-y-8">
                <div className="pb-8 border-b border-white/5 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-[1.25rem] ${order.isBusiness ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'}`}>
                        {order.isBusiness ? <Building2 size={32} /> : <UserIcon size={32} />}
                      </div>
                      <div>
                        <p className="text-lg font-black text-white uppercase tracking-tighter">{order.plan} License</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{order.isBusiness ? 'Corporate FIRM Hub' : 'Individual Practitioner'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Seats Allocated</span>
                    <span className="text-white font-black">{order.seats} Users</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-500 font-black uppercase tracking-[0.2em]">
                    <span>Standard Billing</span>
                    <span className="text-slate-300">${(order.pricePerUser * order.seats).toLocaleString()} /mo</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-black uppercase tracking-[0.2em]">
                    <span>Neural Credits</span>
                    <span className="text-emerald-500">Unlimited</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Total Monthly Commitment</p>
                    <p className="text-5xl font-black text-white tracking-tighter">${order.totalPrice.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-black uppercase mb-2 tracking-widest">USD</p>
                </div>
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                 <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <Sparkles size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Instant Deployment</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Plan activated immediately after success</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
