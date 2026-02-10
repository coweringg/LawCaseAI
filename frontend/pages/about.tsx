import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Shield, Clock, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Layout } from '@/components/Layout'

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-secondary-900 sm:text-5xl md:text-6xl">
                About <span className="text-primary-600">LawCaseAI</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-secondary-600">
                Empowering lawyers with cutting-edge AI technology to streamline case management, 
                document analysis, and legal research.
              </p>
              <div className="mt-10 flex justify-center">
                <Link href="/register">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-secondary-900">
                Why Choose LawCaseAI?
              </h2>
              <p className="mt-4 text-lg text-secondary-600">
                Built by lawyers, for lawyers. We understand your needs.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="mt-4">User-Friendly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600">
                    Intuitive interface designed specifically for legal professionals. 
                    No technical expertise required.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="mt-4">Secure & Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600">
                    Bank-level security and full compliance with legal industry standards 
                    and data protection regulations.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="mt-4">24/7 Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600">
                    Access your cases and documents anytime, anywhere. 
                    Never miss important deadlines.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="mt-4">Proven Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-600">
                    Trusted by thousands of law firms. 
                    Average 40% increase in case efficiency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-secondary-900">
                Our Mission
              </h2>
              <p className="mt-6 text-lg text-secondary-600 leading-relaxed">
                At LawCaseAI, we're revolutionizing legal practice management through artificial intelligence. 
                Our mission is to empower lawyers with tools that automate routine tasks, 
                provide intelligent insights, and ultimately deliver better outcomes for clients. 
                We believe technology should augment legal expertise, not replace it.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
                <div className="text-secondary-600">Lawyers Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50,000+</div>
                <div className="text-secondary-600">Cases Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
                <div className="text-secondary-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Transform Your Practice?
            </h2>
            <p className="mt-4 text-xl text-primary-100">
              Join thousands of lawyers who are already using LawCaseAI to streamline their workflow.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
