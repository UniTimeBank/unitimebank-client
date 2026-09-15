import React from 'react';
import { Layers, GraduationCap, Users } from 'lucide-react';
import type { PostTabType } from '../../hooks';

interface AllPostsTabsProps {
  activeTab: PostTabType;
  onTabChange: (tab: PostTabType) => void;
  allCount: number;
  mentorCount: number;
  learnerCount: number;
}

export const AllPostsTabs: React.FC<AllPostsTabsProps> = ({
  activeTab,
  onTabChange,
  allCount,
  mentorCount,
  learnerCount,
}) => {
  const tabs = [
    {
      value: 'ALL' as PostTabType,
      label: 'Tất cả bài đăng',
      count: allCount,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      value: 'MENTOR_POSTS' as PostTabType,
      label: 'Lớp học Mentor',
      count: mentorCount,
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      value: 'LEARNER_REQUESTS' as PostTabType,
      label: 'Yêu cầu học tập',
      count: learnerCount,
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl w-fit max-w-full overflow-x-auto scrollbar-none shadow-2xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none ${
              isActive
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className={isActive ? 'text-primary-600' : 'text-slate-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-slate-300/60 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
