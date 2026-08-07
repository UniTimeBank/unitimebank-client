import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { getMondayOfWeek, getEndDate, formatLocalDate, WEEK_DAY_LABELS } from '../utils';

interface SidebarBookingCardProps {
  mentorId: string;
  mentorName?: string;
  onBookSession?: (date: string, startTime: string, endTime: string) => void;
}

export const SidebarBookingCard: React.FC<SidebarBookingCardProps> = ({
  mentorId,
  onBookSession,
}) => {
  const todayStr = formatLocalDate(new Date());
  const initialMonday = getMondayOfWeek(new Date());

  const [fromDate, setFromDate] = useState(initialMonday);
  const [selectedDate, setSelectedDate] = useState(
    todayStr >= initialMonday && todayStr <= getEndDate(initialMonday, 6) ? todayStr : initialMonday,
  );
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  const toDate = getEndDate(fromDate, 6);

  const { availability, isAvailabilityLoading, exceptions } = useMentorSchedule(mentorId, {
    from: fromDate,
    to: toDate,
  });

  // Chuyển tới 1 tuần tiếp theo
  const handleNextWeek = () => {
    const nextMonday = new Date(fromDate + 'T00:00:00');
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextMonStr = formatLocalDate(nextMonday);
    setFromDate(nextMonStr);
    setSelectedDate(nextMonStr);
    setSelectedSlot(null);
  };

  // Lùi về 1 tuần trước
  const handlePrevWeek = () => {
    const prevMonday = new Date(fromDate + 'T00:00:00');
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevMonStr = formatLocalDate(prevMonday);

    if (prevMonStr >= initialMonday) {
      setFromDate(prevMonStr);
      setSelectedDate(prevMonStr >= todayStr ? prevMonStr : todayStr);
      setSelectedSlot(null);
    }
  };

  // Tua nhanh tới 1 tháng sau
  const handleNextMonth = () => {
    const nextMonth = new Date(fromDate + 'T00:00:00');
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonStr = getMondayOfWeek(nextMonth);
    setFromDate(nextMonStr);
    setSelectedDate(nextMonStr);
    setSelectedSlot(null);
  };

  // Tua lùi về 1 tháng trước (không lùi quá tháng hiện tại)
  const handlePrevMonth = () => {
    const prevMonth = new Date(fromDate + 'T00:00:00');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    let prevMonStr = getMondayOfWeek(prevMonth);
    if (prevMonStr < initialMonday) {
      prevMonStr = initialMonday;
    }
    setFromDate(prevMonStr);
    setSelectedDate(prevMonStr >= todayStr ? prevMonStr : todayStr);
    setSelectedSlot(null);
  };

  const dayList = availability || [];

  const activeDay = dayList.find((d) => d.date === selectedDate) || dayList[0];
  const availableSlots = activeDay?.slots || [];

  // Lấy danh sách các ngoại lệ BẬN trên ngày đang chọn
  const blockedExceptionsOnDate = (exceptions || []).filter(
    (e) => e.exceptionDate === selectedDate && e.type === 'BLOCKED',
  );

  const activeDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const monthYearLabel = `Tháng ${activeDateObj.getMonth() + 1}/${activeDateObj.getFullYear()}`;
  const dayMonthLabel = `${activeDateObj.getDate()} Thg ${activeDateObj.getMonth() + 1}`;

  return (
    <div className="bg-[#1E293B] text-white rounded-2xl shadow-xs overflow-hidden">
      {/* Header Chi phí học */}
      <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
            Chi phí học
          </span>
          <div className="text-xl font-black mt-0.5">
            1 <span className="text-xs font-normal text-gray-300">credit / phút</span>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-primary-500/20 text-primary-300 font-bold text-[10px] rounded-full border border-primary-400/30">
          Miễn phí 5 phút đầu
        </span>
      </div>

      {/* Calendar Picker & Real Availability Data */}
      <div className="p-5 bg-white text-gray-900">
        {/* Header Thanh điều khiển: Tua tháng và Chuyển tuần */}
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-900">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
            <span>Lịch rảnh</span>
          </span>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Tua 1 tháng trước (<<) */}
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={fromDate <= initialMonday}
              className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tua 1 tháng trước"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Tuần trước (<) */}
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={fromDate <= initialMonday}
              className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Nhãn Tháng / Năm */}
            <span className="text-slate-800 font-bold text-xs px-1 select-none whitespace-nowrap">
              {monthYearLabel}
            </span>

            {/* Tuần tiếp (>) */}
            <button
              type="button"
              onClick={handleNextWeek}
              className="text-gray-400 hover:text-primary-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tuần tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Tua 1 tháng sau (>>) */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="text-gray-400 hover:text-primary-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              title="Tua 1 tháng sau"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic 7-Day Calendar Header (T2 -> CN) */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
          {WEEK_DAY_LABELS.map((wd) => (
            <span key={wd}>{wd}</span>
          ))}
        </div>

        {isAvailabilityLoading ? (
          <div className="py-6 text-center text-xs text-gray-400 font-medium">
            Đang tính toán lịch rảnh...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700 mb-4">
            {dayList.map((day) => {
              const dObj = new Date(day.date + 'T00:00:00');
              const dateNum = dObj.getDate();
              const isSelected = day.date === selectedDate;
              const isPast = day.date < todayStr;
              const isToday = day.date === todayStr;

              // Lấy các ngoại lệ BẬN của ngày này
              const blockedForDay = (exceptions || []).filter(
                (e) => e.exceptionDate === day.date && e.type === 'BLOCKED',
              );

              // Kiểm tra xem ngày này có khung giờ rảnh bị ảnh hưởng / trùng trực tiếp với lịch bận không
              const hasAffectedBlockedSlot = day.slots.some((slot) =>
                blockedForDay.some((b) => slot.startTime < b.endTime && b.startTime < slot.endTime),
              );

              // Lọc các khung giờ còn trống (không bị dính lịch bận)
              const unblockedSlots = day.slots.filter(
                (slot) => !blockedForDay.some((b) => slot.startTime < b.endTime && b.startTime < slot.endTime),
              );

              const hasValidSlots = unblockedSlots.length > 0;

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot(null);
                  }}
                  className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center select-none ${
                    isPast
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50/40'
                      : isSelected && hasAffectedBlockedSlot
                      ? 'bg-[#991b1b] text-white shadow-xs font-black cursor-pointer'
                      : isSelected && hasValidSlots
                      ? 'bg-primary-600 text-white shadow-xs font-black cursor-pointer'
                      : isSelected
                      ? 'bg-gray-500 text-white shadow-xs font-black cursor-pointer'
                      : hasAffectedBlockedSlot
                      ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fee2e2] cursor-pointer'
                      : hasValidSlots
                      ? 'bg-primary-50/80 text-primary-800 hover:bg-primary-100 border border-primary-200/60 cursor-pointer'
                      : 'text-gray-500 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  <span>{dateNum}</span>
                  {isToday && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : hasAffectedBlockedSlot
                          ? 'bg-[#991b1b]'
                          : hasValidSlots
                          ? 'bg-primary-600'
                          : 'bg-slate-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Time Slots for Selected Date */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Khung giờ trống ({dayMonthLabel})
          </label>

          {isAvailabilityLoading ? (
            <div className="p-4 text-center text-xs text-gray-400">Đang tải khung giờ...</div>
          ) : availableSlots.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-400">
              Mentor không có lịch rảnh vào ngày này.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableSlots.map((slot) => {
                const isChosen =
                  selectedSlot?.startTime === slot.startTime &&
                  selectedSlot?.endTime === slot.endTime;

                // Kiểm tra xem khung giờ này có bị giao thoa / trùng với ngoại lệ BẬN không
                const isSlotBusy = blockedExceptionsOnDate.some(
                  (b) => slot.startTime < b.endTime && b.startTime < slot.endTime,
                );

                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    disabled={isSlotBusy}
                    onClick={() => !isSlotBusy && setSelectedSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 select-none ${
                      isSlotBusy
                        ? 'border-[#fecaca] bg-[#fff5f5] text-[#b91c1c]/70 line-through decoration-[#f87171] cursor-not-allowed opacity-75'
                        : isChosen
                        ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20 cursor-pointer'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <span>{slot.startTime}</span>
                    <span className="text-gray-400 font-normal">→</span>
                    <span>{slot.endTime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => {
            if (selectedSlot && onBookSession) {
              onBookSession(selectedDate, selectedSlot.startTime, selectedSlot.endTime);
            }
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          <span>Đặt lịch ngay</span>
        </button>
      </div>
    </div>
  );
};
