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
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="container-stitch relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={fadeInUp}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full premium-glass border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            Our Mission
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 font-display tracking-tightest leading-tight">
                            Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Legal Intelligence</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                            We empower high-stakes legal professionals with AI-driven infrastructure that redefines efficiency, accuracy, and case outcomes.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-32 relative">
                <div className="container-stitch">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <div className="h-0.5 w-16 bg-primary rounded-full"></div>
                                <h2 className="text-4xl md:text-6xl font-black text-white font-display tracking-tightest">Crafted by <span className="text-primary">Experts</span></h2>
                            </div>
                            <div className="space-y-6 text-xl text-slate-400 leading-relaxed font-medium">
                                <p>
                                    LawCaseAI was founded by a coalition of elite litigation partners and senior AI researchers who recognized a gap in the enterprise market: the need for truly sovereign, intelligent legal technology.
                                </p>
                                <p>
                                    Generic LLMs fail at the nuances of US case law. We built a proprietary semantic layer that understands the &ldquo;why&rdquo; behind legal precedents, not just the text.
                                </p>
                                <p>
                                    Today, we represent the vanguard of legal tech, securing the digital infrastructure of firms that command the future of American jurisprudence.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="absolute inset-x-10 inset-y-10 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
                            <div className="aspect-square premium-glass rounded-[3rem] border border-white/10 flex items-center justify-center p-20 overflow-hidden relative shadow-2xl">
                                <div className="absolute inset-0 crystallography-pattern opacity-[0.05] rotate-45 scale-150 group-hover:scale-[2] transition-transform duration-1000"></div>
                                <Gavel size={240} className="text-primary relative z-10 drop-shadow-[0_0_30px_rgba(10,68,184,0.4)]" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-32 relative">
                <div className="container-stitch relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-display tracking-tightest">Core <span className="text-primary">Principles</span></h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            The non-negotiable standards that power our engineering and partnerships.
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
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 premium-glass rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden relative"
                            >
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(10,68,184,0.4)] transition-all duration-500">
                                        <v.icon size={28} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-white mb-4 font-display uppercase tracking-[0.3em] group-hover:text-primary transition-colors">{v.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{v.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-32 relative border-y border-white/5 overflow-hidden">
                <div className="container-stitch">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Elite Firms", val: "500+" },
                            { label: "Pages Scanned", val: "10M+" },
                            { label: "Hours Saved", val: "250k+" },
                            { label: "Uptime SLA", val: "99.99%" }
                        ].map((s, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-4"
                            >
                                <div className="text-5xl md:text-7xl font-black text-white font-display tracking-tightest drop-shadow-[0_0_20px_rgba(10,68,184,0.3)]">{s.val}</div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA */}
            <section className="py-32 relative overflow-hidden bg-background-dark/30">
                <div className="container-stitch text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto premium-glass p-16 rounded-[3rem] border border-white/10 shadow-2xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-10 font-display tracking-tightest leading-tight">Command the Digital <br /><span className="text-primary">Twin of Your Firm</span></h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/register">
                                <button className="h-16 px-12 bg-primary text-white font-black rounded-2xl shadow-[0_0_30px_rgba(10,68,184,0.4)] hover:scale-105 transition-all text-sm uppercase tracking-widest">
                                    Subscribe Now
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="h-16 px-12 border border-white/10 text-white font-black rounded-2xl premium-glass hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                                >
                                    View Plans
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
