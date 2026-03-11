import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useSettings';
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
        <div className="premium-glass px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl backdrop-blur-xl">
            <div className="text-right">
                <h2 className="text-2xl font-black text-white leading-none tracking-tighter">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </h2>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1.5 opacity-80">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(10,68,184,0.4)] border border-white/20">
                <span className="material-icons-round text-2xl">schedule</span>
            </div>
        </div>
    );
});

TimeDisplay.displayName = 'TimeDisplay';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { data: dashboardData, refetch: refetchDashboardStats } = useDashboardStats(!!user && isAuthenticated);
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [globalAlert, setGlobalAlert] = useState<{message: string, type: string} | null>(null);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ cases: Array<{ id: string; title: string; subtitle: string; status: string }>; files: Array<{ id: string; caseId: string; title: string; subtitle: string }> }>({ cases: [], files: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    useEffect(() => {
        const checkSystemStatus = () => {
            if (!isAuthenticated) return;
            api.get('/system/status').then(res => {
                if (res.data.success && res.data.data) {
                    setGlobalAlert(res.data.data.globalAlert || null);

                    const isMaintenance = !!res.data.data.maintenanceMode;
                    const isAdmin = user?.role === 'admin';
                    setIsMaintenanceMode(isMaintenance && !isAdmin);
                }
            }).catch(() => {})
        };

        if (user) {
            const dismissed = localStorage.getItem(`dismiss_usage_banner_${user.id}`);
            if (dismissed === 'true') {
                setIsBannerVisible(false);
            }
        }

        checkSystemStatus();

        const heartbeatInterval = setInterval(() => {
            if (isAuthenticated && user) {
                api.get('/user/profile').catch(() => {});
                refetchDashboardStats();
                checkSystemStatus();
            }
        }, 300000);

        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [isAuthenticated, user, refetchDashboardStats]);

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
    }, [searchQuery, isAuthenticated]);

    useEffect(() => {
        if (!mounted || !user) return;

        const isAdminPath = router.pathname.startsWith('/dashboard/admin');
        const isAdmin = user.role === 'admin';

        if (isAdmin && !isAdminPath) {
            console.log('[AUTH] Admin restricted to /dashboard/admin. Redirecting...');
            router.push('/dashboard/admin');
        } else if (!isAdmin && isAdminPath) {
            console.log('[AUTH] Standard user restricted from admin panel. Redirecting...');
            router.push('/dashboard');
        }
    }, [user, router, mounted]);

    const handleDismissBanner = () => {
        setIsBannerVisible(false);
        if (user) {
            localStorage.setItem(`dismiss_usage_banner_${user.id}`, 'true');
        }
    };

    const isActive = (path: string, exact = false) => {
        if (exact) return router.pathname === path;
        return router.pathname === path || router.pathname.startsWith(`${path}/`);
    };

    const usagePercentage = dashboardData?.cases?.usagePercentage || 0;
    const showWarning = usagePercentage >= 80 && isBannerVisible;

    if (!mounted) return null;

    if (isMaintenanceMode) {
        return (
            <div className="bg-slate-900 text-white h-screen flex flex-col items-center justify-center relative overflow-hidden font-display">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.div
                        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[150px]"
                    />
                </div>
                <div className="z-10 text-center px-4 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-2xl shadow-red-900/20"
                    >
                        <span className="material-icons-round text-5xl text-red-500">engineering</span>
                    </motion.div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">System Under Maintenance</h1>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        We are currently performing scheduled maintenance to improve the platform. 
                        Please check back in a few minutes.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Updates in progress
                    </div>

                    <div>
                        <button
                            onClick={logout}
                            className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <span className="material-icons-round text-sm">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#05060a] text-slate-100 font-display h-screen w-full flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 mesh-gradient opacity-60" />
                <div className="absolute inset-0 crystallography-pattern opacity-[0.02] scale-150 rotate-12" />
                
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 45, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.15, 0.05],
                        rotate: [45, 0, 45]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
                />
            </div>
            {showWarning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 py-2 px-4 flex items-center justify-between z-50 flex-shrink-0">
                    <div className="flex items-center justify-center gap-3 flex-1">
                        <span className="material-icons text-amber-600 dark:text-amber-500 text-lg">warning</span>
                        <p className="text-amber-900 dark:text-amber-200 text-xs font-medium">
                            You have reached {usagePercentage}% of your case limit. Upgrade now to ensure uninterrupted service.
                        </p>
                        <Link href="/settings?tab=billing">
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

            {globalAlert && (
                <div className={`
                    border-b py-3 px-4 flex items-center justify-between z-50 flex-shrink-0 animate-in slide-in-from-top
                    ${globalAlert.type === 'error' ? 'bg-error-500 text-white border-error-600' : 
                      globalAlert.type === 'success' ? 'bg-success-500 text-white border-success-600' : 
                      globalAlert.type === 'warning' ? 'bg-warning-500 text-white border-warning-600' : 
                      'bg-primary text-white border-primary'}
                `}>
                    <div className="flex items-center justify-center gap-3 flex-1">
                        <span className="material-icons-round text-lg">
                            {globalAlert.type === 'error' ? 'error' : 
                             globalAlert.type === 'success' ? 'check_circle' : 
                             globalAlert.type === 'warning' ? 'warning' : 'info'}
                        </span>
                        <p className="text-xs font-bold uppercase tracking-wide">
                            {globalAlert.message}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative z-10 min-h-0">
                <aside className={`w-64 flex-shrink-0 premium-glass !bg-transparent !border-y-0 !border-l-0 border-r border-white/10 text-slate-400 hidden lg:flex h-full relative overflow-hidden transition-all duration-300`}>
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between w-full">
                        <div>
                            <div className="h-16 flex items-center px-6 mb-4">
                                <Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard'} className="flex items-center gap-2 text-primary dark:text-white">
                                    <span className="material-icons-round text-3xl text-primary">gavel</span>
                                    <span className="text-xl font-extrabold tracking-tight">LawCase<span className="text-primary">AI</span></span>
                                </Link>
                            </div>
                            <nav className="px-4 space-y-2">
                                {(user?.role === 'admin' ? [
                                    { href: '/dashboard/admin', label: 'Overview', icon: 'admin_panel_settings', exact: true },
                                    { href: '/dashboard/admin/analytics', label: 'AI Analytics', icon: 'psychology', exact: false },
                                    { href: '/dashboard/admin/treasury', label: 'Treasury', icon: 'account_balance', exact: false },
                                    { href: '/dashboard/admin/system', label: 'System Command', icon: 'security', exact: false }
                                ] : [
                                    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
                                    { href: '/cases', label: 'My Cases', icon: 'folder_open' },
                                    { href: '/calendar', label: 'Calendar', icon: 'calendar_today' },
                                    { href: '/settings', label: 'Settings', icon: 'settings' }
                                ]).map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.03)" }}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-300 border group cursor-pointer relative overflow-hidden ${isActive(item.href, (item as any).exact)
                                                ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_30px_rgba(10,68,184,0.1)]'
                                                : 'text-slate-500 hover:text-slate-200 border-transparent'}`}
                                        >
                                            <span className={`material-icons-round text-[22px] transition-all duration-300 ${isActive(item.href, (item as any).exact) ? 'text-primary scale-110' : 'text-slate-600 group-hover:text-slate-300'}`}>
                                                {item.icon}
                                            </span>
                                            <span className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${isActive(item.href, (item as any).exact) ? 'text-white' : 'group-hover:text-white'}`}>
                                                {item.label}
                                            </span>
                                            {isActive(item.href, (item as any).exact) && (
                                                <motion.div 
                                                    layoutId="activeNav" 
                                                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(10,68,184,0.6)]" 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="px-2 pb-4 space-y-4 relative z-10 flex-shrink-0">
                            {user?.role !== 'admin' && user?.plan !== 'elite' && user?.plan !== 'enterprise' && (
                                <div className="glass border-white/10 rounded-2xl p-5 shadow-xl w-full">
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
                                    <Link href="/settings?tab=billing" className="block w-full">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                                        >
                                            Upgrade Plan
                                        </motion.button>
                                    </Link>
                                </div>
                            )}
                            {router.pathname !== '/settings' && (
                                <div className="flex items-center gap-3 px-3 py-4 border-t border-white/5 mt-2">
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
                            )}
                        </div>
                    </div>
                </aside>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed left-0 top-0 bottom-0 w-72 bg-[#060910] border-r border-white/10 z-[70] lg:hidden flex flex-col"
                            >
                                <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-round text-3xl text-primary">gavel</span>
                                            <span className="text-xl font-extrabold tracking-tight text-white">LawCaseAI</span>
                                        </div>
                                        <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    </div>
                                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                        {(user?.role === 'admin' ? [
                                            { href: '/dashboard/admin', label: 'Overview', icon: 'admin_panel_settings', exact: true },
                                            { href: '/dashboard/admin/analytics', label: 'AI Analytics', icon: 'psychology', exact: false },
                                            { href: '/dashboard/admin/treasury', label: 'Treasury', icon: 'account_balance', exact: false },
                                            { href: '/dashboard/admin/system', label: 'System Command', icon: 'security', exact: false }
                                        ] : [
                                            { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
                                            { href: '/cases', label: 'My Cases', icon: 'folder_open' },
                                            { href: '/calendar', label: 'Calendar', icon: 'calendar_today' },
                                            { href: '/settings', label: 'Settings', icon: 'settings' }
                                        ]).map((item) => (
                                            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                                <div className={`flex items-center gap-4 p-4 rounded-xl font-bold border transition-all ${isActive(item.href, (item as any).exact) ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500 border-transparent hover:bg-white/5'}`}>
                                                    <span className="material-icons-round text-2xl">{item.icon}</span>
                                                    <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="p-6 border-t border-white/5">
                                        <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold uppercase text-[10px] tracking-widest border border-red-500/20">
                                            <span className="material-icons-round text-lg">logout</span>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <header className="h-16 lg:h-20 premium-glass !bg-transparent !border-x-0 !border-t-0 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-20 relative">
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 relative z-10"
                        >
                            <span className="material-icons-round">menu</span>
                        </button>
                        <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 lg:gap-6">
                                <div className="hidden sm:block">
                                    <TimeDisplay />
                                </div>
                                <div className="lg:hidden">
                                     <span className="text-lg font-black text-white tracking-tight">LawCase<span className="text-primary">AI</span></span>
                                </div>
                                {user?.role !== 'admin' && (
                                    <div className="hidden xl:block">
                                        <h2 className="text-xl font-black text-white leading-tight font-display tracking-tightest">Operational Command</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-70">Counsel Status &bull; Active Layer</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 lg:gap-10">
                                {user?.role !== 'admin' && (
                                    <div className="relative group hidden md:block">
                                        <span className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-lg lg:text-xl group-focus-within:text-primary transition-all duration-500">search</span>
                                        <input
                                            className="pl-12 lg:pl-16 pr-4 lg:pr-8 py-2.5 lg:py-3 w-[180px] lg:w-[350px] xl:w-[450px] bg-white/[0.03] border border-white/10 rounded-[2rem] text-[10px] lg:text-[11px] focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white/[0.06] placeholder-slate-600 transition-all duration-500 outline-none text-white font-black tracking-[0.2em] shadow-inner shadow-black/20"
                                            placeholder="Audit Core Intelligence..."
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                                            onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
                                        />
                                        
                                        <AnimatePresence>
                                            {showSearchDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 right-0 mt-3 glass-dark border border-white/10 rounded-3xl shadow-2xl z-50 max-h-[400px] overflow-hidden backdrop-blur-3xl"
                                                >
                                                    <div className="p-2 overflow-y-auto max-h-[390px]">
                                                        {isSearching ? (
                                                            <div className="p-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                                Searching...
                                                            </div>
                                                        ) : searchQuery.length > 1 && searchResults.cases.length === 0 && searchResults.files.length === 0 ? (
                                                            <div className="p-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">No results found</div>
                                                        ) : (
                                                            <div className="py-2">
                                                                {searchResults.cases.length > 0 && (
                                                                    <div>
                                                                        <div className="px-5 py-3 text-[9px] font-black text-primary uppercase tracking-[0.3em] border-b border-white/5 mb-2">Matched Cases</div>
                                                                        {searchResults.cases.map(c => (
                                                                            <Link href={`/cases/${c.id}`} key={c.id}>
                                                                                <div className="px-5 py-4 hover:bg-white/5 rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer group/item">
                                                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-white/5 group-hover/item:border-primary/30 group-hover/item:bg-primary/20 transition-all">
                                                                                        <span className="material-icons-round text-primary text-xl">folder</span>
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-black text-white truncate group-hover/item:text-primary transition-colors">{c.title}</p>
                                                                                        <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-widest mt-0.5">{c.subtitle}</p>
                                                                                    </div>
                                                                                    <span className="text-[9px] font-black px-3 py-1 rounded-full bg-white/5 text-slate-400 group-hover/item:bg-primary group-hover/item:text-white uppercase tracking-tighter transition-all">{c.status}</span>
                                                                                </div>
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {searchResults.files.length > 0 && (
                                                                    <div className={searchResults.cases.length > 0 ? "mt-4 pt-4 border-t border-white/5" : ""}>
                                                                        <div className="px-5 py-3 text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] border-b border-white/5 mb-2">Matched Documents</div>
                                                                        {searchResults.files.map(f => (
                                                                            <Link href={`/cases/${f.caseId}`} key={f.id}>
                                                                                <div className="px-5 py-4 hover:bg-white/5 rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer group/item">
                                                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-white/5 group-hover/item:border-blue-500/30 group-hover/item:bg-blue-500/20 transition-all">
                                                                                        <span className="material-icons-round text-blue-400 text-xl">description</span>
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-sm font-black text-white truncate group-hover/item:text-blue-400 transition-colors">{f.title}</p>
                                                                                        <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-widest mt-0.5">{f.subtitle}</p>
                                                                                    </div>
                                                                                    <span className="material-icons-round text-slate-600 text-sm group-hover/item:translate-x-1 transition-transform">arrow_forward</span>
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
                                )}
                                {user?.role !== 'admin' && (
                                    <div className="flex items-center gap-5">
                                        <Link href="/cases/new">
                                            <motion.button
                                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(10,68,184,0.4)" }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 lg:gap-3 px-4 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(10,68,184,0.2)] border border-white/20"
                                            >
                                                <span className="material-icons-round text-base lg:text-lg">add</span>
                                                <span className="hidden sm:inline">Initialize Case</span>
                                                <span className="sm:hidden">Case</span>
                                            </motion.button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10 scrollbar-hide">
                        <div className="w-full mx-auto min-h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
