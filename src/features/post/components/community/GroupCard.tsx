import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, ArrowRight, Check, UserPlus } from 'lucide-react';
import type { CommunityGroup } from '@/features/post/types';
import { useJoinGroupMutation, useLeaveGroupMutation } from '@/core/api/community/communityApi';
import { toast } from 'react-hot-toast';

interface GroupCardProps {
  group: CommunityGroup;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const handleToggleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (group.isJoined) {
        await leaveGroup(group._id).unwrap();
        toast.success(`Đã rời nhóm ${group.name}`);
      } else {
        await joinGroup(group._id).unwrap();
        toast.success(`Đã tham gia nhóm ${group.name}!`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };

  const coverImage =
    group.coverUrl ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner Cover */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black rounded-full shadow-xs border border-white/40">
            {group.category}
          </span>
        </div>

        {/* Members overlay count */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{group.membersCount.toLocaleString()} thành viên</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>{group.postsCount || 0} bài viết</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link
            to={`/community/${group._id}`}
            className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug"
          >
            {group.name}
          </Link>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
            {group.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={handleToggleJoin}
            disabled={isJoining || isLeaving}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              group.isJoined
                ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600 border border-emerald-200/60'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white border border-primary-100'
            }`}
          >
            {group.isJoined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã tham gia</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tham gia</span>
              </>
            )}
          </button>

          <Link
            to={`/community/${group._id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-primary-600 transition-colors flex items-center gap-1 group-hover:gap-1.5 shadow-2xs"
          >
            <span>Vào nhóm</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
