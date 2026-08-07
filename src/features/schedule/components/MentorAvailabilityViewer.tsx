import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { formatLocalDate, getEndDate } from '../utils';

interface MentorAvailabilityViewerProps {
  mentorId: string;
  mentorName?: string;
  onSelectSlot?: (date: string, startTime: string, endTime: string) => void;
}

export const MentorAvailabilityViewer: React.FC<MentorAvailabilityViewerProps> = ({
  mentorId,
  mentorName,
  onSelectSlot,
}) => {
  const todayStr = formatLocalDate(new Date());
  const [fromDate, setFromDate] = useState(todayStr);

  const toDate = getEndDate(fromDate, 6);

  const { availability, isAvailabilityLoading } = useMentorSchedule(mentorId, {
    from: fromDate,
    to: toDate,
  });

  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const dayList = availability || [];

  const handleNextWeek = () => {
    const next = new Date(fromDate + 'T00:00:00');
    next.setDate(next.getDate() + 7);
    setFromDate(formatLocalDate(next));
  };

  const handlePrevWeek = () => {
    const prev = new Date(fromDate + 'T00:00:00');
    prev.setDate(prev.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prev >= today) {
      setFromDate(formatLocalDate(prev));
    } else {
      setFromDate(todayStr);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Lịch Rảnh Khả Dụng {mentorName ? `Của ${mentorName}` : ''}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Chọn khung giờ phù hợp để gửi yêu cầu đặt lịch học 1:1.
          </p>
        </div>

        {/* Controls tuần */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            {fromDate} ➔ {toDate}
          </span>
          <button
            type="button"
            onClick={handleNextWeek}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Tuần kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isAvailabilityLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-semibold">
          Đang tính toán lịch rảnh khả dụng...
        </div>
      ) : dayList.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-xs">
          Không có thông tin lịch rảnh trong khoảng thời gian này.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {dayList.map((day) => {
              const dateObj = new Date(day.date);
              const dayNum = dateObj.getDate();
              const monthNum = dateObj.getMonth() + 1;
              const hasSlots = day.slots.length > 0;

              return (
                <div
                  key={day.date}
                  className={`p-3 rounded-2xl border transition-all ${hasSlots
                      ? 'bg-slate-50/70 border-slate-200/90'
                      : 'bg-slate-50/30 border-slate-100 opacity-50'
                    }`}
                >
                  <div className="text-center pb-2 mb-2 border-b border-slate-200/60">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {day.dayOfWeek}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {dayNum}/{monthNum}
                    </span>
                  </div>

                  {!hasSlots ? (
                    <div className="text-[10px] text-center text-slate-400 py-3 italic">Bận</div>
                  ) : (
                    <div className="space-y-1.5">
                      {day.slots.map((slot, idx) => {
                        const isSelected =
                          selectedSlot?.date === day.date &&
                          selectedSlot?.startTime === slot.startTime;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedSlot({
                                date: day.date,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                              });
                              if (onSelectSlot) {
                                onSelectSlot(day.date, slot.startTime, slot.endTime);
                              }
                            }}
                            className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${isSelected
                                ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-400/40'
                                : 'bg-white text-slate-800 hover:bg-primary-50 border border-slate-200'
                              }`}
                          >
                            <span>{slot.startTime}</span>
                            <span className="text-[9px] opacity-80">- {slot.endTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedSlot && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Đã chọn: <span className="underline">{selectedSlot.date}</span> từ{' '}
                    <span className="underline">{selectedSlot.startTime}</span> đến{' '}
                    <span className="underline">{selectedSlot.endTime}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(
                    `Gửi yêu cầu đặt lịch ngày ${selectedSlot.date} (${selectedSlot.startTime} - ${selectedSlot.endTime})`,
                  );
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tiếp Tục Đặt Lịch Học
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
