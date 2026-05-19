'use client';

import { useState, useEffect } from 'react';
import type { TimeRange } from '@/types/metrics';
import { Calendar, ChevronLeft, Search } from 'lucide-react';
import { SingleDatePicker } from './custom-date-picker';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  appliedCustomStart: string;
  appliedCustomEnd: string;
  onDatePickerApply: (startISO: string, endISO: string) => void;
}

export function TimeRangeSelector({
  value,
  onChange,
  appliedCustomStart,
  appliedCustomEnd,
  onDatePickerApply,
}: TimeRangeSelectorProps) {
  const isCustom = value === 'custom';

  // Local state for single date pickers
  const [tempStart, setTempStart] = useState<Date>(() => {
    return appliedCustomStart ? new Date(appliedCustomStart) : new Date(Date.now() - 3600 * 1000);
  });
  const [tempEnd, setTempEnd] = useState<Date>(() => {
    return appliedCustomEnd ? new Date(appliedCustomEnd) : new Date();
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Sync external changes
  useEffect(() => {
    if (appliedCustomStart) setTempStart(new Date(appliedCustomStart));
    else setTempStart(new Date(Date.now() - 3600 * 1000));
  }, [appliedCustomStart]);

  useEffect(() => {
    if (appliedCustomEnd) setTempEnd(new Date(appliedCustomEnd));
    else setTempEnd(new Date());
  }, [appliedCustomEnd]);

  // Format Helper
  const formatDateTimeDisplay = (d: Date) => {
    if (!d || isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleApply = () => {
    onDatePickerApply(tempStart.toISOString(), tempEnd.toISOString());
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  return (
    <div className="flex flex-wrap items-center">
      {/* ── Main Selector Unified Container ── */}
      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 gap-0.5 shadow-sm transition-all duration-500 ease-out overflow-hidden">
        
        {/* Back Arrow Button (only visible in Custom mode) */}
        <div 
          className="flex items-center overflow-hidden"
          style={{
            width: isCustom ? '36px' : '0px',
            opacity: isCustom ? 1 : 0,
            transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease-out',
            pointerEvents: isCustom ? 'auto' : 'none'
          }}
        >
          <button
            onClick={() => {
              setShowStartPicker(false);
              setShowEndPicker(false);
              onChange('1h');
            }}
            className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all select-none cursor-pointer"
            title="Back to presets"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />
        </div>
                {/* Real-time presets buttons list */}
        <div 
          className="flex items-center gap-0.5 overflow-hidden"
          style={{
            maxWidth: isCustom ? '0px' : '240px',
            opacity: isCustom ? 0 : 1,
            transition: 'max-width 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease-out',
            pointerEvents: isCustom ? 'none' : 'auto'
          }}
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                relative h-7 px-3.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-300 select-none cursor-pointer
                ${value === option.value
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom button */}
        <button
          onClick={() => {
            if (!isCustom) {
              onChange('custom');
              setShowStartPicker(false);
              setShowEndPicker(false);
            } else {
              setShowStartPicker(false);
              setShowEndPicker(false);
            }
          }}
          className={`
            relative flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-lg text-xs font-semibold transition-all duration-500 select-none cursor-pointer
            ${isCustom
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }
          `}
        >
          <Calendar className="h-3.5 w-3.5" />
          Custom
        </button>

        {/* ── Custom Range Display Buttons (Nested inside the same unified pill container) ── */}
        <div 
          className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 transition-all shrink-0"
          style={{
            width: isCustom ? '1px' : '0px',
            opacity: isCustom ? 1 : 0,
            margin: isCustom ? '0 4px' : '0'
          }}
        />

        <div
          className="flex items-center gap-1.5 overflow-hidden pr-0.5 shrink-0"
          style={{
            maxWidth: isCustom ? '440px' : '0px',
            opacity: isCustom ? 1 : 0,
            transform: isCustom ? 'translateX(0)' : 'translateX(15px)',
            transition: 'max-width 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out, transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isCustom ? 'auto' : 'none'
          }}
        >
          {/* Start Date Display Block */}
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 text-xs font-semibold select-none border border-slate-100 dark:border-slate-800 relative">
            <span>{formatDateTimeDisplay(tempStart)}</span>
            <button
              onClick={() => {
                setShowStartPicker(!showStartPicker);
                setShowEndPicker(false);
              }}
              className={`h-5 w-5 flex items-center justify-center rounded-md border transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-100
                ${showStartPicker 
                  ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                }
              `}
              title="시작 일시 선택"
            >
              <Calendar className="h-3 w-3" />
            </button>

            {showStartPicker && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <SingleDatePicker
                  value={tempStart}
                  onChange={setTempStart}
                  onClose={() => setShowStartPicker(false)}
                  label="시작 시간 (From)"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold shrink-0">~</span>

          {/* End Date Display Block */}
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 text-xs font-semibold select-none border border-slate-100 dark:border-slate-800 relative">
            <span>{formatDateTimeDisplay(tempEnd)}</span>
            <button
              onClick={() => {
                setShowEndPicker(!showEndPicker);
                setShowStartPicker(false);
              }}
              className={`h-5 w-5 flex items-center justify-center rounded-md border transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-100
                ${showEndPicker 
                  ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                }
              `}
              title="종료 일시 선택"
            >
              <Calendar className="h-3 w-3" />
            </button>

            {showEndPicker && (
              <div className="absolute right-0 sm:left-0 top-full mt-2 z-50">
                <SingleDatePicker
                  value={tempEnd}
                  onChange={setTempEnd}
                  onClose={() => setShowEndPicker(false)}
                  label="종료 시간 (To)"
                />
              </div>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            disabled={tempStart >= tempEnd}
            className="h-7 w-7 flex items-center justify-center bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-900 rounded-lg transition-all shadow-sm active:scale-95 duration-200 shrink-0 border border-transparent dark:border-slate-300 cursor-pointer"
            title="적용 (Apply)"
          >
            <Search className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
