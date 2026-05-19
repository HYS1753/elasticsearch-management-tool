'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface SingleDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  label: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function SingleDatePicker({
  value,
  onChange,
  onClose,
  label,
}: SingleDatePickerProps) {
  // Calendar month view states
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());

  // Time states
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());

  // Helpers
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const setTimeOnDate = (date: Date, h: number, min: number) => {
    const next = new Date(date);
    next.setHours(h);
    next.setMinutes(min);
    next.setSeconds(0);
    next.setMilliseconds(0);
    return next;
  };

  const generateCalendarDays = (y: number, m: number) => {
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    
    // Trailing previous month days
    const prevMonth = m === 0 ? 11 : m - 1;
    const prevYear = m === 0 ? y - 1 : y;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
    const firstDay = getFirstDayOfMonth(y, m);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      days.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth, d),
      });
    }
    
    // Current month days
    const currentMonthDays = getDaysInMonth(y, m);
    for (let i = 1; i <= currentMonthDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(y, m, i),
      });
    }
    
    // Next month trailing days
    const nextMonth = m === 11 ? 0 : m + 1;
    const nextYear = m === 11 ? y + 1 : y;
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, i),
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const handleDaySelect = (d: Date) => {
    const newD = setTimeOnDate(d, hour, minute);
    onChange(newD);
  };

  const handleHourChange = (hVal: number) => {
    const validHour = Math.max(0, Math.min(23, hVal));
    setHour(validHour);
    onChange(setTimeOnDate(value, validHour, minute));
  };

  const handleMinuteChange = (mVal: number) => {
    const validMin = Math.max(0, Math.min(59, mVal));
    setMinute(validMin);
    onChange(setTimeOnDate(value, hour, validMin));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const calendarDays = generateCalendarDays(year, month);

  return (
    <div className="flex flex-col p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl backdrop-blur-md w-72 animate-in fade-in slide-in-from-top-2 duration-200 select-none">
      
      {/* Title */}
      <div className="text-center pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{label}</span>
      </div>

      {/* Month selection header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </button>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {year}년 {month + 1}월
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {WEEKDAYS.map(w => (
          <span key={w} className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase py-1">
            {w}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {calendarDays.map((cell, idx) => {
          const selected = isSameDay(cell.date, value);
          return (
            <button
              key={`day-${idx}`}
              onClick={() => handleDaySelect(cell.date)}
              className={`
                h-8 w-8 text-xs font-semibold rounded-lg transition-all select-none mx-auto flex items-center justify-center
                ${cell.isCurrentMonth 
                  ? 'text-slate-700 dark:text-slate-300' 
                  : 'text-slate-300 dark:text-slate-700'
                }
                ${selected 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Time Selection */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            className="w-12 text-center py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <span className="text-slate-400 dark:text-slate-650 text-xs font-semibold">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={(e) => handleMinuteChange(Number(e.target.value))}
            className="w-12 text-center py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Confirm OK */}
      <div className="flex justify-end pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-bold shadow-sm transition-all"
        >
          Confirm
        </button>
      </div>

    </div>
  );
}
