import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, LogOut, Crown, UserCheck, Video, Zap, Loader2 } from 'lucide-react';
import type { ActiveGroupRoomItem } from '@/features/session/types';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants';

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
  const coverUrl = room.coverImage || FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;

  // Format thời gian đã mở phòng tự nhiên
  const formatTimeElapsed = () => {
    if (!room.openedAt) return 'Vừa mới mở';
    try {
      const opened = new Date(room.openedAt).getTime();
      const diffMin = Math.floor((Date.now() - opened) / 60000);
      if (diffMin < 2) return 'Vừa mới mở';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch {
      return 'Đang diễn ra';
    }
  };

  const handleEnterRoom = () => {
    navigate(`/rooms/group/${room.roomId}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-[border-color,box-shadow] duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT PART: Thumbnail + Info */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
        {/* 1. Thumbnail Live Preview */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleEnterRoom}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEnterRoom();
            }
          }}
          className="w-full sm:w-44 md:w-48 h-28 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border border-slate-100 select-none shadow-2xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={`Vào phòng học: ${room.title}`}
        >
          <img
            src={coverUrl}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_POST_COVER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

          {/* Top-Left: LIVE Badge duy nhất */}
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />
            LIVE
          </span>

          {/* Bottom-Left: Số người đang tham gia / Tối đa */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xs z-10">
            <Users className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>
              <strong className="text-white font-bold">{room.currentParticipants || 1}</strong>
              <span className="text-slate-300">/{room.maxParticipants || 10}&nbsp;người</span>
            </span>
          </div>
        </div>

        {/* 2. Room Information */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Badges row: Chuyên mục + Vai trò */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/80">
              {categoryLabel}
            </span>

            {isHost ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold">
                <Crown className="w-3 h-3 text-blue-600" aria-hidden="true" />
                <span>Host (Phòng của bạn)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 text-[10px] font-semibold">
                <UserCheck className="w-3 h-3 text-slate-500" aria-hidden="true" />
                <span>Thành viên tham gia</span>
              </span>
            )}
          </div>

          {/* Room Title */}
          <h3
            onClick={handleEnterRoom}
            className="text-base font-bold text-slate-900 group-hover:text-primary-700 cursor-pointer transition-colors leading-snug line-clamp-1 sm:line-clamp-2 text-pretty"
            title={room.title}
          >
            {room.title}
          </h3>

          {/* Meta details: Thời gian mở + Mức phí */}
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Đã mở {formatTimeElapsed()}</span>
            </span>

            <span className="text-slate-300" aria-hidden="true">•</span>

            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
              <Zap className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              <span>1&nbsp;cr/phút (5p đầu miễn phí)</span>
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
          <button
            type="button"
            disabled={isClosing}
            onClick={() => onCloseRoom(room.roomId)}
            className="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-600 font-semibold text-xs px-3.5 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500/30"
            title="Đóng phiên học nhóm này"
          >
            {isClosing ? (
              <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Đóng phòng</span>
          </button>
        )}

        {/* Nút Vào phòng học ngay */}
        <button
          type="button"
          onClick={handleEnterRoom}
          className="rounded-xl bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-bold text-xs px-5 py-2.5 shadow-xs hover:shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500/30"
        >
          <Video className="w-3.5 h-3.5 text-white/90" aria-hidden="true" />
          <span>Vào phòng học ngay</span>
        </button>
      </div>
    </div>
  );
};
