import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Tag, Radio, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import type { ActiveGroupRoomItem } from '../../types';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants';

interface GroupRoomCardProps {
  room: ActiveGroupRoomItem;
  currentUserId?: string;
  onCloseRoom?: (roomId: string) => void;
  isClosing?: boolean;
}

export const GroupRoomCard: React.FC<GroupRoomCardProps> = ({
  room,
  currentUserId,
  onCloseRoom,
  isClosing = false,
}) => {
  const navigate = useNavigate();
  const isHost = Boolean(currentUserId && room.mentorId && String(currentUserId) === String(room.mentorId));

  const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
  const categoryLabel = SKILL_CATEGORY_LABELS[rawCat] || room.category || 'Lập trình';
  const coverUrl = room.coverImage || FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;

  const skillTags = room.skills && room.skills.length > 0 ? room.skills : [];
  const mentorDisplayName = room.mentorName || 'Người hướng dẫn';
  const mentorDisplayTitle = room.mentorTitle || (room.category ? `Chuyên môn: ${categoryLabel}` : 'Người hướng dẫn');

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-4.5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-primary-400">
      <div>
        {/* 1. Cover Image & Badges */}
        <div
          onClick={() => navigate(`/rooms/group/${room.roomId}`)}
          className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 select-none cursor-pointer"
        >
          <img
            src={coverUrl}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left: Category Tag */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
            {categoryLabel}
          </span>

          {/* Top Right: Live Pulse Badge */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-red-600/90 backdrop-blur-md text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5 animate-pulse">
            <Radio className="w-3 h-3 text-white" />
            <span>LIVE</span>
          </span>

          {/* Bottom Left: Live Participants & Credit Rate */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-sm">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{room.currentParticipants || 1} người học</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-amber-300 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>1 cr/phút</span>
            </div>
          </div>
        </div>

        {/* 2. Body Info */}
        <div className="px-1 pt-3.5 space-y-2.5">
          {/* Author Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {room.mentorAvatar ? (
                <img
                  src={room.mentorAvatar}
                  alt={mentorDisplayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0 border border-primary-200">
                  {mentorDisplayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {mentorDisplayName}
                </h4>
                <span className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                  {mentorDisplayTitle}
                </span>
              </div>
            </div>

            {/* Badges on right: Host badge & Trust Score (Điểm uy tín) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Host Badge */}
              {isHost && (
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold shrink-0">
                  Phòng của bạn
                </span>
              )}

              {/* Trust Score Badge (Điểm uy tín) */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold shrink-0"
                title="Điểm uy tín người hướng dẫn"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{room.mentorTrustScore ?? 100}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigate(`/rooms/group/${room.roomId}`)}
            className="text-base font-bold text-slate-900 line-clamp-2 leading-snug tracking-tight cursor-pointer group-hover:text-primary-700 transition-colors"
          >
            {room.title}
          </h3>

          {/* Skill Tag Pills */}
          {skillTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skillTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Action CTA */}
      <div className="px-1 pt-3.5 mt-2 flex items-center gap-2 border-t border-slate-100">
        {/* Nút Đóng phòng (Nếu là Host) */}
        {isHost && onCloseRoom && (
          <button
            type="button"
            disabled={isClosing}
            onClick={() => onCloseRoom(room.roomId)}
            className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200/70 flex items-center justify-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            title="Đóng phòng học này"
          >
            {isClosing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Đóng</span>
          </button>
        )}

        {/* Nút Vào phòng học */}
        <button
          type="button"
          onClick={() => navigate(`/rooms/group/${room.roomId}`)}
          className="flex-1 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-bold text-xs transition-all text-center block shadow-xs cursor-pointer"
        >
          Vào phòng học ngay
        </button>
      </div>
    </div>
  );
};
