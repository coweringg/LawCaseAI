import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 mesh-gradient opacity-40 dark:opacity-100" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full animate-slow-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full animate-slow-glow" style={{ animationDelay: '-5s' }} />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 rtl:space-x-reverse group">
                        <div className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-xl leading-none">gavel</span>
                        </div>
                        <span className="self-center text-xl font-bold whitespace-nowrap text-primary dark:text-white tracking-tight group-hover:text-primary transition-colors">LawCaseAI</span>
                    </Link>
                    <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
                        <Link href="/login">
                            <button className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium text-sm px-4 py-2 text-center hidden sm:block transition-colors" type="button">Log In</button>
                        </Link>
                        <Link href="/register">
                            <button className="text-white bg-primary hover:bg-primary-hover focus:ring-4 focus:outline-none focus:ring-primary/20 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg shadow-primary/30" type="button">Get Started</button>
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-500 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:focus:ring-slate-600"
                            type="button"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                    </div>
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto md:order-1 transition-all duration-300`} id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-bold border border-primary/10 rounded-2xl bg-white dark:bg-background-dark md:bg-transparent md:dark:bg-transparent md:border-0 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
                            <li><Link href="/features" className="block py-2 px-3 text-slate-900 rounded-xl hover:bg-primary/10 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-all">Features</Link></li>
                            <li><Link href="/pricing" className="block py-2 px-3 text-slate-900 rounded-xl hover:bg-primary/10 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-all">Plans</Link></li>
                            <li><Link href="/about" className="block py-2 px-3 text-slate-900 rounded-xl hover:bg-primary/10 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-all">About</Link></li>
                            <li className="sm:hidden mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                <Link href="/login" className="block py-2 px-3 text-primary font-black uppercase tracking-widest text-[10px]">Log In</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-16">
                {children}
            </main>

            <button
                onClick={goToTop}
                className={`fixed bottom-8 right-8 z-40 p-3 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover ${
                    showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                }`}
                aria-label="Scroll to top"
            >
                <span className="material-icons-round text-xl">arrow_upward</span>
            </button>

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
                        <p>© 2026 LawCaseAI. All rights reserved. Professional Software. No trial available.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    );
}
