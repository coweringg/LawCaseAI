import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ProfileSectionProps {
    user: any;
    updateProfile: (data: any) => Promise<{ success: boolean; message: string }>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, updateProfile }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        lawFirm: user?.lawFirm || ''
    });

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="glass-dark border border-white/10 rounded-[32px] overflow-hidden relative">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                        <User className="text-primary" size={20} />
                        Identity Profile
                    </h2>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Legal Name</label>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="relative w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
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
                                    className="relative w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
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
                                    className="relative w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl focus:ring-0 focus:border-primary/50 transition-all text-white font-bold"
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
                            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 gap-3"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                            Commit Changes
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};
