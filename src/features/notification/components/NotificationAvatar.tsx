import React from 'react';
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  Play,
  Coins,
  FileText,
  Bell,
  AlarmClock,
} from 'lucide-react';
import type { NotificationItem } from '../types';
import LogoImage from '@/assets/images/Logo.png';

interface NotificationAvatarProps {
  item: NotificationItem;
}

export const NotificationAvatar: React.FC<NotificationAvatarProps> = ({ item }) => {
  const notif = item.notification;
  const kind = (notif?.kind || '').toUpperCase();
  const sourceEvent = (notif?.sourceEvent || '').toUpperCase();
  const avatarUrl = notif?.avatarUrl;

  // 1. Chat & Direct Messages: ONLY Messages use sender Avatar
  if (
    kind === 'CHAT_MESSAGE' ||
    kind === 'BOOKING_MESSAGE' ||
    (kind.includes('CHAT') && !kind.includes('BOOKING_')) ||
    sourceEvent === 'CHAT_MESSAGE'
  ) {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src = LogoImage;
          }}
          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 shadow-2xs"
        />
      );
    }

    const match = (notif?.title || '').match(/từ\s+([^,]+)/i);
    const name = match ? match[1].trim() : notif?.title || 'U';
    const initial = name.charAt(0).toUpperCase();

    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
        {initial}
      </div>
    );
  }

  // 2. Booking Reminder / Lịch sắp diễn ra
  if (kind === 'BOOKING_REMINDER' || sourceEvent.includes('REMINDER')) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
        <AlarmClock className="w-4 h-4" />
      </div>
    );
  }

  // 2. Booking: Request / Created / Offer
  if (
    kind === 'BOOKING_CREATED' ||
    kind === 'BOOKING_REQUEST' ||
    kind === 'BOOKING_OFFER' ||
    sourceEvent.includes('REQUEST') ||
    sourceEvent.includes('OFFER')
  ) {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <CalendarPlus className="w-4 h-4" />
      </div>
    );
  }

  // 3. Booking: Accepted / Confirmed
  if (
    kind === 'BOOKING_ACCEPTED' ||
    kind === 'BOOKING_CONFIRMED' ||
    sourceEvent.includes('ACCEPTED') ||
    sourceEvent.includes('CONFIRMED')
  ) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <CalendarCheck className="w-4 h-4" />
      </div>
    );
  }

  // 4. Booking: Started
  if (kind === 'BOOKING_STARTED' || sourceEvent.includes('STARTED')) {
    return (
      <div className="w-8 h-8 rounded-full bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
      </div>
    );
  }

  // 5. Booking: Completed
  if (kind === 'BOOKING_COMPLETED' || sourceEvent.includes('COMPLETED')) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCheck className="w-4 h-4" />
      </div>
    );
  }

  // 6. Booking: Cancelled / Rejected / No-Show
  if (
    kind === 'BOOKING_CANCELLED' ||
    kind === 'BOOKING_REJECTED' ||
    kind === 'BOOKING_NO_SHOW' ||
    sourceEvent.includes('CANCEL') ||
    sourceEvent.includes('REJECT') ||
    sourceEvent.includes('NO_SHOW')
  ) {
    return (
      <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
        <CalendarX className="w-4 h-4" />
      </div>
    );
  }

  // 7. General Booking Fallback
  if (kind.includes('BOOKING') || sourceEvent.includes('BOOKING')) {
    return (
      <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
        <Calendar className="w-4 h-4" />
      </div>
    );
  }

  // 8. Wallet / Reward / Daily Streak / Credit
  if (
    kind.includes('WALLET') ||
    kind.includes('STREAK') ||
    kind.includes('REWARD') ||
    sourceEvent.includes('WALLET') ||
    sourceEvent.includes('STREAK')
  ) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
        <Coins className="w-4 h-4" />
      </div>
    );
  }

  // 9. Post notifications
  if (kind.includes('POST') || sourceEvent.includes('POST')) {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-4 h-4" />
      </div>
    );
  }

  // 10. Default / System
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
      <Bell className="w-4 h-4" />
    </div>
  );
};
