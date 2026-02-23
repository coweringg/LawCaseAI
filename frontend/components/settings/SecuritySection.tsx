import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SecuritySectionProps {
    changePassword: (data: any) => Promise<{ success: boolean; message: string }>;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ changePassword }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    return (
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
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-16 pr-16 py-4 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-16 pr-16 py-4 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
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
                            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 gap-3"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                            Update Password
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};
