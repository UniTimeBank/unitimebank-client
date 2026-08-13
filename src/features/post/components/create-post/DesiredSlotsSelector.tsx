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
  const validDuration = Math.max(15, Number(durationMinutes) || 60);

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
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
          KHUNG GIỜ RẢNH MONG MUỐN HỌC (TÙY CHỌN)
        </label>
        <p className="text-[11px] text-gray-500">
          Danh sách ngày tự động khớp theo Thời hạn ({timeline}). Giờ kết thúc tự động gán cố định ({validDuration} phút/buổi).
        </p>
      </div>

      {/* Spacious 2-Row Form Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-4">
        {/* Row 1: Full-Width Day of Week Selector */}
        <div>
          <Select
            label="CHỌN NGÀY RẢNH HỌC"
            options={dayOptions}
            value={dayOfWeek}
            onChange={setDayOfWeek}
          />
        </div>

        {/* Row 2: 2-Column Time Selector (Start Time + Locked End Time) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
          <div>
            <TimeInput
              label="TỪ GIỜ BẮT ĐẦU"
              value={startTime}
              onChange={setStartTime}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5 truncate">
              ĐẾN GIỜ (CỐ ĐỊNH +{validDuration}P)
            </label>
            <div className="w-full px-3.5 py-2.5 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-black text-gray-700 flex items-center justify-between cursor-not-allowed h-[42px]">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                <span>{endTime}</span>
              </span>
              <span className="text-[10px] font-extrabold bg-primary-100 text-primary-800 px-2.5 py-1 rounded-md flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3 text-primary-600" />
                +{validDuration} phút
              </span>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        {/* Row 3: Full Width Submit Slot CTA Button */}
        <Button
          type="button"
          variant="primary"
          fullWidth
          size="md"
          onClick={handleAddSlot}
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-xl font-bold text-xs shadow-xs"
        >
          <span>Thêm Khung Giờ ({startTime} - {endTime})</span>
        </Button>
      </div>

      {/* Selected Slots Pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((slot, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-primary-200 text-primary-800 text-xs font-bold shadow-2xs animate-in fade-in"
            >
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              <span>
                {DAY_DISPLAY[slot.dayOfWeek] || slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="hover:text-red-600 p-0.5 rounded-full transition-colors cursor-pointer"
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
