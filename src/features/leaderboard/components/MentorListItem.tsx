import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import type { MentorLeaderboardItem } from '@/features/moderation/types';
import { LeaderboardAvatar } from './LeaderboardAvatar';

export interface MentorListItemProps {
  item: MentorLeaderboardItem;
  rank: number;
  formatMinutes: (m: number) => string;
}

export const MentorListItem: React.FC<MentorListItemProps> = ({
  item,
  rank,
  formatMinutes,
}) => {
  const displayName = item.displayName || item.name || 'Gia sư';
  const avatar = item.avatarUrl || item.avatar;
  const major = item.major || item.headline || 'Gia sư';

  return (
    <Link
      to={`/profile/${item.userId}`}
      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Rank number */}
        <span
          className={`w-8 text-center font-black text-sm shrink-0 ${
            rank === 1
              ? 'text-amber-500 font-black text-base'
              : rank === 2
              ? 'text-slate-400 font-black text-base'
              : rank === 3
              ? 'text-amber-700 font-black text-base'
              : 'text-slate-400'
          }`}
        >
          {rank}
        </span>

        {/* User Info with Fallback */}
        <div className="relative shrink-0">
          <LeaderboardAvatar
            src={avatar}
            name={displayName}
            size="sm"
            variant="primary"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
              {displayName}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {major} • {formatMinutes(item.totalTeachingMinutes)} dạy
          </p>
        </div>
      </div>

      {/* Metrics & Score */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 font-bold">
          <Star className={`w-3.5 h-3.5 ${item.totalReviews > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          {item.totalReviews > 0 ? (
            <>
              <span>{item.averageRating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal">({item.totalReviews})</span>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 font-normal">Chưa có đánh giá</span>
          )}
        </div>

        <div className="text-right shrink-0 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-black text-emerald-800">
            {Math.round(item.rankScore).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">điểm</span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
      </div>
    </Link>
  );
};
