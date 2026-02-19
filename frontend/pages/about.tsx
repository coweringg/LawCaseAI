import React from 'react'; // Refreshing for hydration sync
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Shield, Zap, Users, Gavel } from 'lucide-react';

export default function About() {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
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
                <title>About Us - LawCaseAI | The Standard in Legal AI</title>
                <meta name="description" content="Learn about LawCaseAI's mission to revolutionize legal practice management through elite artificial intelligence." />
            </Head>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 bg-background-dark overflow-hidden">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.03]"></div>
                <div className="container-stitch relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={fadeInUp}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                            Our Mission
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display">
                            Engineering <span className="text-primary italic">Legal Intelligence</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            We empower high-stakes legal professionals with AI-driven tools that redefine efficiency, accuracy, and case outcomes.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white dark:bg-[#0a0f18] relative">
                <div className="container-stitch">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl font-bold dark:text-white font-display">Crafted by Experts</h2>
                            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
                            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                <p>
                                    LawCaseAI was founded by a coalition of elite litigation partners and senior AI researchers who recognized a gap in the enterprise market: the need for truly sovereign, intelligent legal technology.
                                </p>
                                <p>
                                    Generic LLMs fail at the nuances of US case law. We built a proprietary semantic layer that understands the "why" behind legal precedents, not just the text.
                                </p>
                                <p>
                                    Today, we represent the vanguard of legal tech, securing the digital infrastructure of firms that command the future of American jurisprudence.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square glass rounded-3xl border border-white/10 flex items-center justify-center p-12 overflow-hidden relative">
                                <div className="absolute inset-0 crystallography-pattern opacity-[0.05] rotate-45 scale-150"></div>
                                <Gavel size={200} className="text-primary/20 relative z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-background-dark relative">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="container-stitch relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4 font-display">Core Principles</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            The non-negotiables that power our engineering and relationships.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Zero Knowledge",
                                desc: "Absolute data sovereignty. Your case files are encrypted so deeply even we can't access them."
                            },
                            {
                                icon: Zap,
                                title: "Hyper-Efficiency",
                                desc: "Latency is the enemy of billable time. We optimize every millisecond of our AI pipelines."
                            },
                            {
                                icon: Users,
                                title: "Client Success",
                                desc: "Our partners are high-volume firms. We provide white-glove migration and integration support."
                            },
                            {
                                icon: Gavel,
                                title: "Legal Rigor",
                                desc: "Built with the same attention to detail as a federal appeal. No hallucinations, only citations."
                            }
                        ].map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 glass rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <v.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 font-display uppercase tracking-widest">{v.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-24 bg-white dark:bg-[#0d121d]">
                <div className="container-stitch">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Elite Firms", val: "500+" },
                            { label: "Pages Scanned", val: "10M+" },
                            { label: "Hours Saved", val: "250k+" },
                            { label: "Uptime SLA", val: "99.99%" }
                        ].map((s, i) => (
                            <div key={i} className="space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-primary font-display">{s.val}</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA */}
            <section className="py-24 relative overflow-hidden bg-background-dark">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.05]"></div>
                <div className="relative z-10 container-stitch text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">Command the Digital Twin of Your Firm</h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/register">
                                <button className="h-14 px-10 bg-primary text-white font-bold rounded-xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                                    Subscribe Now
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="h-14 px-10 border border-white/10 text-white font-bold rounded-xl glass hover:bg-white/5 transition-all">
                                    View Plans
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
