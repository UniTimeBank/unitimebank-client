import React from 'react';
import { Clock3, Coins, GraduationCap } from 'lucide-react';
import LogoImage from '@/assets/images/Logo.png';
import { NotificationDropdown } from '@/features/notification';

interface SessionHeaderProps {
  title?: string;
  roomType?: 'ONE_ON_ONE' | 'GROUP';
  isRecording?: boolean;
  userAvatar?: string;
  userName?: string;
  participantCount?: number;
  currentBalance?: number;
  freeSecondsRemaining?: number;
  paidSeconds?: number;
  totalCreditsCharged?: number;
  onLeave?: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  title = 'Phòng học trực tuyến 1-1',
  roomType = 'ONE_ON_ONE',
  userAvatar,
  userName = 'Thành viên',
  participantCount,
  currentBalance,
  freeSecondsRemaining,
  paidSeconds = 0,
  totalCreditsCharged = 0,
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Brand + Separator + Subject Badge */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <img src={LogoImage} alt="UniTime Bank" className="h-8 w-auto object-contain" />
          <span className="font-extrabold text-lg tracking-tight text-slate-800 hidden sm:inline">
            UniTime Bank
          </span>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200/70 text-xs font-semibold max-w-md truncate shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-primary-600 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      </div>

      {/* Right: Notification Bell Dropdown + Profile Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {roomType === 'GROUP' && freeSecondsRemaining !== undefined && (
          freeSecondsRemaining > 0 ? (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs">
              <Clock3 className="h-3.5 w-3.5 text-emerald-600 shrink-0 animate-pulse" />
              <span>
                Miễn phí: {Math.floor(freeSecondsRemaining / 60).toString().padStart(2, '0')}:{(freeSecondsRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs">
              <Clock3 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>
                Trả phí: {Math.floor(paidSeconds / 60).toString().padStart(2, '0')}:{(paidSeconds % 60).toString().padStart(2, '0')}
                {totalCreditsCharged > 0 ? ` • -${totalCreditsCharged} Credit` : ' (1 Credit/phút)'}
              </span>
            </div>
          )
        )}

        {roomType === 'GROUP' && currentBalance !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <Coins className="h-3.5 w-3.5" />
            {currentBalance} Credit
          </div>
        )}

        {roomType === 'GROUP' && participantCount !== undefined && (
          <span className="hidden lg:inline text-xs font-medium text-slate-500">
            {participantCount} người
          </span>
        )}

        {/* Real-time Notification Dropdown */}
        <NotificationDropdown />

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-700 text-white font-bold text-xs flex items-center justify-center border-2 border-primary-100 shadow-2xs">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
