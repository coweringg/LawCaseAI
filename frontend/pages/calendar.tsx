import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState('October 2023');

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Mock data for calendar grid (simplified for this implementation)
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const day = i - 5; // Start from previous month end
        const isCurrentMonth = day > 0 && day <= 31;
        return {
            day: isCurrentMonth ? day : (day <= 0 ? 30 + day : day - 31),
            isCurrentMonth,
            events: [] as any[]
        };
    });

    // Add some mock events
    calendarDays[7].events.push({ title: 'Court Deadline', type: 'deadline', color: 'red' }); // 2nd
    calendarDays[9].events.push({ title: 'Hearing: Case #22', type: 'hearing', color: 'primary' }); // 4th
    calendarDays[14].events.push({ title: 'Client Conf.', type: 'meeting', color: 'emerald' }); // 9th
    calendarDays[15].events.push({ title: 'Pre-trial Review', type: 'review', color: 'primary' }); // 10th
    calendarDays[16].events.push({ title: 'Discovery Due', type: 'deadline', color: 'amber' }); // 11th
    // Today
    calendarDays[17].events.push({ title: 'Motion to Dismiss', type: 'deadline', color: 'red', isToday: true }); // 12th
    calendarDays[18].events.push({ title: 'Settlement Talk', type: 'meeting', color: 'primary' }); // 13th

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex bg-white dark:bg-surface-dark h-[calc(100vh-theme(spacing.20))] -m-8 overflow-hidden rounded-tl-xl border-l border-slate-200 dark:border-slate-800">
                    {/* Sidebar */}
                    <aside className="w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto hidden md:flex">
                        <div className="p-4">
                            <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                <span className="material-icons-round text-sm">add</span>
                                New Event
                            </button>
                        </div>

                        {/* Mini Calendar */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">October 2023</span>
                                <div className="flex gap-2">
                                    <button className="material-icons-round text-sm text-slate-400 hover:text-primary">chevron_left</button>
                                    <button className="material-icons-round text-sm text-slate-400 hover:text-primary">chevron_right</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400 mb-2">
                                {days.map(d => <div key={d}>{d[0]}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
                                {/* Simplified mini calendar grid */}
                                {Array.from({ length: 35 }, (_, i) => (
                                    <div key={i} className={`p-1 font-medium rounded cursor-pointer ${i === 17 ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        {i - 5 > 0 && i - 5 <= 31 ? i - 5 : ''}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Deadlines</h3>
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold">3 Alert</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="w-1.5 h-10 bg-red-500 rounded-full"></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-primary">Motion to Dismiss</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Case #882-WL • 2h left</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="w-1.5 h-10 bg-amber-500 rounded-full"></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-primary">Evidence Submission</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Miller vs. State • Tomorrow</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Calendar Area */}
                    <main className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-background-dark">
                        {/* Calendar Header */}
                        <div className="p-4 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">October 2023</h2>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 hidden sm:flex">
                                    {['Day', 'Week', 'Month', 'List'].map(view => (
                                        <button key={view} className={`p-1 px-3 text-xs font-bold rounded transition-all ${view === 'Month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            {view}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <button className="p-2 border-r border-slate-200 dark:border-slate-700 hover:text-primary transition-colors"><span className="material-icons-round text-sm">chevron_left</span></button>
                                    <button className="p-2 px-4 text-xs font-bold hover:text-primary transition-colors text-slate-700 dark:text-slate-300">Today</button>
                                    <button className="p-2 border-l border-slate-200 dark:border-slate-700 hover:text-primary transition-colors"><span className="material-icons-round text-sm">chevron_right</span></button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 grid grid-cols-7 gap-[1px]">
                            {/* Labels */}
                            {days.map(day => (
                                <div key={day} className="bg-slate-50 dark:bg-surface-dark py-2 text-center text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    {day}
                                </div>
                            ))}

                            {/* Cells */}
                            {calendarDays.map((date, idx) => (
                                <div key={idx} className={`bg-white dark:bg-surface-dark min-h-[120px] p-2 relative group ${date.isCurrentMonth ? '' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                                    <span className={`text-xs font-bold ${date.events.some(e => e.isToday) ? 'bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                                        {date.day}
                                    </span>

                                    <div className="mt-2 space-y-1">
                                        {date.events.map((event, i) => (
                                            <div key={i} className={`text-[10px] px-2 py-1 rounded font-bold border-l-2 truncate cursor-pointer transition-colors
                                        ${event.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500 hover:bg-red-200 dark:hover:bg-red-900/50' : ''}
                                        ${event.color === 'primary' ? 'bg-primary/10 text-primary border-primary hover:bg-primary/20' : ''}
                                        ${event.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' : ''}
                                        ${event.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-500 hover:bg-amber-200 dark:hover:bg-amber-900/50' : ''}
                                    `}>
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
