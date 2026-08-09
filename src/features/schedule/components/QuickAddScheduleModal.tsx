import React, { useState, useMemo } from 'react';
import { Clock, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, TimeInput } from '@/shared/components/ui';
import type { DayOfWeek, RecurringSchedule } from '../types';
import { ALL_DAYS } from '../constants';
import { DaySelectorChips } from './DaySelectorChips';

interface QuickAddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSchedules?: RecurringSchedule[];
  onCreateSchedule: (dto: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => Promise<any>;
  onSuccessCreated?: (newSlots: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[]) => void;
}

export const QuickAddScheduleModal: React.FC<QuickAddScheduleModalProps> = ({
  isOpen,
  onClose,
  existingSchedules = [],
  onCreateSchedule,
  onSuccessCreated,
}) => {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['MON']);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Lấy các khoảng thời gian đã bận/đã có lịch trên các thứ đang được chọn
  const occupiedIntervals = useMemo(() => {
    return existingSchedules
      .filter((s) => selectedDays.includes(s.dayOfWeek) && s.isActive)
      .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  }, [existingSchedules, selectedDays]);

  // 2. Khóa chặn thông minh: Tìm khung giờ bận sớm nhất sau Giờ bắt đầu để làm mốc chặn maxTime
  const maxEndBound = useMemo(() => {
    const laterOccupied = occupiedIntervals
      .filter((inv) => inv.startTime > startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return laterOccupied.length > 0 ? laterOccupied[0].startTime : undefined;
  }, [occupiedIntervals, startTime]);

  // 3. Tìm tất cả các thứ trong tuần bị trùng lặp khung giờ đang chọn
  const conflictingDays = useMemo(() => {
    return selectedDays.filter((day) => {
      return existingSchedules.some((s) => {
        if (s.dayOfWeek !== day || !s.isActive) return false;
        return startTime < s.endTime && s.startTime < endTime;
      });
    });
  }, [selectedDays, existingSchedules, startTime, endTime]);

  const hasConflict = conflictingDays.length > 0;

  // 4. Khi thay đổi Giờ bắt đầu, tự động tính Giờ kết thúc +2 tiếng hoặc khóa chặn tại mốc bận tiếp theo
  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    const [h, m] = val.split(':').map(Number);
    let nextH = h + 2;
    let nextM = m;
    if (nextH >= 24) {
      nextH = 23;
      nextM = 59;
    }
    let calculatedEnd = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;

    const laterOccupied = occupiedIntervals
      .filter((inv) => inv.startTime > val)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (laterOccupied.length > 0) {
      const earliestBusyStart = laterOccupied[0].startTime;
      if (calculatedEnd > earliestBusyStart) {
        calculatedEnd = earliestBusyStart;
      }
    }

    setEndTime(calculatedEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (selectedDays.length === 0) {
      setError('Vui lòng chọn ít nhất một thứ trong tuần.');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
      return;
    }

    if (hasConflict) {
      const dayNames = conflictingDays
        .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
        .join(', ');
      setError(`Không thể thêm! Bị trùng lịch đã có trên: ${dayNames}. Vui lòng đổi khung giờ khác.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const createdSlots: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[] = [];
      for (const day of selectedDays) {
        await onCreateSchedule({
          dayOfWeek: day,
          startTime,
          endTime,
        });
        createdSlots.push({ dayOfWeek: day, startTime, endTime });
      }

      setSuccessMsg(`🎉 Đã thêm thành công khung giờ vào ${selectedDays.length} ngày trong tuần!`);
      onSuccessCreated?.(createdSlots);

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to create schedule slot:', err);
      setError(err?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo lịch rảnh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thiết Lập Khung Giờ Rảnh Nhanh"
      description="Thêm các khung giờ bạn có thể nhận dạy kèm 1:1 mỗi tuần."
      size="md"
    >
      <div className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Real-time Conflict Alert */}
        {hasConflict && !error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>
              Khung giờ này bị trùng lịch trên:{' '}
              <strong className="font-bold text-red-800">
                {conflictingDays
                  .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
                  .join(', ')}
              </strong>
            </span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Day of week chips */}
        <div>
          <DaySelectorChips
            selectedDays={selectedDays}
            onChange={(days) => {
              setError('');
              setSuccessMsg('');
              setSelectedDays(days);
            }}
            label="CHỌN NGÀY TRONG TUẦN"
          />
        </div>

        {/* Time Inputs With Smart Disabled Bounds */}
        <div className="grid grid-cols-2 gap-4">
          <TimeInput
            label="GIỜ BẮT ĐẦU"
            value={startTime}
            disabledIntervals={occupiedIntervals}
            onChange={handleStartTimeChange}
          />
          <TimeInput
            label="GIỜ KẾT THÚC"
            value={endTime}
            minTime={startTime}
            maxTime={maxEndBound}
            disabledIntervals={occupiedIntervals}
            onChange={(val) => setEndTime(val)}
          />
        </div>

        <div className="p-3.5 bg-primary-50/70 border border-primary-200/80 rounded-2xl flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-primary-600 shrink-0" />
          <p className="text-[11px] text-primary-800 leading-relaxed font-medium">
            Lịch rảnh này sẽ được lưu cố định vào hồ sơ và tự động áp dụng hàng tuần để học viên đặt lịch.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedDays.length === 0 || hasConflict}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {isSubmitting
                ? 'Đang lưu...'
                : hasConflict
                  ? 'Bị trùng lịch'
                  : 'Lưu Khung Giờ Rảnh'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
