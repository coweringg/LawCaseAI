import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon: string;
    color: string;
}

interface SettingsSidebarProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    user: any;
    onLogout: () => void;
    onOpenSupport: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ tabs, activeTab, setActiveTab, user, onLogout, onOpenSupport }) => {
    return (
        <div className="md:col-span-1 space-y-4">
            <div className="glass-dark border border-white/10 rounded-[32px] p-3 sticky top-32 overflow-hidden">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                <div className="relative z-10 space-y-2">
                    {tabs
                        .filter(tab => tab.id !== 'organization' || user?.isOrgAdmin)
                        .map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-primary/20 rounded-2xl -z-10"
                                        style={{ willChange: 'opacity, transform' }}
                                    />
                                )}
                                <span className={`material-icons-round text-xl ${activeTab === tab.id ? 'text-white' : `text-${tab.color}`}`}>
                                    {tab.icon}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                                    />
                                )}
                            </motion.button>
                        ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 px-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 relative overflow-hidden group/support">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover/support:bg-primary/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority Auth</span>
                            </div>
                            <p className="text-[10px] text-white font-bold leading-relaxed uppercase tracking-wider mb-4">
                                Direct uplink to <span className="text-primary font-black">security specialists</span>.
                            </p>
                            <button 
                                onClick={onOpenSupport}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all flex items-center justify-center gap-2"
                            >
                                Initialize Support
                                <span className="material-icons-round text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 px-2 pb-2">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Active</span>
                        </div>
                        <p className="text-[10px] text-white font-bold leading-relaxed uppercase tracking-wider">
                            Secure Node: <span className="text-primary">LCAI-CORE-DX</span>
                        </p>
                    </div>
                </div>

                <div className="mt-2 px-4 pb-4">
                    <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-red-500 hover:text-red-600"
                    >
                        <span className="material-icons-round text-xl">logout</span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};
