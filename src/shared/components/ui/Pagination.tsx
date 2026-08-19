import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  showPageSizeSelector = false,
  showItemCount = true,
  itemLabel = 'mục',
  className = '',
}) => {
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close page size menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setIsSizeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no items or only 1 page with no item count, do not render or render minimal
  if (totalPages <= 0) return null;

  // Calculate visible page numbers with smart ellipsis
  const paginationRange = useMemo(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      if (typeof i === 'number') {
        l = i;
      }
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const startItem = totalItems !== undefined ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 select-none ${className}`}
    >
      {/* Left: Item count & Page Size Selector */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium order-2 sm:order-1 flex-wrap">
        {showItemCount && totalItems !== undefined && (
          <span>
            Hiển thị <strong className="text-slate-800 font-semibold">{totalItems > 0 ? startItem : 0}</strong> -{' '}
            <strong className="text-slate-800 font-semibold">{endItem}</strong> trong tổng số{' '}
            <strong className="text-slate-800 font-semibold">{totalItems}</strong> {itemLabel}
          </span>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="relative flex items-center gap-1.5 ml-1" ref={sizeDropdownRef}>
            <span className="text-slate-400">Hiển thị:</span>
            <button
              type="button"
              onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
              className="py-1 px-2.5 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <span>{pageSize} / trang</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  isSizeMenuOpen ? 'rotate-180 text-primary-600' : ''
                }`}
              />
            </button>

            {/* Custom Popover Menu */}
            {isSizeMenuOpen && (
              <div className="absolute z-50 bottom-full left-12 mb-1.5 w-28 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 animate-in zoom-in-95 duration-150">
                {pageSizeOptions.map((opt) => {
                  const isSelected = opt === pageSize;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onPageSizeChange(opt);
                        setIsSizeMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt} / trang</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-center sm:self-auto order-1 sm:order-2">
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Trang trước"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {paginationRange.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Trang sau"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
