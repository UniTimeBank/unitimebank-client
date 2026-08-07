import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import type { DayOfWeek, CopyScheduleSource } from '../types';
import { ALL_DAYS } from '../constants';

interface CopyScheduleModalProps {
  copySource: CopyScheduleSource;
  onClose: () => void;
  onExecute: (targetDays: DayOfWeek[]) => Promise<void>;
  isCopying: boolean;
}

export const CopyScheduleModal: React.FC<CopyScheduleModalProps> = ({
  copySource,
  onClose,
  onExecute,
  isCopying,
}) => {
  const [targetCopyDays, setTargetCopyDays] = useState<DayOfWeek[]>(
    ALL_DAYS.filter((d) => d.value !== copySource.day).map((d) => d.value),
  );

  const handleToggleTargetDay = (dayVal: DayOfWeek) => {
    if (targetCopyDays.includes(dayVal)) {
      setTargetCopyDays(targetCopyDays.filter((t) => t !== dayVal));
    } else {
      setTargetCopyDays([...targetCopyDays, dayVal]);
    }
  };

  const handleConfirm = () => {
    if (targetCopyDays.length > 0) {
      onExecute(targetCopyDays);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Copy className="w-4 h-4 text-[#064e3b]" />
            Sao chép lịch từ {copySource.label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Chọn các thứ bạn muốn áp dụng cùng {copySource.slots.length} khung giờ (
          {copySource.slots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')}):
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {ALL_DAYS.filter((d) => d.value !== copySource.day).map((d) => {
            const isChecked = targetCopyDays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => handleToggleTargetDay(d.value)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{d.label}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isCopying || targetCopyDays.length === 0}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isCopying ? 'Đang sao chép...' : `Sao chép sang (${targetCopyDays.length}) thứ`}
          </button>
        </div>
      </div>
    </div>
  );
};
