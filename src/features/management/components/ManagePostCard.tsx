import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  Lock,
  Unlock,
  Eye,
  Clock,
} from 'lucide-react';
import type { MentorPost, LearnerRequest } from '@/features/post/types';
import { PostStatus, LearnerRequestStatus } from '@/features/post/types';
import {
  SKILL_CATEGORY_LABELS,
  FALLBACK_CATEGORY_IMAGES,
  DEFAULT_POST_COVER,
} from '@/features/post/constants';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';

export interface ManagePostCardProps {
  type: 'MENTOR' | 'LEARNER';
  mentorPost?: MentorPost;
  learnerRequest?: LearnerRequest;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string, title: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export const ManagePostCard: React.FC<ManagePostCardProps> = ({
  type,
  mentorPost,
  learnerRequest,
  onToggleStatus,
  onDelete,
  isToggling = false,
  isDeleting = false,
}) => {
  const isMentor = type === 'MENTOR';
  const post = isMentor ? mentorPost : learnerRequest;

  if (!post) return null;

  const id = post._id;
  const title = isMentor ? mentorPost?.title || '' : learnerRequest?.skillNeeded || '';
  const description = isMentor
    ? mentorPost?.shortDescription || mentorPost?.description || ''
    : learnerRequest?.shortDescription || learnerRequest?.description || '';

  const rawCat = (isMentor ? mentorPost?.tags?.[0]?.category : learnerRequest?.category) || 'PROGRAMMING';
  const categoryUpper = rawCat.toUpperCase();
  const categoryLabel =
    SKILL_CATEGORY_LABELS[categoryUpper] ||
    (isMentor ? mentorPost?.tags?.[0]?.skillName : learnerRequest?.category) ||
    'Kỹ năng';

  const coverUrl =
    post.coverImage || FALLBACK_CATEGORY_IMAGES[categoryUpper] || DEFAULT_POST_COVER;

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired =
    isMentor &&
    mentorPost?.scheduleType === 'LIMITED_TIME' &&
    Boolean(mentorPost?.endDate && mentorPost.endDate < todayStr);

  // Status mapping
  const isPostOpen = isMentor
    ? mentorPost?.status === PostStatus.PUBLISHED && !isExpired
    : learnerRequest?.status === LearnerRequestStatus.OPEN;

  const isPostClosed = isMentor
    ? mentorPost?.status === PostStatus.CLOSED && !isExpired
    : learnerRequest?.status === LearnerRequestStatus.CANCELLED;

  const isMatched = !isMentor && learnerRequest?.status === LearnerRequestStatus.MATCHED;

  const detailUrl = isMentor ? `/posts/mentor/${id}` : `/posts/learner/${id}`;

  const slotsCount = isMentor
    ? mentorPost?.availableSlots?.length || 0
    : learnerRequest?.desiredSlots?.length || 0;

  const creditAmount = !isMentor ? learnerRequest?.expectedCreditAmount || 60 : null;

  // Secondary tags (Chỉ hiển thị chủ đề / kỹ năng, loại bỏ tag trùng tiêu đề bài đăng)
  const tagsList = isMentor
    ? (mentorPost?.tags || [])
        .map((t) => t.skillName)
        .filter((t) => Boolean(t) && t.toLowerCase().trim() !== title.toLowerCase().trim())
    : [
        learnerRequest?.category
          ? SKILL_CATEGORY_LABELS[learnerRequest.category.toUpperCase()] || learnerRequest.category
          : undefined,
      ]
        .filter(Boolean)
        .filter((t) => (t as string).toLowerCase().trim() !== title.toLowerCase().trim()) as string[];

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const handleToggleClick = () => {
    if (!isPostOpen && isExpired) {
      toast.error(
        'Bài đăng đã hết thời hạn mở lớp. Vui lòng cập nhật ngày kết thúc mới để tiếp tục mở lớp.',
      );
      return;
    }
    onToggleStatus(id, isPostOpen ? 'OPEN' : 'CLOSED');
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* 1. Header Media Thumbnail */}
        <div className="relative h-40 sm:h-44 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/25" />

          {/* Top Left: Category Badge (Clean, iconless) */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[11px] uppercase tracking-wider shadow-xs">
            {categoryLabel}
          </span>

          {/* Top Right: Status Badge */}
          <div className="absolute top-3 right-3">
            {isExpired ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-600/90 text-white font-bold text-[11px] shadow-xs backdrop-blur-xs">
                <Clock className="w-3 h-3" />
                Đã hết hạn
              </span>
            ) : isPostOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/90 text-white font-extrabold text-[11px] shadow-xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Đang mở
              </span>
            ) : isPostClosed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/85 text-slate-200 font-bold text-[11px] shadow-xs backdrop-blur-xs">
                <Lock className="w-3 h-3" />
                Đã đóng
              </span>
            ) : isMatched ? (
              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-sky-600/90 text-white font-bold text-[11px] shadow-xs backdrop-blur-xs">
                Đã kết nối
              </span>
            ) : null}
          </div>

          {/* Bottom Left: Slots / Credit Info Overlay (Clean text) */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
            {isMentor ? (
              <span>{slotsCount} khung giờ rảnh</span>
            ) : (
              <span className="font-bold text-amber-300">{creditAmount} Credit</span>
            )}
          </div>
        </div>

        {/* 2. Body Info */}
        <div className="space-y-2 px-0.5">
          {/* Post Title */}
          <Link
            to={detailUrl}
            className="block group/title focus:outline-hidden"
          >
            <h3 className="text-base font-bold text-slate-900 group-hover/title:text-primary-700 transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {description || 'Chưa có thông tin mô tả chi tiết.'}
          </p>

          {/* Skill Tags without clutter icon */}
          {tagsList.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {tagsList.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Toolbar at Bottom */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] text-slate-400 font-medium">
          {formattedDate ? `${formattedDate}` : ''}
        </span>

        <div className="flex items-center gap-2">
          {/* Toggle Close / Open Button (Chỉ hiển thị khi bài chưa hết hạn) */}
          {!isExpired && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleClick}
              disabled={isToggling}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isPostOpen
                  ? 'text-slate-600 hover:text-amber-700 hover:bg-amber-50 border-slate-200 hover:border-amber-200'
                  : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200'
              }`}
              title={isPostOpen ? 'Đóng bài đăng này' : 'Mở lại bài đăng này'}
            >
              {isPostOpen ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đóng bài</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Mở lại</span>
                </>
              )}
            </Button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(id, title)}
            disabled={isDeleting}
            title="Xóa bài đăng"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* View Detail Link */}
          <Link
            to={detailUrl}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
