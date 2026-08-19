import React from 'react';
import { BookingStatus, type BookingItem } from '../types';
import { Button } from '@/shared/components/ui';
import LogoImage from '@/assets/images/Logo.png';

export interface BookingCardProps {
  booking: BookingItem;
  currentUserId?: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoinRoom?: (id: string) => void;
  onMessage?: (id: string) => void;
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

  // Tính thời gian còn lại trước khi hết hạn 24 giờ
  const hoursLeft = React.useMemo(() => {
    if (!isPendingForMe && !isWaitingOther) return null;
    const createdAtMs = new Date(booking.createdAt).getTime();
    const expiresAtMs = createdAtMs + 24 * 60 * 60 * 1000;
    const diffMs = expiresAtMs - Date.now();
    if (diffMs <= 0) return 'sắp hết hạn';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `hết hạn sau ${hours}h`;
    return `hết hạn sau ${mins}m`;
  }, [isPendingForMe, isWaitingOther, booking.createdAt]);

  // Partner info
  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Người hướng dẫn';
  const partnerRole = isMentor ? 'Học viên' : 'Người hướng dẫn';
  const partnerAvatar = isMentor
    ? booking.learnerAvatar || LogoImage
    : booking.mentorAvatar || LogoImage;

  // Format date & time
  const startDate = new Date(booking.scheduledStart);
  const endDate = new Date(booking.scheduledEnd);

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[startDate.getDay()];
  const dateFormatted = `${dayName}, ${String(startDate.getDate()).padStart(2, '0')}/${String(
    startDate.getMonth() + 1,
  ).padStart(2, '0')}/${startDate.getFullYear()}`;

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const timeRange = `${formatTime(startDate)} - ${formatTime(endDate)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: User Avatar + Booking Details */}
        <div className="flex items-start gap-3.5 min-w-0">
          <img
            src={partnerAvatar}
            alt={partnerName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = LogoImage;
            }}
            className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-200"
          />

          <div className="space-y-1 min-w-0">
            {/* Title & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {booking.title || 'Buổi kèm học 1-1'}
              </h3>

              {isPendingForMe && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span>Chờ bạn xác nhận</span>
                  {hoursLeft && <span className="text-[11px] font-normal text-amber-600">({hoursLeft})</span>}
                </span>
              )}

              {isWaitingOther && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                  <span>Chờ phản hồi</span>
                  {hoursLeft && <span className="text-[11px] font-normal text-gray-500">({hoursLeft})</span>}
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

            {/* Subline: Partner + Date & Time */}
            <div className="flex items-center flex-wrap gap-x-2 text-xs text-gray-500">
              <span>
                {partnerRole}: <span className="font-medium text-gray-800">{partnerName}</span>
              </span>
              <span>•</span>
              <span>{dateFormatted}</span>
              <span>•</span>
              <span>{timeRange} ({booking.durationMinutes} phút)</span>
            </div>

            {/* Cancellation / Expiration Reason */}
            {booking.cancellationReason && (isCancelledOrRejected || isExpired) && (
              <p className="text-xs text-rose-600 font-medium truncate pt-0.5">
                Lý do: {booking.cancellationReason}
              </p>
            )}

            {/* Note if available */}
            {booking.note && (
              <p className="text-xs text-gray-500 italic truncate pt-0.5">
                "{booking.note}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Price & Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <div className="text-sm sm:text-base font-bold text-gray-900">
            {booking.totalCreditEscrowed} <span className="text-xs font-medium text-gray-500">Credit</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Case 1: Pending for me */}
            {isPendingForMe && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onAccept?.(booking.id)}
                  disabled={isAccepting}
                  className="rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-xs py-1.5 px-3"
                >
                  {isAccepting ? 'Đang xử lý...' : 'Chấp nhận'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(booking.id)}
                  disabled={isRejecting}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-medium text-xs py-1.5 px-2.5"
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
                className="rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 border-0 text-gray-600 font-medium text-xs py-1.5 px-3"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
              </Button>
            )}

            {/* Case 3: Confirmed / Upcoming */}
            {isConfirmed && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onJoinRoom?.(booking.id)}
                  className="rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-xs py-1.5 px-3"
                >
                  Vào phòng học
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage?.(booking.id)}
                  className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-1.5 px-2.5"
                >
                  Nhắn tin
                </Button>

                <button
                  type="button"
                  onClick={() => onCancel?.(booking.id)}
                  disabled={isCancelling}
                  className="text-xs text-gray-400 hover:text-red-600 font-medium px-1.5 py-1 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </>
            )}

            {/* Case 4: Completed */}
            {isCompleted && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs py-1.5 px-3"
              >
                Đánh giá
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
