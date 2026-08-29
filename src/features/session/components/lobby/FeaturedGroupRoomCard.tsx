import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants/post.constants';

export interface GroupRoomDisplayItem {
  roomId: string;
  mentorId?: string;
  mentorName?: string;
  mentorAvatar?: string;
  mentorTitle?: string;
  title: string;
  category?: string;
  currentParticipants?: number;
  openedAt?: string;
  coverImage?: string;
  startTimeText?: string;
  status?: string;
}

interface FeaturedGroupRoomCardProps {
  room: GroupRoomDisplayItem;
}

export const FeaturedGroupRoomCard: React.FC<FeaturedGroupRoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
  const categoryLabel = (SKILL_CATEGORY_LABELS[rawCat] || room.category || 'HỌC NHÓM').toUpperCase();
  const coverUrl = room.coverImage || FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;
  const mentorAvatarUrl =
    room.mentorAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';

  // Format số người xem: 1200 -> 1.2k đang xem
  const formatViewerCount = (count?: number) => {
    if (!count || count <= 0) return '1 đang xem';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}k đang xem`;
    }
    return `${count} đang xem`;
  };

  // Format thời gian bắt đầu
  const formatStartTime = () => {
    if (room.startTimeText) return room.startTimeText;
    if (room.openedAt) {
      try {
        const opened = new Date(room.openedAt).getTime();
        const now = Date.now();
        const diffMinutes = Math.floor((now - opened) / 60000);
        if (diffMinutes < 5) return 'Vừa mới bắt đầu';
        if (diffMinutes < 60) return `Bắt đầu từ ${diffMinutes} phút trước`;
        const diffHours = Math.floor(diffMinutes / 60);
        return `Bắt đầu từ ${diffHours} giờ trước`;
      } catch {
        return 'Đang diễn ra';
      }
    }
    return 'Bắt đầu từ 2 giờ trước';
  };

  const handleJoin = () => {
    navigate(`/rooms/group/${room.roomId}`);
  };

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-full">
      <div>
        {/* 1. Thumbnail Video Preview (padding giống card dưới, không scale khi hover) */}
        <div
          onClick={handleJoin}
          className="relative h-52 sm:h-60 md:h-64 w-full rounded-2xl overflow-hidden bg-slate-950 select-none cursor-pointer"
        >
          <img
            src={coverUrl}
            alt={room.title}
            className="w-full h-full object-cover"
          />

          {/* Lớp phủ tối gradient tinh tế */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Badges góc trên */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            {/* Badge LIVE đỏ */}
            <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-bold text-[11px] tracking-wide flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>

            {/* Badge số người xem */}
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-white font-medium text-[11px] shadow-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-200" />
              <span>{formatViewerCount(room.currentParticipants)}</span>
            </span>
          </div>
        </div>

        {/* 2. Card Body Info */}
        <div className="px-1.5 pt-3.5 space-y-1.5">
          {/* Category & Start Time */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
              {categoryLabel}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-normal text-xs">
              {formatStartTime()}
            </span>
          </div>

          {/* Main Title */}
          <h3
            onClick={handleJoin}
            className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug tracking-tight line-clamp-2 cursor-pointer"
          >
            {room.title}
          </h3>
        </div>
      </div>

      {/* 3. Footer: Mentor Info & CTA Button */}
      <div className="px-1.5 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        {/* Mentor Profile */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={mentorAvatarUrl}
            alt={room.mentorName || 'Mentor'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {room.mentorName || 'PGS. Nguyễn Văn A'}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
              {room.mentorTitle || 'Chuyên gia Tài chính • 15 năm kinh nghiệm'}
            </div>
          </div>
        </div>

        {/* Action CTA Button giống nút Xem danh sách nhiệm vụ */}
        <button
          type="button"
          onClick={handleJoin}
          className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0 text-center"
        >
          Tham gia ngay
        </button>
      </div>
    </div>
  );
};
