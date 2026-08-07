import React, { useState } from 'react';
import { Clock, Copy, AlertCircle } from 'lucide-react';
import type { DayOfWeek, RecurringSchedule, CopyScheduleSource } from '../types';
import { ALL_DAYS } from '../constants';
import { CreateRecurringSlotForm } from './CreateRecurringSlotForm';
import { RecurringSlotCard } from './RecurringSlotCard';
import { CopyScheduleModal } from './CopyScheduleModal';

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
  // Modal sao chép lịch
  const [copySource, setCopySource] = useState<CopyScheduleSource | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [globalSuccessMsg, setGlobalSuccessMsg] = useState('');
  
  // Lưu lỗi riêng biệt cho từng thứ trong tuần
  const [dayErrors, setDayErrors] = useState<Record<string, string>>({});

  // Kiểm tra trùng khung giờ khi bật active (Gán lỗi trực tiếp vào đúng thứ đó)
  const handleToggleSlot = async (slot: RecurringSchedule) => {
    setDayErrors((prev) => ({ ...prev, [slot.dayOfWeek]: '' }));
    setGlobalSuccessMsg('');

    // Nếu slot đang tắt và người dùng muốn BẬT LÊN (!slot.isActive):
    if (!slot.isActive) {
      const conflictingSlot = recurringList.find((s) => {
        if (s.id === slot.id || s.dayOfWeek !== slot.dayOfWeek || !s.isActive) return false;
        // Công thức chồng đè khoảng thời gian: start1 < end2 && start2 < end1
        return slot.startTime < s.endTime && s.startTime < slot.endTime;
      });

      if (conflictingSlot) {
        setDayErrors((prev) => ({
          ...prev,
          [slot.dayOfWeek]: `Không thể bật khung giờ [${slot.startTime} - ${slot.endTime}] vì bị trùng/chồng đè với khung giờ [${conflictingSlot.startTime} - ${conflictingSlot.endTime}] đang bật!`,
        }));
        setTimeout(() => {
          setDayErrors((prev) => ({ ...prev, [slot.dayOfWeek]: '' }));
        }, 6000);
        return;
      }
    }

    try {
      await onToggle(slot.id, slot.isActive);
    } catch (err: any) {
      setDayErrors((prev) => ({
        ...prev,
        [slot.dayOfWeek]: err?.data?.message || err?.message || 'Không thể thay đổi trạng thái khung giờ',
      }));
    }
  };

  // Mở modal sao chép
  const handleOpenCopyModal = (day: DayOfWeek, label: string, slots: RecurringSchedule[]) => {
    setCopySource({ day, label, slots });
  };

  // Thực hiện sao chép sang các thứ khác
  const handleExecuteCopy = async (targetCopyDays: DayOfWeek[]) => {
    if (!copySource || targetCopyDays.length === 0) return;
    setIsCopying(true);
    setDayErrors({});
    setGlobalSuccessMsg('');
    try {
      for (const targetDay of targetCopyDays) {
        for (const slot of copySource.slots) {
          // Tránh tạo trùng lặp
          const alreadyExists = recurringList.some(
            (s) =>
              s.dayOfWeek === targetDay &&
              s.startTime === slot.startTime &&
              s.endTime === slot.endTime,
          );
          if (!alreadyExists) {
            await onCreate({
              dayOfWeek: targetDay,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          }
        }
      }
      setCopySource(null);
      setGlobalSuccessMsg(
        `Đã sao chép lịch từ ${copySource.label} sang các thứ đã chọn thành công!`,
      );
      setTimeout(() => setGlobalSuccessMsg(''), 4000);
    } catch (err: any) {
      setGlobalSuccessMsg('');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      {/* Cột trái: Form thêm khung giờ mới */}
      <div className="lg:col-span-1">
        <CreateRecurringSlotForm
          recurringList={recurringList}
          onCreate={onCreate}
          isCreating={isCreating}
        />
      </div>

      {/* Cột phải: Danh sách các khung giờ rảnh theo thứ trong tuần */}
      <div className="lg:col-span-2 flex flex-col h-full pl-0 lg:pl-2">
        {globalSuccessMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-in fade-in duration-150">
            {globalSuccessMsg}
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Đang tải lịch tuần...</div>
        ) : recurringList.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">Chưa có lịch lặp lại nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy thêm khung giờ bạn thường rảnh hàng tuần ở bên trái để sinh viên có thể chủ động đặt học.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/80">
            {ALL_DAYS.map((day) => {
              const slotsForDay = recurringList.filter((s) => s.dayOfWeek === day.value);
              if (slotsForDay.length === 0) return null;

              // Tính tổng thời lượng phút và số giờ
              const totalMinutes = slotsForDay.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
              const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
              const hasDayError = !!dayErrors[day.value];

              return (
                <div
                  key={day.value}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col gap-2.5"
                >
                  {/* Thông báo lỗi nằm chính xác ở đúng thứ này */}
                  {hasDayError && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{dayErrors[day.value]}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Cột thông tin thứ bên trái */}
                    <div className="md:col-span-4 flex flex-col justify-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                        <h4 className="font-medium text-slate-800 text-sm sm:text-base">
                          {day.label}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 font-normal ml-4">
                        {slotsForDay.length} khung &nbsp;•&nbsp; {totalHours} giờ
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCopyModal(day.value, day.label, slotsForDay)}
                        className="text-xs font-normal text-slate-600 hover:text-primary-600 flex items-center gap-1.5 ml-4 mt-1.5 transition-colors cursor-pointer w-fit"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </button>
                    </div>

                    {/* Cột các thẻ khung giờ bên phải (Khi chỉ có 1 khung giờ thì tự động full chiều rộng) */}
                    <div
                      className={`md:col-span-8 grid gap-3 ${
                        slotsForDay.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                      }`}
                    >
                      {slotsForDay.map((slot) => (
                        <RecurringSlotCard
                          key={slot.id}
                          slot={slot}
                          onToggle={() => handleToggleSlot(slot)}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Sao Chép Lịch Sang Thứ Khác */}
      {copySource && (
        <CopyScheduleModal
          copySource={copySource}
          onClose={() => setCopySource(null)}
          onExecute={handleExecuteCopy}
          isCopying={isCopying}
        />
      )}
    </div>
  );
};
