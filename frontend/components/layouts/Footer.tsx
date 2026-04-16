import React from 'react';
import Link from 'next/link';
import { Gavel } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface FooterProps {
    variant?: 'public' | 'legal';
}

export default function Footer({ variant = 'public' }: FooterProps) {
    const pathname = usePathname();

    if (variant === 'legal') {
        const getLegalLinkClass = (path: string) => {
            const isActive = pathname === path;
            return `hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-500'}`;
        };

        return (
            <footer className="border-t border-white/5 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2 opacity-50">
                            <Gavel size={16} />
                            <span className="font-bold tracking-tight">LawCaseAI</span>
                        </div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-balance text-center md:text-left">
                            © 2026 LawCaseAI Infrastructure. All Rights Reserved.
                        </p>
                    </div>
                    <div className="flex items-center gap-8 text-center flex-wrap justify-center">
                        <Link href="/privacy" className={getLegalLinkClass('/privacy')}>Privacy Policy</Link>
                        <Link href="/terms" className={getLegalLinkClass('/terms')}>Terms of Service</Link>
                        <Link href="/refund" className={getLegalLinkClass('/refund')}>Refund Policy</Link>
                        <Link href="/login?support=true" className={getLegalLinkClass('/login')}>Contact Support</Link>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-background-dark text-slate-400 py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-8 mb-8">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-2 group">
                            <div className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                                <span className="material-icons-round text-xl leading-none">gavel</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">LawCaseAI</span>
                        </Link>
                        <p className="mb-4 text-sm max-w-xs">
                            Premium AI-powered case management platform tailored for the complexities of the US legal system.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold mb-2">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Plans</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>© 2026 LawCaseAI. All rights reserved. Professional Software.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
                        <Link href="/login?support=true" className="hover:text-white transition-colors">Contact Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
