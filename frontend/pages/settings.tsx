import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('billing');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'person' },
        { id: 'team', label: 'Team Management', icon: 'groups' },
        { id: 'billing', label: 'Billing & Plans', icon: 'credit_card' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'security', label: 'Security', icon: 'security' },
        { id: 'integrations', label: 'Integrations', icon: 'integration_instructions' },
    ];

    return (
        <ProtectedRoute>
            <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 antialiased min-h-screen flex flex-col">
                {/* Navbar / Top Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <span className="material-icons-round text-primary text-2xl">gavel</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LawCase<span className="text-primary">AI</span></span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-500 hover:text-primary transition-colors relative">
                                    <span className="material-icons-round">notifications</span>
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                                </button>
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs">JS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                                            }`}
                                    >
                                        <span className={`material-icons-round mr-3 text-[20px] ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
                                            }`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                    <span className="material-icons-round text-primary mt-0.5">headset_mic</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Need help?</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact our priority support team for billing inquiries.</p>
                                        <a className="text-xs font-semibold text-primary hover:text-primary-hover mt-2 inline-block" href="#">Contact Support →</a>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {activeTab === 'billing' ? (
                                <>
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Plan Management</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your subscription, payment methods, and download invoices.</p>
                                    </div>

                                    {/* Plan Overview & Usage Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Current Plan Card */}
                                        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional Plan</h2>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                                Active
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Ideal for growing firms needing advanced AI case analysis.</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">$149<span className="text-sm text-slate-500 font-medium">/mo</span></p>
                                                        <p className="text-xs text-slate-400 mt-1">Billed monthly</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                                                    {/* Usage Metric 1 */}
                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Case Analysis Limit</span>
                                                            <span className="text-xs font-semibold text-primary">5 / 20 Used</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                                                        </div>
                                                    </div>
                                                    {/* Usage Metric 2 */}
                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Storage (GB)</span>
                                                            <span className="text-xs font-semibold text-slate-500">2 / 50 GB Used</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                            <div className="bg-slate-400 dark:bg-slate-600 h-2.5 rounded-full transition-all duration-500" style={{ width: '4%' }}></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                    <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-colors">
                                                        Upgrade Plan
                                                    </button>
                                                    <button className="inline-flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                                                        Compare Plans
                                                    </button>
                                                    <span className="ml-auto text-xs text-slate-400 self-center hidden sm:block">Next billing date: Nov 24, 2023</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method Card */}
                                        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Payment Method</h3>
                                            <div className="flex items-center gap-4 mb-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <div className="bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600 h-10 w-14 flex items-center justify-center">
                                                    <span className="font-bold text-blue-900 text-xs italic">VISA</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Visa ending in 4242</p>
                                                    <p className="text-xs text-slate-500">Expires 12/2025</p>
                                                </div>
                                            </div>
                                            <div className="mt-auto space-y-3">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="material-icons-round text-sm text-green-600">lock</span>
                                                    Securely processed by Stripe
                                                </div>
                                                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                                                    Update Payment Method
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoices Section */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice History</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Send invoices to:</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">billing@lawcaseai.com</span>
                                                <button className="text-primary hover:text-primary-hover ml-1">
                                                    <span className="material-icons-round text-sm">edit</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice ID</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                    {[1, 2, 3].map((i) => (
                                                        <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 font-medium">Oct 01, 2023</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">INV-2023-00{i}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-bold">$149.00</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                    Paid
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                <button className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm font-medium">
                                                                    <span className="material-icons-round text-base">download</span>
                                                                    PDF
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                                            <button className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">
                                                View All Invoices
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center">
                                        <span className="material-icons-round text-6xl text-slate-200 dark:text-slate-700 mb-4">construction</span>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Under Construction</h2>
                                        <p className="text-slate-500 dark:text-slate-400 mt-2">The {tabs.find(t => t.id === activeTab)?.label} section is coming soon.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
