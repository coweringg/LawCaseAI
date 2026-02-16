import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

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
                    <div className="w-full md:w-1/3 bg-slate-50 dark:bg-background-dark border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between p-8 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-12">
                                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">L</div>
                                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">LawCaseAI</span>
                            </div>

                            {/* Stepper */}
                            <div className="space-y-0">
                                {/* Step 1 */}
                                <div className={`relative flex gap-4 step-connector ${step > 1 ? 'active' : ''} ${step === 1 ? 'active' : ''}`}>
                                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-500'}`}>
                                        {step > 1 ? <span className="material-icons text-sm">check</span> : <span className="text-sm font-bold">1</span>}
                                    </div>
                                    <div className="pb-10">
                                        <h3 className={`text-sm font-semibold ${step >= 1 ? 'text-primary' : 'text-slate-500'}`}>Case Basics</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Name and client details</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className={`relative flex gap-4 step-connector ${step > 2 ? 'active' : ''} ${step === 2 ? 'active' : ''}`}>
                                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-500'}`}>
                                        {step > 2 ? <span className="material-icons text-sm">check</span> : <span className="text-sm font-bold">2</span>}
                                    </div>
                                    <div className="pb-10">
                                        <h3 className={`text-sm font-semibold ${step >= 2 ? 'text-primary' : 'text-slate-500'}`}>Classification</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Type, status, and impact</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className={`relative flex gap-4 step-connector ${step > 3 ? 'active' : ''} ${step === 3 ? 'active' : ''}`}>
                                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 3 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-500'}`}>
                                        {step > 3 ? <span className="material-icons text-sm">check</span> : <span className="text-sm font-bold">3</span>}
                                    </div>
                                    <div className="pb-10">
                                        <h3 className={`text-sm font-semibold ${step >= 3 ? 'text-primary' : 'text-slate-500'}`}>Jurisdiction</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Court and location settings</p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className={`relative flex gap-4 step-connector last ${step === 4 ? 'active' : ''}`}>
                                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 4 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-500'}`}>
                                        <span className="text-sm font-bold">4</span>
                                    </div>
                                    <div className="pb-0">
                                        <h3 className={`text-sm font-semibold ${step >= 4 ? 'text-primary' : 'text-slate-500'}`}>Review</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Final confirmation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Context Card */}
                        <div className="relative z-10 mt-auto hidden md:block">
                            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-5 border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <span className="material-icons text-primary text-xl">auto_awesome</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary mb-1">AI Assistant</h4>
                                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                            I'll customize your workspace based on the details you provide here.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form Content */}
                    <div className="w-full md:w-2/3 flex flex-col h-full bg-white dark:bg-surface-dark relative">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {step === 1 && 'Case Basics'}
                                    {step === 2 && 'Classification'}
                                    {step === 3 && 'Jurisdiction'}
                                    {step === 4 && 'Review & Confirm'}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {step === 1 && 'Start by providing the core details of the case.'}
                                    {step === 2 && 'Define the nature and current standing of the case.'}
                                    {step === 3 && 'Specify the legal jurisdiction and court of record.'}
                                    {step === 4 && 'Review all details before creating the workspace.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form className="space-y-6 max-w-2xl mx-auto">
                                {step === 1 && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Case Name (Reference)</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Example: Smith vs. Johnson Corp"
                                                type="text"
                                            />
                                            <p className="mt-1.5 text-xs text-slate-500">Use a descriptive internal name for easier organization.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                name="client"
                                                value={formData.client}
                                                onChange={handleChange}
                                                placeholder="e.g. John Doe or Acme Inc."
                                                type="text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Brief summary of the case..."
                                            />
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Legal Area / Case Type</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full appearance-none px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                    name="practiceArea"
                                                    value={formData.practiceArea}
                                                    onChange={handleChange}
                                                >
                                                    <option value="" disabled>Select the primary domain</option>
                                                    <option value="civil">Civil Litigation</option>
                                                    <option value="criminal">Criminal Law</option>
                                                    <option value="ip">Intellectual Property</option>
                                                    <option value="employment">Employment Law</option>
                                                    <option value="corporate">Corporate & M&A</option>
                                                    <option value="family">Family Law</option>
                                                </select>
                                                <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Initial Status</label>
                                            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg inline-flex w-full">
                                                {['open', 'pending', 'consultation'].map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                                        className={`flex-1 font-medium text-sm py-2 px-4 rounded-md transition-all capitalize ${formData.status === s ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Complexity Assessment</label>
                                            <input
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                type="range"
                                                min="1"
                                                max="3"
                                                name="complexity"
                                                value={formData.complexity}
                                                onChange={handleChange}
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                                <span>Low</span>
                                                <span className="text-primary font-bold">Standard</span>
                                                <span>High</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Court of Record</label>
                                            <div className="relative">
                                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">account_balance</span>
                                                <input
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                                    name="court"
                                                    value={formData.court}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Supreme Court of NY"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {step === 4 && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 space-y-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Summary</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Case Name</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Client</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.client}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Type</p>
                                                <p className="font-semibold text-slate-900 dark:text-white capitalize">{formData.practiceArea || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Court</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formData.court || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <button
                                onClick={step === 1 ? () => router.push('/dashboard') : handleBack}
                                className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <button
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={isLoading || (step === 1 && !formData.name)}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {step === 4 ? (isLoading ? 'Creating...' : 'Create Case') : 'Next'}
                                {!isLoading && <span className="material-icons-round text-lg">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
