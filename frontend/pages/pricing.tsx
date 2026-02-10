import React from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Layout } from '@/components/Layout'

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
        'Standard analytics',
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
        'Advanced document storage (10GB)',
        'Priority email support',
        'Advanced analytics & insights',
        'Mobile app access',
        'AI-powered case analysis',
        'Custom workflows'
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
        '24/7 phone & email support',
        'Advanced analytics & insights',
        'Mobile app access',
        'AI-powered case analysis',
        'Custom workflows',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      caseLimit: 100,
      popular: false
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
              Simple, Transparent
              <span className="text-primary-600"> Pricing</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your law practice. Start with a free trial, upgrade anytime.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name}
                  className={`relative ${plan.popular ? 'border-2 border-primary-500 shadow-lg' : 'border border-secondary-200'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-secondary-900">
                        ${plan.price}
                      </span>
                      <span className="text-secondary-600">/{plan.interval}</span>
                    </div>
                    <CardTitle className="text-xl text-secondary-900">{plan.name}</CardTitle>
                    <CardDescription className="text-secondary-600">
                      Perfect for {plan.name === 'Basic' ? 'solo practitioners' : plan.name === 'Professional' ? 'growing firms' : 'large enterprises'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
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
                        className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : 'bg-secondary-600 hover:bg-secondary-700'} text-white`}
                        size="lg"
                      >
                        {plan.name === 'Basic' ? 'Start Free Trial' : 'Get Started'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-secondary-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we will prorate any differences.
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
                  You will receive a notification when approaching your limit. You can upgrade your plan or archive old cases to make room for new ones.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-secondary-600">
                  Absolutely. We use bank-level encryption, regular security audits, and comply with all legal industry standards for data protection.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
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
      </div>
    </Layout>
  )
}
