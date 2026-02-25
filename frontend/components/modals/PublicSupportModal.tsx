import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Building2, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PublicSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublicSupportModal({ isOpen, onClose }: PublicSupportModalProps) {
  const [formData, setFormData] = useState({
    subject: 'Login Error',
    name: '',
    email: '',
    lawFirm: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/support/public`, formData);
      
      if (response.data.success) {
        toast.success('Message sent successfully. We will contact you as soon as possible.');
        setFormData({
          subject: 'Login Error',
          name: '',
          email: '',
          lawFirm: '',
          description: ''
        });
        onClose();
      } else {
        toast.error(response.data.message || 'There was an error sending the message.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Connection error. Please try again later.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#060910]/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container — centered by parent flexbox, no translate needed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg premium-glass border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-black text-white font-display tracking-tight">Support & Help</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Submit a logic signal</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Type</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3.5 text-[13px] font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="Login Error" className="bg-[#060910]">Login Error</option>
                    <option value="Forgot Password" className="bg-[#060910]">Forgot Password</option>
                    <option value="Account Locked" className="bg-[#060910]">Account Locked</option>
                    <option value="Other Issue" className="bg-[#060910]">Other Issue</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                    <div className="relative group">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-[13px] font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all"
                        placeholder="e.g. John Doe"
                      />
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Law Firm / Company</label>
                    <div className="relative group">
                      <input
                        type="text"
                        name="lawFirm"
                        value={formData.lawFirm}
                        onChange={handleChange}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-[13px] font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all"
                        placeholder="Optional"
                      />
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email</label>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">We will contact you at this email address to help resolve the issue.</p>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-[13px] font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all"
                      placeholder="email@example.com"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Description</label>
                  <div className="relative group">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-[13px] font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.04] transition-all resize-none"
                      placeholder="Please provide more details (e.g. when the issue started, alternative emails used, etc.)"
                    />
                    <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-white transition-colors" />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary-hover shadow-[0_0_30px_rgba(10,68,184,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Transmit Signal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
