import React from 'react';
import {
  WEEK_DAY_LABELS,
  JS_DAY_TO_SLOT_DAY,
  JS_DAY_TO_SHORT_DAY,
} from '../../constants';
import type { PostScheduleType, TimeSlot } from '@/features/post/types';
import type { RecurringSchedule, ScheduleException, CalendarDayItem, BusySlotItem } from '../../types';

interface BookingCalendarGridProps {
  calendarGrid: (CalendarDayItem | null)[];
  selectedDate: string;
  todayStr: string;
  isApiMode: boolean;
  isAvailabilityLoading: boolean;
  recurringSchedules?: RecurringSchedule[];
  exceptions?: ScheduleException[];
  busySlots?: BusySlotItem[];
  customSlots?: TimeSlot[];
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
  recurringSchedules = [],
  exceptions = [],
  busySlots = [],
  customSlots = [],
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

            const dateObj = new Date(dateStr + 'T00:00:00');
            const jsDay = dateObj.getDay();
            const dayKeyLong = JS_DAY_TO_SLOT_DAY[jsDay];
            const dayKeyShort = JS_DAY_TO_SHORT_DAY[jsDay];

            // 1. Lấy tất cả khung giờ mẫu cấu hình cho ngày này
            const daySlots: { startTime: string; endTime: string }[] = [];
            if (isApiMode) {
              (recurringSchedules || []).forEach((r) => {
                if ((r.dayOfWeek === dayKeyShort || r.dayOfWeek === dayKeyLong) && r.isActive !== false) {
                  daySlots.push({ startTime: r.startTime, endTime: r.endTime });
                }
              });
              (exceptions || []).forEach((e) => {
                if (e.exceptionDate === dateStr && e.type === 'EXTRA') {
                  if (!daySlots.some((s) => s.startTime === e.startTime && s.endTime === e.endTime)) {
                    daySlots.push({ startTime: e.startTime, endTime: e.endTime });
                  }
                }
              });
            } else {
              let inRange = true;
              if (scheduleType === 'LIMITED_TIME' || (startDate && endDate)) {
                if (startDate && dateStr < startDate) inRange = false;
                if (endDate && dateStr > endDate) inRange = false;
              }
              if (inRange) {
                (customSlots || []).forEach((s) => {
                  if (s.dayOfWeek.toUpperCase() === dayKeyLong || s.dayOfWeek.toUpperCase() === dayKeyShort) {
                    daySlots.push({ startTime: s.startTime, endTime: s.endTime });
                  }
                });
              }
            }

            // 2. Tính số lượng slot đã bận (bị chặn hoặc đã có người đặt)
            const busyCount = daySlots.filter((slot) => {
              const isBlocked = (exceptions || []).some(
                (e) => e.exceptionDate === dateStr && e.type === 'BLOCKED' && slot.startTime < e.endTime && e.startTime < slot.endTime,
              );
              const isBooked = (busySlots || []).some(
                (b) => b.date === dateStr && slot.startTime < b.endTime && b.startTime < slot.endTime,
              );
              return isBlocked || isBooked;
            }).length;

            const hasConfiguredSlots = daySlots.length > 0;
            const isFullyBooked = !isPast && hasConfiguredSlots && busyCount >= daySlots.length;
            const hasAvailableSlots = !isPast && hasConfiguredSlots && busyCount < daySlots.length;

            // 1. Ngày quá khứ hoặc không có cấu hình lịch rảnh -> Disable
            if (!hasConfiguredSlots || isPast) {
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

            // 2. Ngày ĐÃ KÍN LỊCH -> Cho phép bấm chọn nhưng hiển thị tone MÀU XÁM
            if (isFullyBooked) {
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  title={`Ngày ${dayNum}: Đã kín lịch`}
                  className={`relative h-8.5 rounded-xl text-xs transition-all flex items-center justify-center select-none cursor-pointer ${
                    isSelected
                      ? 'bg-gray-200 text-gray-700 font-bold shadow-xs'
                      : 'text-gray-400 font-medium hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isToday && (
                    <span
                      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        isSelected ? 'bg-gray-600' : 'bg-primary-500'
                      }`}
                    />
                  )}
                </button>
              );
            }

            // 3. Ngày CÒN KHUNG GIỜ TRỐNG -> Màu đen đậm, khi chọn nền xanh
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                title={`Ngày ${dayNum}: Còn ${daySlots.length - busyCount} khung giờ trống`}
                className={`relative h-8.5 rounded-xl text-xs transition-all flex items-center justify-center select-none cursor-pointer ${
                  isSelected
                    ? 'bg-primary-700 text-white font-bold shadow-xs'
                    : 'text-gray-900 font-bold hover:bg-primary-50/80 hover:text-primary-700'
                }`}
              >
                <span>{dayNum}</span>
                {isToday && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary-600'
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
