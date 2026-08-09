import React from 'react';
import { Clock, User, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MentorPost } from '../../types';

import { SKILL_CATEGORY_LABELS } from '../../constants';
import { RichTextViewer } from '../create-post/RichTextEditor';

interface MentorPostCardProps {
  post: MentorPost;
  onSelect?: (post: MentorPost) => void;
  variant?: 'vertical' | 'horizontal' | 'compact' | 'preview';
}

const DAY_SHORT_LABELS: Record<string, string> = {
  MONDAY: 'T2',
  TUESDAY: 'T3',
  WEDNESDAY: 'T4',
  THURSDAY: 'T5',
  FRIDAY: 'T6',
  SATURDAY: 'T7',
  SUNDAY: 'CN',
  MON: 'T2',
  TUE: 'T3',
  WED: 'T4',
  THU: 'T5',
  FRI: 'T6',
  SAT: 'T7',
  SUN: 'CN',
};

const formatDateVN = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const MentorPostCard: React.FC<MentorPostCardProps> = ({
  post,
  onSelect,
  variant = 'vertical',
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

  const rawCategory = post.tags?.[0]?.category || 'PROGRAMMING';
  const categoryName = SKILL_CATEGORY_LABELS[rawCategory] || rawCategory;

  const topBadge =
    post.tags?.[0]?.skillName
      ? post.tags[0].skillName.toUpperCase()
      : post.sessionType === 'GROUP'
      ? 'LỚP HỌC NHÓM'
      : post.sessionType === 'BOTH'
      ? 'LỚP 1:1 & NHÓM'
      : 'LỚP HỌC 1:1';

  // Format các slot rảnh hoặc khoảng thời gian đợt học hiển thị ngắn gọn
  const formatSlotsSummary = () => {
    if (post.scheduleType === 'LIMITED_TIME' && (post.startDate || post.endDate)) {
      return `Đợt học: ${formatDateVN(post.startDate)} - ${formatDateVN(post.endDate)}`;
    }
    if (!post.availableSlots || post.availableSlots.length === 0) {
      return 'Chưa chọn lịch rảnh';
    }
    const days = post.availableSlots
      .map((s) => DAY_SHORT_LABELS[s.dayOfWeek] || s.dayOfWeek)
      .filter((v, i, a) => a.indexOf(v) === i);
    return `Lịch tuần (${days.length} khung giờ)`;
  };

  // Variant Vertical / Preview / Compact
  if (variant === 'vertical' || variant === 'preview' || variant === 'compact') {
    return (
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div>
          {/* Cover Image */}
          <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100">
            <img
              src={defaultThumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Top Left Badge */}
            <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
              {topBadge}
            </span>
            {/* Credit Tag */}
            <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs shadow-md">
              60 credit/giờ
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-2.5">
            {/* Mentor Info Header */}
            {post.mentorName && (
              <div className="flex items-center gap-2">
                {post.mentorAvatar ? (
                  <img
                    src={post.mentorAvatar}
                    alt={post.mentorName}
                    className="w-5 h-5 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                    <User className="w-3 h-3" />
                  </div>
                )}
                <span className="text-xs font-bold text-gray-700">{post.mentorName}</span>
                {post.trustScoreSnapshot && (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    ★ {post.trustScoreSnapshot}
                  </span>
                )}
              </div>
            )}

            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>

            {/* Skill Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/80"
                  >
                    <Tag className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>{tag.skillName}</span>
                  </span>
                ))}
              </div>
            )}

            {post.shortDescription ? (
              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {post.shortDescription}
              </p>
            ) : post.description ? (
              <RichTextViewer content={post.description} className="line-clamp-2" />
            ) : (
              <p className="text-xs text-gray-400 font-medium italic">
                Mô tả lộ trình học và nội dung truyền đạt sẽ hiển thị tại đây...
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-1.5 text-gray-700 text-xs font-bold truncate max-w-[65%]">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{formatSlotsSummary()}</span>
          </div>

          <Link
            to={`/posts/${post._id}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(post);
              }
            }}
            className="text-teal-800 hover:text-teal-900 font-extrabold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>XEM CHI TIẾT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Variant Horizontal
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 group items-center justify-between">
      <div className="flex flex-col md:flex-row gap-5 items-start flex-1">
        {/* Thumbnail */}
        <div className="relative w-full md:w-44 h-32 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
          <img
            src={defaultThumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-black uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-md">
              {categoryName}
            </span>
            {post.mentorName && (
              <span className="text-3xs text-gray-500 font-bold">• {post.mentorName}</span>
            )}
          </div>

          <h3 className="text-base font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {post.title}
          </h3>

          {post.shortDescription ? (
            <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
              {post.shortDescription}
            </p>
          ) : post.description ? (
            <RichTextViewer content={post.description} className="line-clamp-2" />
          ) : (
            <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
              Khóa hướng dẫn 1 giờ kèm cặp chi tiết giúp sinh viên nắm vững kiến thức cốt lõi.
            </p>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 text-xs pt-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>{formatSlotsSummary()}</span>
          </div>
        </div>
      </div>

      {/* Right Action */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <span className="px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs">
          60 credit/giờ
        </span>
        <Link
          to={`/posts/${post._id}`}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(post);
            }
          }}
          className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-primary-600 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          ĐẶT LỊCH &rarr;
        </Link>
      </div>
    </div>
  );
};
