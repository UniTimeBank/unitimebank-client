import React from 'react';
import { ShieldCheck, Check, Star } from 'lucide-react';

interface PostAuthorCardProps {
  authorName: string;
  authorAvatar?: string;
  trustScore?: number;
  badgeText?: string;
  roleSubtitle?: string;
  bio?: string;
  tags?: string[];
}

export const PostAuthorCard: React.FC<PostAuthorCardProps> = ({
  authorName,
  authorAvatar,
  trustScore = 98,
  badgeText = 'TOP 5% MENTOR',
  roleSubtitle = 'Thành viên cộng đồng UniTimeBank',
  bio,
  tags = [],
}) => {
  const displayBio =
    bio ||
    'Đam mê chia sẻ kiến thức, đồng hành cùng bạn học tập và phát triển kỹ năng thực chiến.';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Avatar with verified check badge */}
      <div className="relative shrink-0">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-13 h-13 rounded-full object-cover ring-2 ring-primary-50"
          />
        ) : (
          <div className="w-13 h-13 rounded-full bg-primary-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary-600 text-white flex items-center justify-center border-2 border-white shadow-2xs"
          title="Đã xác thực"
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      </div>

      {/* Author info */}
      <div className="space-y-1.5 flex-1 min-w-0">
        {/* Name and Trust Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">{authorName}</h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600 text-[11px] font-medium bg-gray-50">
            <ShieldCheck className="w-3 h-3 text-primary-600" />
            <span>Uy tín: {trustScore}/100</span>
          </span>
          {badgeText && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-700 text-white text-[10px] font-semibold">
              <Star className="w-3 h-3 fill-white" />
              <span>{badgeText}</span>
            </span>
          )}
        </div>

        {/* Role subtitle & Bio */}
        <p className="text-xs text-gray-600 font-normal leading-relaxed">
          {roleSubtitle || displayBio}
        </p>

        {/* Skill / interest badges */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
