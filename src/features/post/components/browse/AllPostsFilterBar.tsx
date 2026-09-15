import React, { useState, useRef, useEffect } from 'react';
import { Search, ListFilter, ChevronDown, Check, RotateCcw, X } from 'lucide-react';
import type { PostTabType } from '../../hooks';

interface AllPostsFilterBarProps {
  activeTab: PostTabType;
  onTabChange: (tab: PostTabType) => void;
  searchKeyword: string;
  onSearchKeywordChange: (kw: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onClearSearch: () => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalItems: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'TẤT CẢ DANH MỤC' },
  { value: 'PROGRAMMING', label: 'LẬP TRÌNH' },
  { value: 'LANGUAGE', label: 'NGOẠI NGỮ' },
  { value: 'DESIGN', label: 'THIẾT KẾ' },
  { value: 'ACADEMIC', label: 'HỌC THUẬT' },
  { value: 'BUSINESS', label: 'KINH DOANH' },
  { value: 'SOFT_SKILLS', label: 'KỸ NĂNG MỀM' },
  { value: 'MUSIC', label: 'ÂM NHẠC' },
  { value: 'SPORTS', label: 'THỂ THAO' },
  { value: 'OTHER', label: 'KHÁC' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'MỚI NHẤT' },
  { value: 'trustScore', label: 'ĐIỂM UY TÍN CAO' },
  { value: 'relevance', label: 'PHÙ HỢP NHẤT' },
];

export const AllPostsFilterBar: React.FC<AllPostsFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchKeyword,
  onSearchKeywordChange,
  onSearchSubmit,
  onClearSearch,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { value: PostTabType; label: string }[] = [
    { value: 'ALL', label: 'TẤT CẢ BÀI ĐĂNG' },
    { value: 'MENTOR_POSTS', label: 'LỚP HỌC MENTOR' },
    { value: 'LEARNER_REQUESTS', label: 'YÊU CẦU HỌC TẬP' },
  ];

  const currentCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || 'TẤT CẢ DANH MỤC';
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'MỚI NHẤT';

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs">
      {/* 1. Top Row: Primary Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold uppercase tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'text-slate-800 hover:text-[#1B4D3E] hover:bg-slate-100/70 font-bold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Subtle Divider Line */}
      <div className="border-t border-slate-100 my-3.5 sm:my-4" />

      {/* 2. Bottom Row: Search Box & Dropdown Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input Box */}
        <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-0">
          <div className="flex items-center bg-[#F1F5F9] rounded-xl px-4 py-2.5 border border-transparent focus-within:border-primary-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              placeholder="Tìm kiếm bài đăng..."
              className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={onClearSearch}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 cursor-pointer transition-colors shrink-0 ml-1"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Category Dropdown Pill */}
        <div className="relative shrink-0" ref={categoryRef}>
          <button
            type="button"
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsSortOpen(false);
            }}
            className="w-full sm:w-auto bg-[#F1F5F9] hover:bg-slate-200/80 active:bg-slate-300/80 text-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-transparent select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ListFilter className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">{currentCategoryLabel}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                isCategoryOpen ? 'rotate-180 text-primary-700' : ''
              }`}
            />
          </button>

          {/* Category Dropdown Menu */}
          {isCategoryOpen && (
            <div className="absolute z-50 top-full left-0 sm:left-auto sm:right-0 mt-1.5 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-1.5 max-h-60 overflow-y-auto space-y-0.5">
                {CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = opt.value === category;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onCategoryChange(opt.value);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left uppercase tracking-wide ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown Pill */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
            }}
            className="w-full sm:w-auto bg-[#F1F5F9] hover:bg-slate-200/80 active:bg-slate-300/80 text-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-transparent select-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ListFilter className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">{currentSortLabel}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                isSortOpen ? 'rotate-180 text-primary-700' : ''
              }`}
            />
          </button>

          {/* Sort Dropdown Menu */}
          {isSortOpen && (
            <div className="absolute z-50 top-full right-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-1.5 space-y-0.5">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === sortBy;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left uppercase tracking-wide ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Filter Button (Optional when filters are active) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="p-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200/60 shrink-0 flex items-center justify-center"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
