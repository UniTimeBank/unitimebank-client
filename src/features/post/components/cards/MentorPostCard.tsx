import React from 'react';
import { Clock, User, Tag, ArrowRight, Calendar } from 'lucide-react';
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

  return (
    <div
      className="bg-white rounded-3xl border border-gray-200/80 hover:border-primary-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group overflow-hidden"
    >
      <div>
        {/* Cover Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          <img
            src={defaultThumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badge Top Left */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary-700 font-black text-2xs uppercase tracking-wider shadow-sm">
            {topBadge}
          </span>

          {/* Credit Tag Top Right */}
          <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-primary-600 text-white font-extrabold text-xs shadow-md">
            60 credit/giờ
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Mentor Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.mentorAvatar ? (
                <img
                  src={post.mentorAvatar}
                  alt={post.mentorName || 'Mentor'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                  {(post.mentorName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-gray-800">{post.mentorName || 'Mentor'}</span>
            </div>

            <span className="text-3xs font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
              ★ {post.trustScoreSnapshot || 98} UY TÍN
            </span>
          </div>

          {/* Title Link */}
          <Link to={`/posts/mentor/${post._id}`} className="block">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Description */}
          {post.shortDescription ? (
            <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
              {post.shortDescription}
            </p>
          ) : post.description ? (
            <RichTextViewer content={post.description} className="line-clamp-2" />
          ) : null}

          {/* Skill Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-3xs font-bold border border-primary-100"
                >
                  <Tag className="w-2.5 h-2.5 text-primary-500" />
                  <span>{tag.skillName}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-2xs font-bold text-gray-400">
            {post.sessionType === 'GROUP' ? 'Lớp nhóm' : 'Lớp 1:1'}
          </span>

          <Link
            to={`/posts/mentor/${post._id}`}
            className="py-1.5 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
