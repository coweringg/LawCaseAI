import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Building, Lock, Save, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Settings() {
    const { user, updateProfile, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile state
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        lawFirm: user?.lawFirm || ''
    });

    // Security state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Billing state
    const [billingInfo, setBillingInfo] = useState<any>(null);
    const [isLoadingBilling, setIsLoadingBilling] = useState(false);

    // Support Modal state
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [supportData, setSupportData] = useState({
        type: 'error',
        subject: '',
        description: ''
    });
    const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        brand: 'Visa',
        last4: '',
        expiryMonth: 12,
        expiryYear: 2025
    });

    // Purchase History state
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Helper to format date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Update profile data when user context changes
    React.useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                lawFirm: user.lawFirm || ''
            });
            fetchBillingInfo();
            fetchPurchaseHistory();
        }
    }, [user]);

    const fetchBillingInfo = async () => {
        setIsLoadingBilling(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/billing`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setBillingInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch billing info:', error);
        } finally {
            setIsLoadingBilling(false);
        }
    };

    const fetchPurchaseHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setPurchaseHistory(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch purchase history', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingSupport(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(supportData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || 'Support request submitted!');
                setIsSupportModalOpen(false);
                setSupportData({ type: 'error', subject: '', description: '' });
            } else {
                toast.error(data.message || 'Failed to submit support request');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsSubmittingSupport(false);
        }
    };

    const handleUpgradePlan = async () => {
        if (billingInfo?.plan === 'professional') {
            toast.error('You are already on the Professional plan');
            return;
        }

        setIsUpgrading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId: 'professional' })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Plan upgraded successfully!');
                fetchBillingInfo();
                fetchPurchaseHistory();
            } else {
                toast.error(data.message || 'Upgrade failed');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPayment(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/payment-methods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentFormData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Payment method added!');
                setIsPaymentModalOpen(false);
                fetchBillingInfo();
            } else {
                toast.error(data.message || 'Failed to add card');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handleRemoveCard = async (id: string) => {
        if (!confirm('Are you sure you want to remove this card?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/payment-methods/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Card removed');
                fetchBillingInfo();
            } else {
                toast.error(data.message || 'Failed to remove card');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    };

    const handleSetDefaultCard = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/payment-methods/${id}/default`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Default card updated');
                fetchBillingInfo();
            } else {
                toast.error(data.message || 'Failed to set default');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { success, message } = await updateProfile(profileData);
        setIsSubmitting(false);
        if (success) {
            toast.success(message || 'Profile updated successfully');
        } else {
            toast.error(message || 'Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsSubmitting(true);
        const { success, message } = await changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        setIsSubmitting(false);
        if (success) {
            toast.success(message || 'Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            toast.error(message || 'Failed to change password');
        }
    };

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
                                <Link href="/dashboard" className="inline-flex justify-center items-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md gap-2.5 group">
                                    <span className="material-icons-round text-[20px] text-slate-500 group-hover:text-primary transition-colors">dashboard</span>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-72 flex-shrink-0">
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
                                        <button
                                            onClick={() => setIsSupportModalOpen(true)}
                                            className="text-xs font-semibold text-primary hover:text-primary-hover mt-2 inline-block text-left"
                                        >
                                            Contact Support →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Manage your personal information and law firm profile.</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                                                        <User className="w-4 h-4 text-primary" />
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                        placeholder="John Doe"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                                                        <Mail className="w-4 h-4 text-primary" />
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                        placeholder="john@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-3 md:col-span-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                                                        <Building className="w-4 h-4 text-primary" />
                                                        Law Firm Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.lawFirm}
                                                        onChange={(e) => setProfileData({ ...profileData, lawFirm: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                        placeholder="Doe & Associates"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed gap-2.5 h-12"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    Update Profile
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Security & Privacy</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Manage your password and secure your LawCaseAI account.</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Shield className="w-6 h-6 text-primary" />
                                                Password Modification
                                            </h2>
                                        </div>
                                        <form onSubmit={handlePasswordSubmit} className="p-8 space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Current Password</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                                        <Lock className="w-5 h-5 text-slate-400" />
                                                    </span>
                                                    <input
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">New Password</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                                            <Lock className="w-5 h-5 text-slate-400" />
                                                        </span>
                                                        <input
                                                            type={showPasswords.new ? 'text' : 'password'}
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                            placeholder="••••••••"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                                            <Lock className="w-5 h-5 text-slate-400" />
                                                        </span>
                                                        <input
                                                            type={showPasswords.confirm ? 'text' : 'password'}
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white text-base"
                                                            placeholder="••••••••"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed gap-2.5 h-12"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                                    Update Security
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Billing & Subscription</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Manage your current plan, view invoices, and update payment methods.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Current Plan Card */}
                                        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                                                {billingInfo?.plan?.charAt(0).toUpperCase() + billingInfo?.plan?.slice(1) || 'Loading...'} Plan
                                                            </h2>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                                Active
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                            {billingInfo?.plan === 'basic' ? 'Basic plan for individual lawyers.' : 'Advanced plan for growing law firms.'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                            {billingInfo?.plan === 'basic' ? '$0' : '$149'}
                                                            <span className="text-sm text-slate-500 font-medium">/mo</span>
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">Billed monthly</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Case Analysis Limit</span>
                                                            <span className="text-xs font-semibold text-primary">
                                                                {billingInfo?.currentCases || 0} / {billingInfo?.planLimit || 0} Used
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                            <div
                                                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${billingInfo?.planUsagePercentage || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Remaining Cases</span>
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {billingInfo?.remainingCases || 0} Cases left
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                            <div
                                                                className="bg-slate-400 dark:bg-slate-600 h-2.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${100 - (billingInfo?.planUsagePercentage || 0)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                    <button
                                                        onClick={handleUpgradePlan}
                                                        disabled={isUpgrading || billingInfo?.plan === 'professional'}
                                                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-colors h-10 px-8 disabled:opacity-70"
                                                    >
                                                        {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        {billingInfo?.plan === 'professional' ? 'Current Plan' : 'Upgrade Plan'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Payment Methods</h3>
                                            <div className="space-y-4 flex-1">
                                                {billingInfo?.paymentMethods?.map((pm: any) => (
                                                    <div key={pm.id} className={`flex items-center gap-4 p-3 border rounded-lg transition-all ${billingInfo.defaultPaymentMethodId === pm.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                                                        <div className="bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600 h-10 w-14 flex items-center justify-center text-[10px] font-bold text-blue-900 italic leading-none">
                                                            {pm.brand?.toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">•••• {pm.last4}</p>
                                                                {billingInfo.defaultPaymentMethodId === pm.id && (
                                                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">DEFAULT</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500">Exp {pm.expiryMonth}/{pm.expiryYear}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {billingInfo.defaultPaymentMethodId !== pm.id && (
                                                                <button
                                                                    onClick={() => handleSetDefaultCard(pm.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                                                    title="Set as default"
                                                                >
                                                                    <span className="material-icons-round text-lg">star_border</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemoveCard(pm.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Remove card"
                                                            >
                                                                <span className="material-icons-round text-lg">delete_outline</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!billingInfo?.paymentMethods || billingInfo.paymentMethods.length === 0) && (
                                                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                        <span className="material-icons-round text-slate-300 dark:text-slate-700 text-4xl mb-2">credit_card_off</span>
                                                        <p className="text-sm text-slate-500">No payment methods</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    onClick={() => {
                                                        setPaymentFormData({
                                                            brand: 'Visa',
                                                            last4: '',
                                                            expiryMonth: 12,
                                                            expiryYear: 2025
                                                        });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-2"
                                                >
                                                    <span className="material-icons-round text-lg">add_card</span>
                                                    Add New Card
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purchase History Section */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <span className="material-icons-round text-primary">history</span>
                                                Purchase History
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Invoice</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {isLoadingHistory ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                                Loading history...
                                                            </td>
                                                        </tr>
                                                    ) : purchaseHistory.length > 0 ? (
                                                        purchaseHistory.map((item) => (
                                                            <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    {formatDate(item.date)}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                                                        {item.plan}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                                        ${item.amount}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <a href={item.invoiceUrl} className="text-primary hover:text-primary-hover text-sm font-bold flex items-center justify-end gap-1">
                                                                        <span className="material-icons-round text-sm">download</span>
                                                                        PDF
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                                No purchases found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {['team', 'notifications', 'integrations'].includes(activeTab) && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {tabs.find(t => t.id === activeTab)?.label}
                                        </h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">
                                            Customize your workspace and team collaboration settings.
                                        </p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
                                        <div className="max-w-sm mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <span className="material-icons-round text-3xl text-slate-300 dark:text-slate-600">
                                                    {tabs.find(t => t.id === activeTab)?.icon}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enhancing your tools...</h3>
                                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                                We are refining the {tabs.find(t => t.id === activeTab)?.label} experience to help you work smarter. This module will be live shortly.
                                            </p>
                                            <button
                                                onClick={() => setIsSupportModalOpen(true)}
                                                className="mt-6 text-sm font-bold text-primary hover:text-primary-hover flex items-center justify-center gap-2 mx-auto"
                                            >
                                                <span className="material-icons-round text-base">support_agent</span>
                                                Request Priority Feature
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Support Modal */}
                {isSupportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-scale-in">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons-round text-primary">headset_mic</span>
                                    Contact Support
                                </h3>
                                <button
                                    onClick={() => setIsSupportModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSupportSubmit} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSupportData({ ...supportData, type: 'error' })}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${supportData.type === 'error' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                                        >
                                            <span className={`material-icons-round ${supportData.type === 'error' ? 'text-red-500' : 'text-slate-400'}`}>report_problem</span>
                                            <span className="text-sm font-bold">Report Error</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSupportData({ ...supportData, type: 'implementation' })}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${supportData.type === 'implementation' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                                        >
                                            <span className={`material-icons-round ${supportData.type === 'implementation' ? 'text-primary' : 'text-slate-400'}`}>rocket_launch</span>
                                            <span className="text-sm font-bold">New Implementation</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={supportData.subject}
                                            onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                                            placeholder={supportData.type === 'error' ? "Describe the issue briefly..." : "What feature would you like to see?"}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={supportData.description}
                                            onChange={(e) => setSupportData({ ...supportData, description: e.target.value })}
                                            placeholder="Please provide as much detail as possible..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsSupportModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingSupport}
                                        className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {isSubmittingSupport ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-icons-round text-sm">send</span>}
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-scale-in">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons-round text-primary">credit_card</span>
                                    Add Payment Method
                                </h3>
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleAddPaymentMethod} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Card Brand</label>
                                        <select
                                            value={paymentFormData.brand}
                                            onChange={(e) => setPaymentFormData({ ...paymentFormData, brand: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                                        >
                                            <option value="Visa">Visa</option>
                                            <option value="Mastercard">Mastercard</option>
                                            <option value="American Express">American Express</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last 4 Digits</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={4}
                                            value={paymentFormData.last4}
                                            onChange={(e) => setPaymentFormData({ ...paymentFormData, last4: e.target.value.replace(/\D/g, '') })}
                                            placeholder="4242"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Exp Month</label>
                                            <input
                                                type="number"
                                                required
                                                min={1}
                                                max={12}
                                                value={paymentFormData.expiryMonth}
                                                onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryMonth: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Exp Year</label>
                                            <input
                                                type="number"
                                                required
                                                min={new Date().getFullYear()}
                                                value={paymentFormData.expiryYear}
                                                onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryYear: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPayment}
                                        className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {isUpdatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-icons-round text-sm">add</span>}
                                        Add Card
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
