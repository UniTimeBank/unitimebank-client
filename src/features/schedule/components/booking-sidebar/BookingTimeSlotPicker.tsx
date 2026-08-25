import React from 'react';
import type { ScheduleException, BusySlotItem } from '../../types';

interface BookingTimeSlotPickerProps {
  dayMonthLabel: string;
  slotsForSelectedDate: { startTime: string; endTime: string }[];
  blockedExceptionsOnDate?: ScheduleException[];
  busySlotsOnDate?: BusySlotItem[];
  isAllSlotsBusy?: boolean;
  selectedSlot: { startTime: string; endTime: string } | null;
  onSelectSlot: (slot: { startTime: string; endTime: string }) => void;
}

export const BookingTimeSlotPicker: React.FC<BookingTimeSlotPickerProps> = ({
  dayMonthLabel,
  slotsForSelectedDate,
  blockedExceptionsOnDate = [],
  busySlotsOnDate = [],
  isAllSlotsBusy = false,
  selectedSlot,
  onSelectSlot,
}) => {
  return (
    <div className="space-y-2 pt-2 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Khung giờ trống ({dayMonthLabel})
        </label>
        {isAllSlotsBusy && slotsForSelectedDate.length > 0 && (
          <span className="text-[11px] font-semibold text-rose-500">
            (Đã kín chỗ)
          </span>
        )}
      </div>

      {slotsForSelectedDate.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/70 text-xs text-gray-400 font-medium">
          Mentor không có lịch rảnh vào ngày này.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
          {slotsForSelectedDate.map((slot) => {
            const isBlockedException = (blockedExceptionsOnDate || []).some(
              (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
            );
            const isBooked = (busySlotsOnDate || []).some(
              (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
            );

            // Khung giờ đã có người đặt hoặc Mentor báo bận -> hiển thị tối giản gạch ngang mờ
            if (isBooked || isBlockedException) {
              return (
                <div
                  key={`${slot.startTime}-${slot.endTime}`}
                  title={isBooked ? 'Khung giờ này đã được đặt' : 'Mentor đã báo bận khung giờ này'}
                  className="py-2 px-2.5 rounded-xl border border-gray-200/60 bg-gray-50/80 text-gray-400 text-xs font-medium flex items-center justify-center gap-1 select-none cursor-not-allowed opacity-60"
                >
                  <span className="line-through decoration-gray-400/80">{slot.startTime}</span>
                  <span className="opacity-40 font-normal">→</span>
                  <span className="line-through decoration-gray-400/80">{slot.endTime}</span>
                </div>
              );
            }

            // Khung giờ khả dụng
            const isChosen =
              selectedSlot?.startTime === slot.startTime &&
              selectedSlot?.endTime === slot.endTime;

            return (
              <button
                key={`${slot.startTime}-${slot.endTime}`}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 select-none cursor-pointer ${
                  isChosen
                    ? 'border-primary-700 bg-primary-700 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50/40'
                }`}
              >
                <span>{slot.startTime}</span>
                <span className="opacity-50 font-normal">→</span>
                <span>{slot.endTime}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
