import React from 'react';
import { Tag, ShieldCheck, User } from 'lucide-react';
import type { MentorPost } from '../../types';
import { SKILL_CATEGORY_LABELS } from '../../constants';

interface MentorPostHeaderProps {
  post: MentorPost;
}

export const MentorPostHeader: React.FC<MentorPostHeaderProps> = ({ post }) => {
  const categoryName = SKILL_CATEGORY_LABELS[post.tags?.[0]?.category || 'PROGRAMMING'] || 'LẬP TRÌNH';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      {/* Category & Badge Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-black text-2xs uppercase tracking-wider border border-primary-200">
            {categoryName}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-2xs uppercase tracking-wider">
            {post.sessionType === 'GROUP' ? 'Lớp học nhóm' : post.sessionType === 'BOTH' ? '1:1 & Nhóm' : 'Lớp học 1:1'}
          </span>
        </div>

        <div className="px-4 py-1.5 rounded-xl bg-primary-600 text-white font-black text-sm shadow-xs">
          60 Credit / Giờ
        </div>
      </div>

      {/* Post Title */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
        {post.title}
      </h1>

      {/* Mentor Profile Snapshot */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-3">
          {post.mentorAvatar ? (
            <img
              src={post.mentorAvatar}
              alt={post.mentorName || 'Mentor'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {(post.mentorName || 'M').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-gray-900">{post.mentorName || 'Mentor UniTime'}</h4>
            <p className="text-xs text-gray-500 font-semibold">Người hướng dẫn chuyên môn</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 border border-primary-200">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-black">{post.trustScoreSnapshot || 98} ĐIỂM UY TÍN</span>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-50 text-primary-800 text-xs font-bold border border-primary-100"
            >
              <Tag className="w-3.5 h-3.5 text-primary-500" />
              <span>{tag.skillName}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
