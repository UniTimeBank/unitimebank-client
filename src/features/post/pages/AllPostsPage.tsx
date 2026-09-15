import React from 'react';
import { useAllPostsBrowser } from '../hooks';
import {
  AllPostsHeader,
  AllPostsTabs,
  AllPostsFilterBar,
  AllPostsSkeletonGrid,
  AllPostsEmptyState,
  AllPostsGrid,
} from '../components';
import { Pagination } from '@/shared/components/ui';

export const AllPostsPage: React.FC = () => {
  const {
    activeTab,
    category,
    sortBy,
    searchKeyword,
    setSearchKeyword,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    isLoading,
    hasActiveFilters,
    mentorCount,
    learnerCount,
    allCount,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
    handleSearchSubmit,
    handleResetFilters,
    handlePageChange,
  } = useAllPostsBrowser({ pageSize: 9 });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* 1. Header Banner matching Group Lobby Page design */}
        <AllPostsHeader />

        {/* 2. Unified Navigation Tabs, Search & Filter Toolbar */}
        <AllPostsFilterBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={() => {
            setSearchKeyword('');
            handleSearchSubmit();
          }}
          category={category}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          totalItems={totalItems}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {/* 4. Cards Grid / Loading Skeleton / Empty State */}
        <div className="pt-2">
          {isLoading ? (
            <AllPostsSkeletonGrid count={6} />
          ) : paginatedItems.length === 0 ? (
            <AllPostsEmptyState
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          ) : (
            <AllPostsGrid items={paginatedItems} />
          )}
        </div>

        {/* 5. Bottom Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              showItemCount={true}
              itemLabel="bài đăng"
            />
          </div>
        )}
      </div>
    </div>
  );
};
