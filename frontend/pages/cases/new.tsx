import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
    Info
} from 'lucide-react';

export default function NewCase() {
    const router = useRouter();
    const { token } = useAuth();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Case created successfully!');
                router.push('/dashboard');
            } else {
                toast.error(data.message || 'Failed to create case');
            }
        } catch (error) {
            toast.error('Network error. Failed to create case');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="bg-white dark:bg-surface-dark w-full max-w-6xl rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 min-h-[600px]">
                    {/* Left Sidebar: Progress & Context */}
                    <div className="w-full md:w-1/3 bg-slate-50 dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-10 relative overflow-hidden">
                        {/* Rich Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-16">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 ring-4 ring-primary/10">L</div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">LawCaseAI</span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Intelligent Law</span>
                                </div>
                            </div>

                            {/* Enhanced Stepper */}
                            <div className="space-y-4">
                                {[
                                    { id: 1, label: 'Case Basics', sub: 'Naming & Client', icon: <FileText className="w-4 h-4" /> },
                                    { id: 2, label: 'Classification', sub: 'Area & Status', icon: <Briefcase className="w-4 h-4" /> },
                                    { id: 3, label: 'Jurisdiction', sub: 'Court Records', icon: <Scale className="w-4 h-4" /> },
                                    { id: 4, label: 'Verification', sub: 'Final Confirm', icon: <BadgeCheck className="w-4 h-4" /> }
                                ].map((s, idx) => (
                                    <div key={s.id} className="relative group">
                                        <div className="flex gap-5 items-center">
                                            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${step > s.id
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110'
                                                : step === s.id
                                                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/25 scale-110'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                }`}>
                                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                                                {step === s.id && (
                                                    <span className="absolute -inset-2 bg-primary/20 rounded-2xl animate-pulse -z-10"></span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={`text-sm font-bold transition-colors ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s.label}</h3>
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary/70' : 'text-slate-400'}`}>{s.sub}</p>
                                            </div>
                                        </div>
                                        {idx !== 3 && (
                                            <div className="ml-5 mt-1 border-l-2 border-dashed border-slate-200 dark:border-slate-700 h-10 -mb-1"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premium AI Context Card */}
                        <div className="relative z-10 mt-auto hidden lg:block">
                            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-slate-700 shadow-xl border-b-primary/30">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">AI Smart Index</h4>
                                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">
                                            "Provide accurate details to help me build a comprehensive legal context for your case analysis."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form Content */}
                    <div className="w-full md:w-2/3 flex flex-col h-full bg-white dark:bg-surface-dark relative">
                        <div className="px-10 py-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-black/10 backdrop-blur-sm">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest leading-none">Step {step} of 4</span>
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {step === 1 && 'Case Basics'}
                                    {step === 2 && 'Classification'}
                                    {step === 3 && 'Jurisdiction'}
                                    {step === 4 && 'Verification'}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                    {step === 1 && 'Establish the identity and primary context for your new legal matter.'}
                                    {step === 2 && 'Assign categories and current state for intelligent AI indexing.'}
                                    {step === 3 && 'Map the case to its respective judicial authority and location.'}
                                    {step === 4 && 'Ensure all details are accurate before initializing the workspace.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form className="space-y-6 max-w-2xl mx-auto">
                                {step === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <FileText className="w-3.5 h-3.5" />
                                                Case Project Name
                                            </label>
                                            <input
                                                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
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
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <Users className="w-3.5 h-3.5" />
                                                Primary Client / Represented Party
                                            </label>
                                            <input
                                                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                name="client"
                                                value={formData.client}
                                                onChange={handleChange}
                                                placeholder="e.g., John C. Doe"
                                                type="text"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-2.5 group-focus-within:text-primary transition-colors">
                                                <Layers className="w-3.5 h-3.5" />
                                                Initial Case Description
                                            </label>
                                            <textarea
                                                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 min-h-[160px] resize-none"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Provide a brief summary of the legal matter, including key dates or parties involved..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-4 group-focus-within:text-primary transition-colors">
                                                <Gavel className="w-3.5 h-3.5" />
                                                Legal Practice Area
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
                                                        className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left ${formData.practiceArea === area.id
                                                            ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${formData.practiceArea === area.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                            {area.icon}
                                                        </div>
                                                        <span className="text-sm font-bold">{area.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-4">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Matter Status
                                            </label>
                                            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
                                                {['active', 'pending', 'discovery'].map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                                        className={`flex-1 flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em] py-3 rounded-lg transition-all ${formData.status === s
                                                            ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${formData.status === s ? 'bg-primary' : 'bg-slate-300'}`}></span>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    Complexity Estimation
                                                </label>
                                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest ${formData.complexity === '1' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                                                    formData.complexity === '2' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                                                        'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                                                    }`}>
                                                    {formData.complexity === '1' ? 'Light' : formData.complexity === '2' ? 'Standard' : 'Complex'}
                                                </span>
                                            </div>
                                            <input
                                                className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
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
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-4 group-focus-within:text-primary transition-colors">
                                                <Scale className="w-3.5 h-3.5" />
                                                Court or Judicial Authority
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors" />
                                                <input
                                                    className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
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

                                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-md">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-1">Calendar Integration</h4>
                                            <p className="text-[10px] font-medium text-slate-500 max-w-xs">
                                                Once created, you'll be able to sync court calendars and deadlines through your dashboard settings.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="animate-in fade-in zoom-in duration-500 space-y-6">
                                        <div className="relative p-1 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-indigo-500/20 border border-primary/20 overflow-hidden">
                                            <div className="relative bg-white dark:bg-slate-900 rounded-[22px] p-8 shadow-2xl relative z-10">
                                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Case Summary</h3>
                                                    </div>
                                                    <span className="text-[10px] font-extrabold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-widest">Live Preview</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                <FileText className="w-3 h-3" /> Case Reference
                                                            </div>
                                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{formData.name}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                <Users className="w-3 h-3" /> Represented Client
                                                            </div>
                                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{formData.client}</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                    <Gavel className="w-3 h-3" /> Practice Area
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{formData.practiceArea || 'General'}</div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                    <Shield className="w-3 h-3" /> Complexity
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Level {formData.complexity}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                <Building2 className="w-3 h-3" /> Jurisdiction
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{formData.court || 'Not provided'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                                        <Layers className="w-3 h-3" /> Full Description
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                                                        "{formData.description || 'No description provided.'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Decorative blob */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30">
                                            <Clock className="w-5 h-5 text-amber-500 flex-none" />
                                            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                                Initializing the case workspace will trigger AI indexing for any subsequent document uploads. This may take a few moments once started.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-10 py-8 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button
                                onClick={step === 1 ? () => router.push('/dashboard') : handleBack}
                                className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {step === 1 ? 'Discard' : 'Go Back'}
                            </button>
                            <button
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={isLoading || (step === 1 && !formData.name) || (step === 2 && !formData.practiceArea)}
                                className={`group relative px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all overflow-hidden ${(isLoading || (step === 1 && !formData.name) || (step === 2 && !formData.practiceArea))
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary text-white shadow-xl shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0'
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
            </DashboardLayout>
        </ProtectedRoute>
    );
}
