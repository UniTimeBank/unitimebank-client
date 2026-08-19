import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Tag, Clock, Calendar, Bookmark, Coins, Users } from 'lucide-react';
import type { MentorPost, LearnerRequest } from '../../types';
import {
  SKILL_CATEGORY_LABELS,
  FALLBACK_CATEGORY_IMAGES,
  DEFAULT_POST_COVER,
} from '../../constants';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { formatTimeAgo } from '@/shared/utils';

export interface UnifiedPostCardData {
  id?: string;
  type: 'MENTOR' | 'LEARNER';
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  primaryTag?: string;
  secondaryTags?: string[];
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  authorSubtitle?: string;
  trustScore?: number;
  creditAmount?: number | string;
  creditText?: string;
  sessionTypeText?: string;
  timelineText?: string;
  scheduleType?: 'ALWAYS_OPEN' | 'LIMITED_TIME';
  detailUrl?: string;
  isPreview?: boolean;
  createdAt?: string | Date;
  timeAgoText?: string;
}

export const UnifiedPostCard: React.FC<{
  data: UnifiedPostCardData;
  className?: string;
}> = ({ data, className = '' }) => {
  const {
    id,
    type,
    title,
    description,
    category,
    coverImage,
    primaryTag,
    secondaryTags = [],
    authorName,
    authorAvatar,
    authorSubtitle,
    trustScore = 100,
    creditAmount,
    creditText,
    sessionTypeText,
    timelineText,
    scheduleType = 'ALWAYS_OPEN',
    detailUrl,
    isPreview = false,
    createdAt,
    timeAgoText,
  } = data;

  const rawCat = category?.toUpperCase() || 'PROGRAMMING';
  const coverUrl = coverImage || FALLBACK_CATEGORY_IMAGES[rawCat] || DEFAULT_POST_COVER;

  const topBadge =
    primaryTag ||
    SKILL_CATEGORY_LABELS[rawCat] ||
    (type === 'MENTOR' ? 'BÀI DẠY' : 'YÊU CẦU HỌC');

  const topBadgeRight =
    type === 'MENTOR'
      ? sessionTypeText || 'Lớp 1:1'
      : timelineText || 'Trong 3 ngày';

  const isLimited = scheduleType === 'LIMITED_TIME';
  const bottomDisplay =
    creditText ||
    (type === 'MENTOR' ? 'Lịch mở' : creditAmount ? `${creditAmount} credit` : '60 credit');

  const validTitle = title || (type === 'MENTOR' ? 'Tiêu đề bài dạy của bạn...' : 'Tên môn học / Kỹ năng cần tìm...');
  const validDesc =
    description ||
    (type === 'MENTOR'
      ? 'Mô tả chi tiết nội dung kiến thức và lộ trình hướng dẫn bạn sẽ cung cấp cho học viên.'
      : 'Mô tả cụ thể những kiến thức hoặc bài tập bạn muốn được Mentor hỗ trợ giải đáp.');

  // Loại bỏ các tag trùng lặp với topBadge hoặc topBadgeRight
  const uniqueSecondaryTags = Array.from(
    new Set(
      secondaryTags
        .map((t) => t?.trim())
        .filter(
          (t) =>
            Boolean(t) &&
            t.toLowerCase() !== topBadge.toLowerCase() &&
            t.toLowerCase() !== (topBadgeRight || '').toLowerCase()
        )
    )
  );

  const authUser = useAppSelector(selectCurrentUser);
  const isMyPost = Boolean(authUser?.id && data.authorId && authUser.id === data.authorId);

  return (
    <div
      className={`bg-white rounded-3xl p-3.5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${className}`}
    >
      <div>
        {/* 1. Header Media Thumbnail */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
          <img
            src={coverUrl}
            alt={validTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

          {/* Top Left: Primary Tag / Category */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[11px] uppercase tracking-wider shadow-xs">
            {topBadge}
          </span>

          {/* Top Right: Session Type or Timeline Badge */}
          <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md text-white font-medium text-[11px] shadow-xs">
            {topBadgeRight}
          </span>

          {/* Bottom Left: Timing / Schedule Badge for Mentor, Credit Badge for Learner */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            {type === 'MENTOR' ? (
              isLimited ? (
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )
            ) : (
              <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{bottomDisplay}</span>
          </div>
        </div>

        {/* 2. Body Info */}
        <div className="px-1.5 pt-3.5 space-y-2.5">
          {/* Author Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {authorName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {authorName || 'Thành viên UniTime'}
                </h4>
                <span className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                  {timeAgoText || formatTimeAgo(createdAt)}
                </span>
              </div>
            </div>

            {/* Trust Score & My Post Tag */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isMyPost && (
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  Bài của bạn
                </span>
              )}
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{trustScore}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          {detailUrl && !isPreview ? (
            <Link to={detailUrl} className="block group-hover:text-primary-700 transition-colors">
              <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-snug tracking-tight">
                {validTitle}
              </h3>
            </Link>
          ) : (
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-snug tracking-tight">
              {validTitle}
            </h3>
          )}

          {/* Description */}
          <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
            {validDesc}
          </p>

          {/* Secondary Tags */}
          {uniqueSecondaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {uniqueSecondaryTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-600 text-[10px] font-semibold border border-slate-200/50 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Action CTA */}
      <div className="px-1.5 pt-3.5 mt-2">
        {isPreview ? (
          <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs text-center border border-slate-200/60 select-none">
            Xem trước trên sàn
          </div>
        ) : detailUrl ? (
          <Link
            to={detailUrl}
            className="w-full py-2.5 rounded-xl border border-primary-600/80 bg-white hover:bg-primary-50 text-primary-700 font-bold text-xs transition-all text-center block shadow-2xs hover:shadow-xs"
          >
            Xem chi tiết
          </Link>
        ) : (
          <button
            type="button"
            className="w-full py-2.5 rounded-xl border border-primary-600/80 bg-white hover:bg-primary-50 text-primary-700 font-bold text-xs transition-all text-center block shadow-2xs hover:shadow-xs cursor-pointer"
          >
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
};
