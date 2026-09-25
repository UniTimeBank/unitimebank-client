import { Users, MessageSquare, Share2, Plus, Check, Crown, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import type { CommunityGroup } from '@/features/post/types';

interface GroupDetailHeaderProps {
  group: CommunityGroup;
  postCount: number;
  isGroupOwner?: boolean;
  isMembershipProcessing: boolean;
  onToggleMembership: () => void;
  onShareGroup: () => void;
  onOpenManageMembersModal?: () => void;
  onOpenDisbandModal?: () => void;
}

export const GroupDetailHeader: React.FC<GroupDetailHeaderProps> = ({
  group,
  postCount,
  isGroupOwner,
  isMembershipProcessing,
  onToggleMembership,
  onShareGroup,
  onOpenManageMembersModal,
  onOpenDisbandModal,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            group.coverImage ||
            group.coverUrl ||
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'
          }
          alt={group.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Floating Category Badge on Cover */}
        <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 z-10 flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs uppercase tracking-wider shadow-md border border-white/50">
            {group.category}
          </span>
          {isGroupOwner && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/95 backdrop-blur-md text-white font-bold text-xs tracking-wider shadow-md border border-amber-400/50 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Trưởng nhóm</span>
            </span>
          )}
        </div>
      </div>

      {/* Group Header Info */}
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {group.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-[13px] font-semibold text-gray-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-gray-700 font-bold">{group.membersCount.toLocaleString()}</span> thành viên
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-500" />
              <span className="text-gray-700 font-bold">{postCount}</span> bài viết
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onShareGroup}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
            title="Chia sẻ liên kết nhóm"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {isGroupOwner ? (
            <>
              <Button
                variant="outline"
                onClick={onOpenManageMembersModal}
                leftIcon={<Users className="w-4 h-4 text-primary-600" />}
                className="text-xs font-bold border-gray-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 cursor-pointer"
              >
                Quản lý thành viên
              </Button>

              <Button
                variant="outline"
                onClick={onOpenDisbandModal}
                leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 cursor-pointer"
              >
                Giải tán nhóm
              </Button>
            </>
          ) : group.isJoined ? (
            <Button
              variant="outline"
              onClick={onToggleMembership}
              isLoading={isMembershipProcessing}
              leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
            >
              Đã tham gia nhóm
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onToggleMembership}
              isLoading={isMembershipProcessing}
              leftIcon={<Plus className="w-4 h-4" />}
              className="cursor-pointer"
            >
              Tham gia nhóm ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
