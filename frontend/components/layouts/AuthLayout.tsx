import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    sideContent?: React.ReactNode;
}

export default function AuthLayout({ children, sideContent }: AuthLayoutProps) {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased h-screen w-full flex overflow-hidden font-display transition-colors duration-200">
            {/* Left Side: Branding & Visuals (45% width on large screens) */}
            <div className="hidden lg:flex w-[45%] bg-background-dark relative flex-col justify-between overflow-hidden border-r border-white/5">
                {/* Premium Background Layer */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.05] scale-150 rotate-12"></div>

                    {/* Animated Depth Blobs */}
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

                {/* Content Container */}
                <div className="relative z-10 px-12 py-12 h-full flex flex-col justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                            <span className="material-icons-round text-xl">gavel</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight font-display">LawCaseAI</span>
                    </Link>

                    {/* Main Branding Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-6 font-display">
                            Command the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 italic">Digital Twin</span> <br />
                            of Your Firm.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            Standardizing professional AI infrastructure for high-stakes US legal teams.
                        </p>
                    </motion.div>

                    {/* Testimonial / Social Proof */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="glass border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-1 mb-4 text-primary">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className="material-icons-round text-xs">star</span>
                            ))}
                        </div>
                        <p className="text-slate-300 text-sm mb-6 italic leading-relaxed">
                            "The crystallography pattern analysis combined with LawCaseAI's semantic layer has saved our discovery team hundreds of hours."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                JD
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">James Dale</p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Partner, Dale & Associates</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer Copyright */}
                    <div className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                        © 2026 LawCaseAI Infrastructure
                    </div>
                </div>
            </div>

            {/* Right Side: Secure Form (Full width mobile, 55% desktop) */}
            <div className="w-full lg:w-[55%] h-full bg-background-light dark:bg-background-dark flex flex-col items-center justify-center relative overflow-y-auto">
                {/* Mobile Logo (Visible only on small screens) */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center">
                            <span className="material-icons text-sm">gavel</span>
                        </div>
                        <span className="text-primary dark:text-white font-bold text-lg">LawCaseAI</span>
                    </Link>
                </div>

                {/* Content Children */}
                <div className="w-full max-w-md px-6 py-8 sm:px-8">
                    {children}

                    {/* Footer Terms */}
                    <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        By continuing, you agree to LawCaseAI's
                        <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300 ml-1">Terms of Service</Link>
                        and
                        <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300 ml-1">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
