import React from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: 49,
      interval: 'month',
      features: [
        'Up to 5 active cases',
        'Basic document storage (1GB)',
        'Email support',
        'Standard security features',
        'Mobile app access'
      ],
      caseLimit: 5,
      popular: false
    },
    {
      name: 'Professional',
      price: 149,
      interval: 'month',
      features: [
        'Up to 25 active cases',
        'Enhanced document storage (10GB)',
        'Priority email support',
        'Advanced security features',
        'AI-powered legal research',
        'Client collaboration tools',
        'Advanced analytics'
      ],
      caseLimit: 25,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 399,
      interval: 'month',
      features: [
        'Unlimited active cases',
        'Unlimited document storage',
        '24/7 phone support',
        'Enterprise-grade security',
        'Custom AI training',
        'White-label options',
        'API access',
        'Dedicated account manager'
      ],
      caseLimit: 100,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <header className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                About
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
              Simple, Transparent
              <span className="text-primary-600"> Pricing</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-16 max-w-3xl mx-auto">
              Choose the perfect plan for your practice. All plans include our core features with no hidden fees.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-primary-500 shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-secondary-900">${plan.price}</span>
                      <span className="text-secondary-600">/{plan.interval}</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.caseLimit === 100 ? 'Unlimited' : `${plan.caseLimit}`} active cases
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-secondary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/register">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                        variant={plan.popular ? 'primary' : 'outline'}
                      >
                        {plan.popular ? 'Start Free Trial' : 'Get Started'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Can I change my plan later?
                  </h3>
                  <p className="text-secondary-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Is there a free trial?
                  </h3>
                  <p className="text-secondary-600">
                    Yes, all new users get a 14-day free trial with full access to Professional plan features.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    What happens if I exceed my case limit?
                  </h3>
                  <p className="text-secondary-600">
                    You'll receive a notification when approaching your limit. You can upgrade your plan or archive old cases to make room for new ones.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Is my data secure?
                  </h3>
                  <p className="text-secondary-600">
                    Absolutely. We use bank-level encryption, comply with legal industry standards, and perform regular security audits.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Do you offer discounts for annual billing?
                  </h3>
                  <p className="text-secondary-600">
                    Yes, annual billing saves you 20% compared to monthly billing. Contact sales for custom enterprise pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of lawyers who trust LawCaseAI for their practice management.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-secondary-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">LawCaseAI</span>
              </div>
              <p className="text-secondary-400">
                The future of legal case management is here.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 LawCaseAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
