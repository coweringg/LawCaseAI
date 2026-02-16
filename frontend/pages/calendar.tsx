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

export default function Calendar() {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(undefined);
    const [view, setView] = useState<'Day' | 'Week' | 'Month' | 'List'>('Month');
    const [searchQuery, setSearchQuery] = useState('');
    const [cases, setCases] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);
            const response = await axios.get(`${API_URL}/api/events`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    start: start.toISOString(),
                    end: end.toISOString()
                }
            });
            if (response.data.success) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    }, [currentDate, token, API_URL]);

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
    }, [token, API_URL]);

    useEffect(() => {
        if (token) {
            fetchEvents();
            fetchCases();
        }
    }, [fetchEvents, fetchCases, token]);

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

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex bg-white dark:bg-surface-dark h-[calc(100vh-theme(spacing.20))] -m-8 overflow-hidden rounded-tl-xl border-l border-slate-200 dark:border-slate-800">
                    {/* Sidebar */}
                    <aside className="w-72 bg-white dark:bg-white/5 border-r border-slate-200 dark:border-white/10 flex flex-col overflow-y-auto hidden md:flex">
                        <div className="p-4">
                            <button
                                onClick={() => handleOpenModal(new Date())}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                                <Plus size={18} />
                                New Legal Event
                            </button>
                        </div>

                        {/* Mini Calendar */}
                        <div className="p-4 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">{format(currentDate, 'MMMM yyyy')}</span>
                                <div className="flex gap-1">
                                    <button onClick={prevDate} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"><ChevronLeft size={16} /></button>
                                    <button onClick={nextDate} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400 mb-2">
                                {days.map(d => <div key={d}>{d[0]}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
                                {calendarDays.slice(0, 35).map((date, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentDate(date)}
                                        className={`p-1 font-medium rounded cursor-pointer transition-all ${isSameDay(date, new Date())
                                            ? 'bg-primary text-white font-bold shadow-sm'
                                            : !isSameMonth(date, monthStart)
                                                ? 'text-slate-300 dark:text-slate-600'
                                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                            } ${isSameDay(date, currentDate) && !isSameDay(date, new Date()) ? 'ring-2 ring-primary/30 bg-primary/10' : ''}`}
                                    >
                                        {format(date, 'd')}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="p-4 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Critical Alerts</h3>
                                <div className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                {events.filter(e => e.priority === 'critical' || e.priority === 'high').slice(0, 4).map((event, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleOpenModal(undefined, event)}
                                        className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm hover:shadow-md"
                                    >
                                        <div className={`w-1 h-8 rounded-full ${event.priority === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                        <div>
                                            <p className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{event.title}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
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
                                    </div>
                                ))}
                                {events.filter(e => e.priority === 'critical' || e.priority === 'high').length === 0 && (
                                    <div className="text-center py-8 opacity-50">
                                        <CalendarIcon size={32} className="mx-auto mb-2 text-slate-300" />
                                        <p className="text-[10px] font-medium text-slate-400">No critical deadlines</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Calendar Area */}
                    <main className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-background-dark/50 backdrop-blur-3xl">
                        {/* Calendar Header */}
                        <div className="p-5 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                                    <p className="text-[10px] font-bold text-primary active:text-primary-hover cursor-pointer uppercase tracking-widest">{format(currentDate, 'yyyy')}</p>
                                </div>
                                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-1 shadow-inner">
                                    {(['Day', 'Week', 'Month', 'List'] as const).map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all ${view === v ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'hover:bg-white/50 dark:hover:bg-white/5 text-slate-400'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-1 shadow-inner">
                                    <button onClick={prevDate} className="p-2 hover:text-primary transition-colors"><ChevronLeft size={18} /></button>
                                    <button onClick={goToToday} className="px-4 py-1.5 text-[11px] font-black hover:text-primary transition-colors text-slate-600 dark:text-slate-300">TODAY</button>
                                    <button onClick={nextDate} className="p-2 hover:text-primary transition-colors"><ChevronRight size={18} /></button>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-sm outline-none transition-all w-48 focus:w-64"
                                    />
                                </div>
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
                                        }).map((date, idx) => (
                                            <div key={idx} className="p-4 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(date, 'eee')}</p>
                                                <p className={`text-lg font-black mt-1 ${isSameDay(date, new Date()) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{format(date, 'd')}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 flex-1 divide-x divide-slate-100 dark:divide-white/5">
                                        {eachDayOfInterval({
                                            start: startOfWeek(currentDate),
                                            end: endOfWeek(currentDate)
                                        }).map((date, idx) => (
                                            <div key={idx} className="p-4 space-y-3 bg-white dark:bg-surface-dark/40 min-h-[400px]">
                                                {filteredEvents.filter(e => isSameDay(new Date(e.start), date)).map((event, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleOpenModal(undefined, event)}
                                                        className={`p-3 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${getPriorityColor(event.priority, event.status)}`}
                                                    >
                                                        <p className="text-[10px] font-black mb-1 opacity-80 uppercase">{format(new Date(event.start), 'HH:mm')}</p>
                                                        <p className="text-xs font-bold leading-tight">{event.title}</p>
                                                    </div>
                                                ))}
                                                {(!isSameDay(date, new Date()) && date < new Date()) ? (
                                                    <div className="flex-1 flex items-center justify-center opacity-20 select-none">
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
                                        ))}
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
                </div>
            </DashboardLayout>
        </ProtectedRoute>
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

    return (
        <div className={`bg-white dark:bg-surface-dark/40 min-h-[140px] p-3 relative group transition-all hover:z-10 hover:shadow-2xl hover:bg-slate-50 dark:hover:bg-white/5
            ${!isSameMonth(date, monthStart) ? 'bg-slate-50/50 dark:bg-black/20 opacity-40' : ''}`}>
            <div className="flex justify-between items-start">
                <span className={`text-sm font-black transition-all ${isSameDay(date, new Date())
                    ? 'bg-primary text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg ring-4 ring-primary/20'
                    : isSameMonth(date, monthStart) ? 'text-slate-600 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'
                    }`}>
                    {format(date, 'd')}
                </span>
                {dayEvents.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenModal(undefined, dayEvents[0]); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all text-slate-400"
                    >
                        <MoreVertical size={14} />
                    </button>
                )}
            </div>
            <div className={`mt-4 space-y-1.5 ${isSameDay(date, new Date()) ? '' : date < new Date() ? 'opacity-80' : ''}`}>
                {dayEvents.map((event: any, i: number) => (
                    <div key={i} onClick={() => onOpenModal(undefined, event)} className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border-l-4 truncate cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm ${getPriorityColor(event.priority, event.status)}`}>
                        <div className="flex items-center gap-1.5">
                            {(event.priority === 'critical' && event.status !== 'closed') && <AlertCircle size={10} className="animate-pulse" />}
                            <span className="truncate">{event.title}</span>
                        </div>
                    </div>
                ))}
            </div>
            {(!isSameDay(date, new Date()) && date < new Date()) ? null : (
                <button onClick={() => onOpenModal(date)} className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg">
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
}
