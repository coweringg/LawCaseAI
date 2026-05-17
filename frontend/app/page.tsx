import AuthRedirect from '@/components/auth/AuthRedirect';
import PublicLayout from '@/components/layouts/PublicLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TypewriterText from '@/components/ui/TypewriterText';
import { CheckCircle2, FileText, Gavel, MessageSquare, Shield, Zap } from 'lucide-react';
import { Metadata } from "next";
import dynamic from 'next/dynamic';
import Link from 'next/link';

const DashboardPreview = dynamic(() => import('@/components/ui/DashboardPreview'), { ssr: true });

export const metadata: Metadata = {
  title: "LawCaseAI - Enterprise AI Legal Case Management",
  description: "Professional AI-driven legal case management for US lawyers. Secure, subscription-based platform for modern law firm infrastructure.",
  openGraph: {
    title: "LawCaseAI - Enterprise AI Legal Case Management",
    description: "Professional AI-driven legal case management for US lawyers.",
    type: "website",
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LawCaseAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    description: 'AI-powered case management and document intelligence platform for US law firms.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthRedirect />
      <main className="flex-grow bg-background-dark min-h-screen relative overflow-hidden font-sans text-slate-100 selection:bg-primary/30">
        
        <div className="absolute inset-0 micro-grid z-0" aria-hidden="true"></div>
        <div className="hero-glow" aria-hidden="true"></div>

        <section className="relative pt-24 md:pt-28 px-4 md:px-8 overflow-hidden pb-0 min-h-screen flex flex-col">
          <div className="absolute inset-0 micro-grid pointer-events-none" aria-hidden="true"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1200px] hero-glow pointer-events-none blur-[100px]" aria-hidden="true"></div>
          
          <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto text-center relative z-10 py-8">
            <ScrollReveal
              delay={0}
              yOffset={-10}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm self-center mx-auto"
            >
              <span className="material-symbols-outlined text-amber-400 text-[14px]">shield</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Secure Legal Intelligence</span>
            </ScrollReveal>

            <ScrollReveal
              as="h1"
              delay={0.1}
              yOffset={20}
              duration={0.6}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.05]"
            >
              The Standard for<br/>
              <span className="block text-primary min-h-[2.2em] lg:min-h-[1.1em]">
                <TypewriterText
                  phrases={[
                    'AI-Driven Legal Practice',
                    'Intelligent Case Management',
                    'Smart Document Analysis',
                    'Automated Legal Research',
                  ]}
                  typingSpeed={70}
                  deletingSpeed={35}
                  pauseDuration={2500}
                />
              </span>
            </ScrollReveal>

            <ScrollReveal
              as="p"
              delay={0.2}
              yOffset={20}
              duration={0.6}
              className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
            >
              AI-powered case management and document intelligence platform for US law firms. 
              Immediate operational efficiency and secure analysis for professional legal teams.
            </ScrollReveal>

            <ScrollReveal
              delay={0.3}
              yOffset={20}
              duration={0.6}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/register" className="bg-primary text-background-dark px-8 py-3 rounded-lg font-bold text-sm hover:brightness-110 hover:shadow-[0_0_40px_-5px_rgba(0,230,118,0.6)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark">
                Start Free Trial
              </Link>
              <Link href="/pricing" className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark">
                View Plans
              </Link>
            </ScrollReveal>
          </div>

          <DashboardPreview />
        </section>


        <section className="py-24 relative z-10 border-t border-white/5 bg-background-dark/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-4 font-display">
                Professional <span className="text-primary">Infrastructure</span>
              </h2>
              <p className="text-slate-400 max-w-2xl">
                Immediate access to powerful AI tools designed for high-stakes litigation and transactional law.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "AI Document Insights",
                  desc: "Analyze thousands of pages instantly. AI highlights risks and contradictions in contract law.",
                  icon: FileText
                },
                {
                  title: "Legal Research Assistant",
                  desc: "Technical analysis across extensive jurisprudence. Identify precedents with precision and speed.",
                  icon: Gavel
                },
                {
                  title: "Automated Chronology",
                  desc: "Auto-extract dates from scattered documents to build complete case timelines instantly.",
                  icon: Zap
                },
                {
                  title: "Cross-Thread Intelligence",
                  desc: "Create multiple sub-chats per case. AI synthesizes context across all threads simultaneously.",
                  icon: MessageSquare
                }
              ].map((feature, i) => (
                <ScrollReveal
                  key={i}
                  delay={i * 0.1}
                  yOffset={20}
                  className="glass-panel p-8 rounded-xl hover:border-primary/50 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>


        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 font-display text-white">
                Trusted by <span className="scalability-gradient">Legal Teams</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Built to meet the rigorous security and compliance standards of modern US law firms.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { title: "SOC2 Type II Ready", desc: "Rigorous security, availability, and confidentiality standards." },
                { title: "HIPAA Compliant", desc: "Secure handling of sensitive client data and health information." },
                { title: "GDPR Aligned", desc: "Strict data privacy controls and sovereignty for international professionals." }
              ].map((item, i) => (
                <ScrollReveal 
                  key={i}
                  delay={i * 0.1}
                  yOffset={20}
                  className="flex flex-col items-center text-center p-6"
                >
                  <Shield className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>


        <section className="py-24 relative z-10 border-t border-white/5">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">
              Ready to Upgrade your <br/>
              <span className="text-primary">Legal Intelligence?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Secure your firm&apos;s competitive edge with the most advanced AI case management system on the market.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-background-dark bg-primary rounded hover:bg-white transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(0,230,118,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark">
              Get Started Now
            </Link>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <CheckCircle2 size={16} className="text-primary" />
              <span>Early access for US Law Firms</span>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
