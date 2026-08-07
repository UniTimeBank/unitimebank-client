import React from 'react';
import { ShieldCheck, Share2, Heart } from 'lucide-react';

interface PublicProfileHeaderProps {
  userName: string;
  roleTitle: string;
  avatarUrl: string;
  bio: string;
  skillsList: string[];
  isLiked: boolean;
  onToggleLike: () => void;
}

export const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({
  userName,
  roleTitle,
  avatarUrl,
  bio,
  skillsList,
  isLiked,
  onToggleLike,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs relative">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Standalone with Subtle Verified Badge */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={userName}
            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100 shadow-2xs"
          />
          <span
            className="absolute -bottom-1 -right-1 p-1 bg-primary-500 text-white rounded-full ring-2 ring-white shadow-xs cursor-pointer"
            title="Đã xác thực sinh viên (@.edu.vn)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              {/* Name & Minimal Borderless Reputation Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{userName}</h1>
                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold rounded-md tracking-wide">
                  Người dạy xuất sắc
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500">{roleTitle}</p>
            </div>

            {/* Public Actions ONLY (Share & Heart - NO Edit profile button!) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleLike}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isLiked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mt-4">{bio}</p>

          {/* Skills tags - READ ONLY (NO + Thêm kỹ năng button, NO × delete buttons!) */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
