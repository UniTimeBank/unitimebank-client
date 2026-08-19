import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BookingCreditBreakdownProps {
  selectedSlot: { startTime: string; endTime: string } | null;
  requiredCredit: number;
  availableCredit: number;
  isInsufficientCredit: boolean;
}

export const BookingCreditBreakdown: React.FC<BookingCreditBreakdownProps> = ({
  selectedSlot,
  requiredCredit,
  availableCredit,
  isInsufficientCredit,
}) => {
  if (!selectedSlot) return null;

  return (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-gray-500 font-medium">Chi phí ({requiredCredit} phút):</span>
        <span className="font-extrabold text-gray-900">{requiredCredit} Credit</span>
      </div>

      {isInsufficientCredit ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Số dư ví không đủ ({availableCredit}/{requiredCredit} Credit)
            </p>
            <p className="text-[10px] text-rose-600 font-normal mt-0.5">
              Cần thêm {requiredCredit - availableCredit} Credit để đặt lịch học này.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Số dư khả dụng:</span>
          <span className="font-extrabold text-emerald-700">{availableCredit} Credit</span>
        </div>
      )}
    </div>
  );
};
