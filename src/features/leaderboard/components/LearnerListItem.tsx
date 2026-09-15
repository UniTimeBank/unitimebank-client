import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { LearnerLeaderboardItem } from '@/features/moderation/types';
import { LeaderboardAvatar } from './LeaderboardAvatar';

export interface LearnerListItemProps {
  item: LearnerLeaderboardItem;
  rank: number;
  formatMinutes: (m: number) => string;
}

export const LearnerListItem: React.FC<LearnerListItemProps> = ({
  item,
  rank,
  formatMinutes,
}) => {
  const displayName = item.displayName || item.name || 'Học viên';
  const avatar = item.avatarUrl || item.avatar;
  const major = item.major || item.headline || 'Học viên';

  return (
    <Link
      to={`/profile/${item.userId}`}
      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
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

        <div className="relative shrink-0">
          <LeaderboardAvatar
            src={avatar}
            name={displayName}
            size="sm"
            variant="blue"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
              {displayName}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {major} • {formatMinutes(item.totalLearningMinutes)} học
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-bold">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>{item.totalSessionsCompleted} buổi</span>
        </div>

        <div className="text-right shrink-0 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-black text-blue-700">
            {Math.round(item.rankScore).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">điểm</span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
      </div>
    </Link>
  );
};
