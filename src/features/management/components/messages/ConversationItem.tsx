import React from 'react';
import { type BookingItem, BookingStatus } from '@/core/api/booking/bookingApi';
import type { PartnerInfo } from '../../hooks/useMessagesManagement';
import LogoImage from '@/assets/images/Logo.png';

interface ConversationItemProps {
  booking: BookingItem;
  partner: PartnerInfo;
  isSelected: boolean;
  onSelect: (bookingId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  booking,
  partner,
  isSelected,
  onSelect,
}) => {
  const formatBookingDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case BookingStatus.COMPLETED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Đã hoàn thành
          </span>
        );
      case BookingStatus.CANCELLED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Đã hủy
          </span>
        );
      case BookingStatus.REJECTED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-50 text-red-700 border border-red-200">
            Đã từ chối
          </span>
        );
      case BookingStatus.EXPIRED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Hết hạn
          </span>
        );
      case BookingStatus.NO_SHOW:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            Vắng mặt
          </span>
        );
      case BookingStatus.STARTED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            Đang diễn ra
          </span>
        );
      case BookingStatus.CONFIRMED:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã xác nhận
          </span>
        );
      case BookingStatus.PENDING_MENTOR_APPROVAL:
      case BookingStatus.PENDING_LEARNER_APPROVAL:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Chờ duyệt
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-100 text-gray-600">
            {partner.role}
          </span>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(booking.id)}
      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer relative ${
        isSelected
          ? 'bg-primary-50/70 border-l-4 border-primary-700'
          : 'hover:bg-gray-50/80'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <img
          src={partner.avatar}
          alt={partner.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = LogoImage;
          }}
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`text-xs font-bold truncate ${
              isSelected ? 'text-primary-900' : 'text-gray-900'
            }`}
          >
            {partner.name}
          </h4>
          <span className="text-[10px] font-medium text-gray-400 shrink-0">
            {formatBookingDate(booking.scheduledStart)}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 font-medium truncate">
          {booking.title || 'Buổi kèm học 1-1'}
        </p>

        <div className="flex items-center gap-1.5 pt-0.5">
          {getStatusBadge()}
          <span className="text-[10px] text-gray-400">• {booking.durationMinutes}p</span>
        </div>
      </div>
    </button>
  );
};
