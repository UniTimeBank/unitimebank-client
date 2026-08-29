import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, LogOut, Radio, Crown, UserCheck } from 'lucide-react';
import type { ActiveGroupRoomItem } from '@/features/session/types';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants';
import { Button } from '@/shared/components/ui';

export interface ManageGroupRoomCardProps {
  room: ActiveGroupRoomItem;
  currentUserId?: string;
  onCloseRoom?: (roomId: string) => void;
  isClosing?: boolean;
}

export const ManageGroupRoomCard: React.FC<ManageGroupRoomCardProps> = ({
  room,
  currentUserId,
  onCloseRoom,
  isClosing = false,
}) => {
  const navigate = useNavigate();
  const isHost = Boolean(currentUserId && room.mentorId && String(currentUserId) === String(room.mentorId));

  const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
  const categoryLabel = (SKILL_CATEGORY_LABELS[rawCat] || room.category || 'HỌC NHÓM').toUpperCase();
  const coverUrl = FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;

  // Format thời gian đã mở phòng
  const formatTimeElapsed = () => {
    if (!room.openedAt) return 'Vừa bắt đầu';
    try {
      const opened = new Date(room.openedAt).getTime();
      const diffMin = Math.floor((Date.now() - opened) / 60000);
      if (diffMin < 5) return 'Vừa mới mở';
      if (diffMin < 60) return `Đã mở ${diffMin} phút trước`;
      const diffHours = Math.floor(diffMin / 60);
      return `Đã mở ${diffHours} giờ trước`;
    } catch {
      return 'Đang diễn ra';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT PART: Thumbnail + Info */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
        {/* 1. Thumbnail */}
        <div className="w-full sm:w-44 md:w-48 h-32 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 select-none">
          <img
            src={coverUrl}
            alt={room.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

          {/* Top-Left: LIVE Badge */}
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>

          {/* Bottom-Left: Participants count */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>{room.currentParticipants || 1} người học</span>
          </div>
        </div>

        {/* 2. Room Information */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Badges row: Category + Role + Live status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/80">
              {categoryLabel}
            </span>

            {isHost ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                <Crown className="w-3 h-3 text-blue-600" />
                <span>Host (Phòng của bạn)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                <UserCheck className="w-3 h-3 text-slate-500" />
                <span>Thành viên tham gia</span>
              </span>
            )}

            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang trực tiếp
            </span>
          </div>

          {/* Room Title */}
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 sm:line-clamp-2">
            {room.title}
          </h3>

          {/* Meta details: Time elapsed, Rate, Max capacity */}
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimeElapsed()}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Tối đa {room.maxParticipants || 20} người</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 text-[11px]">
              1 cr/phút (5p đầu miễn phí)
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PART: Action CTAs */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        {/* Nút Đóng phòng (Chỉ hiển thị nếu là Host) */}
        {isHost && onCloseRoom && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isClosing}
            onClick={() => onCloseRoom(room.roomId)}
            className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-none w-full sm:w-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đóng phòng</span>
          </Button>
        )}

        {/* Nút Vào phòng học */}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate(`/rooms/group/${room.roomId}`)}
          className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-5 py-2.5 shadow-xs w-full sm:w-auto cursor-pointer"
        >
          <span>Vào phòng học ngay</span>
        </Button>
      </div>
    </div>
  );
};
