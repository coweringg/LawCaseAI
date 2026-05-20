"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    minDate?: Date;
    dropUp?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Select date", minDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => value ? new Date(value + 'T12:00:00') : new Date());
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUp: false });
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Click outside: close only if click is outside BOTH trigger and panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideTrigger = triggerRef.current?.contains(target);
            const isInsidePanel = panelRef.current?.contains(target);
            if (!isInsideTrigger && !isInsidePanel) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            setCurrentMonth(new Date(value + 'T12:00:00'));
        }
    }, [value]);

    const updateCoords = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const calendarHeight = 340;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const shouldOpenUp = spaceBelow < calendarHeight && spaceAbove > calendarHeight;

            setCoords({
                top: shouldOpenUp ? rect.top : rect.bottom,
                left: rect.left,
                width: Math.max(rect.width, 280),
                openUp: shouldOpenUp,
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            return () => {
                window.removeEventListener('scroll', updateCoords, true);
                window.removeEventListener('resize', updateCoords);
            };
        }
    }, [isOpen, updateCoords]);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    const handleSelectDay = (day: Date, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange('');
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateCoords();
        setIsOpen(prev => !prev);
    };

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart),
        end: endOfWeek(monthEnd),
    });

    return (
        <div className="relative w-full" ref={triggerRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`
                    w-full flex items-center gap-3 px-3 py-2.5 
                    bg-white/[0.03] border border-white/[0.08] rounded-lg 
                    transition-all text-left
                    ${isOpen
                        ? 'border-primary/40 shadow-[0_0_15px_rgba(0,230,118,0.08)]'
                        : 'hover:border-white/20'
                    }
                `}
            >
                <CalendarIcon size={14} className={value ? 'text-primary' : 'text-slate-600'} />
                <span className={`text-sm font-medium truncate ${value ? 'text-white' : 'text-slate-600'}`}>
                    {value ? format(new Date(value + 'T12:00:00'), 'MMM d, yyyy') : placeholder}
                </span>
                {value && (
                    <X
                        size={12}
                        className="ml-auto text-slate-600 hover:text-white transition-colors shrink-0"
                        onClick={handleClear}
                    />
                )}
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: coords.openUp ? coords.top - 8 : coords.top + 8,
                                left: coords.left,
                                width: 280,
                                zIndex: 99999,
                                transform: coords.openUp ? 'translateY(-100%)' : 'none',
                            }}
                            className="bg-black/95 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.7)] overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                                    {format(currentMonth, 'MMMM yyyy')}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 px-2 pt-2">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
                                {calendarDays.map((day, idx) => {
                                    const isSelected = value && isSameDay(day, new Date(value + 'T12:00:00'));
                                    const isOutsideMonth = !isSameMonth(day, currentMonth);
                                    const isToday = isSameDay(day, new Date());
                                    const isDisabled = minDate && !isSameDay(day, minDate) && day < minDate;

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={!!isDisabled}
                                            onClick={(e) => handleSelectDay(day, e)}
                                            className={`
                                                relative aspect-square flex items-center justify-center text-[11px] font-bold rounded-lg transition-all
                                                ${isSelected
                                                    ? 'bg-primary text-black shadow-[0_0_12px_rgba(0,230,118,0.4)] scale-105 font-black'
                                                    : isOutsideMonth
                                                        ? 'text-slate-800'
                                                        : isDisabled
                                                            ? 'text-slate-800 cursor-not-allowed'
                                                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            {format(day, 'd')}
                                            {isToday && !isSelected && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
