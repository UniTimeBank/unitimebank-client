import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Zap, Info, FileText, Lock } from 'lucide-react';
import type { TimeSlot } from '@/features/post/types';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';

export interface LearnerRequestDetailSidebarProps {
  title?: string;
  learnerId?: string;
  slots: TimeSlot[];
  expectedCreditAmount?: number;
  expectedDurationMinutes?: number;
  deadlineText?: string;
  learnerName?: string;
  status?: string;
  primaryButtonText?: string;
  onPrimaryAction?: (slot: TimeSlot) => void;
  className?: string;
}

const DAY_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

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

const getDayOrder = (rawDay: string): number => {
  if (!rawDay) return 99;
  const upper = rawDay.toUpperCase().trim();
  if (DAY_ORDER[upper]) return DAY_ORDER[upper];
  if (upper.includes('HAI') || upper.includes('MON')) return 1;
  if (upper.includes('BA') || upper.includes('TUE')) return 2;
  if (upper.includes('TƯ') || upper.includes('WED')) return 3;
  if (upper.includes('NĂM') || upper.includes('THU')) return 4;
  if (upper.includes('SÁU') || upper.includes('FRI')) return 5;
  if (upper.includes('BẢY') || upper.includes('SAT')) return 6;
  if (upper.includes('NHẬT') || upper.includes('SUN')) return 7;
  return 99;
};

const formatSlotDay = (rawDay: string): string => {
  if (!rawDay) return 'Khung giờ rảnh';
  const upper = rawDay.toUpperCase().trim();
  return DAY_LABELS[upper] || rawDay;
};

export const LearnerRequestDetailSidebar: React.FC<LearnerRequestDetailSidebarProps> = ({
  title = 'Khung giờ học viên rảnh',
  learnerId,
  slots = [],
  expectedCreditAmount = 60,
  expectedDurationMinutes = 60,
  deadlineText,
  learnerName = 'Học viên',
  status,
  primaryButtonText = 'Nhận dạy yêu cầu này',
  onPrimaryAction,
  className = '',
}) => {
  const authUser = useAppSelector(selectCurrentUser);
  const isOwner = Boolean(authUser?.id && learnerId && authUser.id === learnerId);
  const isClosed = status === 'CANCELLED' || status === 'MATCHED';
  // Normalize slots or provide fallback
  const rawSlots: TimeSlot[] =
    slots && slots.length > 0
      ? slots
      : [
          { dayOfWeek: 'Thứ Hai', startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 'Thứ Tư', startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 'Chủ Nhật', startTime: '14:00', endTime: '15:00' },
        ];

  // Group and sort slots by Day of Week (Monday -> Sunday) and then by startTime
  const groupedSlots = useMemo(() => {
    const map = new Map<string, { dayLabel: string; order: number; slots: TimeSlot[] }>();

    for (const slot of rawSlots) {
      const dayLabel = formatSlotDay(slot.dayOfWeek);
      const order = getDayOrder(slot.dayOfWeek);

      if (!map.has(dayLabel)) {
        map.set(dayLabel, { dayLabel, order, slots: [] });
      }
      map.get(dayLabel)!.slots.push(slot);
    }

    // Sort days chronologically
    const sortedGroups = Array.from(map.values()).sort((a, b) => a.order - b.order);

    // Sort time slots inside each day
    for (const group of sortedGroups) {
      group.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return sortedGroups;
  }, [rawSlots]);

  // Initial selection: first slot of first day
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(() => {
    return groupedSlots[0]?.slots[0] || null;
  });

  const handleAcceptRequest = () => {
    if (!selectedSlot) {
      toast.error('Chưa chọn khung giờ', 'Vui lòng chọn 1 khung giờ bạn có thể nhận dạy');
      return;
    }

    if (onPrimaryAction) {
      onPrimaryAction(selectedSlot);
      return;
    }

    toast.success(
      'Đã gửi đề nghị nhận dạy!',
      `Khung giờ: ${formatSlotDay(selectedSlot.dayOfWeek)} (${selectedSlot.startTime} - ${selectedSlot.endTime}) cho ${learnerName}`,
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

      {/* White Clean Body: Danh sách khung giờ nhóm theo Thứ */}
      <div className="p-5 bg-white text-gray-900 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-primary-700 font-bold text-xs mb-1">
            <Clock className="w-4 h-4 text-primary-600 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Chọn một khung giờ bạn có thể nhận kèm học viên:
          </p>
        </div>

        {/* Danh sách các nhóm Thứ (2 cột / dòng) */}
        <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-0.5">
          {groupedSlots.map(({ dayLabel, slots: daySlots }) => (
            <div key={dayLabel} className="space-y-1.5">
              {/* Tiêu đề Thứ */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>{dayLabel}</span>
              </div>

              {/* 2 khung giờ 1 dòng */}
              <div className="grid grid-cols-2 gap-2">
                {daySlots.map((slot) => {
                  const isSelected =
                    selectedSlot?.dayOfWeek === slot.dayOfWeek &&
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;

                  return (
                    <button
                      key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
                        isSelected
                          ? 'border-primary-700 bg-primary-700 text-white shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50/40'
                      }`}
                    >
                      <span>{slot.startTime}</span>
                      <span className="opacity-50 font-normal">→</span>
                      <span>{slot.endTime}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 font-normal text-center pt-1 border-t border-gray-100">
          Thời gian hiển thị theo múi giờ Việt Nam (GMT+7).
        </p>

        {/* Nút hành động Nhận dạy */}
        <div className="pt-1">
          {isOwner ? (
            <Link to="/manage/posts" className="block w-full">
              <Button
                type="button"
                variant="outline"
                fullWidth
                size="md"
                className="rounded-xl border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs py-3 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Quản lý yêu cầu của bạn</span>
              </Button>
            </Link>
          ) : isClosed ? (
            <div className="space-y-1.5">
              <Button
                type="button"
                variant="outline"
                fullWidth
                size="md"
                disabled
                className="rounded-xl border-amber-200 bg-amber-50/80 text-amber-800 font-bold text-xs py-3 flex items-center justify-center gap-1.5 shadow-2xs opacity-90 cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-amber-600" />
                <span>{status === 'MATCHED' ? 'Yêu cầu đã có gia sư' : 'Yêu cầu học đã đóng'}</span>
              </Button>
              <p className="text-[11px] text-amber-700 font-medium text-center">
                Học viên hiện đang tạm ngưng nhận thêm đề nghị dạy mới.
              </p>
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              fullWidth
              size="md"
              disabled={!selectedSlot}
              onClick={handleAcceptRequest}
              className="rounded-xl bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 shadow-xs cursor-pointer"
            >
              <span>{primaryButtonText}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
