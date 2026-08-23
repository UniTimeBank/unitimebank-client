import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import type { BookingItem } from '@/core/api/booking/bookingApi';
import type { PartnerInfo } from '../../hooks/useMessagesManagement';
import LogoImage from '@/assets/images/Logo.png';

interface ChatRoomHeaderProps {
  booking: BookingItem;
  partner: PartnerInfo;
  onViewProfile: (partnerId?: string) => void;
  onOpenDetail: () => void;
  onRefreshMessages: () => void;
  isFetching: boolean;
}

export const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  booking,
  partner,
  onViewProfile,
  onOpenDetail,
  onRefreshMessages,
  isFetching,
}) => {
  return (
    <div className="p-3.5 sm:px-6 sm:py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white shrink-0">
      {/* Partner Profile snapshot (Clickable avatar and name to view profile) */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={() => onViewProfile(partner.id)}
          className="relative shrink-0 cursor-pointer hover:opacity-85 transition-opacity group"
          title={`Xem hồ sơ của ${partner.name}`}
        >
          <img
            src={partner.avatar}
            alt={partner.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = LogoImage;
            }}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-primary-500 transition-colors"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onViewProfile(partner.id)}
              className="text-sm font-bold text-gray-900 truncate hover:text-primary-700 cursor-pointer hover:underline transition-colors"
              title={`Xem hồ sơ của ${partner.name}`}
            >
              {partner.name}
            </h3>
            <span className="text-[9px] px-2 py-0.2 rounded-md bg-sky-50 text-sky-700 font-extrabold uppercase tracking-wide border border-sky-200/60">
              {partner.role}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">
            Buổi học: <strong className="text-gray-700">{booking.title || '1-1 Session'}</strong> ({booking.durationMinutes} phút)
          </p>
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenDetail}
          className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary-200/80 bg-primary-50/90 hover:bg-primary-100 text-primary-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-primary-700" />
          <span>Chi tiết lịch học</span>
        </button>

        <button
          type="button"
          onClick={onRefreshMessages}
          title="Làm mới tin nhắn"
          className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary-700' : ''}`} />
        </button>
      </div>
    </div>
  );
};
