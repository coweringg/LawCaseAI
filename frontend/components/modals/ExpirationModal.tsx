import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';

interface ExpirationModalProps {
    isOpen: boolean;
    onClose: (delayHours: number) => void;
    user: User | null;
}

export default function ExpirationModal({ isOpen, onClose, user }: ExpirationModalProps) {
    if (!isOpen || !user) return null;

    const isPaidExpiration = user.expiredPremium;
    const isFreeExpiration = user.expiredTrial && !user.expiredPremium;
    const isEmployee = user.organizationId && !user.isOrgAdmin;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring" as const, damping: 25, stiffness: 300 }
        },
        exit: { opacity: 0, scale: 0.95, y: 10 }
    };

    if (!isPaidExpiration && !isFreeExpiration) return null;

    const getTitle = () => {
        if (isEmployee && isPaidExpiration) return "Organization Plan Expired";
        return isPaidExpiration ? "Subscription Expired" : "Free Trial Ended";
    };

    const getMessage = () => {
        if (isEmployee && isPaidExpiration) {
            return "The plan for your organization has expired. Your cases have been deactivated. Please inform an administrator to reactivate access.";
        }
        return isPaidExpiration 
            ? "We noticed your last billing cycle has expired. To protect your data, all your cases have been deactivated. Don't worry, you can easily reactivate them at any time by resuming your plan."
            : "Your 24-hour free trial has come to an end. To reactivate your case and continue enjoying the legal intelligence ecosystem, you need to purchase an official plan.";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-slate-900 border border-white/10 w-full max-w-lg md:max-w-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 font-display"
                    >
                        <div className="absolute top-0 right-0 left-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent z-0 pointer-events-none" />
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full z-0 pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full z-0 pointer-events-none" />

                        <div className="p-8 md:p-10 text-center relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                                <span className={`material-icons-round text-4xl ${isPaidExpiration ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {isPaidExpiration ? (isEmployee ? 'group_off' : 'gavel') : 'timer_off'}
                                </span>
                                <div className="absolute inset-0 rounded-2xl flex items-center justify-center animate-ping opacity-20 bg-primary pointer-events-none" style={{ animationDuration: '3s' }} />
                            </div>

                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                                {getTitle()}
                            </h2>
                            
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                {getMessage()}
                            </p>

                            {isPaidExpiration && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-left backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons-round text-sm text-slate-500">receipt_long</span>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Log</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3 text-sm text-slate-300 items-start">
                                            <span className="material-icons-round text-rose-500 text-base mt-0.5">error_outline</span>
                                            <div>
                                                <span className="font-bold text-white">Plan expiration:</span> Your monthly/annual access cycle has concluded.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 text-sm text-slate-300 items-start">
                                            <span className="material-icons-round text-amber-500 text-base mt-0.5">lock</span>
                                            <div>
                                                <span className="font-bold text-white">Suspended cases:</span> Your files and associated AIs are currently inactive, but securely encrypted.
                                            </div>
                                        </li>
                                        <li className="flex gap-3 text-sm text-slate-300 items-start">
                                            <span className="material-icons-round text-emerald-500 text-base mt-0.5">check_circle</span>
                                            <div>
                                                <span className="font-bold text-white">Next Step:</span> Renew your subscription to instantly restore full access.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {!isEmployee && (
                                    <Link href="/settings?tab=billing" onClick={() => onClose(0)} className="w-full">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 border border-white/10 transition-colors"
                                        >
                                            View Plans
                                        </motion.button>
                                    </Link>
                                )}

                                <div className={`flex gap-3 flex-col sm:flex-row`}>
                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onClose(24)}
                                        className={`py-3.5 px-6 bg-white/5 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition-colors flex-1`}
                                    >
                                        Close for now
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onClose(8760)} 
                                        className={`py-3.5 px-6 bg-white/5 text-slate-500 hover:text-slate-300 font-bold text-xs rounded-xl border border-white/10 transition-colors flex-1`}
                                    >
                                        Don&apos;t show again
                                    </motion.button>
                                </div>
                            </div>
                            
                            <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-6 pt-6 border-t border-white/5">
                                LawCaseAI Core Intelligence
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
