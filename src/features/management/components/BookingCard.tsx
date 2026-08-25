import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Shield,
  Star,
} from 'lucide-react';
import { BookingStatus, type BookingItem } from '../types';
import { Button } from '@/shared/components/ui';
import LogoImage from '@/assets/images/Logo.png';
import { checkBookingSessionJoinable } from '@/features/session';

export interface BookingCardProps {
  booking: BookingItem;
  currentUserId?: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoinRoom?: (id: string) => void;
  onMessage?: (id: string) => void;
  onOpenDetail?: (booking: BookingItem) => void;
  onRate?: (booking: BookingItem) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isCancelling?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onJoinRoom,
  onMessage,
  onOpenDetail,
  onRate,
  isAccepting = false,
  isRejecting = false,
  isCancelling = false,
}) => {
  const isMentor = currentUserId ? booking.mentorId === currentUserId : true;

  const isPendingForMe =
    (booking.status === BookingStatus.PENDING_MENTOR_APPROVAL && isMentor) ||
    (booking.status === BookingStatus.PENDING_LEARNER_APPROVAL && !isMentor);

  const isWaitingOther =
    (booking.status === BookingStatus.PENDING_MENTOR_APPROVAL && !isMentor) ||
    (booking.status === BookingStatus.PENDING_LEARNER_APPROVAL && isMentor);

  const isConfirmed =
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.STARTED;
  const isCompleted = booking.status === BookingStatus.COMPLETED;
  const isExpired = booking.status === BookingStatus.EXPIRED;
  const isCancelledOrRejected =
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.REJECTED ||
    booking.status === BookingStatus.NO_SHOW;

  // ════════════════════════════════════════════════════════════════
  // 1. LIVE COUNTDOWN TIMER
  // ════════════════════════════════════════════════════════════════
  const [countdownStr, setCountdownStr] = useState<string>('');

  useEffect(() => {
    if (!isPendingForMe && !isWaitingOther) return;

    const tick = () => {
      const createdAtMs = new Date(booking.createdAt).getTime();
      const expiresAtMs = createdAtMs + 24 * 60 * 60 * 1000;
      const diffMs = expiresAtMs - Date.now();

      if (diffMs <= 0) {
        setCountdownStr('hết hạn');
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdownStr(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isPendingForMe, isWaitingOther, booking.createdAt]);

  // ════════════════════════════════════════════════════════════════
  // 2. PARTNER INFO & TRUST SCORE
  // ════════════════════════════════════════════════════════════════
  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Gia sư';
  const partnerRole = isMentor ? 'Học viên' : 'Gia sư';
  const partnerAvatar = isMentor
    ? booking.learnerAvatar || LogoImage
    : booking.mentorAvatar || LogoImage;
  const partnerTrustScore = isMentor
    ? booking.learnerTrustScore ?? 100
    : booking.mentorTrustScore ?? 100;

  // ════════════════════════════════════════════════════════════════
  // 3. DATE & TIME FORMATTING
  // ════════════════════════════════════════════════════════════════
  const startDate = new Date(booking.scheduledStart);
  const endDate = new Date(booking.scheduledEnd);
  const createdAtDate = new Date(booking.createdAt);

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[startDate.getDay()];
  const dateFormatted = `${dayName}, ${String(startDate.getDate()).padStart(2, '0')}/${String(
    startDate.getMonth() + 1,
  ).padStart(2, '0')}/${startDate.getFullYear()}`;

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const timeRange = `${formatTime(startDate)} - ${formatTime(endDate)}`;

  const createdTime = `${formatTime(createdAtDate)} ${String(createdAtDate.getDate()).padStart(
    2,
    '0',
  )}/${String(createdAtDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Section: Avatar with Overlay Trust Badge + Content */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Avatar with Floating Trust Badge Overlay */}
          <div className="relative shrink-0 pb-1">
            <img
              src={partnerAvatar}
              alt={partnerName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = LogoImage;
              }}
              className="w-11 h-11 rounded-full object-cover border border-gray-200"
            />
            <div
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full px-1.5 py-0 text-[10px] font-extrabold shadow-2xs flex items-center gap-0.5 whitespace-nowrap"
              title={`Điểm uy tín: ${partnerTrustScore}`}
            >
              <Shield className="w-2.5 h-2.5 text-emerald-600 shrink-0 fill-emerald-100" />
              <span>{partnerTrustScore}</span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">

            {/* Title & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenDetail?.(booking)}
                className="text-base font-semibold text-gray-900 hover:text-primary-700 transition-colors truncate text-left cursor-pointer"
              >
                {booking.title || 'Buổi kèm học 1-1'}
              </button>

              {isPendingForMe && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                  <span>Chờ bạn xác nhận</span>
                  {countdownStr && (
                    <span className="text-[11px] font-mono text-amber-800">
                      (hết hạn sau {countdownStr})
                    </span>
                  )}
                </span>
              )}

              {isWaitingOther && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 inline-flex items-center gap-1">
                  <span>Chờ phản hồi</span>
                  {countdownStr && (
                    <span className="text-[11px] font-mono text-gray-500">
                      (hết hạn sau {countdownStr})
                    </span>
                  )}
                </span>
              )}

              {isConfirmed && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã xác nhận
                </span>
              )}

              {isCompleted && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  Hoàn thành
                </span>
              )}

              {isExpired && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  Đã quá hạn
                </span>
              )}

              {isCancelledOrRejected && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  {booking.status === BookingStatus.REJECTED ? 'Đã từ chối' : 'Đã hủy'}
                </span>
              )}
            </div>

            {/* Partner Info & Schedule */}
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-gray-600">
              {/* Partner Name */}
              <span className="text-gray-700">
                <span>{partnerRole}: </span>
                <span className="font-semibold text-gray-900">{partnerName}</span>
              </span>

              <span className="text-gray-300">•</span>

              {/* Date */}
              <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {dateFormatted}
              </span>

              <span className="text-gray-300">•</span>

              {/* Time Range */}
              <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{timeRange}</span>
                <span className="text-gray-500 font-normal">({booking.durationMinutes} phút)</span>
              </span>

              <span className="text-gray-300">•</span>

              {/* Created At */}
              <span className="text-gray-400 text-[11px]">Đặt: {createdTime}</span>
            </div>


            {/* Note if available */}
            {booking.note && (
              <p className="text-xs text-gray-500 italic pt-0.5 truncate">
                "{booking.note}"
              </p>
            )}

            {/* Cancellation reason if available */}
            {booking.cancellationReason && (isCancelledOrRejected || isExpired) && (
              <p className="text-xs text-rose-600 font-medium pt-0.5">
                Lý do: {booking.cancellationReason}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Price & Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <div className="text-sm sm:text-base font-bold text-gray-900">
            {booking.totalCreditEscrowed} <span className="text-xs font-medium text-gray-500">Credit</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Case 1: Pending for me */}
            {isPendingForMe && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onAccept?.(booking.id)}
                  disabled={isAccepting}
                  className="rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-xs py-1.5 px-3 cursor-pointer"
                >
                  {isAccepting ? 'Đang xử lý...' : 'Chấp nhận'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(booking.id)}
                  disabled={isRejecting}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-medium text-xs py-1.5 px-2.5 cursor-pointer"
                >
                  {isRejecting ? 'Đang xử lý...' : 'Từ chối'}
                </Button>
              </>
            )}

            {/* Case 2: Waiting for other party */}
            {isWaitingOther && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancel?.(booking.id)}
                disabled={isCancelling}
                className="rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 border-0 text-gray-600 font-medium text-xs py-1.5 px-3 cursor-pointer"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
              </Button>
            )}

            {/* Case 3: Confirmed / Upcoming */}
            {isConfirmed && (() => {
              const canJoin = checkBookingSessionJoinable(booking);
              return (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!canJoin}
                    onClick={() => canJoin && onJoinRoom?.(booking.id)}
                    className={`rounded-lg font-medium text-xs py-1.5 px-3 flex items-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white ${
                      !canJoin
                        ? 'opacity-40 cursor-not-allowed pointer-events-none'
                        : 'cursor-pointer'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vào phòng học</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage?.(booking.id)}
                    className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-1.5 px-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    <span>Nhắn tin</span>
                  </Button>

                  {/* Ẩn nút Hủy khi buổi học đã đến giờ hoặc đang diễn ra */}
                  {!canJoin && booking.status !== BookingStatus.STARTED && (
                    <button
                      type="button"
                      onClick={() => onCancel?.(booking.id)}
                      disabled={isCancelling}
                      className="text-xs text-gray-400 hover:text-red-600 font-medium px-1.5 py-1 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  )}
                </>
              );
            })()}

            {/* Case 4: Completed */}
            {isCompleted && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage?.(booking.id)}
                  className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-1.5 px-2.5 cursor-pointer"
                >
                  Tin nhắn
                </Button>
                {/* Chỉ Học viên mới được đánh giá Người dạy */}
                {!isMentor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRate?.(booking)}
                    className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-1.5 px-3 cursor-pointer"
                  >
                    Đánh giá
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
