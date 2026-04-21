import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Type, AlertCircle, MapPin, Loader2, ChevronDown, ListFilter, ShieldAlert, Briefcase, CheckCircle2, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import api from '@/lib/api';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: any) => Promise<void>;
    initialDate?: Date;
    event?: any;
    cases: any[];
}

const initialState = {
    title: '',
    description: '',
    start: '',
    startTime: '09:00',
    type: 'deadline',
    priority: 'medium',
    caseId: '',
    location: '',
    isAllDay: false,
    status: 'active'
};

export default function EventModal({
    isOpen,
    onClose,
    onSave,
    initialDate,
    event,
    cases
}: EventModalProps) {

    const [formData, setFormData] = useState(initialState);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const parseSafely = (dateVal: any) => {
            const d = new Date(dateVal);
            return isNaN(d.getTime()) ? new Date() : d;
        };

        if (isOpen) {
            setShowDeleteConfirm(false);

            if (event) {
                const startDate = parseSafely(event.start);
                setFormData({
                    title: event.title || '',
                    description: event.description || '',
                    start: format(startDate, 'yyyy-MM-dd'),
                    startTime: format(startDate, 'HH:mm'),
                    type: event.type || 'deadline',
                    priority: event.priority || 'medium',
                    caseId: event.caseId || '',
                    location: event.location || '',
                    isAllDay: event.isAllDay || false,
                    status: event.status || 'active'
                });
            } else {
                const startDate = parseSafely(initialDate);

                const now = new Date();
                const nextHour = (now.getHours() + 1) % 24;
                const startTimeString = `${nextHour.toString().padStart(2, '0')}:00`;

                setFormData({
                    ...initialState,
                    start: format(startDate, 'yyyy-MM-dd'),
                    startTime: startTimeString
                });
            }
        }
    }, [event, initialDate, isOpen]);

    const handleDelete = async () => {
        if (!event?._id) return;

        setIsSaving(true);
        try {
            const response = await api.delete(`/events/${event._id}`);
            const data = response.data;
            if (response.status === 200) {
                onClose();
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setIsSaving(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const startDateTime = new Date(`${formData.start}T${formData.isAllDay ? '00:00' : formData.startTime}`);
            const submissionData = { ...formData };
            if (!submissionData.caseId || submissionData.caseId === '') {
                delete (submissionData as any).caseId;
            }

            await onSave({
                ...submissionData,
                start: startDateTime.toISOString(),
            });
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={event ? 'Edit Legal Event' : 'Schedule Legal Event'}>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <CalendarIcon className="text-primary" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                {event ? 'Refine Legal Event' : 'Schedule Legal Event'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                {event ? 'Update litigation timeline' : 'Initialize timeline entry'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-400" aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {(() => {
                        if (!formData.start || formData.isAllDay) return null;
                        const isToday = isSameDay(new Date(formData.start + 'T00:00:00'), new Date());
                        const selectedTime = new Date(`${formData.start}T${formData.startTime}`);
                        const isPast = isToday && selectedTime < new Date();

                        if (isPast) {
                            return (
                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-snug">
                                        Strategic Warning: This time has already passed. Please ensure this is intentional or adjust to a future time.
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                <Type size={12} className="text-primary" />
                                Event Title
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="e.g., Filing Deadline: Miller vs. Evans"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <CalendarIcon size={12} className="text-primary" />
                                    Date
                                </label>
                                <input
                                    required
                                    type="date"
                                    min={(() => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return today.toISOString().split('T')[0];
                                    })()}
                                    value={formData.start}
                                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <Clock size={12} className="text-primary" />
                                    Time
                                </label>
                                <input
                                    disabled={formData.isAllDay}
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold disabled:opacity-30 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <ListFilter size={12} className="text-primary" />
                                    Event Type
                                </label>
                                <div className="relative group/select">
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer relative z-10"
                                    >
                                        <option value="deadline" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Deadline</option>
                                        <option value="hearing" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Hearing</option>
                                        <option value="meeting" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Meeting</option>
                                        <option value="review" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Review</option>
                                        <option value="consultation" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Consultation</option>
                                        <option value="other" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Other</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/select:text-primary transition-colors z-20" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                    <ShieldAlert size={12} className="text-primary" />
                                    Priority
                                </label>
                                <div className="relative group/select">
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer relative z-10"
                                    >
                                        <option value="low" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Low</option>
                                        <option value="medium" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Medium</option>
                                        <option value="high" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">High</option>
                                        <option value="critical" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Critical</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/select:text-primary transition-colors z-20" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                                <Briefcase size={12} className="text-primary" />
                                Associated Case (Optional)
                            </label>
                            <div className="relative group/select">
                                <select
                                    value={formData.caseId}
                                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-xl outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer relative z-10"
                                >
                                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white italic">No specific case</option>
                                    {cases.map(c => (
                                        <option key={c._id} value={c._id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/select:text-primary transition-colors z-20" />
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${formData.status === 'closed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                        {formData.status === 'closed' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">Event Status</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {formData.status === 'closed' ? 'Marked as completed' : 'Currently active timeline'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'closed' : 'active' })}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'closed'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white'
                                        }`}
                                >
                                    {formData.status === 'closed' ? 'Re-Activate' : 'Mark Closed'}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5 relative">
                        {showDeleteConfirm && (
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 z-20 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                <div className="flex-1 text-xs font-bold text-red-500 flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    Confirm deletion?
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-[10px] font-black uppercase bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/20 hover:bg-red-600"
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                        {event && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                                aria-label="Delete Event"
                            >
                                <Trash2 size={20} className="group-active:scale-95 transition-transform" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                event ? 'Update Event' : 'Create Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
