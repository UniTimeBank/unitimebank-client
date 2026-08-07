import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { RecurringSchedule } from '../types';

interface RecurringSlotCardProps {
  slot: RecurringSchedule;
  onToggle: (id: string, currentActive: boolean) => Promise<any> | void;
  onDelete: (id: string) => Promise<any> | void;
}

export const RecurringSlotCard: React.FC<RecurringSlotCardProps> = ({
  slot,
  onToggle,
  onDelete,
}) => {
  return (
    <div className="bg-[#f1f5f9] border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between transition-all">
      {/* Thời gian & thời lượng */}
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-slate-900">
          {slot.startTime} - {slot.endTime}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
          {slot.durationMinutes} phút
        </span>
      </div>

      {/* Đường phân cách dọc */}
      <div className="h-8 w-px bg-slate-200/90 mx-2.5" />

      {/* Các nút hành động bên phải */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Nút checkmark: Dùng màu Primary với hover:bg-primary-500 */}
        <button
          type="button"
          onClick={() => onToggle(slot.id, slot.isActive)}
          className={`w-7.5 h-7.5 min-w-[30px] min-h-[30px] rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer shadow-2xs ${
            slot.isActive
              ? 'bg-primary-700 hover:bg-primary-500 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-primary-700'
          }`}
          title={slot.isActive ? 'Đang bật' : 'Đã tắt'}
        >
          <Check
            className={
              slot.isActive
                ? 'w-4 h-4 text-white stroke-[3]'
                : 'w-3.5 h-3.5 text-primary-700 stroke-[2.5]'
            }
          />
        </button>

        {/* Nút xóa: Khi hover đổi màu nền sang hồng nâu */}
        <button
          type="button"
          onClick={() => onDelete(slot.id)}
          className="w-7.5 h-7.5 min-w-[30px] min-h-[30px] rounded-full text-slate-400 hover:bg-[#fde8e8] hover:text-[#991b1b] flex items-center justify-center transition-colors duration-150 cursor-pointer"
          title="Xóa khung giờ"
        >
          <Trash2 className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>
    </div>
  );
};
