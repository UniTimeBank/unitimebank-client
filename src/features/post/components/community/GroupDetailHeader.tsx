import React from 'react';
import { Users, MessageSquare, Share2, Plus, Check } from 'lucide-react';
import type { CommunityGroup } from '@/features/post/types';

interface GroupDetailHeaderProps {
  group: CommunityGroup;
  postCount: number;
  isMembershipProcessing: boolean;
  onToggleMembership: () => void;
  onShareGroup: () => void;
}

export const GroupDetailHeader: React.FC<GroupDetailHeaderProps> = ({
  group,
  postCount,
  isMembershipProcessing,
  onToggleMembership,
  onShareGroup,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            group.coverUrl ||
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'
          }
          alt={group.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Group Header Info */}
      <div className="p-6 sm:p-8 relative -mt-12 sm:-mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white shadow-xs text-primary-700 text-xs font-black rounded-full border border-primary-100">
              {group.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
              Nhóm công khai
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {group.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary-600" />
              <span>{group.membersCount.toLocaleString()} thành viên</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-500" />
              <span>{postCount} bài viết</span>
            </span>
            <span>•</span>
            <span>Tạo bởi {group.creatorName}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onShareGroup}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors cursor-pointer"
            title="Chia sẻ nhóm"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMembership}
            disabled={isMembershipProcessing}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
              group.isJoined
                ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 border border-emerald-200'
                : 'bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white shadow-primary-500/20'
            }`}
          >
            {group.isJoined ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã tham gia nhóm</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tham gia nhóm ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
