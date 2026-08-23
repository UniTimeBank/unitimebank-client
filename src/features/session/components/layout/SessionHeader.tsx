import React from 'react';
import { GraduationCap } from 'lucide-react';
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
  onLeave?: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  title = 'Phòng học trực tuyến 1-1',
  roomType = 'ONE_ON_ONE',
  isRecording = true,
  userAvatar,
  userName = 'Thành viên',
  participantCount,
  currentBalance,
  onLeave,
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

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-semibold max-w-md truncate shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      </div>

      {/* Right: Notification Bell Dropdown + Profile Avatar */}
      <div className="flex items-center gap-3 shrink-0">
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
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-indigo-100 shadow-2xs">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
