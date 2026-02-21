import React, { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowLeft, CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardNav } from '@/components/DashboardNav'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/utils/api'
import toast from 'react-hot-toast'

export default function Upgrade() {
  const { user, token, updateUser } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'basic',
      name: 'Growth',
      price: 99,
      interval: 'month',
      features: [
        'Up to 8 active matters',
        'Automated Chronology Suite',
        'Standard AI Discovery',
        'SOC2 Type II Security',
      ],
      caseLimit: 8,
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 199,
      interval: 'month',
      features: [
        'Up to 18 active matters',
        'Advanced AI Jurisprudence',
        'Team Collaboration Portal',
        'Matter Intelligence Analytics',
        'Priority GPU Allocation',
        'HIPAA & GDPR Compliance'
      ],
      caseLimit: 18,
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 300,
      interval: 'month',
      features: [
        '∞ Unlimited active matters',
        'Cross-Matter Intelligence',
        '24/7 Priority Support',
        'Bulk Neural Transcription',
        'Dedicated Success Manager',
        'White-label Client Portals'
      ],
      caseLimit: 100000,
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise Intelligence',
      price: 300,
      interval: 'month',
      features: [
        '∞ Unlimited organization capacity',
        'Network-Wide Firm Access',
        'Custom AI Protocol Integration',
        'Vault Security Architecture',
        'Dedicated Legal Technologist',
        'Priority GPU Uplink'
      ],
      caseLimit: 100000,
      popular: false
    }
  ]

  const handleUpgrade = (planId: string) => {
    router.push(`/settings?tab=billing&openPlan=true&planId=${planId}`);
  }

  const getCurrentPlanInfo = () => {
    return plans.find(p => p.id === user?.plan)
  }

  const currentPlan = getCurrentPlanInfo()

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
        <div className="flex">
          <DashboardNav currentPage="upgrade" />

          <div className="flex-1">
            <header className="bg-white shadow-sm border-b border-secondary-100">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <Link href="/dashboard/settings">
                    <Button variant="ghost" size="sm" className="mr-4">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Settings
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Upgrade Your Plan</h1>
                    <p className="text-secondary-600">Choose the perfect plan for your practice</p>
                  </div>
                </div>
              </div>
            </header>

            <main className="p-6">
              {/* Current Plan Status */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-secondary-900">
                          {currentPlan?.name} Plan
                        </h3>
                        <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800">
                          Active
                        </span>
                      </div>
                      <p className="text-secondary-600 mt-1">
                        ${currentPlan?.price}/month • {user.currentCases} of {(user.planLimit || 0) >= 10000 ? '∞' : user.planLimit} matters used
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">Monthly Cost</p>
                      <p className="text-2xl font-bold text-secondary-900">${currentPlan?.price}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(user.planLimit || 0) >= 10000 ? 0 : (user.currentCases / user.planLimit) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-secondary-500 mt-2">
                      {(user.planLimit || 0) >= 10000 ? 'Unlimited capacity available' : `${user.planLimit - user.currentCases} matters remaining`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {plans.filter(plan => plan.id !== user.plan).map((plan) => (
                  <Card
                    key={plan.id}
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
                        <span className="text-secondary-600">/{plan.id === 'enterprise' ? 'user/month' : plan.interval}</span>
                      </div>
                      <CardDescription className="mt-2 text-primary font-bold">
                        {plan.caseLimit >= 10000 ? '∞ Unlimited' : plan.caseLimit} active matters
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

                      <Button
                        className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                        variant={plan.popular ? 'primary' : 'outline'}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isProcessing && selectedPlan === plan.id}
                      >
                        {isProcessing && selectedPlan === plan.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Security Notice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary-600" />
                    Secure Payment Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">Payment Security</h4>
                      <ul className="space-y-2 text-sm text-secondary-600">
                        <li>• 256-bit SSL encryption</li>
                        <li>• PCI DSS compliant</li>
                        <li>• Fraud protection</li>
                        <li>• Secure data storage</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">Billing & Refunds</h4>
                      <ul className="space-y-2 text-sm text-secondary-600">
                        <li>• Monthly billing cycle</li>
                        <li>• Cancel anytime</li>
                        <li>• 30-day money-back guarantee</li>
                        <li>• Instant plan activation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
