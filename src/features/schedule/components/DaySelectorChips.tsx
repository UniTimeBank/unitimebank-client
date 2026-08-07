import React from 'react';
import type { DayOfWeek } from '../types';
import { ALL_DAYS } from '../constants';

interface DaySelectorChipsProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export const DaySelectorChips: React.FC<DaySelectorChipsProps> = ({
  selectedDays,
  onChange,
}) => {
  const handleToggleDay = (dayVal: DayOfWeek) => {
    if (selectedDays.includes(dayVal)) {
      onChange(selectedDays.filter((d) => d !== dayVal));
    } else {
      onChange([...selectedDays, dayVal]);
    }
  };

  const handleSelectAll = () => {
    const all = ALL_DAYS.map((d) => d.value);
    if (selectedDays.length === all.length) {
      onChange([]);
    } else {
      onChange(all);
    }
  };

  const handleSelectWeekdays = () => {
    const weekdays: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const isExact =
      selectedDays.length === weekdays.length &&
      weekdays.every((d) => selectedDays.includes(d));

    if (isExact) {
      onChange([]);
    } else {
      onChange(weekdays);
    }
  };

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3">
        THỨ TRONG TUẦN
      </label>

      {/* Nút chọn nhanh (Pills) full 50% mỗi nút */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <button
          type="button"
          onClick={handleSelectAll}
          className={`w-full py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer border text-center ${
            selectedDays.length === ALL_DAYS.length
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          Chọn tất cả
        </button>

        <button
          type="button"
          onClick={handleSelectWeekdays}
          className={`w-full py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer border text-center ${
            selectedDays.length === 5 &&
            ['MON', 'TUE', 'WED', 'THU', 'FRI'].every((d: any) =>
              selectedDays.includes(d),
            )
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          T2 - T6
        </button>
      </div>

      {/* Danh sách 7 nút thứ trong tuần nằm trọn vẹn trên 1 hàng không in đậm */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {ALL_DAYS.map((d) => {
          const isSelected = selectedDays.includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => handleToggleDay(d.value)}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-xs sm:text-sm font-normal transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
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
