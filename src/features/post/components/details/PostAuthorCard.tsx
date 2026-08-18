import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, Star, ChevronRight, User } from 'lucide-react';

export interface PostAuthorCardProps {
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  trustScore?: number;
  badgeText?: string;
  roleSubtitle?: string;
  bio?: string;
  tags?: string[];
}

export const PostAuthorCard: React.FC<PostAuthorCardProps> = ({
  authorId,
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

  const profileUrl = authorId ? `/profile/${authorId}` : '/profile';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-200">
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        {/* Avatar with verified check badge & Clickable link */}
        <Link to={profileUrl} className="relative shrink-0 group block cursor-pointer">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-13 h-13 rounded-full object-cover ring-2 ring-primary-50 group-hover:ring-primary-300 transition-all"
            />
          ) : (
            <div className="w-13 h-13 rounded-full bg-primary-600 group-hover:bg-primary-700 text-white font-bold text-lg flex items-center justify-center shadow-xs transition-colors">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary-600 text-white flex items-center justify-center border-2 border-white shadow-2xs"
            title="Đã xác thực"
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        </Link>

        {/* Author info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Name and Trust Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={profileUrl}
              className="text-sm sm:text-base font-bold text-gray-900 hover:text-primary-700 transition-colors cursor-pointer"
            >
              {authorName}
            </Link>
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

      {/* Right Side: View Profile Button */}
      <Link
        to={profileUrl}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-primary-800 bg-primary-50 hover:bg-primary-100 transition-colors shrink-0 self-end sm:self-center cursor-pointer"
      >
        <User className="w-3.5 h-3.5" />
        <span>Xem hồ sơ</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
