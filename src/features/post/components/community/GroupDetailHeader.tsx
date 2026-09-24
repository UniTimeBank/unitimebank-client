import React from 'react';
import { Users, MessageSquare, Share2, Plus, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui';
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
            type="button"
            onClick={onShareGroup}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
            title="Chia sẻ nhóm"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {group.isJoined ? (
            <Button
              variant="outline"
              onClick={onToggleMembership}
              isLoading={isMembershipProcessing}
              leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              Đã tham gia nhóm
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onToggleMembership}
              isLoading={isMembershipProcessing}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tham gia nhóm ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
