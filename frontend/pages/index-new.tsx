import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, FileText, Users, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Layout } from '@/components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <main>
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
                AI-Powered Legal Case
                <span className="text-primary-600"> Management</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                Streamline your legal practice with intelligent case management, AI-powered insights, and secure document handling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Purchase Product
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                  Why Choose LawCaseAI?
                </h2>
                <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                  Modern legal technology designed to enhance your practice efficiency and client service.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-primary-600" />
                    </div>
                    <CardTitle>AI-Powered Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600">
                      Get intelligent case analysis, document summaries, and legal research assistance powered by advanced AI.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-success-600" />
                    </div>
                    <CardTitle>Bank-Level Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600">
                      Your data is protected with enterprise-grade encryption, secure cloud storage, and compliance with legal industry standards.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-warning-600" />
                    </div>
                    <CardTitle>Client Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-600">
                      Share documents securely, communicate with clients, and manage case progress all in one centralized platform.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                  Everything You Need to Manage Your Practice
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                    Comprehensive Case Management
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-secondary-700">Organize cases with custom tags and categories</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-secondary-700">Track deadlines and important dates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-secondary-700">Secure document storage and sharing</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-secondary-700">AI-powered legal research assistance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-secondary-700">Time tracking and billing integration</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                    <div className="h-4 bg-primary-200 rounded w-2/3"></div>
                    <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
                    <div className="h-4 bg-success-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Legal Practice?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join thousands of lawyers who are already using LawCaseAI to streamline their workflow.
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Purchase Product
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  )
}
