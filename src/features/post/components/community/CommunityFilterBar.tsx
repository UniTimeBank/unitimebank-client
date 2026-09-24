import React from 'react';
import { Search } from 'lucide-react';
import { COMMUNITY_CATEGORIES } from '@/features/post/constants';

interface CommunityFilterBarProps {
  activeTab: 'ALL' | 'MY_GROUPS';
  onTabChange: (tab: 'ALL' | 'MY_GROUPS') => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
}

export const CommunityFilterBar: React.FC<CommunityFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="space-y-4">
      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-100/80 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Khám phá tất cả nhóm
          </button>
          <button
            onClick={() => onTabChange('MY_GROUPS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MY_GROUPS'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Nhóm của tôi
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên nhóm hoặc mô tả..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COMMUNITY_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-2xs scale-[1.02]'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
