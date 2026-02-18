import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
    parseISO
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
    ListFilter
} from 'lucide-react';
import { subDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import EventModal from '@/components/modals/EventModal';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Calendar() {
    const { token } = useAuth();
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

            const response = await axios.get(`${API_URL}/api/events`, {
                headers: { Authorization: `Bearer ${token}` },
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
    }, [currentDate, token]);

    const fetchCases = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/cases`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCases(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    }, [token]);

    useEffect(() => {
        const now = Date.now();
        if (token && now - lastFetch.current > 1000) {
            lastFetch.current = now;
            fetchEvents();
            fetchCases();
        }
    }, [fetchEvents, fetchCases, token]);

    // Real-time event status updater
    useEffect(() => {
        const updateEventStatuses = () => {
            setEvents(prevEvents =>
                prevEvents.map(event => {
                    const eventTime = new Date(event.start);
                    const now = new Date();

                    // If event is today and time has passed, update status to 'closed'
                    if (event.status !== 'closed' &&
                        isSameDay(eventTime, now) &&
                        eventTime < now) {
                        return { ...event, status: 'closed' };
                    }
                    return event;
                })
            );
        };

        // Update immediately and then every minute
        updateEventStatuses();
        const interval = setInterval(updateEventStatuses, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

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
                response = await axios.put(`${API_URL}/api/events/${selectedEvent._id}`, eventData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post(`${API_URL}/api/events`, eventData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
            case 'high': return 'bg-amber-100 text-amber-700 border-amber-500 dark:bg-amber-900/30 dark:text-amber-400';
            case 'medium': return 'bg-primary/10 text-primary border-primary';
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-slate-100 text-slate-700 border-slate-500 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    if (!mounted) return null;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex bg-transparent h-[calc(100vh-theme(spacing.20))] -m-8 overflow-hidden relative z-10">
                    {/* Sidebar */}
                    <aside className="w-80 glass-dark border-r border-white/5 flex flex-col overflow-y-auto hidden md:flex relative">
                        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] z-0 pointer-events-none"></div>
                        <div className="relative z-10 p-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOpenModal(new Date())}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20"
                            >
                                <Plus size={18} />
                                New Legal Entry
                            </motion.button>
                        </div>

                        {/* Mini Calendar */}
                        <div className="p-6 border-b border-white/5 relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-black text-xs uppercase tracking-widest text-white">{format(currentDate, 'MMMM yyyy')}</span>
                                <div className="flex gap-2">
                                    <button onClick={prevDate} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
                                    <button onClick={nextDate} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-black text-slate-500 mb-4 tracking-tighter">
                                {days.map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
                                {calendarDays.slice(0, 35).map((date, idx) => {
                                    const isPastMini = isBefore(date, startOfDay(new Date()));
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setCurrentDate(date)}
                                            className={`p-1.5 font-bold rounded-lg cursor-pointer transition-all ${isSameDay(date, new Date())
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : isPastMini
                                                    ? 'text-slate-600/50 hover:bg-white/5 hover:text-white'
                                                    : !isSameMonth(date, monthStart)
                                                        ? 'text-slate-700'
                                                        : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                } ${isSameDay(date, currentDate) && !isSameDay(date, new Date()) ? 'ring-1 ring-primary/50 bg-primary/10 text-white' : ''}`}
                                        >
                                            {format(date, 'd')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="p-6 flex-1 relative z-10">
                            <div className="flex items-center justify-between mb-6">
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
                                        className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group shadow-xl"
                                    >
                                        <div className={`w-1 h-8 rounded-full ${event.priority === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-white group-hover:text-primary transition-colors line-clamp-1 truncate">{event.title}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
                                                <Clock size={10} />
                                                {(() => {
                                                    try {
                                                        const d = new Date(event.start);
                                                        return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'MMM d, h:mm a');
                                                    } catch {
                                                        return 'Invalid Date';
                                                    }
                                                })()}
                                            </p>
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

                    {/* Main Calendar Area */}
                    <main className="flex-1 overflow-hidden flex flex-col bg-transparent backdrop-blur-3xl">
                        {/* Calendar Header */}
                        <div className="p-6 flex flex-wrap items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-xl">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <h2 className="text-3xl font-black text-white tracking-tight font-display">{format(currentDate, 'MMMM yyyy')}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Selective Repository Insight</p>
                                </div>
                                <div className="flex items-center glass p-1 rounded-2xl border border-white/10 shadow-2xl">
                                    {(['Day', 'Week', 'Month', 'List'] as const).map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === v ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                <div className="flex items-center glass p-1 rounded-2xl border border-white/10">
                                    <button onClick={prevDate} className="p-2.5 text-slate-500 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                                    <button onClick={goToToday} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors text-slate-400 border-x border-white/5">TODAY</button>
                                    <button onClick={nextDate} className="p-2.5 text-slate-500 hover:text-white transition-colors"><ChevronRight size={18} /></button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsSearchModalOpen(true);
                                        setSearchQuery('');
                                    }}
                                    className="flex items-center gap-3 px-5 py-3 glass border border-white/10 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-2xl group"
                                >
                                    <Search size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Discovery</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Conditional Rendering based on View */}
                        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-white/5">
                            {view === 'Month' && (
                                <div className="grid grid-cols-7 gap-[1px]">
                                    {days.map(day => (
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
                                            const isDayToday = isSameDay(date, new Date());

                                            return (
                                                <div key={idx} className={`p-4 space-y-3 min-h-[400px] transition-colors ${isDayPast ? 'bg-black/20 opacity-60' : 'bg-white dark:bg-surface-dark/40'}`}>
                                                    {filteredEvents.filter(e => isSameDay(new Date(e.start), date)).map((event, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => handleOpenModal(undefined, event)}
                                                            className={`p-3 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${getPriorityColor(event.priority, event.status)} ${isDayPast ? 'grayscale-[0.5]' : ''}`}
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
                                                            className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl text-slate-300 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center"
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
                                                className={`p-6 rounded-2xl flex items-center justify-between group cursor-pointer transition-all border-l-[6px] shadow-lg hover:translate-x-1 ${getPriorityColor(event.priority, event.status)}`}
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
                                                <ChevronRight size={24} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
                                                <div className={`flex-1 p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 group-hover:border-primary/30 transition-all shadow-sm group-hover:shadow-xl ${getPriorityColor(event.priority, event.status)}`}>
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

                    {/* Centralized Global Search Modal */}
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
                                    {/* Search Header */}
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

                                    {/* Search Results */}
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
                                                        className="p-6 rounded-[28px] glass border border-white/5 hover:border-primary/50 cursor-pointer transition-all group active:scale-[0.98] flex justify-between items-center shadow-2xl"
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
                                                                event.priority === 'high' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                                                    'bg-primary text-white shadow-primary/20'
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

                                    {/* Footer */}
                                    <div className="p-5 bg-white/5 border-t border-white/10 text-center">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                                            ANTIGRAVITY NEURAL DISCOVERY CORE
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div >
            </DashboardLayout >
        </ProtectedRoute >
    );
}

// Sub-component for clarity
function CalendarCell({ date, events, onOpenModal, monthStart, getPriorityColor }: any) {
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
        <div className={`min-h-[140px] p-4 relative group transition-all hover:z-20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-r border-b border-white/5 
            ${!isCurrentMonth ? 'bg-black/40 opacity-20' :
                isPast ? 'bg-black/20 grayscale-[0.5] opacity-60' : 'bg-white/5 hover:bg-white/10'}`}>
            <div className="flex justify-between items-start">
                <span className={`text-sm font-black transition-all ${isToday
                    ? 'bg-primary text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-2 ring-primary/20'
                    : isPast ? 'text-slate-600' : isCurrentMonth ? 'text-slate-400 group-hover:text-white' : 'text-slate-700'
                    }`}>
                    {format(date, 'd')}
                </span>
                {dayEvents.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenModal(undefined, dayEvents[0]); }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white"
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
                        className={`text-[10px] px-3 py-2 rounded-xl font-black border-l-[3px] truncate cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg uppercase tracking-tighter ${getPriorityColor(event.priority, event.status)}`}
                    >
                        <div className="flex items-center gap-1.5">
                            {(event.priority === 'critical' && event.status !== 'closed') && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />}
                            <span className="truncate">{event.title}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
            {(!isToday && date < new Date()) ? null : (
                <button
                    onClick={() => onOpenModal(date)}
                    className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-xl shadow-primary/20"
                >
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
}
