import React from 'react';
import {
  WEEK_DAY_LABELS,
  JS_DAY_TO_SLOT_DAY,
  JS_DAY_TO_SHORT_DAY,
} from '../../constants';
import type { PostScheduleType } from '@/features/post/types';
import type { RecurringSchedule, ScheduleException, CalendarDayItem } from '../../types';

interface BookingCalendarGridProps {
  calendarGrid: (CalendarDayItem | null)[];
  selectedDate: string;
  todayStr: string;
  isApiMode: boolean;
  isAvailabilityLoading: boolean;
  recurringSchedules?: RecurringSchedule[];
  exceptions?: ScheduleException[];
  activeDaysOfWeekSet: Set<string>;
  scheduleType?: PostScheduleType | string;
  startDate?: string;
  endDate?: string;
  onSelectDate: (dateStr: string) => void;
}

export const BookingCalendarGrid: React.FC<BookingCalendarGridProps> = ({
  calendarGrid,
  selectedDate,
  todayStr,
  isApiMode,
  isAvailabilityLoading,
  recurringSchedules,
  exceptions,
  activeDaysOfWeekSet,
  scheduleType,
  startDate,
  endDate,
  onSelectDate,
}) => {
  return (
    <div className="space-y-1.5">
      {/* 7-Day Labels (T2 -> CN) */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
        {WEEK_DAY_LABELS.map((wd) => (
          <span key={wd} className="py-0.5">
            {wd}
          </span>
        ))}
      </div>

      {/* Full Month Calendar Matrix */}
      {isApiMode && isAvailabilityLoading ? (
        <div className="py-8 text-center text-xs text-gray-400 font-medium animate-pulse">
          Đang tải lịch rảnh...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarGrid.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="h-8.5" />;
            }

            const { dateStr, dayNum } = item;
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            // Check if date has BLOCKED exception
            const dayExceptions = (exceptions || []).filter(
              (e) => e.exceptionDate === dateStr && e.type === 'BLOCKED',
            );
            const isBusy = !isPast && dayExceptions.length > 0;

            let isAvailable = false;
            if (isApiMode) {
              const dateObj = new Date(dateStr + 'T00:00:00');
              const jsDay = dateObj.getDay();
              const dayKeyLong = JS_DAY_TO_SLOT_DAY[jsDay];
              const dayKeyShort = JS_DAY_TO_SHORT_DAY[jsDay];

              const hasRecurring = (recurringSchedules || []).some(
                (r) =>
                  (r.dayOfWeek === dayKeyShort || r.dayOfWeek === dayKeyLong) &&
                  r.isActive !== false,
              );
              const hasExtra = (exceptions || []).some(
                (e) => e.exceptionDate === dateStr && e.type === 'EXTRA',
              );
              isAvailable = !isPast && (hasRecurring || hasExtra);
            } else {
              let inRange = true;
              if (scheduleType === 'LIMITED_TIME' || (startDate && endDate)) {
                if (startDate && dateStr < startDate) inRange = false;
                if (endDate && dateStr > endDate) inRange = false;
              }

              const dateObj = new Date(dateStr + 'T00:00:00');
              const slotDayKey = JS_DAY_TO_SLOT_DAY[dateObj.getDay()];
              isAvailable = inRange && activeDaysOfWeekSet.has(slotDayKey) && !isPast;
            }

            // 1. Ngày không rảnh và không có lịch bận -> disable
            if (!isAvailable && !isBusy) {
              return (
                <div
                  key={dateStr}
                  className="relative h-8.5 flex items-center justify-center text-gray-300 font-normal select-none cursor-not-allowed"
                >
                  <span>{dayNum}</span>
                  {isToday && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </div>
              );
            }

            // 2. Ngày rảnh HOẶC Ngày có lịch bận -> Cho phép click chọn (ngày bận hiện chữ ĐỎ)
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                className={`relative h-8.5 rounded-xl text-xs transition-all flex items-center justify-center select-none cursor-pointer ${
                  isSelected
                    ? isBusy
                      ? 'bg-red-500 text-white font-bold shadow-xs'
                      : 'bg-primary-700 text-white font-bold shadow-xs'
                    : isBusy
                    ? 'text-red-500 font-bold hover:bg-red-50'
                    : 'text-gray-900 font-bold hover:bg-primary-50/80 hover:text-primary-700'
                }`}
              >
                <span>{dayNum}</span>
                {isToday && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : isBusy ? 'bg-red-500' : 'bg-primary-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
