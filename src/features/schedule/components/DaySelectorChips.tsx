import React from 'react';
import type { DayOfWeek } from '../types';
import { ALL_DAYS } from '../constants';

interface DaySelectorChipsProps {
  selectedDays: DayOfWeek[];
  onChange?: (days: DayOfWeek[]) => void;
  onChangeSelectedDays?: (days: DayOfWeek[]) => void;
  label?: string;
  hideLabel?: boolean;
}

export const DaySelectorChips: React.FC<DaySelectorChipsProps> = ({
  selectedDays,
  onChange,
  onChangeSelectedDays,
  label = 'THỨ TRONG TUẦN',
  hideLabel = false,
}) => {
  const triggerChange = (days: DayOfWeek[]) => {
    onChange?.(days);
    onChangeSelectedDays?.(days);
  };

  const handleToggleDay = (dayVal: DayOfWeek) => {
    if (selectedDays.includes(dayVal)) {
      triggerChange(selectedDays.filter((d) => d !== dayVal));
    } else {
      triggerChange([...selectedDays, dayVal]);
    }
  };

  const handleSelectAll = () => {
    const all = ALL_DAYS.map((d) => d.value);
    if (selectedDays.length === all.length) {
      triggerChange([]);
    } else {
      triggerChange(all);
    }
  };

  const handleSelectWeekdays = () => {
    const weekdays: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const isExact =
      selectedDays.length === weekdays.length &&
      weekdays.every((d) => selectedDays.includes(d));

    if (isExact) {
      triggerChange([]);
    } else {
      triggerChange(weekdays);
    }
  };

  return (
    <div>
      {!hideLabel && (
        <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2.5">
          {label}
        </label>
      )}

      {/* Nút chọn nhanh (Pills) */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button
          type="button"
          onClick={handleSelectAll}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
            selectedDays.length === ALL_DAYS.length
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Chọn tất cả
        </button>

        <button
          type="button"
          onClick={handleSelectWeekdays}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
            selectedDays.length === 5 &&
            ['MON', 'TUE', 'WED', 'THU', 'FRI'].every((d: any) =>
              selectedDays.includes(d)
            )
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          T2 - T6
        </button>
      </div>

      {/* Danh sách 7 nút thứ trong tuần */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {ALL_DAYS.map((d) => {
          const isSelected = selectedDays.includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => handleToggleDay(d.value)}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              title={d.label}
            >
              {d.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
