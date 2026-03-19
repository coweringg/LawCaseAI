import React from 'react';
import { Lock, ArrowRight, Zap, Shield, RotateCcw, XCircle, Archive, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LockedTrialOverlayProps {
  isTrialExpired?: boolean;
  closedByUser?: boolean;
  status?: string;
}

export const LockedTrialOverlay: React.FC<LockedTrialOverlayProps> = ({ isTrialExpired = false, closedByUser = false, status }) => {
  const isPending = status === 'pending';
  const isDiscovery = status === 'discovery';
  const isClosed = closedByUser || status === 'closed' || status === 'archived';

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full premium-glass rounded-[3rem] border border-white/10 p-12 text-center shadow-2xl space-y-8"
      >
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center relative ${isClosed ? 'bg-red-500/10 text-red-400' : isPending ? 'bg-amber-500/10 text-amber-500' : isDiscovery ? 'bg-purple-500/10 text-purple-400' : 'bg-primary/10 text-primary'}`}>
            {isClosed ? <XCircle size={48} /> : isPending ? <Clock size={48} /> : isDiscovery ? <Search size={48} /> : <Lock size={48} />}
            <div className={`absolute -top-2 -right-2 w-8 h-8 bg-background-dark rounded-full flex items-center justify-center border ${isClosed ? 'border-red-500/20' : isPending ? 'border-amber-500/20' : isDiscovery ? 'border-purple-500/20' : 'border-primary/20'} anim-pulse`}>
                {isClosed 
                  ? <Lock size={14} className="text-red-400" />
                  : isPending
                  ? <Lock size={14} className="text-amber-500" />
                  : isDiscovery
                  ? <Lock size={14} className="text-purple-400" />
                  : <Zap size={14} className="text-primary" fill="currentColor" />
                }
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white font-display tracking-tightest">
            {isClosed ? 'Permanently Sealed.' : isPending ? 'Pending Activation.' : isDiscovery ? 'Discovery Phase.' : isTrialExpired ? 'Trial Expired.' : 'Case Suspended.'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isClosed
              ? <>This case was <span className="text-red-400 font-bold italic">permanently sealed</span>. It cannot be reopened or reactivated. All data is preserved for reference purposes only.</>
              : isPending
                ? <>This case is currently <span className="text-amber-500 font-bold italic">pending</span> and awaiting activation. Return to the dashboard to mark it as active and unlock full workspace features.</>
              : isDiscovery
                ? <>This case is currently in the <span className="text-purple-400 font-bold italic">discovery phase</span>. Certain interactive features are disabled until it is marked as active.</>
              : isTrialExpired
                ? <>Your evaluation period has ended. This workspace is now <span className="text-white font-bold italic">read-only</span> until a permanent plan is activated.</>
                : <>Your billing cycle has expired and this case has been <span className="text-white font-bold italic">suspended</span>. Reactivate it from your case list after renewing your plan.</>
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                {isClosed ? <Archive size={20} className="text-red-400" /> : isPending ? <Clock size={20} className="text-amber-500" /> : isDiscovery ? <Search size={20} className="text-purple-400" /> : <Shield size={20} className="text-primary" />}
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {isClosed ? 'Archived' : isPending ? 'Awaiting Startup' : isDiscovery ? 'Pre-trial Data' : 'Secure Data'}
                </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2">
                {isClosed
                  ? <XCircle size={20} className="text-slate-600" />
                  : isTrialExpired
                    ? <ArrowRight size={20} className="text-emerald-500" />
                    : <RotateCcw size={20} className="text-emerald-500" />
                }
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {isClosed ? 'No Reactivation' : isTrialExpired ? 'Instant Upgrade' : 'Reactivatable'}
                </span>
            </div>
        </div>

        <div className="space-y-4">
            <Link href={isClosed ? '/cases' : isTrialExpired ? '/settings?tab=billing&openPlan=true' : '/cases'}>
              <button className={`w-full py-5 font-black rounded-2xl shadow-2xl hover:scale-105 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 group ${
                isClosed 
                  ? 'bg-white/10 text-slate-300 border border-white/10 shadow-none' 
                  : (isPending || isDiscovery) ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-primary text-white shadow-primary/30 hover:bg-primary-hover'
              }`}>
                  {isClosed ? 'Return to Cases' : isPending ? 'Go To Cases To Activate' : isDiscovery ? 'Return to Cases' : isTrialExpired ? 'Upgrade Infrastructure' : 'Go to Cases'}
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                {isClosed
                  ? 'This action is irreversible. Create a new case to continue working.'
                  : isPending || isDiscovery
                  ? 'Workspace restrictions apply until the case is active'
                  : isTrialExpired
                    ? 'Reactivating this workspace counts toward your new plan limits.'
                    : 'All data remains intact and recoverable upon reactivation.'
                }
            </p>
        </div>
      </motion.div>
    </div>
  );
};
