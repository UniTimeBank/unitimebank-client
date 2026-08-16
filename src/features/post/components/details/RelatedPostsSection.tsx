import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, BookOpen } from 'lucide-react';
import { useGetMentorPostsQuery } from '@/core/api/post/postApi';
import type { MentorPost } from '../../types';
import { SKILL_CATEGORY_LABELS } from '../../constants';

interface RelatedPostsSectionProps {
  currentPostId?: string;
  title?: string;
}

const CATEGORY_BANNERS: Record<string, string> = {
  PROGRAMMING: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  DESIGN: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
  MARKETING: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
  LANGUAGE: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
  SCIENCE: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
  BUSINESS: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
};

export const RelatedPostsSection: React.FC<RelatedPostsSectionProps> = ({
  currentPostId,
  title = 'Các lớp học gợi ý khác',
}) => {
  const { data: response, isLoading } = useGetMentorPostsQuery({ limit: 10 });

  // Extract real posts array from API response
  const realPosts: MentorPost[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as any).items)) return (response as any).items;
    if (Array.isArray((response as any).data)) return (response as any).data;
    return [];
  }, [response]);

  // Take the first 3 other real posts
  const displayedPosts = useMemo(() => {
    return realPosts.filter((p) => p._id !== currentPostId).slice(0, 3);
  }, [realPosts, currentPostId]);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-8 border-t border-gray-100">
        <div className="h-5 w-48 bg-gray-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (displayedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-8 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">{title}</h3>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards Grid with 100% Real Dynamic Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayedPosts.map((post) => {
          const categoryCode = post.tags?.[0]?.category || 'PROGRAMMING';
          const categoryLabel =
            SKILL_CATEGORY_LABELS[categoryCode] || post.tags?.[0]?.skillName || 'LẬP TRÌNH';
          const rating = ((post.trustScoreSnapshot || 100) / 20).toFixed(1);
          const authorName = post.mentorName || 'Mentor';
          const coverImg =
            post.coverImage ||
            CATEGORY_BANNERS[categoryCode.toUpperCase()] ||
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

          return (
            <Link
              key={post._id}
              to={`/posts/mentor/${post._id}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Banner Thumbnail */}
                <div className="w-full h-32 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 shadow-2xs">
                  <img
                    src={coverImg}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-primary-700 text-[10px] font-extrabold border border-primary-100 shadow-2xs">
                    1 Credit
                  </span>
                </div>

                {/* Category Label */}
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  {categoryLabel}
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-black text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                  {post.title}
                </h4>

                {/* Short Description */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                  {post.shortDescription || 'Khóa học chia sẻ kiến thức thực chiến cùng Mentor trên UniTimeBank.'}
                </p>
              </div>

              {/* Author Snapshot Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {post.mentorAvatar ? (
                    <img
                      src={post.mentorAvatar}
                      alt={authorName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-100"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800 text-[11px] truncate max-w-[120px]">
                    {authorName}
                  </span>
                </div>

                {/* Rating Badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
