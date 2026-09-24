import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, ArrowRight, Check, UserPlus } from 'lucide-react';
import type { CommunityGroup } from '@/features/post/types';
import { useJoinGroupMutation, useLeaveGroupMutation } from '@/core/api/community/communityApi';
import { toast } from 'react-hot-toast';

interface GroupCardProps {
  group: CommunityGroup;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate();
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const handleCardClick = () => {
    navigate(`/community/${group._id}`);
  };

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
    group.coverImage ||
    group.coverUrl ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop';

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl p-3.5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
    >
      <div>
        {/* 1. Header Media Thumbnail */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

          {/* Top Left: Category Badge */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[11px] uppercase tracking-wider shadow-xs">
            {group.category}
          </span>

          {/* Bottom Left: Members Count Badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{group.membersCount.toLocaleString()} thành viên</span>
          </div>

          {/* Bottom Right: Posts Count Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{group.postsCount || 0} bài viết</span>
          </div>
        </div>

        {/* 2. Body Info */}
        <div className="px-1.5 pt-3.5 space-y-2.5">
          {/* Creator & Privacy Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {group.creatorAvatar ? (
                <img
                  src={group.creatorAvatar}
                  alt={group.creatorName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                  {group.creatorName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-slate-700 truncate leading-tight">
                {group.creatorName || 'Quản trị viên'}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
              Công khai
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 leading-snug tracking-tight">
            {group.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
            {group.description}
          </p>
        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="px-1.5 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {group.isJoined ? (
          <>
            <button
              type="button"
              onClick={handleToggleJoin}
              disabled={isJoining || isLeaving}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600 border border-emerald-200/70 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Nhấp để rời nhóm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã tham gia</span>
            </button>

            <button
              type="button"
              onClick={handleCardClick}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-primary-600 text-white transition-all flex items-center gap-1 group-hover:gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Vào nhóm</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
            </button>

            <button
              type="button"
              onClick={handleToggleJoin}
              disabled={isJoining || isLeaving}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tham gia nhóm</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
