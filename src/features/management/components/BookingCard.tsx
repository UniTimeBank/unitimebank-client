import React from 'react';
import { Calendar, Clock, Check, X, Hourglass, Video, MessageSquare } from 'lucide-react';
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
  const isCancelledOrRejected =
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.REJECTED ||
    booking.status === BookingStatus.NO_SHOW;

  // Partner Info (If I am mentor -> show learner, If I am learner -> show mentor)
  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Người hướng dẫn';
  const partnerRoleLabel = isMentor ? 'NGƯỜI HỌC' : 'NGƯỜI HƯỚNG DẪN';
  const partnerAvatar = isMentor
    ? booking.learnerAvatar || LogoImage
    : booking.mentorAvatar || LogoImage;

  // Time parsing
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
  const hoursDuration = (booking.durationMinutes / 60).toFixed(1).replace('.0', '');

  // CreatedAt formatting
  const createdDate = new Date(booking.createdAt);
  const createdAtFormatted = `${formatTime(createdDate)}, ${String(createdDate.getDate()).padStart(
    2,
    '0',
  )}/${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

  const category = booking.category || 'KHOA HỌC MÁY TÍNH';
  const title = booking.title || 'Buổi kèm học 1-1';

  // Card accent stripe color with primary tokens
  const accentBorder = isPendingForMe
    ? 'border-l-primary-800'
    : isWaitingOther
    ? 'border-l-primary-500'
    : isConfirmed
    ? 'border-l-primary-600'
    : isCompleted
    ? 'border-l-emerald-600'
    : 'border-l-gray-300';

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs border border-gray-100 border-l-4 ${accentBorder} p-5 sm:p-6 transition-all hover:shadow-sm`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left & Middle: Info Block */}
        <div className="space-y-4 flex-1 min-w-0">
          {/* Top Badges: Category & Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider">
              {category}
            </span>

            {isPendingForMe && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-200/60">
                <Clock className="w-3.5 h-3.5 text-primary-600" />
                <span>Chờ xác nhận</span>
              </span>
            )}

            {isWaitingOther && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">
                <Hourglass className="w-3.5 h-3.5 text-gray-500" />
                <span>Chờ bạn xác nhận</span>
              </span>
            )}

            {isConfirmed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-100 text-primary-800 text-xs font-bold rounded-full border border-primary-300/60">
                <Calendar className="w-3.5 h-3.5 text-primary-700" />
                <span>Đã xác nhận</span>
              </span>
            )}

            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Đã hoàn thành</span>
              </span>
            )}

            {isCancelledOrRejected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
                <X className="w-3.5 h-3.5 text-red-600" />
                <span>
                  {booking.status === BookingStatus.REJECTED
                    ? 'Đã từ chối'
                    : booking.status === BookingStatus.NO_SHOW
                    ? 'Vắng mặt'
                    : 'Đã hủy'}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h3>
            {booking.note && (
              <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-1 italic">
                "{booking.note}"
              </p>
            )}
          </div>

          {/* Bottom Gray Capsule: Partner Info & Scheduled Time */}
          <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
            {/* Partner Info */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={partnerAvatar}
                alt={partnerName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LogoImage;
                }}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 bg-white"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  {partnerRoleLabel}
                </span>
                <span className="text-sm font-bold text-gray-900 truncate block">
                  {partnerName}
                </span>
              </div>
            </div>

            {/* Divider in sm */}
            <div className="hidden sm:block w-px h-8 bg-gray-200" />

            {/* Date & Time */}
            <div className="space-y-1 sm:text-right">
              <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-gray-800">
                <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{dateFormatted}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-gray-600">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  {timeRange} ({hoursDuration}h)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Price & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-end sm:items-center lg:items-end justify-between sm:justify-end gap-4 shrink-0 w-full lg:w-48 self-stretch lg:self-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
          {/* Price */}
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {booking.totalCreditEscrowed}{' '}
              <span className="text-base font-bold text-gray-700">CR</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium block">
              / {booking.durationMinutes} phút
            </span>
          </div>

          {/* Actions Column */}
          <div className="flex flex-col gap-2 w-full sm:w-auto lg:w-full min-w-[140px]">
            {/* State 1: Chờ bạn xác nhận (Accept / Reject) */}
            {isPendingForMe && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onAccept?.(booking.id)}
                  disabled={isAccepting}
                  className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-xs w-full"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isAccepting ? 'Đang xử lý...' : 'Chấp nhận'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(booking.id)}
                  disabled={isRejecting}
                  className="bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 w-full"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isRejecting ? 'Đang xử lý...' : 'Từ chối'}</span>
                </Button>
              </>
            )}

            {/* State 2: Chờ đối tác xác nhận (Requester waiting) */}
            {isWaitingOther && (
              <div className="text-right space-y-2 w-full">
                <span className="text-[11px] text-gray-400 font-medium block">
                  Đã gửi yêu cầu lúc {createdAtFormatted}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel?.(booking.id)}
                  disabled={isCancelling}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 border-0 text-gray-700 font-bold text-xs py-2.5 rounded-xl w-full"
                >
                  <span>{isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}</span>
                </Button>
              </div>
            )}

            {/* State 3: Sắp tới / Đã xác nhận (Join Room / Message / Cancel) */}
            {isConfirmed && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onJoinRoom?.(booking.id)}
                  className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-xs w-full"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Vào phòng học</span>
                </Button>

                <div className="flex gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage?.(booking.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Nhắn tin</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel?.(booking.id)}
                    disabled={isCancelling}
                    className="bg-gray-100 hover:bg-red-50 hover:text-red-600 border-0 text-gray-700 font-bold text-xs py-2 rounded-xl"
                  >
                    <span>Hủy</span>
                  </Button>
                </div>
              </>
            )}

            {/* State 4: Hoàn thành / Hủy (Xem chi tiết / Đánh giá) */}
            {isCompleted && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-bold text-xs py-2.5 rounded-xl w-full"
              >
                <span>Xem đánh giá</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
