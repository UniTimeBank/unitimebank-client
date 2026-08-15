import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Calendar, Clock, Lock } from 'lucide-react';
import { Button, Select, TimeInput } from '@/shared/components/ui';
import type { TimeSlot } from '../../types';

const DAY_MAP_TO_BACKEND: Record<string, string> = {
  MON: 'MONDAY',
  TUE: 'TUESDAY',
  WED: 'WEDNESDAY',
  THU: 'THURSDAY',
  FRI: 'FRIDAY',
  SAT: 'SATURDAY',
  SUN: 'SUNDAY',
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
};

const DAY_DISPLAY: Record<string, string> = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ Nhật',
  MON: 'Thứ 2',
  TUE: 'Thứ 3',
  WED: 'Thứ 4',
  THU: 'Thứ 5',
  FRI: 'Thứ 6',
  SAT: 'Thứ 7',
  SUN: 'Chủ Nhật',
};

const DAY_CODE_MAP: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

const DAY_LABEL_MAP: Record<number, string> = {
  0: 'Chủ Nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  const totalMins = h * 60 + m + minutesToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

// Generate dynamic day options based on timeline selection
const getDynamicDayOptions = (timelineStr: string) => {
  const today = new Date();

  if (timelineStr.includes('24')) {
    // Within 24 Hours -> Only Today!
    const dayIndex = today.getDay();
    const code = DAY_CODE_MAP[dayIndex];
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
    const label = `Hôm nay (${DAY_LABEL_MAP[dayIndex]}, ${dateStr})`;
    return [{ value: code, label }];
  }

  if (timelineStr.includes('3')) {
    // Next 3 days starting from today in real-time
    const options: { value: string; label: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayIndex = d.getDay();
      const code = DAY_CODE_MAP[dayIndex];
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const prefix = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : 'Mốt';
      const label = `${prefix} (${DAY_LABEL_MAP[dayIndex]}, ${dateStr})`;
      options.push({ value: code, label });
    }
    return options;
  }

  // Next 7 days starting from today in real-time (e.g. Wed -> Next Tue)
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayIndex = d.getDay();
    const code = DAY_CODE_MAP[dayIndex];
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const prefix = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : i === 6 ? 'Tuần sau' : '';
    const label = prefix
      ? `${DAY_LABEL_MAP[dayIndex]} (${dateStr}) — ${prefix}`
      : `${DAY_LABEL_MAP[dayIndex]} (${dateStr})`;
    options.push({ value: code, label });
  }
  return options;
};

interface DesiredSlotsSelectorProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  durationMinutes?: number;
  timeline?: string;
}

export const DesiredSlotsSelector: React.FC<DesiredSlotsSelectorProps> = ({
  value = [],
  onChange,
  durationMinutes = 60,
  timeline = 'Trong 3 ngày',
}) => {
  const validDuration = Math.max(30, Number(durationMinutes) || 60);

  // Real-time day options based on timeline
  const dayOptions = useMemo(() => getDynamicDayOptions(timeline), [timeline]);

  const [dayOfWeek, setDayOfWeek] = useState(() => dayOptions[0]?.value || 'MONDAY');
  const [startTime, setStartTime] = useState('19:00');
  const [error, setError] = useState<string | null>(null);

  // Update dayOfWeek and filter out invalid slots when timeline selection changes
  useEffect(() => {
    if (dayOptions.length > 0 && !dayOptions.some((opt) => opt.value === dayOfWeek)) {
      setDayOfWeek(dayOptions[0].value);
    }

    if (value && value.length > 0) {
      const validDayCodes = new Set(dayOptions.map((opt) => opt.value));
      const validSlots = value.filter((slot) => {
        const backendDay = DAY_MAP_TO_BACKEND[slot.dayOfWeek] || slot.dayOfWeek;
        return validDayCodes.has(backendDay);
      });
      if (validSlots.length !== value.length) {
        onChange(validSlots);
      }
    }
  }, [timeline, dayOptions]);

  // Computed end time strictly based on startTime + validDuration
  const endTime = useMemo(() => {
    return addMinutesToTime(startTime, validDuration);
  }, [startTime, validDuration]);

  const handleAddSlot = () => {
    setError(null);

    if (!startTime || !endTime) {
      setError('Vui lòng chọn giờ bắt đầu');
      return;
    }

    const backendDay = DAY_MAP_TO_BACKEND[dayOfWeek] || dayOfWeek;
    const exists = value.some(
      (slot) =>
        (DAY_MAP_TO_BACKEND[slot.dayOfWeek] || slot.dayOfWeek) === backendDay &&
        slot.startTime === startTime &&
        slot.endTime === endTime,
    );

    if (exists) {
      setError('Khung giờ này đã được thêm từ trước');
      return;
    }

    onChange([...value, { dayOfWeek: backendDay, startTime, endTime }]);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {/* Spacious White Card matching the above section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            KHUNG GIỜ RẢNH MONG MUỐN HỌC
          </h4>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            Danh sách ngày tự động khớp theo Thời hạn ({timeline}). Giờ kết thúc cố định {validDuration} phút/buổi.
          </p>
        </div>

        {/* Row 1: Full-Width Day of Week Selector */}
        <div>
          <Select
            label="CHỌN NGÀY RẢNH HỌC *"
            options={dayOptions}
            value={dayOfWeek}
            onChange={setDayOfWeek}
          />
        </div>

        {/* Row 2: 2-Column Time Selector (Start Time + Locked End Time) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
          <div>
            <TimeInput
              label="TỪ GIỜ BẮT ĐẦU *"
              value={startTime}
              onChange={setStartTime}
              minuteStep={15}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1 truncate">
              ĐẾN GIỜ <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 bg-slate-100/70 text-sm flex items-center justify-between cursor-not-allowed select-none min-h-[42px]">
              <span className="text-sm tracking-wide font-medium text-slate-700">
                {endTime}
              </span>
              <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-100/80 flex items-center gap-1">
                <Lock className="w-3 h-3 text-primary-600 shrink-0" />
                +{validDuration} phút
              </span>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        {/* Row 3: Full Width Submit Slot CTA Button */}
        <Button
          type="button"
          variant="primary"
          fullWidth
          size="md"
          onClick={handleAddSlot}
          className="rounded-xl font-semibold text-xs shadow-2xs"
        >
          <span>Thêm Khung Giờ</span>
        </Button>
      </div>

      {/* Selected Slots Pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((slot, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium shadow-2xs animate-in fade-in"
            >
              <Calendar className="w-3.5 h-3.5 text-primary-600" />
              <span>
                {DAY_DISPLAY[slot.dayOfWeek] || slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="hover:text-red-600 p-0.5 rounded-full transition-colors cursor-pointer text-slate-400"
                title="Bỏ chọn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
