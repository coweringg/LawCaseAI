import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    sideContent?: React.ReactNode;
}

export default function AuthLayout({ children, sideContent }: AuthLayoutProps) {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased h-screen w-full flex overflow-hidden font-display transition-colors duration-200">
            {/* Left Side: Branding & Visuals (45% width on large screens) */}
            <div className="hidden lg:flex w-[45%] bg-primary relative flex-col justify-between overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Modern corporate glass architecture abstract"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhiWOiSmWYeEInqcoIqMQkOtrNWMedUsdDYo99RZ_I1fdp0s1nXxZHf9No_9MBUbLaI75Rhs3I0dOSiwQdU8CEGlqP9yo8zao_teTpkSZGBcrfZOt7rC8NjtaN9ziUolIq19mPSH_nmFUihFBgsTlRK2fBhhA8EU8MUoP0aJ9N7YZbw0zfya_yANCZW63veaiWt0ZnABdYXlbbDH4nEHs_p-qkrbpCoI6qFSmtbAPwMGixwEVTp1C8iQSTxnUTG6yu5cwzAzqUDvw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#062a78] opacity-90"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 px-12 py-12 h-full flex flex-col justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <span className="material-icons text-white text-lg">gavel</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">LawCaseAI</span>
                    </Link>

                    {/* Main Branding Text */}
                    <div className="mb-12">
                        <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-6">
                            Automate your case research with precision.
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                            Join the platform that processes 10,000+ legal documents daily, helping US firms save over 40 hours per week on discovery.
                        </p>
                    </div>

                    {/* Testimonial / Social Proof */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
                        <div className="flex items-center gap-1 mb-3 text-yellow-400">
                            <span className="material-icons text-sm">star</span>
                            <span className="material-icons text-sm">star</span>
                            <span className="material-icons text-sm">star</span>
                            <span className="material-icons text-sm">star</span>
                            <span className="material-icons text-sm">star</span>
                        </div>
                        <p className="text-white/90 text-sm mb-4 italic">"LawCaseAI has revolutionized how we handle preliminary research. The accuracy is unmatched in the industry."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                                <span className="text-white font-bold">JD</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">James Dale</p>
                                <p className="text-blue-200 text-xs">Partner, Dale & Associates</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-8 text-blue-200/60 text-xs">
                        © 2024 LawCaseAI Inc. All rights reserved.
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
