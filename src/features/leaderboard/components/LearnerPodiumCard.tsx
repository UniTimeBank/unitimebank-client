import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import type { LearnerLeaderboardItem } from '@/features/moderation/types';
import { LeaderboardAvatar } from './LeaderboardAvatar';

export interface LearnerPodiumCardProps {
  item: LearnerLeaderboardItem;
  rank: number;
  formatMinutes: (m: number) => string;
}

export const LearnerPodiumCard: React.FC<LearnerPodiumCardProps> = ({
  item,
  rank,
  formatMinutes,
}) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;

  const displayName = item.displayName || item.name || 'Học viên';
  const avatar = item.avatarUrl || item.avatar;
  const major = item.major || item.headline || 'Học viên UniTime';

  const bgStyle = isGold
    ? 'bg-gradient-to-b from-blue-50 to-white border-blue-300 ring-2 ring-blue-400/40 shadow-lg'
    : isSilver
    ? 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-md'
    : 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-200 shadow-md';

  const badgeColor = isGold
    ? 'bg-blue-600 text-white ring-4 ring-blue-200'
    : isSilver
    ? 'bg-slate-400 text-white ring-4 ring-slate-200'
    : 'bg-indigo-600 text-white ring-4 ring-indigo-200';

  const avatarVariant = isGold ? 'blue' : isSilver ? 'slate' : 'primary';

  return (
    <Link
      to={`/profile/${item.userId}`}
      className={`relative rounded-3xl p-6 border flex flex-col items-center text-center transition-all hover:-translate-y-1 block ${bgStyle}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mb-3 shadow-md ${badgeColor}`}
      >
        {rank}
      </div>

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
      <div className="mt-3 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200/80 shadow-2xs whitespace-nowrap">
        <span>{Math.round(item.rankScore).toLocaleString()} Điểm Hạng</span>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-left">
        <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium block">Thời gian học</span>
          <span className="text-xs font-bold text-blue-700 mt-0.5 block">
            {formatMinutes(item.totalLearningMinutes)}
          </span>
        </div>
        <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium block">Buổi học xong</span>
          <span className="text-xs font-bold text-slate-700 mt-0.5 block">
            {item.totalSessionsCompleted} buổi
          </span>
        </div>
      </div>
    </Link>
  );
};
