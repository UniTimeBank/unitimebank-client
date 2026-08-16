import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, Zap } from 'lucide-react';
import type { TimeSlot } from '@/features/post/types';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';

export interface LearnerRequestSidebarProps {
  title?: string;
  slots: TimeSlot[];
  expectedCreditAmount?: number;
  expectedDurationMinutes?: number;
  deadlineText?: string;
  learnerName?: string;
  primaryButtonText?: string;
  onPrimaryAction?: (slot: TimeSlot) => void;
  className?: string;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
  MON: 'Thứ Hai',
  TUE: 'Thứ Ba',
  WED: 'Thứ Tư',
  THU: 'Thứ Năm',
  FRI: 'Thứ Sáu',
  SAT: 'Thứ Bảy',
  SUN: 'Chủ Nhật',
};

const formatSlotDay = (rawDay: string): string => {
  if (!rawDay) return 'Khung giờ rảnh';
  const upper = rawDay.toUpperCase().trim();
  return DAY_LABELS[upper] || rawDay;
};

export const LearnerRequestSidebar: React.FC<LearnerRequestSidebarProps> = ({
  title = 'Khung giờ học viên rảnh',
  slots = [],
  expectedCreditAmount = 60,
  expectedDurationMinutes = 60,
  deadlineText,
  learnerName = 'Học viên',
  primaryButtonText = 'Nhận dạy yêu cầu này',
  onPrimaryAction,
  className = '',
}) => {
  // Normalize slots or provide fallback
  const displaySlots: TimeSlot[] =
    slots && slots.length > 0
      ? slots
      : [
          { dayOfWeek: 'Thứ Hai', startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 'Thứ Tư', startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 'Chủ Nhật', startTime: '14:00', endTime: '15:00' },
        ];

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);

  const handleAcceptRequest = () => {
    if (selectedSlotIndex === null || !displaySlots[selectedSlotIndex]) {
      toast.error('Chưa chọn khung giờ', 'Vui lòng chọn 1 khung giờ bạn có thể nhận dạy');
      return;
    }

    const chosen = displaySlots[selectedSlotIndex];
    if (onPrimaryAction) {
      onPrimaryAction(chosen);
      return;
    }

    toast.success(
      'Đã gửi đề nghị nhận dạy!',
      `Khung giờ: ${formatSlotDay(chosen.dayOfWeek)} (${chosen.startTime} - ${chosen.endTime}) cho ${learnerName}`,
    );
  };

  return (
    <div
      className={`bg-[#1E293B] text-white rounded-3xl shadow-xs overflow-hidden ${className}`}
    >
      {/* Dark Top Header: Ngân sách & Thời lượng */}
      <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
            Ngân sách trả
          </span>
          <div className="text-xl font-bold mt-0.5 text-white">
            {expectedCreditAmount}{' '}
            <span className="text-xs font-normal text-gray-300">credits</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] rounded-full border border-emerald-400/30">
            {expectedDurationMinutes} phút / buổi
          </span>
          {deadlineText && (
            <span className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{deadlineText}</span>
            </span>
          )}
        </div>
      </div>

      {/* White Clean Body: Danh sách khung giờ */}
      <div className="p-5 bg-white text-gray-900 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-primary-700 font-bold text-xs mb-1">
            <Clock className="w-4 h-4 text-primary-600 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Chọn một khung giờ bạn có thể kèm học viên:
          </p>
        </div>

        {/* Danh sách các khung giờ học viên mong muốn */}
        <div className="space-y-2.5">
          {displaySlots.map((slot, index) => {
            const isSelected = selectedSlotIndex === index;
            const formattedDay = formatSlotDay(slot.dayOfWeek);

            return (
              <button
                key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${index}`}
                type="button"
                onClick={() => setSelectedSlotIndex(index)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer select-none ${
                  isSelected
                    ? 'border-primary-700 bg-primary-50/70 ring-2 ring-primary-600/30 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Calendar className="w-3.5 h-3.5 text-primary-600" />
                    <span>{formattedDay}</span>
                  </div>
                  <div className="text-sm font-extrabold text-primary-800 tracking-wide">
                    {slot.startTime} <span className="text-gray-400 font-normal">→</span> {slot.endTime}
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-gray-400 font-normal text-center pt-1">
          Thời gian hiển thị theo múi giờ Việt Nam (GMT+7).
        </p>

        {/* Nút hành động Nhận dạy */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="md"
            disabled={selectedSlotIndex === null}
            onClick={handleAcceptRequest}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 shadow-xs"
          >
            <span>{primaryButtonText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
