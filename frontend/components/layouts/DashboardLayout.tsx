import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardStats } from '@/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const TimeDisplay = memo(() => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 flex items-center gap-3 shadow-lg shadow-primary/5">
            <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-icons-round">schedule</span>
            </div>
        </div>
    );
});

TimeDisplay.displayName = 'TimeDisplay';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { user, token, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ cases: Array<{ id: string; title: string; subtitle: string; status: string }>; files: Array<{ id: string; caseId: string; title: string; subtitle: string }> }>({ cases: [], files: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    useEffect(() => {
        const fetchUsageStats = async () => {
            if (!token || !user) return;
            try {
                // Check if user has already dismissed the banner for this session/limit
                const dismissed = localStorage.getItem(`dismiss_usage_banner_${user.id}`);
                if (dismissed === 'true') {
                    setIsBannerVisible(false);
                }

                const response = await api.get('/dashboard/stats');
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching usage stats:', error);
            }
        };

        fetchUsageStats();
    }, [token, user]);

    // Global Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                setShowSearchDropdown(true);
                try {
                    const response = await api.get(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
                    if (response.data.success) {
                        setSearchResults(response.data.data);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ cases: [], files: [] });
                setShowSearchDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, token]);

    const handleDismissBanner = () => {
        setIsBannerVisible(false);
        if (user) {
            localStorage.setItem(`dismiss_usage_banner_${user.id}`, 'true');
        }
    };

    const isActive = (path: string) => {
        return router.pathname === path || router.pathname.startsWith(`${path}/`);
    };

    const usagePercentage = dashboardData?.cases?.usagePercentage || 0;
    const showWarning = usagePercentage >= 80 && isBannerVisible;

    if (!mounted) return null;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-hidden relative">
            {/* Background Animated Blobs for Dashboard */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                        opacity: [0.03, 0.05, 0.03]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"
                ></motion.div>
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -45, 0],
                        opacity: [0.02, 0.04, 0.02]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"
                ></motion.div>
            </div>
            {/* Global Usage Warning */}
            {showWarning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 py-2 px-4 flex items-center justify-between z-50">
                    <div className="flex items-center justify-center gap-3 flex-1">
                        <span className="material-icons text-amber-600 dark:text-amber-500 text-lg">warning</span>
                        <p className="text-amber-900 dark:text-amber-200 text-xs font-medium">
                            You have reached {usagePercentage}% of your case limit. Upgrade now to ensure uninterrupted service.
                        </p>
                        <Link href="/pricing">
                            <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors">
                                Upgrade Now
                            </button>
                        </Link>
                    </div>
                    <button
                        onClick={handleDismissBanner}
                        className="text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 glass-dark border-r border-white/5 text-slate-400 flex flex-col justify-between hidden md:flex relative overflow-hidden">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="h-20 flex items-center px-6 mb-4">
                                <Link href="/dashboard" className="flex items-center gap-2 text-primary dark:text-white">
                                    <span className="material-icons-round text-3xl text-primary">gavel</span>
                                    <span className="text-xl font-extrabold tracking-tight">LawCase<span className="text-primary">AI</span></span>
                                </Link>
                            </div>
                            <nav className="px-4 space-y-2">
                                {[
                                    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
                                    { href: '/cases', label: 'My Cases', icon: 'folder_open' },
                                    { href: '/calendar', label: 'Calendar', icon: 'calendar_today' },
                                    { href: '/settings', label: 'Settings', icon: 'settings' }
                                ].map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border group cursor-pointer ${isActive(item.href)
                                                ? 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5'
                                                : 'hover:bg-white/5 hover:text-white border-transparent'}`}
                                        >
                                            <span className={`material-icons-round ${isActive(item.href) ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                {item.icon}
                                            </span>
                                            <span className={isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}>{item.label}</span>
                                            {isActive(item.href) && (
                                                <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </motion.div>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="p-4 space-y-6 relative z-10">
                            <div className="glass border-white/10 rounded-2xl p-4 shadow-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Usage</span>
                                    <span className="text-[10px] font-bold text-primary">{usagePercentage}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${usagePercentage}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full"
                                    ></motion.div>
                                </div>
                                <Link href="/pricing" className="block w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                                    >
                                        Upgrade Plan
                                    </motion.button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-3 px-2 py-2 border-t border-white/5 pt-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold">{user?.role || 'Senior Counsel'}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-slate-500 hover:text-red-500 transition-colors"
                                    title="Log Out"
                                >
                                    <span className="material-icons-round text-xl">logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Header */}
                    <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <TimeDisplay />
                            <div>
                                <h2 className="text-lg font-black text-white leading-tight font-display">Counsel Status</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">On-Duty • Active Session</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative group hidden lg:block">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-xl group-focus-within:text-primary transition-colors">search</span>
                                <input
                                    className="pl-12 pr-4 py-2.5 w-96 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white/10 placeholder-slate-500 transition-all outline-none text-white font-medium"
                                    placeholder="Search repository..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                                    onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
                                />

                                {/* Search Dropdown */}
                                <AnimatePresence>
                                    {showSearchDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-3 glass-dark border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[480px] overflow-hidden"
                                        >
                                            <div className="p-2 overflow-y-auto max-h-[470px]">
                                                {isSearching ? (
                                                    <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        Searching...
                                                    </div>
                                                ) : searchQuery.length > 1 && searchResults.cases.length === 0 && searchResults.files.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No results found</div>
                                                ) : (
                                                    <div className="py-2">
                                                        {searchResults.cases.length > 0 && (
                                                            <div>
                                                                <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 mb-1">Cases</div>
                                                                {searchResults.cases.map(c => (
                                                                    <Link href={`/cases/${c.id}`} key={c.id}>
                                                                        <div
                                                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer"
                                                                            role="link"
                                                                            tabIndex={0}
                                                                            aria-label={`Open case ${c.title}`}
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                                                <span className="material-icons-round text-primary text-sm">folder</span>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                                                                                <p className="text-[10px] text-slate-400 truncate uppercase font-bold">{c.subtitle}</p>
                                                                            </div>
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">{c.status}</span>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {searchResults.files.length > 0 && (
                                                            <div className={searchResults.cases.length > 0 ? "mt-2 pt-2 border-t border-slate-50 dark:border-slate-800" : ""}>
                                                                <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 mb-1">Files</div>
                                                                {searchResults.files.map(f => (
                                                                    <Link href={`/cases/${f.caseId}`} key={f.id}>
                                                                        <div
                                                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer"
                                                                            role="link"
                                                                            tabIndex={0}
                                                                            aria-label={`Open file ${f.title}`}
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                                                <span className="material-icons-round text-emerald-600 text-sm">description</span>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.title}</p>
                                                                                <p className="text-[10px] text-slate-400 truncate uppercase font-bold">{f.subtitle}</p>
                                                                            </div>
                                                                            <span className="material-icons-round text-slate-300 text-sm">arrow_forward</span>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/cases/new">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-primary/20 active:shadow-inner"
                                    >
                                        <span className="material-icons-round text-lg">add</span>
                                        <span>Create Case</span>
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Page Content */}
                    <div className="flex-1 overflow-y-auto p-8 relative z-10">
                        <div className="max-w-[1400px] mx-auto min-h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
