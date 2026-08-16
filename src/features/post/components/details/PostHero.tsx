import React from 'react';
import { Star, Clock } from 'lucide-react';

interface PostHeroProps {
  title: string;
  categoryCode?: string;
  skills?: string[];
  skillLabel?: string;
  coverImage?: string;
  shortDescription?: string;
  ratingValue?: string;
  reviewsCount?: number;
  durationMinutes?: number;
}

const CATEGORY_BANNERS: Record<string, string> = {
  PROGRAMMING: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
  DESIGN: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200',
  MARKETING: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
  LANGUAGE: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200',
  SCIENCE: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200',
  BUSINESS: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
};

export const PostHero: React.FC<PostHeroProps> = ({
  title,
  categoryCode = 'PROGRAMMING',
  skills = [],
  skillLabel,
  coverImage,
  shortDescription,
  ratingValue = '5.0',
  reviewsCount = 128,
  durationMinutes = 60,
}) => {
  // Real cover image from post or category-based banner
  const heroImage =
    coverImage ||
    CATEGORY_BANNERS[categoryCode.toUpperCase()] ||
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200';

  const displaySkills = skills.length > 0 ? skills : skillLabel ? [skillLabel] : ['Chuyên môn'];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
      {/* Hero Banner Image */}
      <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta Row: Skills on Left & Star Rating on Right */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Skill Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {displaySkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-primary-50 text-primary-700 font-semibold text-xs border border-primary-100/70"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Right: Subtle Star Rating */}
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-normal">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-800">{ratingValue}</span>
          <span className="text-gray-400">({reviewsCount} đánh giá)</span>
        </span>
      </div>

      {/* Post Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
        {title}
      </h1>

      {/* Short Description */}
      {shortDescription && (
        <p className="text-sm text-gray-600 leading-relaxed font-normal">
          {shortDescription}
        </p>
      )}

      {/* Duration Indicator */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-primary-600 border border-gray-100">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-gray-500">
            Thời lượng: <strong className="font-semibold text-gray-800">{durationMinutes} phút / buổi</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
