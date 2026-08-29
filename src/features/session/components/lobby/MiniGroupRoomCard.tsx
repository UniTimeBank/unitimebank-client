import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_CATEGORY_IMAGES, DEFAULT_POST_COVER, SKILL_CATEGORY_LABELS } from '@/features/post/constants/post.constants';
import type { GroupRoomDisplayItem } from './FeaturedGroupRoomCard';

interface MiniGroupRoomCardProps {
  room: GroupRoomDisplayItem;
}

export const MiniGroupRoomCard: React.FC<MiniGroupRoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const rawCat = (room.category || 'PROGRAMMING').toUpperCase();
  const categoryLabel = (SKILL_CATEGORY_LABELS[rawCat] || room.category || 'HỌC NHÓM').toUpperCase();
  const coverUrl = room.coverImage || FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;

  // Format số lượt xem: VD: "85 xem" hoặc "1.2k xem"
  const formatViewerCount = (count?: number) => {
    if (!count || count <= 0) return '1 xem';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}k xem`;
    }
    return `${count} xem`;
  };

  const handleJoin = () => {
    navigate(`/rooms/group/${room.roomId}`);
  };

  return (
    <div
      onClick={handleJoin}
      className="bg-white rounded-2xl p-3 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 cursor-pointer group"
    >
      {/* 1. Left Thumbnail with mini LIVE badge (không scale khi hover) */}
      <div className="w-20 h-20 sm:w-22 sm:h-20 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border border-slate-100 select-none">
        <img
          src={coverUrl}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Mini Red LIVE Badge */}
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
          LIVE
        </span>
      </div>

      {/* 2. Right Content */}
      <div className="flex-1 min-w-0">
        {/* Category */}
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 leading-none mb-1 truncate">
          {categoryLabel}
        </div>

        {/* Title */}
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {room.title}
        </h4>

        {/* Mentor & Viewer Count */}
        <div className="text-[11px] text-slate-400 mt-1 truncate font-normal">
          <span>{room.mentorName || 'Mentor UniTime'}</span>
          <span className="mx-1.5 text-slate-300">•</span>
          <span>{formatViewerCount(room.currentParticipants)}</span>
        </div>
      </div>
    </div>
  );
};
