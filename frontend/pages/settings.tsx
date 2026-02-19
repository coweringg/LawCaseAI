import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { User, Mail, Building, Lock, Save, Shield, Eye, EyeOff, Loader2, Sparkles, CreditCard, Bell, Share2, Layers, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { BillingInfo, Purchase } from '@/types';

export default function Settings() {
    const { user, updateProfile, changePassword, logout } = useAuth();
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
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
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
    const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
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
            const response = await api.get('/user/billing');
            if (response.status === 200) {
                setBillingInfo(response.data.data);
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
            const response = await api.get('/payments/history');
            if (response.status === 200) {
                setPurchaseHistory(response.data.data || []);
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
            const response = await api.post('/user/support', supportData);
            const data = response.data;
            if (response.status === 201 || response.status === 200) {
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
            const response = await api.post('/payments/confirm', { planId: 'professional' });
            const data = response.data;
            if (response.status === 200) {
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
            const response = await api.post('/user/payment-methods', paymentFormData);
            const data = response.data;
            if (response.status === 200 || response.status === 201) {
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
            const response = await api.delete(`/user/payment-methods/${id}`);
            const data = response.data;
            if (response.status === 200) {
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
            const response = await api.patch(`/user/payment-methods/${id}/default`);
            const data = response.data;
            if (response.status === 200) {
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

    const [mounted, setMounted] = useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>LawCaseAI - Settings</title>
            </Head>
            <DashboardLayout>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto space-y-12 relative z-10"
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight font-display mb-2">System Configuration</h1>
                            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em]">Neural Interface • Security Protocols • Billing Units</p>
                        </div>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="glass-dark border border-white/10 rounded-[32px] p-4 sticky top-6 overflow-hidden">
                                <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                                <nav className="space-y-1 relative z-10">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full group flex items-center px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === tab.id
                                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <span className={`material-icons-round mr-4 text-xl ${activeTab === tab.id ? 'text-white' : 'text-slate-600 group-hover:text-primary'
                                                }`}>{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-8 p-6 glass border border-white/10 rounded-2xl relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                            <SettingsIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-wider">Priority Auth</p>
                                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase leading-relaxed">Direct uplink to security specialists.</p>
                                            <button
                                                onClick={() => setIsSupportModalOpen(true)}
                                                className="text-[10px] font-black text-primary hover:text-white transition-colors mt-3 uppercase tracking-widest"
                                            >
                                                Initialize Support →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-3 px-2 py-2 border-t border-white/5 pt-6 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                        <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold">{user?.role || 'Senior Counsel'}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-slate-500 hover:text-red-500 transition-colors"
                                        title="Log Out"
                                    >
                                        <span className="material-icons-round text-xl">logout</span>
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {activeTab === 'profile' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="glass-dark border border-white/10 rounded-[32px] overflow-hidden relative">
                                        <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                                            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                                                <User className="text-primary" size={20} />
                                                Identity Profile
                                            </h2>
                                        </div>
                                        <form onSubmit={handleProfileSubmit} className="p-10 space-y-10 relative z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Legal Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                        <input
                                                            type="text"
                                                            value={profileData.name}
                                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                            className="relative w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Email</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                        <input
                                                            type="email"
                                                            value={profileData.email}
                                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                            className="relative w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                                            placeholder="john@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 md:col-span-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Organization / Law Firm</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                        <input
                                                            type="text"
                                                            value={profileData.lawFirm}
                                                            onChange={(e) => setProfileData({ ...profileData, lawFirm: e.target.value })}
                                                            className="relative w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                                            placeholder="Doe & Associates"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 flex justify-end">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 gap-3"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                                    Commit Changes
                                                </motion.button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="glass-dark border border-white/10 rounded-[32px] overflow-hidden relative">
                                        <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                                            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                                                <Shield className="text-primary" size={20} />
                                                Security Protocols
                                            </h2>
                                        </div>
                                        <form onSubmit={handlePasswordSubmit} className="p-10 space-y-8 relative z-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current Password</label>
                                                <div className="relative group">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-primary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2">
                                                        <Lock className="w-5 h-5 text-slate-600" />
                                                    </span>
                                                    <input
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="relative w-full pl-16 pr-16 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-red-500/50 transition-all text-white font-bold"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                                    >
                                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Neural Key</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2">
                                                            <Lock className="w-5 h-5 text-slate-600" />
                                                        </span>
                                                        <input
                                                            type={showPasswords.new ? 'text' : 'password'}
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            className="relative w-full pl-16 pr-16 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                                            placeholder="••••••••"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                                        >
                                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New Key</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2">
                                                            <Lock className="w-5 h-5 text-slate-600" />
                                                        </span>
                                                        <input
                                                            type={showPasswords.confirm ? 'text' : 'password'}
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            className="relative w-full pl-16 pr-16 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                                            placeholder="••••••••"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                                        >
                                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 flex justify-end">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all disabled:opacity-50 gap-3"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock size={18} />}
                                                    Update Security
                                                </motion.button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Billing & Subscription</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Manage your current plan, view invoices, and update payment methods.</p>
                                    </div>

                                    {activeTab === 'billing' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-10"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {/* Current Plan Card */}
                                                <div className="md:col-span-2 glass-dark border border-white/10 rounded-[32px] overflow-hidden relative group">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                                    <div className="p-10 relative z-10">
                                                        <div className="flex justify-between items-start mb-10">
                                                            <div>
                                                                <div className="flex items-center gap-4 mb-2">
                                                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                                                        {billingInfo?.plan || 'Loading...'} System
                                                                    </h2>
                                                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                                                                        Active
                                                                    </span>
                                                                </div>
                                                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                                    {billingInfo?.plan === 'basic' ? 'Standard Legal Processing' : 'Advanced Neural Jurisprudence'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-4xl font-black text-white tracking-tighter">
                                                                    ${billingInfo?.plan === 'basic' ? '0' : '149'}
                                                                    <span className="text-sm text-slate-500 font-bold">/mo</span>
                                                                </p>
                                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">SaaS Protocol</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Load</span>
                                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                                        {billingInfo?.currentCases || 0} / {billingInfo?.planLimit || 0}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${billingInfo?.planUsagePercentage || 0}%` }}
                                                                        className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Surplus</span>
                                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                                        {billingInfo?.remainingCases || 0} Units
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${100 - (billingInfo?.planUsagePercentage || 0)}%` }}
                                                                        className="bg-slate-600 h-full rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-10 border-t border-white/5">
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={handleUpgradePlan}
                                                                disabled={isUpgrading || billingInfo?.plan === 'professional'}
                                                                className="px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                                            >
                                                                {isUpgrading && <Loader2 className="w-4 h-4 animate-spin mr-3 inline" />}
                                                                {billingInfo?.plan === 'professional' ? 'Max Tier Active' : 'Enhance Protocol'}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="glass-dark border border-white/10 rounded-[32px] p-8 flex flex-col h-full relative overflow-hidden">
                                                    <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8 relative z-10">Vault Keys</h3>
                                                    <div className="space-y-6 flex-1 relative z-10">
                                                        {billingInfo?.paymentMethods?.map((pm) => (
                                                            <motion.div
                                                                layout
                                                                key={pm.id}
                                                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${billingInfo.defaultPaymentMethodId === pm.id ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10' : 'border-white/5 bg-black/40'}`}
                                                            >
                                                                <div className="bg-white/10 p-3 rounded-xl border border-white/10 h-10 w-14 flex items-center justify-center">
                                                                    <CreditCard size={20} className="text-slate-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xs font-black text-white tracking-widest truncate">•••• {pm.last4}</p>
                                                                        {billingInfo.defaultPaymentMethodId === pm.id && (
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(37,99,235,1)]" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Exp {pm.expiryMonth}/{pm.expiryYear}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {billingInfo.defaultPaymentMethodId !== pm.id && (
                                                                        <button
                                                                            onClick={() => handleSetDefaultCard(pm.id)}
                                                                            className="p-2 text-slate-600 hover:text-primary transition-colors"
                                                                        >
                                                                            <Sparkles size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleRemoveCard(pm.id)}
                                                                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <span className="material-icons-round text-lg">delete_outline</span>
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                setPaymentFormData({ brand: 'Visa', last4: '', expiryMonth: 12, expiryYear: 2025 });
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            className="w-full flex items-center justify-center px-6 py-4 bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all gap-3"
                                                        >
                                                            <CreditCard size={18} />
                                                            Initialize New Key
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Purchase History Section */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-dark border border-white/10 rounded-[32px] overflow-hidden"
                                    >
                                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                <Layers className="text-primary" size={20} />
                                                Archived Transactions
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-black/20 border-b border-white/5">
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Timestamp</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quantum</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">State</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Data</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {isLoadingHistory ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                                            </td>
                                                        </tr>
                                                    ) : purchaseHistory.length > 0 ? (
                                                        purchaseHistory.map((item) => (
                                                            <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                                                                <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                                                    {formatDate(item.date)}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-xs font-black text-white uppercase tracking-widest">
                                                                        {item.plan}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-xs font-black text-primary">
                                                                        ${item.amount}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <a href={item.invoiceUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                                                                        <Share2 size={12} />
                                                                        PDF
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-20 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                                                                No neural data points found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
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
                </motion.div>
            </DashboardLayout>
            <AnimatePresence>
                {isSupportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSupportModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="relative w-full max-w-xl glass-dark rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden"
                        >
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                            <div className="p-8 border-b border-white/10 flex justify-between items-center relative z-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <Sparkles className="text-primary" />
                                    Initialize Support
                                </h3>
                                <button onClick={() => setIsSupportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSupportSubmit} className="p-10 space-y-8 relative z-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setSupportData({ ...supportData, type: 'error' })}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${supportData.type === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                                    >
                                        <span className={`material-icons-round text-2xl ${supportData.type === 'error' ? 'text-red-500' : 'text-slate-600'}`}>report_problem</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Error</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSupportData({ ...supportData, type: 'implementation' })}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${supportData.type === 'implementation' ? 'border-primary/50 bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                                    >
                                        <span className={`material-icons-round text-2xl ${supportData.type === 'implementation' ? 'text-primary' : 'text-slate-600'}`}>rocket_launch</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Feature Uplink</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Header</label>
                                    <input
                                        type="text"
                                        required
                                        value={supportData.subject}
                                        onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                        placeholder="Transmission summary..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Log</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={supportData.description}
                                        onChange={(e) => setSupportData({ ...supportData, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold resize-none"
                                        placeholder="Provide technical specifics..."
                                    />
                                </div>

                                <div className="flex justify-end gap-5 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmittingSupport}
                                        className="px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {isSubmittingSupport ? <Loader2 size={18} className="animate-spin" /> : <span className="material-icons-round text-base">send</span>}
                                        Broadcast Stream
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="relative w-full max-w-xl glass-dark rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden"
                        >
                            <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
                            <div className="p-8 border-b border-white/10 flex justify-between items-center relative z-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <CreditCard className="text-primary" />
                                    Initialize Key
                                </h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleAddPaymentMethod} className="p-10 space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Card Protocol</label>
                                    <select
                                        value={paymentFormData.brand}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, brand: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold appearance-none"
                                    >
                                        <option value="Visa">Visa Protocol</option>
                                        <option value="Mastercard">Mastercard Protocol</option>
                                        <option value="American Express">Amex Protocol</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Final 4 Identifiers</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        value={paymentFormData.last4}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, last4: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                        placeholder="4242"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Index (M)</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            max={12}
                                            value={paymentFormData.expiryMonth}
                                            onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryMonth: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Index (Y)</label>
                                        <input
                                            type="number"
                                            required
                                            min={new Date().getFullYear()}
                                            value={paymentFormData.expiryYear}
                                            onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryYear: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-5 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isUpdatingPayment}
                                        className="px-10 py-4 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-white/10 transition-all disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {isUpdatingPayment ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                                        Commit Key
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}
