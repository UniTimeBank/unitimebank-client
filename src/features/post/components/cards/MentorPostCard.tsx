import React from 'react';
import type { MentorPost } from '../../types';

interface MentorPostCardProps {
  post: MentorPost;
  onSelect?: (post: MentorPost) => void;
  variant?: 'vertical' | 'horizontal' | 'compact' | 'preview';
}

export const MentorPostCard: React.FC<MentorPostCardProps> = ({
  post,
  onSelect,
  variant = 'vertical',
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

  const categoryName = post.tags?.[0]?.category || 'STEM';

  // Variant Vertical / Preview / Compact (The requested card design in screenshot)
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
            {/* Category Tag */}
            <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
              {categoryName}
            </span>
            {/* Credit Tag */}
            <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs shadow-md">
              60 credit/giờ
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-2">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>

            <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
              {post.description || 'Nắm bắt chuyên sâu các kỹ thuật xử lý dữ liệu với Pandas, NumPy...'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
          <div>Lịch gần nhất: 3 Th9</div>
          <button
            type="button"
            onClick={() => onSelect?.(post)}
            className="text-teal-800 hover:text-teal-900 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>XEM CHI TIẾT</span>
            <span>&rarr;</span>
          </button>
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
            <span className="text-3xs text-gray-400 font-semibold">• 2 giờ trước</span>
          </div>

          <h3 className="text-base font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {post.title}
          </h3>

          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
            {post.description || 'Khóa hướng dẫn 1 giờ kèm cặp chi tiết giúp sinh viên nắm vững kiến thức cốt lõi.'}
          </p>
        </div>
      </div>

      {/* Right Action */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <span className="px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs">
          60 credit/giờ
        </span>
        <button
          type="button"
          onClick={() => onSelect?.(post)}
          className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-primary-600 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          XEM CHI TIẾT &rarr;
        </button>
      </div>
    </div>
  );
};
