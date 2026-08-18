import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { formatLocalDate } from '../utils';
import type { TimeSlot, PostScheduleType } from '@/features/post/types';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import { useGetMyWalletQuery } from '@/core/api';

export interface SidebarBookingCardProps {
  // Option A: Profile Mode (fetches from API)
  mentorId?: string;
  // Option B: Post Detail Mode (uses post's specific slots)
  slots?: TimeSlot[];
  scheduleType?: PostScheduleType | string;
  startDate?: string;
  endDate?: string;

  // Customization & Meta Props
  title?: string;
  creditCost?: number | string;
  creditRateText?: string;
  freeTrialText?: string;
  mentorName?: string;
  authorName?: string;
  primaryButtonText?: string;
  onBookSession?: (date: string, startTime: string, endTime: string) => void;
  onPrimaryAction?: (date: string, slot: TimeSlot) => void;
  className?: string;
}

const JS_DAY_TO_SLOT_DAY: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

const JS_DAY_TO_SHORT_DAY: Record<number, string> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const SidebarBookingCard: React.FC<SidebarBookingCardProps> = ({
  mentorId,
  slots,
  scheduleType,
  startDate,
  endDate,
  title = 'Lịch rảnh',
  creditCost = '1',
  creditRateText = 'credit / phút',
  freeTrialText = 'Miễn phí 5 phút đầu',
  mentorName,
  authorName,
  primaryButtonText = 'Đặt lịch ngay',
  onBookSession,
  onPrimaryAction,
  className = '',
}) => {
  const displayName = mentorName || authorName || 'Mentor';
  const today = new Date();
  const todayStr = formatLocalDate(today);

  // If post is LIMITED_TIME with future startDate, start viewing in that month
  const initialYear =
    scheduleType === 'LIMITED_TIME' && startDate && startDate > todayStr
      ? new Date(startDate + 'T00:00:00').getFullYear()
      : today.getFullYear();
  const initialMonth =
    scheduleType === 'LIMITED_TIME' && startDate && startDate > todayStr
      ? new Date(startDate + 'T00:00:00').getMonth()
      : today.getMonth();

  // Month navigation state
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth); // 0-11

  // Start & End of current viewed month for API query
  const fromMonthStr = formatLocalDate(new Date(currentYear, currentMonth, 1));
  const toMonthStr = formatLocalDate(new Date(currentYear, currentMonth + 1, 0));

  // If mentorId is provided, fetch availability, exceptions, and recurring schedules from API
  const isApiMode = Boolean(mentorId && (!slots || slots.length === 0));
  const { availability, isAvailabilityLoading, exceptions, recurringSchedules } = useMentorSchedule(
    mentorId || '',
    { from: fromMonthStr, to: toMonthStr },
  );

  // Fallback slots if in custom slots mode and empty
  const customSlots: TimeSlot[] = useMemo(() => {
    if (slots && slots.length > 0) return slots;
    if (isApiMode) return [];
    return [
      { dayOfWeek: 'TUESDAY', startTime: '18:00', endTime: '20:00' },
      { dayOfWeek: 'THURSDAY', startTime: '18:00', endTime: '20:00' },
      { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '11:00' },
    ];
  }, [slots, isApiMode]);

  // Set of active slot days of week (uppercase) for custom slots mode
  const activeDaysOfWeekSet = useMemo(() => {
    return new Set(customSlots.map((s) => s.dayOfWeek.toUpperCase()));
  }, [customSlots]);

  // Find the first upcoming available date for initial selection
  const initialAvailableDate = useMemo(() => {
    const startSearchDate =
      scheduleType === 'LIMITED_TIME' && startDate && startDate > todayStr
        ? new Date(startDate + 'T00:00:00')
        : today;

    for (let i = 0; i < 60; i++) {
      const d = new Date(startSearchDate);
      d.setDate(startSearchDate.getDate() + i);
      const dStr = formatLocalDate(d);

      if (isApiMode) {
        const dayData = availability?.find((a) => a.date === dStr);
        if (dayData && dayData.slots.length > 0) {
          return dStr;
        }
      } else {
        let inRange = true;
        if (scheduleType === 'LIMITED_TIME' || (startDate && endDate)) {
          if (startDate && dStr < startDate) inRange = false;
          if (endDate && dStr > endDate) inRange = false;
        }

        const slotDayKey = JS_DAY_TO_SLOT_DAY[d.getDay()];
        if (inRange && activeDaysOfWeekSet.has(slotDayKey)) {
          return dStr;
        }
      }
    }
    return todayStr;
  }, [todayStr, isApiMode, availability, activeDaysOfWeekSet, scheduleType, startDate, endDate]);

  const [selectedDate, setSelectedDate] = useState<string>(initialAvailableDate);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedSlot(null);
  };

  const handlePrevYear = () => {
    if (currentYear <= today.getFullYear()) return;
    setCurrentYear((y) => y - 1);
    setSelectedSlot(null);
  };

  const handleNextYear = () => {
    setCurrentYear((y) => y + 1);
    setSelectedSlot(null);
  };

  // Generate full month grid matrix (Monday-start)
  const calendarGrid = useMemo(() => {
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayJs = new Date(currentYear, currentMonth, 1).getDay();
    const firstDayMondayIndex = firstDayJs === 0 ? 6 : firstDayJs - 1;

    const days: ({ dateStr: string; dayNum: number; isCurrentMonth: boolean } | null)[] = [];

    // Empty padding cells before day 1
    for (let i = 0; i < firstDayMondayIndex; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dObj = new Date(currentYear, currentMonth, d);
      const dateStr = formatLocalDate(dObj);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Compute all slots for the selected date (including base slots and blocked exceptions)
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const jsDay = dateObj.getDay();
    const dayKeyLong = JS_DAY_TO_SLOT_DAY[jsDay];
    const dayKeyShort = JS_DAY_TO_SHORT_DAY[jsDay];

    const resultSlots: { startTime: string; endTime: string }[] = [];

    if (isApiMode) {
      // 1. Recurring schedules for this day of week
      const recurringForDay = (recurringSchedules || []).filter(
        (r) =>
          (r.dayOfWeek === dayKeyShort || r.dayOfWeek === dayKeyLong) &&
          r.isActive !== false,
      );
      recurringForDay.forEach((r) => {
        resultSlots.push({ startTime: r.startTime, endTime: r.endTime });
      });

      // 2. Extra slots from exceptions on this date
      const extraExceptions = (exceptions || []).filter(
        (e) => e.exceptionDate === selectedDate && e.type === 'EXTRA',
      );
      extraExceptions.forEach((e) => {
        if (!resultSlots.some((s) => s.startTime === e.startTime && s.endTime === e.endTime)) {
          resultSlots.push({ startTime: e.startTime, endTime: e.endTime });
        }
      });

      // 3. Blocked exceptions on this date (so they appear as red struck-through buttons!)
      const blockedExceptions = (exceptions || []).filter(
        (e) => e.exceptionDate === selectedDate && e.type === 'BLOCKED',
      );
      blockedExceptions.forEach((b) => {
        if (!resultSlots.some((s) => s.startTime === b.startTime && s.endTime === b.endTime)) {
          resultSlots.push({ startTime: b.startTime, endTime: b.endTime });
        }
      });
    } else {
      // Post Mode
      if (scheduleType === 'LIMITED_TIME' || (startDate && endDate)) {
        if (startDate && selectedDate < startDate) return [];
        if (endDate && selectedDate > endDate) return [];
      }

      const matchingSlots = customSlots.filter(
        (s) =>
          s.dayOfWeek.toUpperCase() === dayKeyLong ||
          s.dayOfWeek.toUpperCase() === dayKeyShort,
      );
      matchingSlots.forEach((s) => {
        resultSlots.push({ startTime: s.startTime, endTime: s.endTime });
      });

      // Also include any blocked exceptions for this date
      const blockedExceptions = (exceptions || []).filter(
        (e) => e.exceptionDate === selectedDate && e.type === 'BLOCKED',
      );
      blockedExceptions.forEach((b) => {
        if (!resultSlots.some((s) => s.startTime === b.startTime && s.endTime === b.endTime)) {
          resultSlots.push({ startTime: b.startTime, endTime: b.endTime });
        }
      });
    }

    resultSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return resultSlots;
  }, [
    selectedDate,
    isApiMode,
    recurringSchedules,
    exceptions,
    customSlots,
    scheduleType,
    startDate,
    endDate,
  ]);

  // Exceptions for selected date
  const blockedExceptionsOnDate = useMemo(() => {
    if (!exceptions) return [];
    return exceptions.filter((e) => e.exceptionDate === selectedDate && e.type === 'BLOCKED');
  }, [exceptions, selectedDate]);

  // Format labels
  const monthYearLabel = `Tháng ${currentMonth + 1}/${currentYear}`;
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const dayMonthLabel = `${selectedDateObj.getDate()} THG ${selectedDateObj.getMonth() + 1}`;

  // Query current user's wallet balance
  const { data: myWallet } = useGetMyWalletQuery();
  const availableCredit = myWallet?.availableBalance ?? 0;

  const selectedSlotDuration = useMemo(() => {
    if (!selectedSlot) return 0;
    const [startH, startM] = selectedSlot.startTime.split(':').map(Number);
    const [endH, endM] = selectedSlot.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 60;
  }, [selectedSlot]);

  const requiredCredit = selectedSlotDuration; // 1 credit / phút
  const isInsufficientCredit = Boolean(selectedSlot && availableCredit < requiredCredit);

  const isPrevMonthDisabled =
    currentYear === today.getFullYear() && currentMonth <= today.getMonth();

  const handleBooking = () => {
    if (!selectedSlot) {
      toast.error('Chưa chọn khung giờ', 'Vui lòng chọn 1 khung giờ rảnh bên dưới');
      return;
    }

    if (isInsufficientCredit) {
      toast.error(
        'Số dư Credit không đủ!',
        `Buổi học ${requiredCredit} phút cần ${requiredCredit} Credit (Ví của bạn hiện có: ${availableCredit} Credit). Vui lòng nạp hoặc tích lũy thêm Credit.`,
      );
      return;
    }

    if (onPrimaryAction) {
      onPrimaryAction(selectedDate, {
        dayOfWeek: JS_DAY_TO_SLOT_DAY[selectedDateObj.getDay()],
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
      return;
    }

    if (onBookSession) {
      onBookSession(selectedDate, selectedSlot.startTime, selectedSlot.endTime);
      return;
    }

    toast.success(
      'Đã gửi yêu cầu đặt lịch!',
      `Ngày: ${dayMonthLabel} (${selectedSlot.startTime} - ${selectedSlot.endTime}) với ${displayName}`,
    );
  };

  return (
    <div
      className={`bg-[#1E293B] text-white rounded-3xl shadow-xs overflow-hidden ${className}`}
    >
      {/* Dark Top Header: Chi phí học */}
      <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
            Chi phí học
          </span>
          <div className="text-xl font-bold mt-0.5 text-white">
            {creditCost}{' '}
            <span className="text-xs font-normal text-gray-300">{creditRateText}</span>
          </div>
        </div>

        {freeTrialText && (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] rounded-full border border-emerald-400/30">
            {freeTrialText}
          </span>
        )}
      </div>

      {/* White Clean Calendar Body */}
      <div className="p-5 bg-white text-gray-900 space-y-4">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-900">
          <span className="flex items-center gap-1.5 text-primary-700 font-bold">
            <CalendarIcon className="w-4 h-4 text-primary-600 shrink-0" />
            <span>{title}</span>
          </span>

          <div className="flex items-center gap-0.5">
            {/* Tua 1 năm trước (<<) */}
            <button
              type="button"
              onClick={handlePrevYear}
              disabled={isPrevMonthDisabled}
              className="text-gray-400 hover:text-primary-700 disabled:opacity-20 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              title="Năm trước"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Tháng trước (<) */}
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevMonthDisabled}
              className="text-gray-400 hover:text-primary-700 disabled:opacity-20 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Nhãn Tháng / Năm */}
            <span className="text-gray-800 font-bold text-xs px-1.5 select-none whitespace-nowrap">
              {monthYearLabel}
            </span>

            {/* Tháng tiếp (>) */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="text-gray-400 hover:text-primary-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tháng tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Tua 1 năm sau (>>) */}
            <button
              type="button"
              onClick={handleNextYear}
              className="text-gray-400 hover:text-primary-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              title="Năm sau"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

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
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedSlot(null);
                  }}
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

        {/* Selected Date Time Slots */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Khung giờ trống ({dayMonthLabel})
          </label>

          {slotsForSelectedDate.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/70 text-xs text-gray-400 font-medium">
              Mentor không có lịch rảnh vào ngày này.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
              {slotsForSelectedDate.map((slot) => {
                const isSlotBusy = blockedExceptionsOnDate.some(
                  (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
                );

                const isChosen =
                  !isSlotBusy &&
                  selectedSlot?.startTime === slot.startTime &&
                  selectedSlot?.endTime === slot.endTime;

                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    disabled={isSlotBusy}
                    onClick={() => !isSlotBusy && setSelectedSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 select-none ${
                      isSlotBusy
                        ? 'border-red-200 bg-red-50/70 text-red-500 line-through cursor-not-allowed opacity-80'
                        : isChosen
                        ? 'border-primary-700 bg-primary-700 text-white shadow-2xs cursor-pointer'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50/40 cursor-pointer'
                    }`}
                  >
                    <span>{slot.startTime}</span>
                    <span className="opacity-60 font-normal">→</span>
                    <span>{slot.endTime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Credit Breakdown & Insufficient Balance Warning */}
        {selectedSlot && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-500 font-medium">Chi phí ({requiredCredit} phút):</span>
              <span className="font-extrabold text-gray-900">{requiredCredit} Credit</span>
            </div>

            {isInsufficientCredit ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Số dư ví không đủ ({availableCredit}/{requiredCredit} Credit)</p>
                  <p className="text-[10px] text-rose-600 font-normal mt-0.5">
                    Cần thêm {requiredCredit - availableCredit} Credit để đặt lịch học này.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Số dư khả dụng:</span>
                <span className="font-extrabold text-emerald-700">{availableCredit} Credit</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="md"
            disabled={!selectedSlot || isInsufficientCredit}
            onClick={handleBooking}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 shadow-xs"
          >
            <span>{isInsufficientCredit ? 'Số dư không đủ' : primaryButtonText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
