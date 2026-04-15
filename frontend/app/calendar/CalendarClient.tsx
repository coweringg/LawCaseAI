"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addDays,
    isBefore,
    startOfDay,
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    AlertCircle,
    Clock,
    Calendar as CalendarIcon,
    Search,
    MoreVertical,
    Loader2,
    MapPin,
    ListFilter,
    Briefcase
} from 'lucide-react';
import { subDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import EventModal from '@/components/modals/EventModal';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarClient() {
    const { isAuthenticated } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(undefined);
    const [view, setView] = useState<'Day' | 'Week' | 'Month' | 'List'>('Month');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [mounted, setMounted] = useState(false);
    const lastFetch = React.useRef<number>(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchEvents = useCallback(async (query?: string) => {
        if (!query) setIsLoading(true);
        else setIsSearching(true);

        try {
            const params: any = {};
            if (query) {
                params.search = query;
            } else {
                params.start = startOfMonth(currentDate).toISOString();
                params.end = endOfMonth(currentDate).toISOString();
            }

            const response = await api.get('/events', {
                params
            });

            if (response.data.success) {
                if (query) {
                    setSearchResults(response.data.data);
                } else {
                    setEvents(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            if (!query) toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    }, [currentDate]);

    const fetchCases = useCallback(async () => {
        try {
            const response = await api.get('/cases');
            if (response.data.success) {
                setCases(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    }, []);

    useEffect(() => {
        const now = Date.now();
        if (isAuthenticated && now - lastFetch.current > 1000) {
            lastFetch.current = now;
            fetchEvents();
            fetchCases();
        }
    }, [fetchEvents, fetchCases, isAuthenticated]);

    useEffect(() => {
        if (isSearchModalOpen && searchQuery.trim().length > 0) {
            const timer = setTimeout(() => {
                fetchEvents(searchQuery);
            }, 300);
            return () => clearTimeout(timer);
        } else if (isSearchModalOpen) {
            setSearchResults([]);
        }
    }, [searchQuery, isSearchModalOpen, fetchEvents]);

    const handleSaveEvent = async (eventData: any) => {
        try {
            let response;
            if (selectedEvent) {
                response = await api.put(`/events/${selectedEvent._id}`, eventData);
            } else {
                response = await api.post('/events', eventData);
            }

            if (response.data.success) {
                toast.success(selectedEvent ? 'Legal event updated successfully' : 'Legal event created successfully');
                fetchEvents();
            }
        } catch (error: any) {
            console.error('Error saving event:', error);
            const errorMessage = error.response?.data?.message || 'A technical error occurred while saving the legal event.';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleOpenModal = (date?: Date, event?: any) => {
        setSelectedDate(date);
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const days = DAYS;

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextDate = () => {
        if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'Week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };
    const prevDate = () => {
        if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'Week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subDays(currentDate, 1));
    };
    const goToToday = () => setCurrentDate(new Date());

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getPriorityColor = (priority: string, status?: string) => {
        if (status === 'closed') return 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800/50 dark:text-slate-500 line-through opacity-60';
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-500 dark:bg-red-900/30 dark:text-red-400';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-500 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-500 dark:bg-amber-900/30 dark:text-amber-400';
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-slate-100 text-slate-700 border-slate-500 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    if (!mounted) return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );

    return (
        <DashboardLayout>
            <div className="flex bg-transparent h-[calc(100vh-5rem)] -m-6 overflow-hidden relative z-10">
                <aside className="w-64 premium-glass border-r border-white/10 hidden md:flex flex-col overflow-y-auto relative">
                    <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
                    <div className="relative z-10 p-4">
                        <motion.button
                            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenModal(new Date())}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20"
                        >
                            <Plus size={18} />
                            New Legal Entry
                        </motion.button>
                    </div>

                    <div className="p-6 border-b border-white/10 relative z-10 bg-white/[0.01]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-black text-[11px] uppercase tracking-[0.3em] text-white font-display">{format(currentDate, 'MMMM yyyy')}</span>
                            <div className="flex gap-1">
                                <button onClick={prevDate} className="p-2 transition-all duration-150 hover:text-white hover:scale-110 active:scale-90"><ChevronLeft size={16} /></button>
                                <button onClick={nextDate} className="p-2 transition-all duration-150 hover:text-white hover:scale-110 active:scale-90"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-[8px] text-center font-black text-slate-600 mb-4 tracking-[0.2em]">
                            {days.map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 text-[10px] text-center">
                            {calendarDays.slice(0, 35).map((date, idx) => {
                                const isPastMini = isBefore(date, startOfDay(new Date()));
                                const isTodayMini = isSameDay(date, new Date());
                                const isCurrentDay = isSameDay(date, currentDate);
                                
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentDate(date)}
                                        className={`p-1.5 font-black rounded-lg cursor-pointer transition-all duration-150 relative group/day ${isTodayMini
                                            ? 'text-primary'
                                            : isPastMini
                                                ? 'text-slate-700 opacity-40 hover:opacity-100 hover:bg-white/5'
                                                : !isSameMonth(date, monthStart)
                                                    ? 'text-slate-800'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {isCurrentDay && !isTodayMini && <div className="absolute inset-0 border border-primary/40 rounded-lg animate-pulse"></div>}
                                        {isTodayMini && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(37,99,235,1)]"></div>}
                                        {format(date, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 flex-1 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Master Timeline</h3>
                            <div className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        </div>
                        <div className="space-y-4">
                            {events.filter(e => e.priority === 'critical' || e.priority === 'high').slice(0, 5).map((event, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    onClick={() => handleOpenModal(undefined, event)}
                                    className="flex gap-4 items-start p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/40 hover:scale-[1.02] transition-all duration-150 cursor-pointer group shadow-2xl relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className={`w-1.5 h-10 rounded-full shrink-0 ${event.priority === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]'}`}></div>
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <p className="text-[11px] font-black text-white group-hover:text-primary transition-colors line-clamp-1 truncate font-display tracking-tightest leading-tight mb-1.5">{event.title}</p>
                                        {event.caseId && (() => {
                                            const linkedCase = cases.find((c: any) => c._id === event.caseId);
                                            return linkedCase ? (
                                                <div className="flex items-center gap-1 mb-1.5">
                                                    <Briefcase size={8} className="text-primary/60" />
                                                    <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest truncate">{linkedCase.name}</span>
                                                </div>
                                            ) : null;
                                        })()}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                                <Clock size={10} className="text-primary" />
                                                {(() => {
                                                    try {
                                                        const d = new Date(event.start);
                                                        return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'h:mm a');
                                                    } catch {
                                                        return 'Invalid Date';
                                                    }
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                                <CalendarIcon size={10} />
                                                {(() => {
                                                    try {
                                                        const d = new Date(event.start);
                                                        return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'MMM d');
                                                    } catch {
                                                        return 'Invalid Date';
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {events.filter(e => e.priority === 'critical' || e.priority === 'high').length === 0 && (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <CalendarIcon size={32} className="mx-auto mb-3 text-slate-700" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline Clear</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 overflow-hidden flex flex-col bg-transparent backdrop-blur-3xl">
                    <div className="p-6 flex flex-wrap items-center justify-between border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent pointer-events-none"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="flex flex-col">
                                <h2 className="text-4xl font-black text-white tracking-tightest font-display leading-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Master Timeline &bull; Neural Indexing Active</p>
                                </div>
                            </div>
                            <div className="flex items-center premium-glass p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl">
                                {(['Day', 'Week', 'Month', 'List'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-150 ${view === v ? 'bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-5 mt-2 sm:mt-0 relative z-10">
                            <div className="flex items-center premium-glass p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                                <button onClick={prevDate} className="p-3 text-slate-500 hover:text-white transition-all hover:scale-110"><ChevronLeft size={20} /></button>
                                <button onClick={goToToday} className="px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all text-slate-400 border-x border-white/10">TODAY</button>
                                <button onClick={nextDate} className="p-3 text-slate-500 hover:text-white transition-all hover:scale-110"><ChevronRight size={20} /></button>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(37,99,235,0.3)", transition: { duration: 0.15 } }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setIsSearchModalOpen(true);
                                    setSearchQuery('');
                                }}
                                className="flex items-center gap-3 px-6 py-3.5 premium-glass border border-white/10 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/40 transition-all shadow-2xl group"
                            >
                                <Search size={18} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-150" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Discovery Core</span>
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-slate-100 dark:bg-white/5">
                        {view === 'Month' && (
                            <div className="grid grid-cols-7 gap-[1px]">
                                {DAYS.map(day => (
                                    <div key={day} className="bg-white/50 dark:bg-surface-dark/30 backdrop-blur-sm py-3 text-center text-[10px] font-black text-slate-400 border-b border-slate-200 dark:border-white/5 tracking-widest uppercase">
                                        {day}
                                    </div>
                                ))}
                                {calendarDays.map((date, idx) => (
                                    <CalendarCell
                                        key={idx}
                                        date={date}
                                        events={filteredEvents}
                                        onOpenModal={handleOpenModal}
                                        monthStart={monthStart}
                                        getPriorityColor={getPriorityColor}
                                        cases={cases}
                                    />
                                ))}
                            </div>
                        )}

                        {view === 'Week' && (
                            <div className="flex flex-col h-full bg-white dark:bg-surface-dark">
                                <div className="grid grid-cols-7 gap-px border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                    {eachDayOfInterval({
                                        start: startOfWeek(currentDate),
                                        end: endOfWeek(currentDate)
                                    }).map((date, idx) => {
                                        const isPastHeader = isBefore(date, startOfDay(new Date()));
                                        return (
                                            <div key={idx} className={`p-4 text-center ${isPastHeader ? 'opacity-40' : ''}`}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(date, 'eee')}</p>
                                                <p className={`text-lg font-black mt-1 ${isSameDay(date, new Date()) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{format(date, 'd')}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-7 flex-1 divide-x divide-slate-100 dark:divide-white/5">
                                    {eachDayOfInterval({
                                        start: startOfWeek(currentDate),
                                        end: endOfWeek(currentDate)
                                    }).map((date, idx) => {
                                        const isDayPast = isBefore(date, startOfDay(new Date()));

                                        return (
                                            <div key={idx} className={`p-4 space-y-3 min-h-[400px] transition-colors ${isDayPast ? 'bg-black/20 opacity-60' : 'bg-white dark:bg-surface-dark/40'}`}>
                                                {filteredEvents.filter(e => isSameDay(new Date(e.start), date)).map((event, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleOpenModal(undefined, event)}
                                                        className={`p-3 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${getPriorityColor(event.priority, event.status)} ${isDayPast ? 'grayscale-[0.5]' : ''}`}
                                                    >
                                                        <p className="text-[10px] font-black mb-1 opacity-80 uppercase">{format(new Date(event.start), 'HH:mm')}</p>
                                                        <p className="text-xs font-bold leading-tight">{event.title}</p>
                                                    </div>
                                                ))}
                                                {isDayPast ? (
                                                    <div className="flex-1 flex items-center justify-center opacity-10 select-none">
                                                        <Clock size={24} className="text-slate-300" />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenModal(date)}
                                                        className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl text-slate-300 hover:border-primary/30 hover:text-primary transition-all duration-150 flex items-center justify-center"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {view === 'Day' && (
                            <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-24 h-24 bg-primary rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl shadow-primary/30">
                                        <span className="text-[14px] font-black uppercase tracking-tighter">{format(currentDate, 'MMM')}</span>
                                        <span className="text-4xl font-black">{format(currentDate, 'd')}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{format(currentDate, 'EEEE')}</h3>
                                        <p className="text-lg font-bold text-slate-400 capitalize">{format(currentDate, 'MMMM do, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {filteredEvents.filter(e => isSameDay(new Date(e.start), currentDate)).map((event, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleOpenModal(undefined, event)}
                                            className={`p-6 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-150 border-l-[6px] shadow-lg hover:translate-x-1 ${getPriorityColor(event.priority, event.status)}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="text-center w-20">
                                                    <span className="text-xl font-black text-slate-900 dark:text-white">{format(new Date(event.start), 'HH:mm')}</span>
                                                    <span className="block text-[10px] font-black uppercase opacity-60">{format(new Date(event.start), 'aaa')}</span>
                                                </div>
                                                <div className="h-10 w-px bg-slate-200 dark:bg-white/10"></div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{event.title}</p>
                                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
                                                        <MapPin size={12} /> {event.location || 'No location set'}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={24} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-150" />
                                        </div>
                                    ))}
                                    {filteredEvents.filter(e => isSameDay(new Date(e.start), currentDate)).length === 0 && (
                                        <div className="py-24 text-center bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
                                            <CalendarIcon size={64} className="mx-auto mb-4 text-slate-200" />
                                            <h4 className="text-xl font-black text-slate-400">No appointments scheduled today</h4>
                                            <button
                                                onClick={() => {
                                                    if (!isSameDay(currentDate, new Date()) && currentDate < new Date()) {
                                                        toast.error('Cannot schedule events in the past');
                                                        return;
                                                    }
                                                    handleOpenModal(currentDate);
                                                }}
                                                className={`mt-6 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${!isSameDay(currentDate, new Date()) && currentDate < new Date()
                                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                    : 'bg-primary text-white hover:scale-105 shadow-primary/20'
                                                    }`}
                                            >
                                                Schedule Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {view === 'List' && (
                            <div className="p-8 max-w-5xl mx-auto space-y-8">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                    <ListFilter size={24} className="text-primary" />
                                    Agenda Timeline
                                </h3>
                                <div className="space-y-6">
                                    {filteredEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map((event, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleOpenModal(undefined, event)}
                                            className="flex gap-6 items-start group cursor-pointer"
                                        >
                                            <div className="w-24 text-right pt-2">
                                                <p className="text-[11px] font-black text-slate-400 uppercase">{format(new Date(event.start), 'MMM d')}</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{format(new Date(event.start), 'h:mm a')}</p>
                                            </div>
                                            <div className="relative pt-2 pb-8">
                                                <div className="absolute top-0 bottom-0 left-1 w-[2px] bg-slate-100 dark:bg-white/5 group-last:bg-transparent"></div>
                                                <div className={`w-3 h-3 rounded-full absolute left-[-4px] top-[14px] ring-4 ring-white dark:ring-surface-dark ${event.priority === 'critical' ? 'bg-red-500' :
                                                    event.priority === 'high' ? 'bg-amber-500' : 'bg-primary'
                                                    }`}></div>
                                            </div>
                                            <div className={`flex-1 p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 group-hover:border-primary/30 transition-all duration-150 shadow-sm group-hover:shadow-xl ${getPriorityColor(event.priority, event.status)}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{event.title}</h4>
                                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{event.description || 'No description provided'}</p>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/50 dark:bg-black/20">{event.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <div className="py-24 text-center">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No events to display</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveEvent}
                    initialDate={selectedDate}
                    event={selectedEvent}
                    cases={cases}
                />

                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-[15vh] px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
                                onClick={() => setIsSearchModalOpen(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                className="relative w-full max-w-2xl glass-dark rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/10 flex items-center gap-6 bg-white/5">
                                    <div className="p-4 bg-primary/20 text-primary rounded-2xl shadow-inner">
                                        <Search size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Initialize query..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-2xl font-black text-white font-display placeholder:text-slate-700"
                                        />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">Intelligence Core Discovery Interface</p>
                                    </div>
                                    <button
                                        onClick={() => setIsSearchModalOpen(false)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all font-black text-[10px] tracking-widest"
                                    >
                                        ESC
                                    </button>
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3 bg-transparent">
                                    {isSearching ? (
                                        <div className="py-24 text-center">
                                            <Loader2 size={48} className="animate-spin text-primary mx-auto mb-6" />
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronizing data units...</p>
                                        </div>
                                    ) : searchQuery.trim() === '' ? (
                                        <div className="py-24 text-center opacity-30">
                                            <Search size={64} className="mx-auto mb-6 text-slate-700" />
                                            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Query input required for discovery</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="grid gap-3">
                                            {searchResults.map((event, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={i}
                                                    onClick={() => {
                                                        const eDate = new Date(event.start);
                                                        setIsSearchModalOpen(false);
                                                        setSearchQuery('');

                                                        setTimeout(() => {
                                                            setView('Month');
                                                            setCurrentDate(eDate);
                                                            handleOpenModal(undefined, event);
                                                            toast.success(`Opening ${format(eDate, 'MMM d')}`, {
                                                                icon: '⚖️',
                                                                style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
                                                            });
                                                        }, 100);
                                                    }}
                                                    className="p-6 rounded-[28px] glass border border-white/5 hover:border-primary/50 cursor-pointer transition-all duration-150 group active:scale-[0.98] flex justify-between items-center shadow-2xl"
                                                >
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <h5 className="text-[18px] font-black text-white truncate group-hover:text-primary transition-colors mb-2 font-display">{event.title}</h5>
                                                        <div className="flex items-center gap-6 text-slate-500">
                                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                                <CalendarIcon size={14} className="text-primary" />
                                                                {format(new Date(event.start), 'MMM d, yyyy')}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                                <Clock size={14} className="text-primary" />
                                                                {format(new Date(event.start), 'h:mm a')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${event.status === 'closed'
                                                            ? 'bg-white/5 text-slate-500 border-white/10'
                                                            : 'bg-primary/10 text-primary border-primary/20'
                                                            }`}>
                                                            {event.status === 'closed' ? 'Archived' : 'Active'}
                                                        </div>
                                                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${event.priority === 'critical' ? 'bg-red-500 text-white shadow-red-500/20' :
                                                            event.priority === 'high' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                                                                event.priority === 'medium' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                                                    'bg-emerald-500 text-white shadow-emerald-500/20'
                                                            }`}>
                                                            {event.priority}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-24 text-center">
                                            <AlertCircle size={48} className="text-slate-800 mx-auto mb-6" />
                                            <h5 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Null result set</h5>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Repository scan completed with no matches</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 bg-white/5 border-t border-white/10 text-center">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                                        LAW CASE AI INTELLIGENCE
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

function CalendarCell({ date, events, onOpenModal, monthStart, getPriorityColor, cases }: any) {
    const dayEvents = events.filter((e: any) => {
        try {
            const d = new Date(e.start);
            return !isNaN(d.getTime()) && isSameDay(d, date);
        } catch {
            return false;
        }
    });

    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = isSameMonth(date, monthStart);
    const isPast = isBefore(date, startOfDay(new Date()));

    return (
        <div className={`min-h-[120px] p-4 relative group transition-all duration-200 hover:z-20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-r border-b border-white/10 overflow-hidden
            ${!isCurrentMonth ? 'bg-black/60 opacity-10' :
                isPast ? 'bg-black/30 grayscale-[0.8] opacity-50' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}>
            <div className="flex justify-between items-start relative z-10">
                <span className={`text-[12px] font-black transition-all duration-150 font-display ${isToday
                    ? 'bg-primary text-white w-10 h-10 flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)] ring-2 ring-white/20'
                    : isPast ? 'text-slate-600' : isCurrentMonth ? 'text-slate-400 group-hover:text-white group-hover:scale-110' : 'text-slate-700'
                    }`}>
                    {format(date, 'd')}
                </span>
                {dayEvents.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenModal(undefined, dayEvents[0]); }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all duration-150 text-slate-500 hover:text-white"
                    >
                        <MoreVertical size={14} />
                    </button>
                )}
            </div>
            <div className={`mt-4 space-y-2 ${isToday ? '' : date < new Date() ? 'opacity-40' : ''}`}>
                {dayEvents.map((event: any, i: number) => (
                    <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        onClick={() => onOpenModal(undefined, event)}
                        className={`text-[10px] px-3 py-2 rounded-xl font-black border-l-[3px] truncate cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-lg uppercase tracking-tighter ${getPriorityColor(event.priority, event.status)}`}
                    >
                        <div className="flex items-center gap-1.5">
                            {(event.priority === 'critical' && event.status !== 'closed') && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />}
                            <span className="truncate">{event.title}</span>
                        </div>
                        {event.caseId && (() => {
                            const linkedCase = cases?.find((c: any) => c._id === event.caseId);
                            return linkedCase ? (
                                <div className="flex items-center gap-1 mt-0.5 opacity-70">
                                    <Briefcase size={8} />
                                    <span className="text-[7px] truncate">{linkedCase.name}</span>
                                </div>
                            ) : null;
                        })()}
                    </motion.div>
                ))}
            </div>
            {(!isToday && date < new Date()) ? null : (
                <button
                    onClick={() => onOpenModal(date)}
                    className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-110 active:scale-95 shadow-xl shadow-primary/20"
                >
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
}
