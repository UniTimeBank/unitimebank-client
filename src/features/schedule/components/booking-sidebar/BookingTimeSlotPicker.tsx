import React from 'react';
import type { ScheduleException } from '../../types';

interface BookingTimeSlotPickerProps {
  dayMonthLabel: string;
  slotsForSelectedDate: { startTime: string; endTime: string }[];
  blockedExceptionsOnDate: ScheduleException[];
  selectedSlot: { startTime: string; endTime: string } | null;
  onSelectSlot: (slot: { startTime: string; endTime: string }) => void;
}

export const BookingTimeSlotPicker: React.FC<BookingTimeSlotPickerProps> = ({
  dayMonthLabel,
  slotsForSelectedDate,
  blockedExceptionsOnDate,
  selectedSlot,
  onSelectSlot,
}) => {
  return (
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
                onClick={() => !isSlotBusy && onSelectSlot(slot)}
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
  );
};
