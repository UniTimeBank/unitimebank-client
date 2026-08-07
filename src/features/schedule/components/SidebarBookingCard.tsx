import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { getMondayOfWeek, getEndDate, WEEK_DAY_LABELS } from '../utils';

interface SidebarBookingCardProps {
  mentorId: string;
  mentorName?: string;
  onBookSession?: (date: string, startTime: string, endTime: string) => void;
}

export const SidebarBookingCard: React.FC<SidebarBookingCardProps> = ({
  mentorId,
  onBookSession,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const initialMonday = getMondayOfWeek(new Date());

  const [fromDate, setFromDate] = useState(initialMonday);
  const [selectedDate, setSelectedDate] = useState(
    todayStr >= initialMonday && todayStr <= getEndDate(initialMonday, 6) ? todayStr : initialMonday,
  );
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  const toDate = getEndDate(fromDate, 6);

  const { availability, isAvailabilityLoading } = useMentorSchedule(mentorId, {
    from: fromDate,
    to: toDate,
  });

  const handleNextWeek = () => {
    const nextMonday = new Date(fromDate);
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextMonStr = nextMonday.toISOString().split('T')[0];
    setFromDate(nextMonStr);
    setSelectedDate(nextMonStr);
    setSelectedSlot(null);
  };

  const handlePrevWeek = () => {
    const prevMonday = new Date(fromDate);
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevMonStr = prevMonday.toISOString().split('T')[0];

    if (prevMonStr >= initialMonday) {
      setFromDate(prevMonStr);
      setSelectedDate(prevMonStr >= todayStr ? prevMonStr : todayStr);
      setSelectedSlot(null);
    }
  };

  const dayList = availability || [];

  const activeDay = dayList.find((d) => d.date === selectedDate) || dayList[0];
  const availableSlots = activeDay?.slots || [];

  const activeDateObj = selectedDate ? new Date(selectedDate) : new Date();
  const monthYearLabel = `Tháng ${activeDateObj.getMonth() + 1} năm ${activeDateObj.getFullYear()}`;
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
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-900">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span>Lịch rảnh khả dụng</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-semibold text-[11px]">{monthYearLabel}</span>
            <button
              type="button"
              onClick={handlePrevWeek}
              disabled={fromDate <= initialMonday}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
              title="Tuần tiếp"
            >
              <ChevronRight className="w-4 h-4" />
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
              const dObj = new Date(day.date);
              const dateNum = dObj.getDate();
              const isSelected = day.date === selectedDate;
              const hasSlots = day.slots.length > 0;
              const isPast = day.date < todayStr;

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
                      : isSelected
                      ? 'bg-primary-600 text-white shadow-xs font-black cursor-pointer'
                      : hasSlots
                      ? 'bg-primary-50/80 text-primary-800 hover:bg-primary-100 border border-primary-200/60 cursor-pointer'
                      : 'text-gray-500 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  <span>{dateNum}</span>
                  {hasSlots && !isPast && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-primary-600'
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
              Không có khung giờ trống vào ngày này
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot, idx) => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime &&
                  selectedSlot?.endTime === slot.endTime;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSelectedSlot({
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      })
                    }
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-extrabold ring-2 ring-primary-500/30'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Book a 1-1 Session Button */}
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => {
            if (selectedSlot && onBookSession) {
              onBookSession(selectedDate, selectedSlot.startTime, selectedSlot.endTime);
            }
          }}
          className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
            selectedSlot
              ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer active:scale-[0.99]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>
            {selectedSlot
              ? `Đặt lịch học (${selectedSlot.startTime} - ${selectedSlot.endTime})`
              : 'Chọn khung giờ để đặt lịch'}
          </span>
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-2.5">
          Khi đặt lịch, credit sẽ được tạm giữ (ký quỹ) và trừ tự động 1 credit/phút thực học.
        </p>
      </div>
    </div>
  );
};
