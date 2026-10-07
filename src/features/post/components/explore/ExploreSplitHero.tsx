import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { SessionType } from '../../types';

export const FILTER_PILLS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Lập trình', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế', value: 'DESIGN' },
  { label: 'Học thuật', value: 'ACADEMIC' },
  { label: 'Kinh doanh', value: 'BUSINESS' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc', value: 'MUSIC' },
  { label: 'Thể thao', value: 'SPORTS' },
];

interface ExploreSplitHeroProps {
  exploreTab: 'MENTOR_POSTS' | 'LEARNER_REQUESTS';
  searchKeyword: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (val: string) => void;
  advancedFilter: {
    sessionType: 'ALL' | SessionType;
    minTrustScore: number;
    sortBy: 'relevance' | 'newest' | 'trustScore';
  };
  onOpenFilterModal: () => void;
}

export const ExploreSplitHero: React.FC<ExploreSplitHeroProps> = ({
  exploreTab,
  searchKeyword,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  advancedFilter,
  onOpenFilterModal,
}) => {
  const hasAdvancedFilters = advancedFilter.sessionType !== 'ALL' || advancedFilter.minTrustScore > 0;

  return (
    <section className="relative pt-10 sm:pt-14 pb-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Tiêu đề thanh lịch & gọn gàng */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
        Khám phá Không gian <br className="hidden sm:inline" />
        <span className="text-primary-700">Tri thức Học thuật</span>
      </h1>

      <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed font-normal">
        Kết nối, trao đổi kỹ năng và học tập 1-on-1 hoặc theo nhóm cùng cộng đồng sinh viên.
      </p>

      {/* Thanh Search tối giản & tinh tế */}
      <div className="relative max-w-2xl mx-auto mt-7">
        <div className="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-2xs hover:border-slate-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-50/80 transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              exploreTab === 'LEARNER_REQUESTS'
                ? 'Tìm theo môn cần học, người học, kỹ năng...'
                : 'Tìm kiếm môn học, người dạy, hoặc chủ đề...'
            }
            className="w-full pl-11 pr-10 py-3 rounded-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dải Category Text-Only Pills (Tự động wrap vừa vặn, không bị khuất hai bên) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-3xl mx-auto">
        {FILTER_PILLS.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelectCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 font-medium'
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {/* Nút Lọc Thêm */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 border ${
            hasAdvancedFilters
              ? 'bg-primary-50 text-primary-800 border-primary-300 font-semibold'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <span>Lọc thêm</span>
          {hasAdvancedFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
        </button>
      </div>
    </section>
  );
};
