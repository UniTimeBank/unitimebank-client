import React from 'react';
import { useUserProfile } from '@/features/user/hooks';
import { UnifiedPostCard } from '../cards/UnifiedPostCard';
import { SKILL_CATEGORY_LABELS } from '../../constants';

interface MentorPostPreviewProps {
  title: string;
  category?: string;
  shortDescription?: string;
  description: string;
  coverImage?: string;
  skillsText?: string;
  scheduleType?: 'ALWAYS_OPEN' | 'LIMITED_TIME';
  startDate?: string;
  endDate?: string;
  selectedSlotCount?: number;
}

export const MentorPostPreview: React.FC<MentorPostPreviewProps> = ({
  title,
  category,
  shortDescription,
  description,
  coverImage,
  skillsText = '',
  scheduleType = 'ALWAYS_OPEN',
  startDate,
  endDate,
  selectedSlotCount = 0,
}) => {
  const { profile } = useUserProfile();

  const skills = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const categoryLabel = (
    category ? (SKILL_CATEGORY_LABELS[category.toUpperCase()] || category) : 'LẬP TRÌNH'
  ).toUpperCase();

  const scheduleLabel = selectedSlotCount > 0 ? `${selectedSlotCount} khung giờ` : 'Lịch mở';

  return (
    <div className="space-y-6 sticky top-24">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-3">
          XEM TRƯỚC BÀI ĐĂNG TRÊN SÀN
        </h3>

        <UnifiedPostCard
          data={{
            type: 'MENTOR',
            title: title || 'Tiêu đề bài dạy của bạn...',
            description:
              shortDescription ||
              (description ? description.replace(/<[^>]+>/g, ' ').slice(0, 120) : '') ||
              'Mô tả lộ trình học và nội dung truyền đạt sẽ hiển thị tại đây...',
            category: category,
            coverImage: coverImage,
            primaryTag: categoryLabel,
            secondaryTags: skills.length > 0 ? skills : ['Kỹ năng bài dạy'],
            authorName: profile?.displayName || 'Bạn (Mentor)',
            authorAvatar: profile?.avatarUrl,
            authorSubtitle: 'Mentor UniTime',
            trustScore: profile?.trustScore || 100,
            creditText: scheduleLabel,
            sessionTypeText: 'Lớp 1:1',
            scheduleType: scheduleType,
            timeAgoText: 'Vừa xong',
            isPreview: true,
          }}
        />
      </div>
    </div>
  );
};
