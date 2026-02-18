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
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col relative">
            {/* Navigation */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 rtl:space-x-reverse group">
                        <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-xl">gavel</span>
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
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto md:order-1`} id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-slate-100 rounded-lg bg-slate-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-slate-800 md:dark:bg-transparent dark:border-slate-700">
                            <li><Link href="/features" className="block py-2 px-3 text-slate-900 rounded hover:bg-slate-100 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="block py-2 px-3 text-slate-900 rounded hover:bg-slate-100 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-colors">Plans</Link></li>
                            <li><Link href="/about" className="block py-2 px-3 text-slate-900 rounded hover:bg-slate-100 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:text-white dark:hover:text-primary transition-colors">About</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-16">
                {children}
            </main>

            {/* Scroll To Top Button */}
            <button
                onClick={goToTop}
                className={`fixed bottom-8 right-8 z-40 p-3 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover ${
                    showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                }`}
                aria-label="Scroll to top"
            >
                <span className="material-icons-round text-xl">arrow_upward</span>
            </button>

            {/* Footer */}
            <footer className="bg-background-dark text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4 group">
                                <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <span className="material-icons-round text-xl">gavel</span>
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">LawCaseAI</span>
                            </Link>
                            <p className="mb-6 text-sm max-w-xs">
                                Premium AI-powered case management platform tailored for the complexities of the US legal system.
                            </p>
                            <div className="flex space-x-4">
                                <a className="text-slate-400 hover:text-white transition-colors" href="#"><span className="sr-only">LinkedIn</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-primary transition-colors">Plans</Link></li>
                                <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-sm">
                                <li><p className="hover:text-primary transition-colors cursor-pointer">Account Access</p></li>
                                <li><p className="hover:text-primary transition-colors cursor-pointer">Partner Support</p></li>
                                <li><p className="hover:text-primary transition-colors cursor-pointer">Contact Us</p></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                        <p>© 2026 LawCaseAI Inc. Professional Software. No trial available.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
