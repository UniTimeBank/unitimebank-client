import React from 'react';
import { Share2, Heart } from 'lucide-react';

interface PublicProfileHeaderProps {
  userName: string;
  avatarUrl: string;
  bio: string;
  skillsList: string[];
  isLiked: boolean;
  onToggleLike: () => void;
}

export const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({
  userName,
  avatarUrl,
  bio,
  skillsList,
  isLiked,
  onToggleLike,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs relative">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Standalone */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={userName}
            className="w-22 h-22 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-primary-50 shadow-xs"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{userName}</h1>
            </div>

            {/* Public Actions (Share & Heart) */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép liên kết hồ sơ!');
                  }
                }}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Chia sẻ hồ sơ"
              >
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={onToggleLike}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${isLiked
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                title={isLiked ? 'Bỏ yêu thích' : 'Yêu thích người dạy này'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-2.5 pl-3.5 border-l-2 border-primary-500/70 py-0.5 max-w-xl">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {bio}
            </p>
          </div>

          {/* Skills tags - READ ONLY */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-xl"
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
