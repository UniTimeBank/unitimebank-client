import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface PostFilterBarProps {
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  selectedUrgency?: string;
  onUrgencyChange?: (urgency: string) => void;
  activeCount?: number;
}

export const PostFilterBar: React.FC<PostFilterBarProps> = ({
  selectedCategory = 'Tất cả',
  onCategoryChange,
  selectedSort = 'Credit cao nhất',
  onSortChange,
  selectedUrgency = 'Tất cả',
  onUrgencyChange,
  activeCount = 248,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <div className="relative inline-block">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="appearance-none bg-white border border-gray-200/90 hover:border-gray-300 text-gray-700 text-xs font-bold py-2.5 pl-9 pr-8 rounded-xl shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="All">Danh mục: Tất cả</option>
            <option value="STEM">Danh mục: Lập trình & CNTT</option>
            <option value="ARTS">Danh mục: Thiết kế & Đồ họa</option>
            <option value="HUMANITIES">Danh mục: Ngoại ngữ & Xã hội</option>
            <option value="ECONOMICS">Danh mục: Kinh tế & Quản trị</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Credit */}
        <div className="relative inline-block">
          <select
            value={selectedSort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="appearance-none bg-white border border-gray-200/90 hover:border-gray-300 text-gray-700 text-xs font-bold py-2.5 pl-8 pr-8 rounded-xl shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="High to Low">Credit: Cao đến thấp</option>
            <option value="Low to High">Credit: Thấp đến cao</option>
            <option value="Newest">Mới nhất</option>
          </select>
          <span className="text-3xs font-black absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            💳
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Urgency */}
        <div className="relative inline-block">
          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange?.(e.target.value)}
            className="appearance-none bg-white border border-gray-200/90 hover:border-gray-300 text-gray-700 text-xs font-bold py-2.5 pl-8 pr-8 rounded-xl shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="Any">Độ khẩn: Tất cả</option>
            <option value="Urgent">⚡ Cần gấp</option>
            <option value="Standard">Tiêu chuẩn</option>
          </select>
          <span className="text-3xs font-black absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            ⚡
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Count */}
      <div className="text-xs font-medium text-gray-500">
        Hiển thị <span className="font-bold text-gray-900">{activeCount}</span> yêu cầu đang mở
      </div>
    </div>
  );
};
