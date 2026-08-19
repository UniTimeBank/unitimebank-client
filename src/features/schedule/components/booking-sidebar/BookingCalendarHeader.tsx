import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface BookingCalendarHeaderProps {
  title?: string;
  monthYearLabel: string;
  isPrevMonthDisabled: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const BookingCalendarHeader: React.FC<BookingCalendarHeaderProps> = ({
  title = 'Lịch rảnh',
  monthYearLabel,
  isPrevMonthDisabled,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
}) => {
  return (
    <div className="flex items-center justify-between text-xs font-bold text-gray-900">
      <span className="flex items-center gap-1.5 text-primary-700 font-bold">
        <CalendarIcon className="w-4 h-4 text-primary-600 shrink-0" />
        <span>{title}</span>
      </span>

      <div className="flex items-center gap-0.5">
        {/* Tua 1 năm trước (<<) */}
        <button
          type="button"
          onClick={onPrevYear}
          disabled={isPrevMonthDisabled}
          className="text-gray-400 hover:text-primary-700 disabled:opacity-20 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          title="Năm trước"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Tháng trước (<) */}
        <button
          type="button"
          onClick={onPrevMonth}
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
          onClick={onNextMonth}
          className="text-gray-400 hover:text-primary-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          title="Tháng tiếp theo"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Tua 1 năm sau (>>) */}
        <button
          type="button"
          onClick={onNextYear}
          className="text-gray-400 hover:text-primary-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          title="Năm sau"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
