import React from 'react';
import {
  Calendar,
  Clock,
  Coins,
  User,
  ShieldCheck,
  MessageSquare,
  Video,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { BookingStatus, type BookingItem } from '@/features/management/types';
import LogoImage from '@/assets/images/Logo.png';

export interface BookingDetailModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onOpenChat?: (booking: BookingItem) => void;
  onJoinRoom?: (bookingId: string) => void;
  onOpenCancel?: (bookingId: string) => void;
  onAccept?: (bookingId: string) => void;

  onReject?: (bookingId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  currentUserId,
  onOpenChat,
  onJoinRoom,
  onOpenCancel,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}) => {
  if (!booking) return null;

  const isMentor = currentUserId ? booking.mentorId === currentUserId : false;
  const isPendingForMe =
    (booking.status === BookingStatus.PENDING_MENTOR_APPROVAL && isMentor) ||
    (booking.status === BookingStatus.PENDING_LEARNER_APPROVAL && !isMentor);

  const isConfirmed =
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.STARTED;

  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Người hướng dẫn';
  const partnerRole = isMentor ? 'Học viên' : 'Gia sư';
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

  const getStatusBadge = () => {
    switch (booking.status) {
      case BookingStatus.PENDING_MENTOR_APPROVAL:
      case BookingStatus.PENDING_LEARNER_APPROVAL:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Chờ phê duyệt
          </span>
        );
      case BookingStatus.CONFIRMED:
      case BookingStatus.STARTED:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã xác nhận (Ký quỹ thành công)
          </span>
        );
      case BookingStatus.COMPLETED:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Đã hoàn thành
          </span>
        );
      case BookingStatus.EXPIRED:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Hết hạn sau 24h
          </span>
        );
      case BookingStatus.CANCELLED:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            Đã hủy
          </span>
        );
      case BookingStatus.REJECTED:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            Đã từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết buổi học"
      description="Thông tin lịch trình, đối tác và trạng thái ký quỹ Credit"
      size="lg"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Header Capsule */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wider block mb-1">
              TIÊU ĐỀ BUỔI HỌC
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{booking.title || 'Buổi học 1-1'}</h3>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Partner Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={partnerAvatar}
              alt={partnerName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = LogoImage;
              }}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {partnerRole}
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm truncate">{partnerName}</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Vai trò của bạn: <strong>{isMentor ? 'Gia sư' : 'Học viên'}</strong>
              </p>
            </div>
          </div>

          {(isConfirmed || booking.status === BookingStatus.COMPLETED) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenChat?.(booking);
              }}
              className="rounded-xl border-slate-200 text-slate-700 font-bold text-xs shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary-600" />
              <span>Nhắn tin</span>
            </Button>
          )}
        </div>


        {/* Schedule & Escrow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>Thời gian học</span>
            </div>
            <p className="text-slate-600 font-semibold">{dateFormatted}</p>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRange} ({booking.durationMinutes} phút)</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Ký quỹ Credit</span>
            </div>
            <p className="text-slate-900 font-extrabold text-sm">
              {booking.totalCreditEscrowed} Credit
            </p>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo vệ Escrow (1 phút = 1 Credit)</span>
            </div>
          </div>
        </div>

        {/* Note / Message */}
        {booking.note && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Lời nhắn / Yêu cầu từ người đặt:</span>
            </div>
            <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
              "{booking.note}"
            </p>
          </div>
        )}

        {/* Cancellation Reason if cancelled */}
        {booking.cancellationReason && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lý do hủy / từ chối:</span>
              <p className="text-[11px] text-rose-700 mt-0.5">{booking.cancellationReason}</p>
            </div>
          </div>
        )}

        {/* Actions Bottom Bar */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="rounded-xl border-slate-200 text-slate-700 font-bold text-xs"
          >
            Đóng
          </Button>

          {isPendingForMe && (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onReject?.(booking.id);
                }}
                disabled={isRejecting}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                {isRejecting ? 'Đang xử lý...' : 'Từ chối'}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onAccept?.(booking.id);
                }}
                disabled={isAccepting}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-5 shadow-xs"
              >
                {isAccepting ? 'Đang xử lý...' : 'Chấp nhận & Ký quỹ'}
              </Button>
            </>
          )}

          {isConfirmed && (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenCancel?.(booking.id);
                }}

                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
              >
                Hủy buổi học
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onJoinRoom?.(booking.id);
                }}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-5 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Vào phòng học</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
