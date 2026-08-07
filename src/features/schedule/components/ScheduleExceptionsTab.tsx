import React, { useState } from 'react';
import { CalendarX, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Button, Input, Select, TimeInput, DateInput } from '@/shared/components/ui';
import type { ExceptionType, ScheduleException } from '../types';

const EXCEPTION_TYPES: { value: ExceptionType; label: string }[] = [
  { value: 'BLOCKED', label: 'Báo bận (Không nhận lịch ngày này)' },
  { value: 'EXTRA', label: 'Thêm giờ rảnh đặc biệt (Ngoài lịch tuần)' },
];

interface ScheduleExceptionsTabProps {
  exceptionsList: ScheduleException[];
  isLoading: boolean;
  onCreate: (dto: {
    exceptionDate: string;
    type: ExceptionType;
    startTime: string;
    endTime: string;
    reason?: string;
  }) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  isCreating: boolean;
}

export const ScheduleExceptionsTab: React.FC<ScheduleExceptionsTabProps> = ({
  exceptionsList,
  isLoading,
  onCreate,
  onDelete,
  isCreating,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState<ExceptionType>('BLOCKED');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Vui lòng chọn ngày ngoại lệ');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    try {
      await onCreate({
        exceptionDate: date,
        type,
        startTime,
        endTime,
        reason: reason || undefined,
      });
      setReason('');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Không thể tạo lịch đặc biệt');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Form tạo ngoại lệ */}
      <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-600" />
            Cài Đặt Lịch Ngoại Lệ
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DateInput
              label="CHỌN NGÀY CỤ THỂ"
              value={date}
              onChange={(val) => setDate(val)}
            />

            <Select
              label="LOẠI NGOẠI LỆ"
              options={EXCEPTION_TYPES}
              value={type}
              onChange={(val) => setType(val as ExceptionType)}
            />

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

            <Input
              label="LÝ DO (TÙY CHỌN)"
              placeholder="VD: Thi giữa kỳ, đi công tác, bận việc cá nhân..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isCreating}
              className="mt-2"
            >
              <CalendarX className="w-4 h-4" />
              <span>Lưu Lịch Ngoại Lệ</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Danh sách các ngoại lệ đã tạo */}
      <div className="lg:col-span-2 flex flex-col h-full">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Đang tải danh sách ngoại lệ...</div>
        ) : exceptionsList.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">Chưa có lịch đặc biệt nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Khi có ngày đột xuất bạn bận hoặc muốn mở thêm ca dạy, hãy cài đặt ở bảng bên trái.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exceptionsList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                  item.type === 'BLOCKED'
                    ? 'bg-rose-50/40 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                        item.type === 'BLOCKED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type === 'BLOCKED' ? 'Báo bận' : 'Thêm giờ'}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {item.exceptionDate}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      ({item.startTime} - {item.endTime})
                    </span>
                  </div>

                  {item.reason && (
                    <p className="text-xs text-slate-500 italic pl-1">
                      Lý do: "{item.reason}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="self-end sm:self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Xóa lịch ngoại lệ này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
