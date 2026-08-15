import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TimeInput } from '@/shared/components/ui';
import type { DayOfWeek, RecurringSchedule } from '../types';
import { ALL_DAYS } from '../constants';
import { DaySelectorChips } from './DaySelectorChips';

interface CreateRecurringSlotFormProps {
  recurringList: RecurringSchedule[];
  isLoading?: boolean;
  onCreate: (dto: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => Promise<any>;
  isCreating: boolean;
}

const ALL_WEEK_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const findFirstAvailableSlotOnDay = (
  day: DayOfWeek,
  list: { dayOfWeek: DayOfWeek; startTime: string; endTime: string; isActive?: boolean }[],
  preferStartFrom = '08:00',
): { startTime: string; endTime: string } | null => {
  const occupied = list
    .filter((s) => s.dayOfWeek === day && (s.isActive ?? true))
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));

  const duration = 60;

  let startM = timeToMinutes(preferStartFrom);
  while (startM + duration <= 23 * 60 + 45) {
    const endM = startM + duration;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  startM = 7 * 60;
  const preferM = timeToMinutes(preferStartFrom);
  while (startM + duration <= preferM) {
    const endM = startM + duration;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  return null;
};

const findNextAvailableDayAndSlot = (
  startDay: DayOfWeek,
  list: { dayOfWeek: DayOfWeek; startTime: string; endTime: string; isActive?: boolean }[],
  preferStartFrom = '08:00',
): { day: DayOfWeek; startTime: string; endTime: string } => {
  const slotOnCurrentDay = findFirstAvailableSlotOnDay(startDay, list, preferStartFrom);
  if (slotOnCurrentDay) {
    return { day: startDay, startTime: slotOnCurrentDay.startTime, endTime: slotOnCurrentDay.endTime };
  }

  const startIndex = ALL_WEEK_DAYS.indexOf(startDay);
  const otherDays = [
    ...ALL_WEEK_DAYS.slice(startIndex + 1),
    ...ALL_WEEK_DAYS.slice(0, startIndex),
  ];

  for (const day of otherDays) {
    const slot = findFirstAvailableSlotOnDay(day, list, '08:00');
    if (slot) {
      return { day, startTime: slot.startTime, endTime: slot.endTime };
    }
  }

  return { day: startDay, startTime: '08:00', endTime: '09:00' };
};

export const CreateRecurringSlotForm: React.FC<CreateRecurringSlotFormProps> = ({
  recurringList,
  isLoading = false,
  onCreate,
  isCreating,
}) => {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['MON']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && recurringList.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const currentDay = selectedDays[0] || 'MON';
      const isConflicted = recurringList.some(
        (s) => s.dayOfWeek === currentDay && s.isActive && startTime < s.endTime && s.startTime < endTime,
      );

      if (isConflicted) {
        const next = findNextAvailableDayAndSlot(currentDay, recurringList, '08:00');
        setSelectedDays([next.day]);
        setStartTime(next.startTime);
        setEndTime(next.endTime);
      }
    }
  }, [isLoading, recurringList]);

  const occupiedIntervals = useMemo(() => {
    return recurringList
      .filter((s) => selectedDays.includes(s.dayOfWeek) && s.isActive)
      .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  }, [recurringList, selectedDays]);

  const maxEndBound = useMemo(() => {
    const laterOccupied = occupiedIntervals
      .filter((inv) => inv.startTime > startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return laterOccupied.length > 0 ? laterOccupied[0].startTime : undefined;
  }, [occupiedIntervals, startTime]);

  const conflictingDays = useMemo(() => {
    return selectedDays.filter((day) => {
      return recurringList.some((s) => {
        if (s.dayOfWeek !== day || !s.isActive) return false;
        return startTime < s.endTime && s.startTime < endTime;
      });
    });
  }, [selectedDays, recurringList, startTime, endTime]);

  const hasConflict = conflictingDays.length > 0;

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    const [h, m] = val.split(':').map(Number);
    let nextH = h + 1;
    let nextM = m;
    if (nextH >= 24) {
      nextH = 23;
      nextM = 45;
    }
    let calculatedEnd = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;

    const laterOccupied = occupiedIntervals
      .filter((inv) => inv.startTime > val)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (laterOccupied.length > 0) {
      const earliestBusyStart = laterOccupied[0].startTime;
      if (calculatedEnd > earliestBusyStart) {
        calculatedEnd = earliestBusyStart;
      }
    }

    setEndTime(calculatedEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (selectedDays.length === 0) {
      setError('Vui lòng chọn ít nhất một thứ trong tuần');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    if (hasConflict) {
      const dayNames = conflictingDays
        .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
        .join(', ');
      setError(`Không thể thêm! Khung giờ [${startTime} - ${endTime}] bị trùng lịch trên: ${dayNames}.`);
      return;
    }

    try {
      const submittedStartTime = startTime;
      const submittedEndTime = endTime;

      for (const day of selectedDays) {
        await onCreate({ dayOfWeek: day, startTime: submittedStartTime, endTime: submittedEndTime });
      }
      setSuccessMsg(`Đã thêm thành công khung giờ vào ${selectedDays.length} thứ trong tuần!`);
      toast.success(`Tạo lịch rảnh thành công!`);
      setTimeout(() => setSuccessMsg(''), 4000);

      const updatedList = [
        ...recurringList,
        ...selectedDays.map((d) => ({
          dayOfWeek: d,
          startTime: submittedStartTime,
          endTime: submittedEndTime,
          isActive: true,
        })),
      ];

      const currentDay = selectedDays[0] || 'MON';
      const next = findNextAvailableDayAndSlot(currentDay, updatedList, submittedEndTime);

      setSelectedDays([next.day]);
      setStartTime(next.startTime);
      setEndTime(next.endTime);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Không thể tạo lịch lặp lại');
    }
  };

  return (
    <div className="bg-[#f8fafc] p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-5">
          Thêm Khung Giờ Mới
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasConflict && !error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Bị trùng lịch trên:{' '}
                <strong className="font-semibold text-red-700">
                  {conflictingDays
                    .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
                    .join(', ')}
                </strong>
              </span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              {successMsg}
            </div>
          )}

          <DaySelectorChips
            selectedDays={selectedDays}
            onChange={(days) => {
              setError('');
              setSuccessMsg('');
              setSelectedDays(days);

              if (days.length > 0) {
                const isConflictOnNewDays = days.some((day) =>
                  recurringList.some(
                    (s) => s.dayOfWeek === day && s.isActive && startTime < s.endTime && s.startTime < endTime,
                  ),
                );
                if (isConflictOnNewDays) {
                  const slot = findFirstAvailableSlotOnDay(days[0], recurringList, '08:00');
                  if (slot) {
                    setStartTime(slot.startTime);
                    setEndTime(slot.endTime);
                  }
                }
              }
            }}
          />

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <TimeInput
              label="Bắt đầu"
              value={startTime}
              disabledIntervals={occupiedIntervals}
              minuteStep={15}
              onChange={handleStartTimeChange}
            />
            <TimeInput
              label="Kết thúc"
              value={endTime}
              minTime={startTime}
              maxTime={maxEndBound}
              disabledIntervals={occupiedIntervals}
              minuteStep={15}
              onChange={(val) => setEndTime(val)}
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || selectedDays.length === 0 || hasConflict}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {isCreating
                ? 'Đang thêm...'
                : hasConflict
                ? 'Bị trùng lịch (Không thể thêm)'
                : 'Thêm Vào Lịch Tuần'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
