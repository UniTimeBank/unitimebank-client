import React from 'react';
import { UnifiedPostCard } from '../cards';
import type { ExploreCardItem } from '../../types';

interface AllPostsGridProps {
  items: ExploreCardItem[];
}

export const AllPostsGrid: React.FC<AllPostsGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <UnifiedPostCard
          key={item.id}
          data={{
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            category: item.category,
            coverImage: item.coverImage,
            primaryTag: item.tagSkill,
            secondaryTags:
              (item as any).allSkills && (item as any).allSkills.length > 0
                ? (item as any).allSkills
                : item.secondaryTag
                ? [item.secondaryTag]
                : [],
            authorId: item.authorId,
            authorName: item.authorName,
            authorAvatar: item.authorAvatar,
            authorSubtitle: item.authorUniversity,
            trustScore: item.trustScore,
            creditText: item.rateCreditText,
            detailUrl: item.detailUrl,
            sessionTypeText:
              item.sessionType === 'GROUP'
                ? 'Lớp nhóm'
                : item.sessionType === 'BOTH'
                ? '1:1 & Nhóm'
                : 'Lớp 1:1',
            scheduleType: (item as any).scheduleType,
            timelineText: 'Trong 3 ngày',
            createdAt: item.createdAt,
          }}
        />
      ))}
    </div>
  );
};
