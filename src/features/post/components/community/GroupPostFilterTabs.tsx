import React from 'react';
import { HelpCircle, FolderDown, Users, BookOpen } from 'lucide-react';
import type { GroupPostTag } from '@/features/post/types';
import { GROUP_POST_TAG_CONFIG } from '@/features/post/constants';

interface GroupPostFilterTabsProps {
  filterTag: string;
  onFilterTagSelect: (tag: string) => void;
  totalPostsCount: number;
}

const TAG_ICONS: Record<GroupPostTag, React.ReactNode> = {
  QA: <HelpCircle className="w-3.5 h-3.5" />,
  DOCUMENT: <FolderDown className="w-3.5 h-3.5" />,
  STUDY_BUDDY: <Users className="w-3.5 h-3.5" />,
  GENERAL: <BookOpen className="w-3.5 h-3.5" />,
};

export const GroupPostFilterTabs: React.FC<GroupPostFilterTabsProps> = ({
  filterTag,
  onFilterTagSelect,
  totalPostsCount,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onFilterTagSelect('ALL')}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer border ${
          filterTag === 'ALL'
            ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200/80 shadow-2xs'
        }`}
      >
        Tất cả bài viết ({totalPostsCount})
      </button>

      {(Object.keys(GROUP_POST_TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
        const cfg = GROUP_POST_TAG_CONFIG[tagKey];
        const isSelected = filterTag === tagKey;
        return (
          <button
            key={tagKey}
            type="button"
            onClick={() => onFilterTagSelect(tagKey)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1.5 border ${
              isSelected
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200/80 shadow-2xs'
            }`}
          >
            {TAG_ICONS[tagKey]}
            <span>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
};
