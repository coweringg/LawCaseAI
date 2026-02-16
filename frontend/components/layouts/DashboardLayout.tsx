import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        return router.pathname === path || router.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-hidden">
            {/* Global Usage Warning - Mocked State */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 py-2 px-4 flex items-center justify-center gap-3 z-50">
                <span className="material-icons text-amber-600 dark:text-amber-500 text-lg">warning</span>
                <p className="text-amber-900 dark:text-amber-200 text-xs font-medium">
                    You have reached 80% of your case limit. Upgrade now to ensure uninterrupted service.
                </p>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors">
                    Upgrade Now
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 flex flex-col justify-between hidden md:flex border-r border-slate-200 dark:border-slate-700">
                    <div>
                        <div className="h-20 flex items-center px-6 mb-4">
                            <Link href="/dashboard" className="flex items-center gap-2 text-primary dark:text-white">
                                <span className="material-icons-round text-3xl text-primary">gavel</span>
                                <span className="text-xl font-extrabold tracking-tight">LawCase<span className="text-primary">AI</span></span>
                            </Link>
                        </div>
                        <nav className="px-4 space-y-1">
                            <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border ${isActive('/dashboard') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white border-slate-200 dark:border-slate-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white border-transparent'}`}>
                                <span className={`material-icons-round ${isActive('/dashboard') ? 'text-primary dark:text-white' : 'text-slate-400'}`}>dashboard</span>
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/cases" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${isActive('/cases') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}>
                                <span className={`material-icons-round ${isActive('/cases') ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-primary'}`}>folder_open</span>
                                <span>My Cases</span>
                            </Link>
                            <Link href="/documents" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${isActive('/documents') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}>
                                <span className={`material-icons-round ${isActive('/documents') ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-primary'}`}>cloud_queue</span>
                                <span>Document Vault</span>
                            </Link>
                            <Link href="/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${isActive('/calendar') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}>
                                <span className={`material-icons-round ${isActive('/calendar') ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-primary'}`}>calendar_today</span>
                                <span>Calendar</span>
                            </Link>
                            <Link href="/billing" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${isActive('/billing') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}>
                                <span className={`material-icons-round ${isActive('/billing') ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-primary'}`}>payments</span>
                                <span>Billing</span>
                            </Link>
                            <hr className="my-4 border-slate-100 dark:border-slate-700" />
                            <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${isActive('/settings') ? 'bg-slate-100 dark:bg-slate-700 text-primary dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'}`}>
                                <span className={`material-icons-round ${isActive('/settings') ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-primary'}`}>settings</span>
                                <span>Settings</span>
                            </Link>
                        </nav>
                    </div>
                    <div className="p-4 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plan Usage</span>
                                <span className="text-[10px] font-bold text-primary dark:text-blue-400">75%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                                <div className="bg-primary dark:bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <button className="w-full py-2 bg-primary hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                Upgrade Plan
                            </button>
                        </div>
                        <div className="flex items-center gap-3 px-2 py-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-slate-100 dark:border-slate-600 flex items-center justify-center text-primary font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{user?.role || 'Senior Counsel'}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                                title="Log Out"
                            >
                                <span className="material-icons-round">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <header className="h-20 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 flex-shrink-0 z-10">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Good morning, Counsel</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Monday, Oct 12 • New York Chambers</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative group hidden lg:block">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400 text-xl group-focus-within:text-primary dark:group-focus-within:text-blue-400">search</span>
                                <input className="pl-10 pr-4 py-2.5 w-96 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 transition-all outline-none dark:text-white" placeholder="Global Search: cases, precedents, filings..." type="text" />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all relative">
                                    <span className="material-icons-round">notifications</span>
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-surface-dark"></span>
                                </button>
                                <Link href="/cases/new">
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all shadow-md">
                                        <span className="material-icons-round text-lg">add</span>
                                        <span>Create Case</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Page Content */}
                    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-background-dark p-8">
                        <div className="max-w-[1400px] mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
