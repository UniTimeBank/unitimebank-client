import React, { useState } from 'react';
import { Plus, Clock, Trash2, AlertCircle } from 'lucide-react';
import { Button, Select, TimeInput } from '@/shared/components/ui';
import type { DayOfWeek, RecurringSchedule } from '../types';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'MON', label: 'Thứ Hai' },
  { value: 'TUE', label: 'Thứ Ba' },
  { value: 'WED', label: 'Thứ Tư' },
  { value: 'THU', label: 'Thứ Năm' },
  { value: 'FRI', label: 'Thứ Sáu' },
  { value: 'SAT', label: 'Thứ Bảy' },
  { value: 'SUN', label: 'Chủ Nhật' },
];

interface RecurringScheduleTabProps {
  recurringList: RecurringSchedule[];
  isLoading: boolean;
  onCreate: (dto: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => Promise<any>;
  onToggle: (id: string, currentActive: boolean) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  isCreating: boolean;
}

export const RecurringScheduleTab: React.FC<RecurringScheduleTabProps> = ({
  recurringList,
  isLoading,
  onCreate,
  onToggle,
  onDelete,
  isCreating,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MON');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    // Kiểm tra chồng đè khung giờ ở Frontend
    const isOverlap = recurringList.some((s) => {
      if (s.dayOfWeek !== selectedDay || !s.isActive) return false;
      return startTime < s.endTime && s.startTime < endTime;
    });

    if (isOverlap) {
      setError(`Khung giờ [${startTime} - ${endTime}] bị trùng/chồng đè với khung giờ đã cài đặt trên Thứ được chọn!`);
      return;
    }

    try {
      await onCreate({ dayOfWeek: selectedDay, startTime, endTime });
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Không thể tạo lịch lặp lại');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Form thêm lịch lặp lại */}
      <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-600" />
            Thêm Khung Giờ Mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <Select
                label="THỨ TRONG TUẦN"
                options={DAYS_OF_WEEK}
                value={selectedDay}
                onChange={(val) => setSelectedDay(val as DayOfWeek)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TimeInput
                label="BẮT ĐẦU"
                value={startTime}
                onChange={(val) => setStartTime(val)}
              />
              <TimeInput
                label="KẾT THÚC"
                value={endTime}
                onChange={(val) => setEndTime(val)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isCreating}
              className="mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Vào Lịch Tuần</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Danh sách các khung giờ rảnh theo thứ trong tuần */}
      <div className="lg:col-span-2 flex flex-col h-full">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Đang tải lịch tuần...</div>
        ) : recurringList.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">Chưa có lịch lặp lại nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy thêm khung giờ bạn thường rảnh hàng tuần ở bên trái để sinh viên có thể chủ động đặt học.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const slotsForDay = recurringList.filter((s) => s.dayOfWeek === day.value);
              if (slotsForDay.length === 0) return null;

              return (
                <div
                  key={day.value}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                      {day.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {slotsForDay.length} khung giờ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {slotsForDay.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          slot.isActive
                            ? 'bg-primary-50/40 border-primary-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                          <div>
                            <span className="font-bold text-xs sm:text-sm">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              ({slot.durationMinutes} phút)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggle(slot.id, slot.isActive)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                              slot.isActive
                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {slot.isActive ? 'Đang bật' : 'Tắt'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(slot.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa khung giờ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
