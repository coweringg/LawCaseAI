import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, FileText, Users, Shield, TrendingUp, Brain, Lock, Scale, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Layout } from '@/components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-law-charcoal-50 via-white to-law-blue-50">
        <main>
        <section className="section-padding">
          <div className="container-law">
            <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-law-blue-100 text-law-blue-800 rounded-law text-sm font-medium mb-8">
                <Shield className="w-4 h-4 mr-2" />
                Trusted by 1,000+ Law Firms Nationwide
              </div>
              
              <h1 className="heading-1 mb-6 text-balance">
                Enterprise Legal Case
                <span className="text-gradient"> Management</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-law-charcoal-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Streamline your legal practice with intelligent case management, AI-powered insights, and bank-level security for sensitive client data.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <Button className="btn-primary text-lg px-8 py-4">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button className="btn-outline text-lg px-8 py-4">
                    View Enterprise Plans
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-8 mt-8 text-sm text-law-charcoal-500">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  SOC 2 Compliant
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  24/7 Support
                </div>
                <div className="flex items-center">
                  <Scale className="w-4 h-4 mr-1" />
                  Bar Association Approved
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-law">
            <div className="text-center mb-20">
              <h2 className="heading-2 mb-6">
                Why Leading Law Firms Choose LawCaseAI
              </h2>
              <p className="text-xl text-law-charcoal-600 max-w-3xl mx-auto leading-relaxed">
                Enterprise-grade legal technology designed to enhance practice efficiency, ensure compliance, and deliver superior client service.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-premium text-center group">
                <CardHeader className="pb-6">
                  <div className="w-16 h-16 bg-law-blue-100 rounded-law-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-law-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-law-charcoal-900">
                    AI-Powered Legal Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-law-charcoal-600 leading-relaxed">
                    Advanced machine learning algorithms provide intelligent case analysis, document summarization, and predictive legal research tailored to your practice areas.
                  </p>
                </CardContent>
              </div>

              <div className="card-premium text-center group">
                <CardHeader className="pb-6">
                  <div className="w-16 h-16 bg-law-accent-100 rounded-law-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-law-accent-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-law-charcoal-900">
                    Bank-Level Security & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-law-charcoal-600 leading-relaxed">
                    End-to-end encryption, SOC 2 Type II compliance, and HIPAA-ready infrastructure ensure complete protection of privileged client communications and sensitive case data.
                  </p>
                </CardContent>
              </div>

              <div className="card-premium text-center group">
                <CardHeader className="pb-6">
                  <div className="w-16 h-16 bg-law-gold-100 rounded-law-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-law-gold-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-law-charcoal-900">
                    Seamless Client Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-law-charcoal-600 leading-relaxed">
                    Secure client portals, encrypted messaging, and controlled document sharing enable transparent communication while maintaining attorney-client privilege.
                  </p>
                </CardContent>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-law-charcoal-50">
          <div className="container-law">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in-up">
                <h3 className="heading-3 mb-8">
                  Comprehensive Practice Management
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 bg-law-accent-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-law-accent-600" />
                    </div>
                    <div>
                      <span className="text-law-charcoal-900 font-medium">Intelligent Case Organization</span>
                      <p className="text-law-charcoal-600 mt-1">Custom tags, smart categorization, and automated workflow management</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 bg-law-accent-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-law-accent-600" />
                    </div>
                    <div>
                      <span className="text-law-charcoal-900 font-medium">Automated Deadline Tracking</span>
                      <p className="text-law-charcoal-600 mt-1">Statute of limitations monitoring and court date notifications</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 bg-law-accent-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-law-accent-600" />
                    </div>
                    <div>
                      <span className="text-law-charcoal-900 font-medium">Secure Document Management</span>
                      <p className="text-law-charcoal-600 mt-1">Version control, e-signature integration, and audit trails</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 bg-law-accent-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-law-accent-600" />
                    </div>
                    <div>
                      <span className="text-law-charcoal-900 font-medium">AI Legal Research Assistant</span>
                      <p className="text-law-charcoal-600 mt-1">Case law analysis and precedent discovery powered by GPT-4</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 bg-law-accent-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-law-accent-600" />
                    </div>
                    <div>
                      <span className="text-law-charcoal-900 font-medium">Integrated Time & Billing</span>
                      <p className="text-law-charcoal-600 mt-1">Automated time tracking and LEDES billing format support</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="card-elevated">
                <div className="space-y-4">
                  <div className="h-3 bg-law-charcoal-200 rounded-law w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-law-charcoal-200 rounded-law w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-law-blue-200 rounded-law w-2/3 animate-pulse"></div>
                  <div className="h-3 bg-law-charcoal-200 rounded-law w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-law-accent-200 rounded-law w-1/3 animate-pulse"></div>
                  <div className="mt-6 p-4 bg-law-blue-50 rounded-law border border-law-blue-200">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-law-blue-600 mr-2" />
                      <span className="text-sm font-medium text-law-blue-800">AI Analysis Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-law-blue-600">
          <div className="container-law text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-2 text-white mb-6">
                Ready to Transform Your Legal Practice?
              </h2>
              <p className="text-xl text-law-blue-100 mb-12 leading-relaxed">
                Join thousands of leading attorneys who trust LawCaseAI for secure, efficient, and intelligent case management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <Button className="bg-white text-law-blue-600 hover:bg-law-charcoal-50 px-8 py-4 text-lg font-medium shadow-law-lg hover:shadow-law-xl transition-all duration-300">
                    Start Your 14-Day Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button className="btn-outline border-white text-white hover:bg-white hover:text-law-blue-600 px-8 py-4 text-lg">
                    Schedule Enterprise Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 text-law-blue-100 text-sm">
                No credit card required • Full feature access • Cancel anytime
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-law-charcoal-900 text-law-charcoal-300 py-16">
        <div className="container-law">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-law-blue-600 rounded-law flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">LawCaseAI</span>
              </div>
              <p className="text-law-charcoal-400 leading-relaxed">
                Enterprise-grade legal case management trusted by leading law firms across the United States.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="hover:text-white transition-colors duration-200">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors duration-200">Enterprise Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors duration-200">Security & Compliance</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors duration-200">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors duration-200">Legal Insights</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors duration-200">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Legal & Support</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors duration-200">Compliance</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors duration-200">24/7 Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-law-charcoal-800 mt-12 pt-12 text-center text-law-charcoal-500">
            <p>&copy; 2024 LawCaseAI. All rights reserved. | SOC 2 Type II Certified | HIPAA Compliant</p>
          </div>
        </div>
      </footer>
      </div>
    </Layout>
  )
}
