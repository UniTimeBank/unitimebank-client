import React, { useState, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { TimeInput } from '@/shared/components/ui';
import type { DayOfWeek, RecurringSchedule } from '../types';
import { ALL_DAYS } from '../constants';
import { DaySelectorChips } from './DaySelectorChips';

interface CreateRecurringSlotFormProps {
  recurringList: RecurringSchedule[];
  onCreate: (dto: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => Promise<any>;
  isCreating: boolean;
}

export const CreateRecurringSlotForm: React.FC<CreateRecurringSlotFormProps> = ({
  recurringList,
  onCreate,
  isCreating,
}) => {
  // Mặc định chọn Thứ Hai (MON) và khung giờ trống 08:00 - 09:00
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['MON']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lấy các khoảng thời gian đã bận/đã có lịch trên các thứ đang được chọn
  const occupiedIntervals = useMemo(() => {
    return recurringList
      .filter((s) => selectedDays.includes(s.dayOfWeek) && s.isActive)
      .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  }, [recurringList, selectedDays]);

  // Khóa chặn thông minh: Tìm khung giờ bận sớm nhất sau Giờ bắt đầu để làm mốc chặn maxTime
  const maxEndBound = useMemo(() => {
    const laterOccupied = occupiedIntervals
      .filter((inv) => inv.startTime > startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return laterOccupied.length > 0 ? laterOccupied[0].startTime : undefined;
  }, [occupiedIntervals, startTime]);

  // Tìm tất cả các thứ trong tuần bị trùng lặp khung giờ đang chọn
  const conflictingDays = useMemo(() => {
    return selectedDays.filter((day) => {
      return recurringList.some((s) => {
        if (s.dayOfWeek !== day || !s.isActive) return false;
        return startTime < s.endTime && s.startTime < endTime;
      });
    });
  }, [selectedDays, recurringList, startTime, endTime]);

  const hasConflict = conflictingDays.length > 0;

  // Khi thay đổi Giờ bắt đầu, tự động đặt Giờ kết thúc +1 tiếng hoặc chặn cứng tại mốc lịch bận kế tiếp
  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    const [h, m] = val.split(':').map(Number);
    let nextH = h + 1;
    let nextM = m;
    if (nextH >= 24) {
      nextH = 23;
      nextM = 59;
    }
    let calculatedEnd = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;

    // Kiểm tra nếu +1 tiếng vượt qua khung giờ bận kế tiếp thì khóa chặn tại mốc bận đó
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
      setError('Vui lòng chọn ít nhất một thứ trong tuần');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    // Nếu có bất kỳ thứ nào bị trùng -> Chặn tuyệt đối, không được thêm vào bất kỳ thứ nào
    if (hasConflict) {
      const dayNames = conflictingDays
        .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
        .join(', ');
      setError(
        `Không thể thêm! Khung giờ [${startTime} - ${endTime}] bị trùng lịch trên: ${dayNames}. Vui lòng bỏ chọn thứ bị trùng hoặc đổi khung giờ khác.`,
      );
      return;
    }

    try {
      // Tạo lịch cho tất cả các thứ đã chọn
      for (const day of selectedDays) {
        await onCreate({ dayOfWeek: day, startTime, endTime });
      }
      setSuccessMsg(`Đã thêm thành công khung giờ vào ${selectedDays.length} thứ trong tuần!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Không thể tạo lịch lặp lại');
    }
  };

  return (
    <div className="bg-[#f8fafc] p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Tiêu đề Form */}
        <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          <span>Thêm Khung Giờ Mới</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cảnh báo thời gian thực khi có thứ bị trùng lịch */}
          {hasConflict && !error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Bị trùng lịch trên:{' '}
                <strong>
                  {conflictingDays
                    .map((d) => ALL_DAYS.find((item) => item.value === d)?.label || d)
                    .join(', ')}
                </strong>
              </span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Chọn thứ trong tuần */}
          <DaySelectorChips
            selectedDays={selectedDays}
            onChange={(days) => {
              setError('');
              setSuccessMsg('');
              setSelectedDays(days);
            }}
          />

          {/* Chọn giờ bắt đầu & kết thúc */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <TimeInput
              label="BẮT ĐẦU"
              value={startTime}
              disabledIntervals={occupiedIntervals}
              onChange={handleStartTimeChange}
            />
            <TimeInput
              label="KẾT THÚC"
              value={endTime}
              minTime={startTime}
              maxTime={maxEndBound}
              disabledIntervals={occupiedIntervals}
              onChange={(val) => setEndTime(val)}
            />
          </div>

          {/* Nút Submit thêm khung giờ (Khóa khi bị trùng lịch) */}
          <button
            type="submit"
            disabled={isCreating || selectedDays.length === 0 || hasConflict}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm flex items-center justify-center shadow-xs transition-all select-none text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 disabled:active:scale-100 disabled:shadow-none"
          >
            <span className="select-none pointer-events-none">
              {isCreating
                ? 'Đang thêm...'
                : hasConflict
                ? 'Bị trùng lịch (Không thể thêm)'
                : 'Thêm Vào Lịch Tuần'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
