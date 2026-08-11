import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface DateInputProps {
  label?: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  min?: string; // Ngày tối thiểu cho phép chọn (e.g. YYYY-MM-DD)
  error?: string;
  className?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  min,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayLocalDate();
  const effectiveMin = min ? min : todayStr;

  const initialDateStr = value || effectiveMin;
  const initialParts = initialDateStr ? initialDateStr.split('-').map(Number) : [];
  const [viewYear, setViewYear] = useState(initialParts[0] || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(initialParts[1] ? initialParts[1] - 1 : new Date().getMonth());

  useEffect(() => {
    const targetDateStr = value || effectiveMin;
    if (targetDateStr) {
      const [y, m] = targetDateStr.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value, effectiveMin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 300);

      const targetDateStr = value || effectiveMin;
      if (targetDateStr) {
        const [y, m] = targetDateStr.split('-').map(Number);
        if (y && m) {
          setViewYear(y);
          setViewMonth(m - 1);
        }
      }
    }
    setIsOpen(!isOpen);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Chọn ngày...';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    return `Ngày ${d} thg ${m}, ${y}`;
  };

  // Kiểm tra nút lùi tháng có bị chặn không
  const canGoPrevMonth = () => {
    if (!effectiveMin) return true;
    const [minY, minM] = effectiveMin.split('-').map(Number);
    if (viewYear < minY) return false;
    if (viewYear === minY && viewMonth <= minM - 1) return false;
    return true;
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth()) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const handleSelectDay = (dayNum: number, isBlocked: boolean) => {
    if (isBlocked) return;
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const formatted = `${viewYear}-${mStr}-${dStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between bg-white transition-all duration-150 outline-none cursor-pointer ${
          isOpen
            ? 'border-primary-600 ring-2 ring-primary-600/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${error ? 'border-red-500 ring-2 ring-red-100' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-slate-700 shrink-0" />
          <span className={`text-sm ${value ? 'font-medium text-slate-800' : 'font-normal text-slate-400'}`}>
            {formatDateDisplay(value)}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-600' : ''
          }`}
        />
      </button>

      {/* Calendar Popup (Smart Drop-Up / Drop-Down) */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 min-w-[280px] ${
            openUpward ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          }`}
        >
          {/* Header navigation */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <button
              type="button"
              disabled={!canGoPrevMonth()}
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-xs text-slate-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="text-[10px] font-extrabold text-slate-400 uppercase">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(dayNum).padStart(2, '0');
              const currentDateStr = `${viewYear}-${mStr}-${dStr}`;
              const isSelected = value === currentDateStr;
              const isToday = todayStr === currentDateStr;
              
              // Khóa toàn bộ các ngày trước ngày hiện tại (Quá khứ)
              const isPast = effectiveMin ? currentDateStr < effectiveMin : false;

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(dayNum, isPast)}
                  className={`h-8 rounded-xl text-xs transition-all flex items-center justify-center ${
                    isPast
                      ? 'text-slate-400 font-medium cursor-not-allowed pointer-events-none select-none'
                      : isSelected
                      ? 'bg-primary-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-primary-50 text-primary-700 font-bold border border-primary-300/80 cursor-pointer'
                      : 'text-slate-800 font-bold hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
