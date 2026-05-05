"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    FileText,
    Layers,
    Gavel,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Shield,
    Briefcase,
    BadgeCheck,
    Scale,
    Users,
    ChevronDown,
    Building2,
    Calendar,
    Clock,
    Info,
    AlertCircle,
    ShieldAlert,
    Plus,
    Trash2,
    Loader2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { isBefore, startOfDay } from 'date-fns';

export default function NewCaseClient() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        description: '',
        practiceArea: '',
        status: 'active',
        complexity: '2',
        court: '',
    });
    const [keyDates, setKeyDates] = useState<{ title: string; date: string; type: string; priority: string; hasTime?: boolean; time?: string }[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addKeyDate = () => setKeyDates(prev => [...prev, { title: '', date: '', type: 'deadline', priority: 'medium', hasTime: false, time: '09:00' }]);
    const removeKeyDate = (idx: number) => setKeyDates(prev => prev.filter((_, i) => i !== idx));
    const updateKeyDate = (idx: number, field: string, value: any) => {
        if (field === 'date' && value && value.length >= 10) {
            const dateParts = value.split('-');
            const year = parseInt(dateParts[0]);
            
            if (year >= 2000 && year < 3000) {
                const selectedDate = startOfDay(new Date(value + 'T00:00:00'));
                const today = startOfDay(new Date());
                
                if (isBefore(selectedDate, today)) {
                    toast.error('Cannot select a past date for key deadlines');
                    return;
                }
            }
        }
        setKeyDates(prev => prev.map((kd, i) => i === idx ? { ...kd, [field]: value } : kd));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload: any = { ...formData };
            if (keyDates.length > 0) {
                payload.keyDates = keyDates
                    .filter(kd => kd.title && kd.date)
                    .map((kd: any) => {
                        const localDateTime = kd.hasTime && kd.time 
                            ? `${kd.date}T${kd.time}:00` 
                            : `${kd.date}T12:00:00`;
                        
                        const dateObj = new Date(localDateTime);
                        
                        return {
                            ...kd,
                            priority: kd.priority || 'medium',
                            isoDate: dateObj.toISOString()
                        };
                    });
            }
            const response = await api.post('/cases', payload);
            const data = response.data;

            if (data.success) {
                toast.success('Intelligence unit initialized successfully!');
                router.push(`/dashboard/cases/${data.data._id}`);
            } else {
                toast.error(data.message || 'Failed to create case');
                if (data.message?.toLowerCase().includes('limit')) {
                    toast.error('Consider upgrading your plan in Settings.', { duration: 5000 });
                }
            }
        } catch (error) {
            toast.error('Network error. Failed to create case');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );

    return (
        <DashboardLayout>
            <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col md:flex-row border border-white/[0.06] bg-[#0a0a0f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] mx-auto">
                    <div className="w-full md:w-1/3 border-r border-white/[0.06] flex flex-col justify-between p-6 lg:p-8 relative overflow-hidden bg-black/40">
                        <div className="absolute inset-0 micro-grid opacity-[0.04] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/8 rounded-full blur-[120px]"></div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(0,230,118,0.15)]">
                                    <span className="material-icons-round text-primary text-xl">add_circle</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-lg tracking-tight text-white leading-none">New Case</span>
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Intelligence Protocol</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 1, label: 'Case Basics', sub: 'Naming & Client', icon: <FileText className="w-4 h-4" /> },
                                    { id: 2, label: 'Classification', sub: 'Area & Status', icon: <Briefcase className="w-4 h-4" /> },
                                    { id: 3, label: 'Jurisdiction', sub: 'Court Records', icon: <Scale className="w-4 h-4" /> },
                                    { id: 4, label: 'Verification', sub: 'Final Confirm', icon: <BadgeCheck className="w-4 h-4" /> }
                                ].map((s, idx) => (
                                    <div key={s.id} className="relative group">
                                        <div className="flex gap-4 items-center">
                                            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${step > s.id
                                                ? 'bg-primary border-primary/40 text-background-dark shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                                                : step === s.id
                                                    ? 'bg-primary border-primary/40 text-background-dark shadow-[0_0_20px_rgba(0,230,118,0.4)] scale-110'
                                                    : 'bg-white/[0.03] border-white/[0.08] text-slate-600'
                                                }`}>
                                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                                                {step === s.id && (
                                                    <span className="absolute -inset-1.5 bg-primary/15 rounded-2xl animate-pulse -z-10"></span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={`text-sm font-bold transition-colors ${step >= s.id ? 'text-white' : 'text-slate-600'}`}>{s.label}</h3>
                                                <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${step >= s.id ? 'text-primary/70' : 'text-slate-700'}`}>{s.sub}</p>
                                            </div>
                                        </div>
                                        {idx !== 3 && (
                                            <div className={`ml-5 mt-1 border-l-2 border-dashed h-8 -mb-1 transition-colors ${step > s.id ? 'border-primary/30' : 'border-white/[0.06]'}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto hidden lg:block">
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06]">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1">AI Smart Index</h4>
                                        <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                                            Provide accurate details to help build a comprehensive legal context for your case analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 flex flex-col h-full bg-[#0c0c12] relative">
                        <div className="px-6 lg:px-8 py-5 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-widest leading-none border border-primary/20">Step {step} of 4</span>
                                </div>
                                <h1 className="text-xl font-extrabold text-white tracking-tight">
                                    {step === 1 && 'Case Basics'}
                                    {step === 2 && 'Classification'}
                                    {step === 3 && 'Jurisdiction'}
                                    {step === 4 && 'Verification'}
                                </h1>
                                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                    {step === 1 && 'Establish the identity and primary context for your new legal matter.'}
                                    {step === 2 && 'Assign categories and current state for intelligent AI indexing.'}
                                    {step === 3 && 'Map the case to its respective judicial authority and location.'}
                                    {step === 4 && 'Ensure all details are accurate before initializing the workspace.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {user && user.planLimit > 0 && user.currentCases >= user.planLimit && (
                                <div className="max-w-2xl mx-auto mb-10">
                                    <Alert type="error" title="Capacity Saturation" className="shadow-rose-900/10">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                                            <p className="text-[11px] font-medium tracking-wide opacity-90">You have reached the operational limit for your current plan ({user.currentCases}/{user.planLimit >= 10000 ? '∞' : user.planLimit}).</p>
                                            <button 
                                                onClick={() => router.push('/settings?tab=billing')}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-900/40 transition-all shrink-0"
                                            >
                                                Expand Capacity
                                            </button>
                                        </div>
                                    </Alert>
                                </div>
                            )}

                            {user && user.planLimit === 0 && (
                                <div className="max-w-2xl mx-auto mb-10">
                                    <Alert type="warning" title="Inactive Intelligence Protocol" className="shadow-amber-900/10">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                                            <p className="text-[11px] font-medium tracking-wide opacity-90">Your current plan does not allow for case initialization. Please select an active protocol to begin.</p>
                                            <button 
                                                onClick={() => router.push('/settings?tab=billing')}
                                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-background-dark text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-900/40 transition-all shrink-0"
                                            >
                                                Initialize Plan
                                            </button>
                                        </div>
                                    </Alert>
                                </div>
                            )}

                            <form className="space-y-4 max-w-2xl mx-auto">
                                {step === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-250">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <FileText className="w-3.5 h-3.5" />
                                                Case Project Name <span className="ml-1 text-rose-500 font-black text-[9px] lowercase tracking-normal">(Required)</span>
                                            </label>
                                            <input
                                                className="w-full px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none font-medium placeholder:text-slate-700 text-sm"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Johnson Settlement vs. Apex Corp"
                                                type="text"
                                            />
                                            <p className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
                                                <Info className="w-3 h-3" />
                                                This name is used for high-level organization and AI indexing.
                                            </p>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <Users className="w-3.5 h-3.5" />
                                                Primary Client / Represented Party <span className="ml-1 text-rose-500 font-black text-[9px] lowercase tracking-normal">(Required)</span>
                                            </label>
                                            <input
                                                className="w-full px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none font-medium placeholder:text-slate-700 text-sm"
                                                name="client"
                                                value={formData.client}
                                                onChange={handleChange}
                                                placeholder="e.g., John C. Doe"
                                                type="text"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <Layers className="w-3.5 h-3.5" />
                                                Initial Case Description
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none font-medium placeholder:text-slate-700 min-h-[140px] resize-none text-sm"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Provide a brief summary of the legal matter, including key dates or parties involved..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-250">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4 group-focus-within:text-primary transition-colors">
                                                <Gavel className="w-3.5 h-3.5" />
                                                Legal Practice Area <span className="ml-1 text-rose-500 font-black text-[9px] lowercase tracking-normal">(Required)</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'civil', label: 'Civil Litigation', icon: <Scale className="w-4 h-4" /> },
                                                    { id: 'criminal', label: 'Criminal Law', icon: <Shield className="w-4 h-4" /> },
                                                    { id: 'ip', label: 'Property / IP', icon: <Building2 className="w-4 h-4" /> },
                                                    { id: 'corporate', label: 'Corporate / M&A', icon: <Briefcase className="w-4 h-4" /> },
                                                    { id: 'family', label: 'Family Law', icon: <Users className="w-4 h-4" /> },
                                                    { id: 'employment', label: 'Employment', icon: <Users className="w-4 h-4" /> }
                                                ].map(area => (
                                                    <button
                                                        key={area.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, practiceArea: area.id }))}
                                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${formData.practiceArea === area.id
                                                            ? 'border-primary/40 bg-primary/[0.08] text-primary shadow-[0_0_15px_rgba(0,230,118,0.1)]'
                                                            : 'border-white/[0.06] hover:border-white/[0.12] text-slate-500'
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${formData.practiceArea === area.id ? 'bg-primary text-background-dark' : 'bg-white/[0.05] text-slate-600'}`}>
                                                            {area.icon}
                                                        </div>
                                                        <span className="text-sm font-bold">{area.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Matter Status
                                            </label>
                                            <div className="flex p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-full">
                                                {[
                                                    { id: 'active', color: 'text-primary', dot: 'bg-primary' },
                                                    { id: 'pending', color: 'text-amber-500', dot: 'bg-amber-500' },
                                                    { id: 'discovery', color: 'text-primary', dot: 'bg-primary' }
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, status: s.id }))}
                                                        className={`flex-1 flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-[0.2em] py-2.5 rounded-lg transition-all ${formData.status === s.id
                                                            ? `bg-white/[0.08] ${s.color} shadow-sm border border-white/[0.08]`
                                                            : 'text-slate-600 hover:text-slate-400'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${formData.status === s.id ? s.dot : 'bg-slate-300'}`}></span>
                                                        {s.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    Complexity Estimation
                                                </label>
                                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest ${formData.complexity === '1' ? 'bg-primary/10 text-primary' :
                                                    formData.complexity === '2' ? 'bg-primary/10 text-primary' :
                                                        'bg-rose-900/20 text-rose-400'
                                                    }`}>
                                                    {formData.complexity === '1' ? 'Light' : formData.complexity === '2' ? 'Standard' : 'Complex'}
                                                </span>
                                            </div>
                                            <input
                                                className="w-full h-2 bg-white/[0.05] rounded-lg appearance-none cursor-pointer accent-primary"
                                                type="range"
                                                min="1"
                                                max="3"
                                                name="complexity"
                                                value={formData.complexity}
                                                onChange={handleChange}
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                                                <span>Level 1</span>
                                                <span>Level 2</span>
                                                <span>Level 3</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-250">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4 group-focus-within:text-primary transition-colors">
                                                <Scale className="w-3.5 h-3.5" />
                                                Court or Judicial Authority
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors" />
                                                <input
                                                className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none font-medium placeholder:text-slate-700 text-sm"
                                                    name="court"
                                                    value={formData.court}
                                                    onChange={handleChange}
                                                    placeholder="e.g., U.S. District Court for the Southern District of NY"
                                                    type="text"
                                                />
                                            </div>
                                            <p className="mt-3 text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
                                                <Info className="w-3 h-3" />
                                                Optional: Leave blank if not yet filed or assigned.
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Key Dates & Deadlines
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={addKeyDate}
                                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Date
                                                </button>
                                            </div>
                                            {keyDates.length === 0 ? (
                                                <div className="p-8 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-500 mb-3 border border-white/[0.06]">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-1">Calendar Sync</h4>
                                                    <p className="text-[10px] font-medium text-slate-500 max-w-xs">
                                                        Add key dates like hearings, deadlines, and meetings. They&apos;ll auto-sync to your calendar.
                                                    </p>
                                                    <button type="button" onClick={addKeyDate} className="mt-4 px-4 py-2 bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:scale-105 transition-all flex items-center gap-1.5">
                                                        <Plus className="w-3.5 h-3.5" /> Add First Date
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {keyDates.map((kd, idx) => (
                                                        <div key={idx} className="flex gap-3 items-start p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g., Discovery Deadline"
                                                                    value={kd.title}
                                                                    onChange={(e) => updateKeyDate(idx, 'title', e.target.value)}
                                                                    className="w-full px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder:text-slate-700"
                                                                />
                                                                <div className="grid grid-cols-[1fr_auto_1fr_150px] gap-3 items-start">
                                                                    <div>
                                                                        <DatePicker
                                                                            value={kd.date}
                                                                            minDate={new Date()}
                                                                            onChange={(val) => updateKeyDate(idx, 'date', val)}
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateKeyDate(idx, 'hasTime', !kd.hasTime)}
                                                                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all whitespace-nowrap ${kd.hasTime ? 'bg-primary text-background-dark shadow-md shadow-primary/20' : 'bg-white/[0.05] text-slate-500'}`}
                                                                        >
                                                                            {kd.hasTime ? 'Timed' : 'All Day'}
                                                                        </button>
                                                                        {kd.hasTime && (
                                                                            <input
                                                                                type="time"
                                                                                value={kd.time}
                                                                                onChange={(e) => updateKeyDate(idx, 'time', e.target.value)}
                                                                                className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 outline-none p-0 w-[64px] [color-scheme:dark]"
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    <div className="relative z-40">
                                                                        <Select
                                                                            value={kd.type}
                                                                            onChange={(val) => updateKeyDate(idx, 'type', val)}
                                                                            dropUp
                                                                            options={[
                                                                                { value: 'deadline', label: 'Deadline' },
                                                                                { value: 'hearing', label: 'Hearing' },
                                                                                { value: 'meeting', label: 'Meeting' },
                                                                                { value: 'review', label: 'Review' },
                                                                                { value: 'consultation', label: 'Consultation' },
                                                                                { value: 'other', label: 'Other' }
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="relative z-30">
                                                                        <Select
                                                                            value={kd.priority}
                                                                            onChange={(val) => updateKeyDate(idx, 'priority', val)}
                                                                            dropUp
                                                                            options={[
                                                                                { value: 'low', label: 'Low' },
                                                                                { value: 'medium', label: 'Medium' },
                                                                                { value: 'high', label: 'High' },
                                                                                { value: 'critical', label: 'Critical' }
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeKeyDate(idx)}
                                                                className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all mt-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="animate-in fade-in zoom-in duration-250 space-y-6">
                                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/30 via-primary/5 to-primary/30 overflow-hidden">
                                            <div className="relative bg-[#0a0a10] rounded-[15px] p-6 z-10">
                                                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="font-extrabold text-lg text-white tracking-tight">Case Summary</h3>
                                                    </div>
                                                    <span className="text-[9px] font-extrabold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full uppercase tracking-widest border border-primary/20">Live Preview</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                <FileText className="w-3 h-3" /> Case Reference
                                                            </div>
                                                            <div className="text-base font-bold text-white truncate">{formData.name}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                <Users className="w-3 h-3" /> Represented Client
                                                            </div>
                                                            <div className="text-base font-bold text-white truncate">{formData.client}</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                    <Gavel className="w-3 h-3" /> Practice Area
                                                                </div>
                                                              <div className="text-sm font-bold text-slate-300 capitalize truncate">{formData.practiceArea || 'General'}</div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                    <Shield className="w-3 h-3" /> Complexity
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-300">Lvl {formData.complexity}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                <Building2 className="w-3 h-3" /> Jurisdiction
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-300 truncate">{formData.court || 'Not provided'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {keyDates.length > 0 && (
                                                    <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                                        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Calendar className="w-3 h-3" /> Scheduled Key Dates
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                            {keyDates.map((kd, idx) => (
                                                                <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                        <Calendar className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-[10px] font-bold text-white truncate uppercase tracking-tight">{kd.title || 'Untitled Event'}</div>
                                                                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                                                                            {kd.date} &bull; {kd.type} &bull; <span className={kd.priority === 'high' || kd.priority === 'critical' ? 'text-amber-500' : kd.priority === 'low' ? 'text-primary' : ''}>{kd.priority}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                                    <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Layers className="w-3 h-3" /> Description Preview
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] italic truncate max-h-20 overflow-hidden">
                                                        &quot;{formData.description || 'No description provided.'}&quot;
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-amber-900/10 rounded-xl border border-amber-500/20">
                                            <Clock className="w-5 h-5 text-amber-500 flex-none" />
                                            <p className="text-[11px] font-medium text-amber-400">
                                                Initializing the case workspace will trigger AI indexing for any subsequent document uploads. This may take a few moments once started.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-6 lg:px-8 py-5 bg-black/30 backdrop-blur-md border-t border-white/[0.06] flex items-center justify-between">
                            <button
                                onClick={step === 1 ? () => router.push('/dashboard') : handleBack}
                                className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {step === 1 ? 'Discard' : 'Go Back'}
                            </button>
                            <button
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={isLoading || (step === 1 && (!formData.name || !formData.client)) || (step === 2 && !formData.practiceArea) || !!(user && user.currentCases >= user.planLimit)}
                                className={`group relative px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all overflow-hidden ${(isLoading || (step === 1 && (!formData.name || !formData.client)) || (step === 2 && !formData.practiceArea) || !!(user && user.currentCases >= user.planLimit))
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/[0.06]'
                                    : 'bg-primary text-background-dark shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:shadow-[0_0_35px_rgba(0,230,118,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {step === 4 ? (isLoading ? 'Creating Intelligence...' : 'Initialize Workspace') : 'Continue Flow'}
                                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
