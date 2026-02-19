import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Shield, Zap, Search, Gavel, FileText, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Features() {
    const [activeTab, setActiveTab] = useState('insights');
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    if (!mounted) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-background-dark" />
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head>
                <title>Features - LawCaseAI | Professional AI Legal Intelligence</title>
                <meta name="description" content="Explore the elite AI capabilities of LawCaseAI, from document insights to automated chronology and jurisprudence research." />
            </Head>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-background-dark overflow-hidden">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.03]"></div>
                <div className="container-stitch relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 font-display"
                    >
                        The <span className="text-primary italic">Intelligence</span> Edge
                    </motion.h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Deep-tier AI infrastructure tailored for high-stakes US legal practice.
                        Scale your firm with zero-knowledge security and sub-second analysis.
                    </p>
                </div>
            </section>

            {/* Interactive Navigation */}
            <section className="sticky top-16 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 py-4">
                <div className="container-stitch flex justify-center gap-4 md:gap-8 overflow-x-auto pb-2">
                    {[
                        { id: 'insights', label: 'Document Insights', icon: FileText },
                        { id: 'research', label: 'Research Assistant', icon: Search },
                        { id: 'chronology', label: 'Auto-Chronology', icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Feature Demos */}
            <section className="py-24 bg-[#0d121d] min-h-[80vh]">
                <div className="container-stitch">
                    <AnimatePresence mode="wait">
                        {activeTab === 'insights' && <InsightsDemo key="insights" />}
                        {activeTab === 'research' && <ResearchDemo key="research" />}
                        {activeTab === 'chronology' && <ChronologyDemo key="chronology" />}
                    </AnimatePresence>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-24 bg-background-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <div className="container-stitch text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-8">
                        <Shield size={48} />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-8 font-display">Zero-Knowledge Sovereignty</h2>
                    <div className="grid md:grid-cols-3 gap-12 text-left">
                        {[
                            { title: "AES-256 Encryption", desc: "Data is encrypted at the source. Not even LawCaseAI developers can read your case files." },
                            { title: "Isolated Compute", desc: "Your firm's analysis runs in isolated virtual environments, ensuring no data leakage between accounts." },
                            { title: "Sovereign Control", desc: "Download and wipe all data at any time with a single command. Complete ownership of your digital twin." }
                        ].map((s, i) => (
                            <div key={i} className="space-y-4">
                                <h3 className="text-primary font-bold uppercase tracking-widest text-sm">{s.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function InsightsDemo() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
        >
            <div className="space-y-8">
                <h2 className="text-4xl font-bold text-white font-display">AI Document Insights</h2>
                <p className="text-lg text-slate-400">
                    Traditional OCR isn't enough. Our AI performs <span className="text-primary font-bold">Deep Contextual Scanning</span> to identify risk points, missing clauses, and conflicting testimonies.
                </p>
                <ul className="space-y-4">
                    {[
                        "Instant Risk Assessment for Contracts",
                        "Contradiction detection across depositions",
                        "Automated Summarization of 1000+ page datasets"
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-300">
                            <Zap className="text-primary flex-shrink-0" size={20} /> {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="relative glass border-white/10 rounded-2xl p-8 aspect-square flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-slate-900 shadow-inner rounded-xl p-6 font-mono text-[10px] leading-relaxed text-slate-500 overflow-hidden relative">
                    <p className="mb-4 text-slate-400">AGREEMENT OF SERVICES - SECTION 4.2</p>
                    <p className="mb-2">"...the Provider shall not be held liable for any damages resulting from system downtime..."</p>
                    <motion.span
                        initial={{ backgroundColor: "transparent" }}
                        animate={{ backgroundColor: "rgba(10, 68, 184, 0.3)" }}
                        transition={{ delay: 1, duration: 1 }}
                        className="px-1 border-b border-primary text-blue-300"
                    >
                        "resulting from system downtime exceeding 48 hours consecutively"
                    </motion.span>
                    <p className="mt-2">"...unless such downtime is caused by gross negligence or intentional misconduct..."</p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 2 }}
                        className="absolute top-1/2 right-4 w-48 p-3 bg-primary/20 backdrop-blur-md border border-primary/50 rounded-lg shadow-2xl"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={12} className="text-amber-400" />
                            <span className="text-[10px] text-white font-bold">Inconsistency Detected</span>
                        </div>
                        <p className="text-[9px] text-slate-300">Section 4.2 conflicts with the Service Level Agreement (SLA) defined in Appendix B regarding recovery time objectives.</p>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-4 left-6 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                    >
                        <div className="h-6 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center gap-1.5 text-[10px] font-bold">
                            <CheckCircle size={10} /> ANALYSIS READY
                        </div>
                    </motion.div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
        </motion.div>
    );
}

function ResearchDemo() {
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (isTyping) {
            const text = "California civil code 1714 negligence precedents...";
            let i = 0;
            const interval = setInterval(() => {
                setQuery(text.substring(0, i));
                i++;
                if (i > text.length) {
                    setIsTyping(false);
                    clearInterval(interval);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isTyping]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
        >
            <div className="order-2 lg:order-1 relative glass rounded-2xl p-6 h-[400px] flex flex-col">
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-white/10 mb-6">
                    <Search size={18} className="text-primary" />
                    <div className="text-slate-300 text-sm">{query}<span className="animate-pulse">|</span></div>
                </div>
                <div className="flex-1 space-y-4">
                    <AnimatePresence>
                        {!isTyping && [
                            { title: "Rowland v. Christian (1968)", cit: "69 Cal.2d 108", match: "98%" },
                            { title: "Li v. Yellow Cab Co. (1975)", cit: "13 Cal.3d 804", match: "94%" },
                            { title: "Tarasoff v. Regents (1976)", cit: "17 Cal.3d 425", match: "89%" }
                        ].map((res, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all"
                            >
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">{res.title}</h4>
                                    <p className="text-xs text-slate-500">{res.cit}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-primary">{res.match}</div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wider">Semantic Match</div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
                <h2 className="text-4xl font-bold text-white font-display">Research Assistant</h2>
                <p className="text-lg text-slate-400">
                    Go beyond keyword matching. Our AI understands the <span className="text-primary font-bold">Semantic Relationship</span> between case law, allowing you to find obscure precedents with conversational queries.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-[law-lg] border-white/5">
                        <div className="text-primary font-bold text-2xl mb-1">2M+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-tighter font-bold">Citations Indexed</div>
                    </div>
                    <div className="p-4 glass rounded-[law-lg] border-white/5">
                        <div className="text-primary font-bold text-2xl mb-1">&lt; 0.5s</div>
                        <div className="text-xs text-slate-500 uppercase tracking-tighter font-bold">Query Latency</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ChronologyDemo() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
        >
            <div className="space-y-8">
                <h2 className="text-4xl font-bold text-white font-display">Automated Chronology</h2>
                <p className="text-lg text-slate-400">
                    Transform a mess of PDFs into a clean, strategic timeline. Our AI extracts <span className="text-primary font-bold">Temporal Entities</span> across all evidence and maps them to your strategy.
                </p>
                <div className="space-y-4">
                    {[
                        { label: "Date Extraction", val: "100%" },
                        { label: "Entity Resolution", val: "94%" },
                        { label: "Timeline Export", val: "Instant" }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>{stat.label}</span>
                                <span className="text-primary">{stat.val}</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: stat.val === 'Instant' ? '100%' : stat.val }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative glass border-white/10 rounded-2xl p-6 h-[450px] overflow-hidden">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-white/10"></div>
                <div className="space-y-24 relative">
                    {[
                        { date: "Oct 12, 2025", event: "Incident Report Filed", role: "Primary Event" },
                        { date: "Nov 05, 2025", event: "Initial Demand Letter Sent", role: "Legal Action" },
                        { date: "Jan 18, 2026", event: "Deposition of Witness A", role: "Discovery" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.4 }}
                            className="relative pl-12"
                        >
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(10,68,184,0.8)] border border-white"></div>
                            <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{item.date}</div>
                            <div className="text-sm font-bold text-white mb-1 font-display">{item.event}</div>
                            <div className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-white/5 border border-white/5 rounded w-fit">{item.role}</div>
                        </motion.div>
                    ))}
                </div>
                <div className="absolute top-0 right-0 p-4">
                    <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg animate-bounce">AI PARSING DOCUMENT...</div>
                </div>
            </div>
        </motion.div>
    );
}
