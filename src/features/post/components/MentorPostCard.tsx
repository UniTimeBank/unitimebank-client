import React from 'react';
import { Star, ChevronRight, Calendar } from 'lucide-react';
import type { MentorPost } from '../types';

interface MentorPostCardProps {
  post: MentorPost;
  onSelect?: (post: MentorPost) => void;
  variant?: 'horizontal' | 'compact' | 'preview';
}

export const MentorPostCard: React.FC<MentorPostCardProps> = ({
  post,
  onSelect,
  variant = 'horizontal',
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

  if (variant === 'preview' || variant === 'compact') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col">
        {/* Cover Image */}
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={defaultThumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-3xs font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-gray-900 shadow-2xs">
            {post.tags?.[0]?.category || 'CÔNG NGHỆ'}
          </span>
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-primary-600/95 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1 shadow-sm">
            <span>60 credit</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              {post.mentorAvatar ? (
                <img
                  src={post.mentorAvatar}
                  alt={post.mentorName || 'Người dạy'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                  {(post.mentorName || 'M').charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-gray-900 leading-tight">
                  {post.mentorName || 'Alex Johnson'}
                </div>
                <div className="flex items-center gap-1 text-3xs font-semibold text-amber-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{((post.trustScoreSnapshot || 100) / 20).toFixed(1)} Điểm uy tín</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
              {post.description || 'Hướng dẫn thực chiến từ cơ bản đến nâng cao kèm bài tập và lộ trình rõ ràng.'}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags?.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-3xs font-bold uppercase tracking-wider"
                >
                  {tag.skillName}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-500 text-3xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Lịch gần nhất: {post.availableSlots?.[0]?.dayOfWeek || 'Có sẵn'}</span>
            </div>
            <button
              onClick={() => onSelect?.(post)}
              className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-0.5 text-xs transition-colors cursor-pointer"
            >
              <span>XEM CHI TIẾT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Variant Horizontal (Main Feed trang Khám phá)
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 group items-center justify-between">
      <div className="flex flex-col md:flex-row gap-5 items-start flex-1">
        {/* Thumbnail */}
        <div className="relative w-full md:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <img
            src={defaultThumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-3xs font-black uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
              GỢI Ý: {post.tags?.[0]?.skillName || 'LẬP TRÌNH PYTHON'}
            </span>
            <span className="text-3xs text-gray-400 font-semibold">• 2 giờ trước</span>
          </div>

          <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1.5">
            {post.title}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {post.description || 'Khóa hướng dẫn 1 giờ kèm cặp chi tiết giúp sinh viên nắm vững kiến thức cốt lõi.'}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {post.mentorAvatar ? (
                <img
                  src={post.mentorAvatar}
                  alt={post.mentorName || 'Người dạy'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-3xs font-bold flex items-center justify-center">
                  {(post.mentorName || 'M').charAt(0)}
                </div>
              )}
              <div className="text-xs font-bold text-gray-800">
                {post.mentorName || 'Markus Webb'}{' '}
                <span className="text-3xs font-normal text-gray-400 ml-1">KHOA CÔNG NGHỆ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-bold text-xs border border-primary-100">
          60 <span className="font-normal text-3xs">Credit</span>
        </span>
        <button
          onClick={() => onSelect?.(post)}
          className="w-9 h-9 rounded-full bg-gray-900 hover:bg-primary-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          title="Xem chi tiết & Đặt lịch"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
