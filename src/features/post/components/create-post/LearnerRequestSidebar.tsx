import React from 'react';
import { useUserProfile } from '@/features/user/hooks';
import { UnifiedPostCard } from '../cards/UnifiedPostCard';
import { SKILL_CATEGORY_LABELS } from '../../constants';

interface LearnerRequestSidebarProps {
  subject: string;
  category?: string;
  coverImage?: string;
  shortDescription?: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
  userCredits?: number;
  trustScore?: number;
}

export const LearnerRequestSidebar: React.FC<LearnerRequestSidebarProps> = ({
  subject,
  category,
  coverImage,
  shortDescription,
  goals,
  durationMinutes,
  timeline,
  trustScore: propTrustScore,
}) => {
  const { profile } = useUserProfile();

  const rawTrust = propTrustScore ?? profile?.trustScore ?? 50;

  const categoryLabel = (
    category ? (SKILL_CATEGORY_LABELS[category.toUpperCase()] || category) : 'LẬP TRÌNH'
  ).toUpperCase();

  return (
    <div className="space-y-6 sticky top-24">
      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-3">
          XEM TRƯỚC BÀI TÌM NGƯỜI DẠY
        </h3>

        <UnifiedPostCard
          data={{
            type: 'LEARNER',
            title: subject || 'Tên môn học / Kỹ năng cần tìm Mentor',
            description:
              shortDescription ||
              (goals ? goals.replace(/<[^>]+>/g, ' ').slice(0, 120) : '') ||
              'Mô tả cụ thể những kiến thức hoặc bài tập bạn muốn được hỗ trợ giải đáp...',
            coverImage: coverImage,
            primaryTag: categoryLabel,
            secondaryTags: [],
            authorName: profile?.displayName || 'Bạn (Học viên)',
            authorAvatar: profile?.avatarUrl,
            authorSubtitle: 'Sinh viên UniTime',
            trustScore: rawTrust > 10 ? rawTrust : rawTrust * 10,
            creditAmount: durationMinutes || 60,
            creditText: `${durationMinutes || 60} credit`,
            timelineText: timeline || 'Trong 3 ngày',
            timeAgoText: 'Vừa xong',
            isPreview: true,
          }}
        />
      </div>
    </div>
  );
};
