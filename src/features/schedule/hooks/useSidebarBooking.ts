import { useState, useMemo } from 'react';
import type { TimeSlot } from '@/features/post/types';
import { useMentorSchedule } from './useMentorSchedule';
import { formatLocalDate } from '../utils';
import { useGetMyWalletQuery } from '@/core/api';
import { useGetMentorBusySlotsQuery } from '@/core/api/booking/bookingApi';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { toast } from '@/shared/utils';
import type { SidebarBookingCardProps, CalendarDayItem, BusySlotItem } from '../types';
import { JS_DAY_TO_SLOT_DAY, JS_DAY_TO_SHORT_DAY } from '../constants';

export const useSidebarBooking = (props: SidebarBookingCardProps) => {
  const {
    mentorId,
    slots,
    scheduleType,
    startDate,
    endDate,
    status,
    mentorName,
    authorName,
    primaryButtonText = 'Đặt lịch ngay',
    onBookSession,
    onPrimaryAction,
  } = props;

  const displayName = mentorName || authorName || 'Mentor';
  const today = new Date();
  const todayStr = formatLocalDate(today);

  // Check if current user is the owner
  const authUser = useAppSelector(selectCurrentUser);
  const isOwner = Boolean(authUser?.id && mentorId && authUser.id === mentorId);
  const isClosed = status === 'CLOSED' || status === 'ARCHIVED';

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

  // Lấy các khung giờ đã có người đặt (CONFIRMED / STARTED) của Mentor
  const { data: busySlotsData, isLoading: isBusySlotsLoading } = useGetMentorBusySlotsQuery(
    {
      mentorId: mentorId || '',
      from: fromMonthStr,
      to: toMonthStr,
    },
    { skip: !mentorId },
  );

  const busySlots = useMemo(() => busySlotsData?.data || [], [busySlotsData]);

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
        const matchingSlots = customSlots.filter((s) => s.dayOfWeek.toUpperCase() === slotDayKey);
        const dayBusyCount = matchingSlots.filter((slot) => {
          const isBlocked = (exceptions || []).some(
            (e) => e.exceptionDate === dStr && e.type === 'BLOCKED' && slot.startTime < e.endTime && e.startTime < slot.endTime,
          );
          const isBooked = (busySlots || []).some(
            (b) => b.date === dStr && slot.startTime < b.endTime && b.startTime < slot.endTime,
          );
          return isBlocked || isBooked;
        }).length;

        if (inRange && matchingSlots.length > 0 && dayBusyCount < matchingSlots.length) {
          return dStr;
        }
      }
    }
    return todayStr;
  }, [
    todayStr,
    isApiMode,
    availability,
    customSlots,
    exceptions,
    busySlots,
    scheduleType,
    startDate,
    endDate,
  ]);

  const [selectedDate, setSelectedDate] = useState<string>(initialAvailableDate);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  const busySlotsOnDate = useMemo(() => {
    if (!selectedDate || !busySlots.length) return [];
    return busySlots.filter((b) => b.date === selectedDate);
  }, [selectedDate, busySlots]);

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

    const days: (CalendarDayItem | null)[] = [];

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

  // Kiểm tra xem tất cả khung giờ của ngày được chọn có bị bận/đã đặt hết không
  const isAllSlotsBusyOnSelectedDate = useMemo(() => {
    if (!slotsForSelectedDate.length) return false;
    return slotsForSelectedDate.every((slot) => {
      const isBlocked = blockedExceptionsOnDate.some(
        (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
      );
      const isBooked = busySlotsOnDate.some(
        (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
      );
      return isBlocked || isBooked;
    });
  }, [slotsForSelectedDate, blockedExceptionsOnDate, busySlotsOnDate]);

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

  const computedPrimaryButtonText = useMemo(() => {
    if (isAllSlotsBusyOnSelectedDate) return 'Ngày đã kín lịch';
    return primaryButtonText;
  }, [isAllSlotsBusyOnSelectedDate, primaryButtonText]);

  const isPrevMonthDisabled =
    currentYear === today.getFullYear() && currentMonth <= today.getMonth();

  const handleBooking = () => {
    if (isAllSlotsBusyOnSelectedDate) {
      toast.error('Ngày đã kín lịch', 'Tất cả khung giờ trong ngày này đã có người đặt hoặc gia sư báo bận.');
      return;
    }

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

  return {
    today,
    todayStr,
    isOwner,
    isClosed,
    currentYear,
    currentMonth,
    monthYearLabel,
    dayMonthLabel,
    isPrevMonthDisabled,
    handlePrevMonth,
    handleNextMonth,
    handlePrevYear,
    handleNextYear,
    calendarGrid,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    slotsForSelectedDate,
    blockedExceptionsOnDate,
    busySlots,
    busySlotsOnDate,
    isBusySlotsLoading,
    isAllSlotsBusyOnSelectedDate,
    isApiMode,
    isAvailabilityLoading,
    exceptions,
    recurringSchedules,
    customSlots,
    activeDaysOfWeekSet,
    scheduleType,
    startDate,
    endDate,
    availableCredit,
    requiredCredit,
    isInsufficientCredit,
    primaryButtonText: computedPrimaryButtonText,
    handleBooking,
  };
};
