import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Ban,
  CalendarPlus,
} from 'lucide-react';
import { TimeInput, DateInput } from '@/shared/components/ui';
import type { ExceptionType, ScheduleException } from '../types';

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
  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayLocalDate();

  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState<ExceptionType>('BLOCKED');
  const [startTime, setStartTime] = useState('07:57');
  const [endTime, setEndTime] = useState('08:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lấy các khoảng thời gian đã bận / đã có ngoại lệ trên ngày đang chọn
  const occupiedIntervalsOnDate = useMemo(() => {
    return exceptionsList
      .filter((s) => s.exceptionDate === date)
      .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  }, [exceptionsList, date]);

  // Khóa chặn thông minh: Tìm khung giờ bận sớm nhất sau Giờ bắt đầu để làm mốc chặn maxTime
  const maxEndBound = useMemo(() => {
    const laterOccupied = occupiedIntervalsOnDate
      .filter((inv) => inv.startTime > startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return laterOccupied.length > 0 ? laterOccupied[0].startTime : undefined;
  }, [occupiedIntervalsOnDate, startTime]);

  // Tự động nhảy Giờ kết thúc +1 tiếng hoặc chặn cứng tại mốc lịch bận kế tiếp
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
    const laterOccupied = occupiedIntervalsOnDate
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

    if (!date) {
      setError('Vui lòng chọn ngày đặc biệt');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      return;
    }

    // Kiểm tra chồng đè với các ngoại lệ đã có trên ngày này
    const isOverlap = exceptionsList.some((s) => {
      if (s.exceptionDate !== date) return false;
      return startTime < s.endTime && s.startTime < endTime;
    });

    if (isOverlap) {
      setError(`Khung giờ [${startTime} - ${endTime}] trên ngày này bị trùng với lịch đặc biệt đã có!`);
      return;
    }

    try {
      await onCreate({
        exceptionDate: date,
        type,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
      });
      setReason('');
      setSuccessMsg('Đã lưu lịch đặc biệt thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Không thể tạo lịch đặc biệt');
    }
  };

  // Helper format ngày ra dạng: Ngày (15), Tháng (TH11)
  const formatTimelineDate = (dateStr: string) => {
    if (!dateStr) return { day: '--', month: '--' };
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const month = `TH${parseInt(parts[1], 10)}`;
      return { day, month };
    }
    return { day: dateStr, month: '' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      {/* Cột trái: Form Thêm Ngoại Lệ Mới */}
      <div className="lg:col-span-1 bg-[#f8fafc] p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          {/* Tiêu đề Form */}
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Thêm Ngày Đặc Biệt
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {successMsg}
              </div>
            )}

            {/* Chọn Ngày */}
            <div>
              <DateInput
                label="NGÀY"
                value={date}
                onChange={(val) => {
                  setError('');
                  setSuccessMsg('');
                  setDate(val);
                }}
              />
            </div>

            {/* Loại Ngoại Lệ (Nút BẬN và RẢNH THÊM) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                LOẠI NGÀY ĐẶC BIỆT
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Nút BẬN */}
                <button
                  type="button"
                  onClick={() => setType('BLOCKED')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer select-none ${
                    type === 'BLOCKED'
                      ? 'bg-rose-100/70 border-rose-300 text-rose-600 shadow-xs ring-2 ring-rose-200/60'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>BẬN</span>
                </button>

                {/* Nút RẢNH THÊM */}
                <button
                  type="button"
                  onClick={() => setType('EXTRA')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer select-none ${
                    type === 'EXTRA'
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-700 shadow-xs ring-2 ring-emerald-200/60'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>RẢNH THÊM</span>
                </button>
              </div>
            </div>

            {/* Thời Gian (Bắt đầu -> Kết thúc) (Khóa chặn thông minh maxTime khi chạm mốc bận) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                THỜI GIAN
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TimeInput
                    value={startTime}
                    disabledIntervals={occupiedIntervalsOnDate}
                    onChange={handleStartTimeChange}
                  />
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                <div className="flex-1">
                  <TimeInput
                    value={endTime}
                    minTime={startTime}
                    maxTime={maxEndBound}
                    disabledIntervals={occupiedIntervalsOnDate}
                    onChange={(val) => setEndTime(val)}
                  />
                </div>
              </div>
            </div>

            {/* Lý do / Ghi chú */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                LÝ DO / GHI CHÚ
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 text-sm outline-none transition-all resize-none bg-white placeholder:text-slate-400 text-slate-800"
              />
            </div>

            {/* Nút Submit Lưu Ngoại Lệ */}
            <button
              type="submit"
              disabled={isCreating}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#044e3a] hover:bg-[#033c2d] text-white font-medium text-sm flex items-center justify-center shadow-xs transition-all select-none text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isCreating ? 'Đang lưu...' : 'Lưu Ngày Đặc Biệt'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Cột phải: Danh Sách Lịch Ngoại Lệ Sắp Tới */}
      <div className="lg:col-span-2 flex flex-col h-full pl-0 lg:pl-4">
        {/* Header danh sách */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">
            Lịch Đặc Biệt Sắp Tới
          </h3>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Bộ lọc"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Đang tải lịch đặc biệt...</div>
        ) : exceptionsList.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">Chưa có lịch đặc biệt nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thêm các ngày bạn bận đột xuất hoặc rảnh thêm ở bên trái để hệ thống cập nhật lịch chính xác.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-6 space-y-6">
            {exceptionsList.map((slot) => {
              const { day, month } = formatTimelineDate(slot.exceptionDate);
              const isBlocked = slot.type === 'BLOCKED';

              return (
                <div key={slot.id} className="relative flex items-start gap-5 pl-6 group">
                  {/* Cột mốc Timeline ngày tháng bên trái */}
                  <div className="absolute -left-12 top-2 flex flex-col items-center text-center w-10">
                    <span className="text-sm font-bold text-slate-800 leading-none">
                      {day}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                      {month}
                    </span>
                  </div>

                  {/* Thẻ Card Ngoại Lệ với viền trái dày nổi bật */}
                  <div
                    className={`w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm ${
                      isBlocked ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-600'
                    }`}
                  >
                    {/* Hàng Header Thẻ: Badge + Thời Gian + Nút Xóa */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Badge Loại */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isBlocked
                              ? 'bg-rose-100/80 text-rose-600'
                              : 'bg-emerald-100/80 text-emerald-700'
                          }`}
                        >
                          {isBlocked ? 'BẬN' : 'RẢNH THÊM'}
                        </span>

                        {/* Khung giờ */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Nút Xóa Thẻ */}
                      <button
                        type="button"
                        onClick={() => onDelete(slot.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Xóa ngày đặc biệt này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tiêu đề / Lý do */}
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                      {slot.reason || (isBlocked ? 'Bận Đột Xuất' : 'Rảnh Thêm Ngoài Giờ')}
                    </h4>

                    {/* Mô tả phụ */}
                    <p className="text-xs text-slate-500 font-normal">
                      {isBlocked
                        ? 'Không thể nhận lịch dạy bù trong khung giờ này.'
                        : 'Sẵn sàng nhận học viên mới hoặc dạy bù.'}
                    </p>
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
