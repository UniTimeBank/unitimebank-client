import React from 'react';
import {
  Mic,
  MicOff,
  MoreVertical,
  VolumeX,
  UserMinus,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import type { ParticipantItemData } from '../../hooks/useInRoomParticipants';
import { useGetPublicProfileQuery } from '@/core/api/user';

interface ParticipantItemProps {
  item: ParticipantItemData;
  isCurrentUserHost: boolean;
  isMenuOpen: boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: () => void;
  onMute?: (userId: string) => void;
  onOpenKickModal: (userId: string, userName: string) => void;
  onOpenBlockModal: (userId: string, userName: string) => void;
  onReport?: (userId: string, userName: string) => void;
}

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  item,
  isCurrentUserHost,
  isMenuOpen,
  menuRef,
  onToggleMenu,
  onMute,
  onOpenKickModal,
  onOpenBlockModal,
  onReport,
}) => {
  const {
    participant,
    participantId,
    displayName,
    avatarUrl,
    initialLetter,
    isHost,
    isSelf,
    activeMinutes,
    credits,
  } = item;

  // Lấy thông tin profile công khai nếu thiếu tên thật hoặc thiếu avatar
  const needsProfileFetch =
    !isSelf &&
    Boolean(participantId) &&
    (!avatarUrl || !displayName || displayName === 'Thành viên' || displayName.startsWith('Học viên'));

  const { data: publicProfile } = useGetPublicProfileQuery(participantId, {
    skip: !needsProfileFetch,
  });

  const finalDisplayName = publicProfile?.displayName || displayName;
  const finalAvatarUrl = publicProfile?.avatarUrl || avatarUrl;
  const finalInitialLetter = (finalDisplayName || 'U').charAt(0).toUpperCase();

  // Quyền thao tác menu 3 chấm: Chỉ Host được thao tác trên học viên khác (không phải chính mình và không phải host)
  const canModerate = isCurrentUserHost && !isSelf && !isHost;

  return (
    <div
      className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
        isHost
          ? 'bg-amber-50/20 border-amber-200/50'
          : isSelf
          ? 'bg-slate-50/60 border-slate-200/70'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/40'
      }`}
    >
      {/* Left: Avatar + Name + Badges */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar */}
        <div className="relative shrink-0">
          {finalAvatarUrl ? (
            <img
              src={finalAvatarUrl}
              alt={finalDisplayName}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                isHost
                  ? 'bg-amber-100/80 text-amber-800 border-amber-200'
                  : isSelf
                  ? 'bg-slate-100 text-slate-800 border-slate-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80'
              }`}
            >
              {finalInitialLetter}
            </div>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
        </div>

        {/* Name & Badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
              {finalDisplayName}
            </span>

            {isHost ? (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/70">
                Chủ phòng
              </span>
            ) : isSelf ? (
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                Bạn
              </span>
            ) : null}
          </div>

          {/* Thời gian học & Credit nếu là Host đang xem học viên */}
          {isCurrentUserHost && !isHost && (activeMinutes !== undefined || credits !== undefined) && (
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
              {activeMinutes !== undefined && <span>{activeMinutes} phút</span>}
              {credits !== undefined && (
                <span className="text-emerald-600 font-medium">{credits} Credit</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Mic Status & 3-Dots Menu (Host Only) */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {/* Mic Status Icon */}
        <div
          className={`p-1.5 rounded-lg text-xs ${
            participant.isMicrophoneEnabled
              ? 'text-slate-600 bg-slate-100'
              : 'text-rose-500 bg-rose-50'
          }`}
          title={participant.isMicrophoneEnabled ? 'Micro đang bật' : 'Micro đang tắt'}
        >
          {participant.isMicrophoneEnabled ? (
            <Mic className="w-3.5 h-3.5" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
        </div>

        {/* 3-Dots Action Button: ONLY for Host when targeting other participants */}
        {canModerate && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Tùy chọn quản trị"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Floating Action Menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs"
              >
                {/* 1. Mute */}
                {onMute && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMenu();
                      onMute(participantId);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tắt tiếng micro</span>
                  </button>
                )}

                {/* 2. Kick */}
                <button
                  type="button"
                  onClick={() => onOpenKickModal(participantId, finalDisplayName)}
                  className="w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50/60 flex items-center gap-2 cursor-pointer"
                >
                  <UserMinus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mời ra khỏi phòng</span>
                </button>

                {/* 3. Ban / Block */}
                <button
                  type="button"
                  onClick={() => onOpenBlockModal(participantId, finalDisplayName)}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50/60 flex items-center gap-2 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  <span>Cấm vào phòng</span>
                </button>

                {/* 4. Report */}
                {onReport && (
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => onReport(participantId, finalDisplayName)}
                      className="w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Báo cáo vi phạm</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
