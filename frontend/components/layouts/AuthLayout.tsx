import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    sideContent?: React.ReactNode;
}

export default function AuthLayout({ children, sideContent }: AuthLayoutProps) {
    return (
        <div className="bg-[#060910] text-slate-100 antialiased h-screen w-full flex overflow-hidden font-display transition-colors duration-200">
            <div className="hidden lg:flex w-[45%] bg-[#060910] relative flex-col justify-between overflow-hidden border-r border-white/5 shadow-2xl">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 mesh-gradient opacity-60"></div>
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 rotate-12"></div>

                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, 0],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
                    ></motion.div>
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [0, -5, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
                    ></motion.div>
                </div>

                <div className="relative z-10 px-12 py-12 h-full flex flex-col justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-icons-round text-xl">gavel</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight font-display group-hover:text-primary transition-colors duration-300">LawCaseAI</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6 xl:mb-12"
                    >
                        <h1 className="text-4xl xl:text-6xl font-black text-white leading-tight mb-4 xl:mb-8 font-display tracking-tightest">
                            Upgrade Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Legal Intelligence</span> <br />
                            with LawCaseAI.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
                            Standardizing professional AI infrastructure for high-stakes US legal teams.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="premium-glass border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] rotate-45 scale-150"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-1 mb-6 text-primary drop-shadow-[0_0_10px_rgba(10,68,184,0.4)]">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="material-icons-round text-sm">star</span>
                                ))}
                            </div>
                            <p className="text-slate-300 text-lg mb-8 italic leading-relaxed font-medium">
                                &ldquo;The crystallography pattern analysis combined with LawCaseAI&apos;s semantic layer has saved our discovery team hundreds of hours.&rdquo;
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                    JD
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm">Senior Litigation Partner</p>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">Early Access Partner</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                        © 2026 LawCaseAI
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[55%] h-full bg-[#060910] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-y-auto scrollbar-hide">
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center">
                            <span className="material-icons text-sm">gavel</span>
                        </div>
                        <span className="text-primary dark:text-white font-bold text-lg">LawCaseAI</span>
                    </Link>
                </div>

                <div className="w-full max-w-md py-8 sm:py-12">
                    {children}

                    <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        By continuing, you agree to LawCaseAI&apos;s{' '}
                        <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
