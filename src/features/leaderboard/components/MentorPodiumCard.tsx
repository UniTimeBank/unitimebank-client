import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { MentorLeaderboardItem } from '@/features/moderation/types';
import { LeaderboardAvatar } from './LeaderboardAvatar';

export interface MentorPodiumCardProps {
  item: MentorLeaderboardItem;
  rank: number;
  formatMinutes: (m: number) => string;
}

export const MentorPodiumCard: React.FC<MentorPodiumCardProps> = ({
  item,
  rank,
  formatMinutes,
}) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;

  const displayName = item.displayName || item.name || 'Gia sư';
  const avatar = item.avatarUrl || item.avatar;
  const major = item.major || item.headline || 'Gia sư UniTime';

  const bgStyle = isGold
    ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 ring-2 ring-amber-400/40 shadow-lg'
    : isSilver
    ? 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-md'
    : 'bg-gradient-to-b from-orange-50/50 to-white border-orange-200 shadow-md';

  const badgeColor = isGold
    ? 'bg-amber-500 text-white ring-4 ring-amber-200'
    : isSilver
    ? 'bg-slate-400 text-white ring-4 ring-slate-200'
    : 'bg-amber-700 text-white ring-4 ring-amber-200';

  const avatarVariant = isGold ? 'amber' : isSilver ? 'slate' : 'primary';

  return (
    <Link
      to={`/profile/${item.userId}`}
      className={`relative rounded-3xl p-6 border flex flex-col items-center text-center transition-all hover:-translate-y-1 block ${bgStyle}`}
    >
      {/* Rank Badge */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mb-3 shadow-md ${badgeColor}`}
      >
        {rank}
      </div>

      {/* Avatar with resilient Fallback */}
      <div className="relative mb-3">
        <LeaderboardAvatar
          src={avatar}
          name={displayName}
          size="podium"
          variant={avatarVariant}
        />
      </div>

      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{displayName}</h3>
      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{major}</p>

      {/* Rank Score */}
      <div className="mt-3 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200/80 shadow-2xs whitespace-nowrap">
        <span>{Math.round(item.rankScore).toLocaleString()} Điểm Hạng</span>
      </div>

      {/* Stats Breakdown */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-left">
        <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium block">Đánh giá</span>
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-0.5">
            <Star className={`w-3 h-3 ${item.totalReviews > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            {item.totalReviews > 0 ? (
              <>
                {item.averageRating.toFixed(1)}{' '}
                <span className="text-[10px] text-slate-400 font-normal">({item.totalReviews})</span>
              </>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">Chưa có</span>
            )}
          </span>
        </div>
        <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium block">Thời gian dạy</span>
          <span className="text-xs font-bold text-slate-700 mt-0.5 block">
            {formatMinutes(item.totalTeachingMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
};
