import React from 'react';
import { useCommunityGroups } from '@/features/post/hooks';
import {
  CommunityHeaderBanner,
  CommunityFilterBar,
  GroupCard,
  GroupCardSkeleton,
  GroupEmptyState,
} from '@/features/post/components/community';

export const CommunityPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    groups,
    isLoading,
    isFetching,
  } = useCommunityGroups();

  const groupList = Array.isArray(groups) ? groups : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <CommunityHeaderBanner />

      {/* Filter and Search Bar */}
      <CommunityFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Groups Grid / Skeleton / Empty State */}
      <div className="min-h-[380px] transition-opacity duration-200">
        {isLoading && groupList.length === 0 ? (
          <GroupCardSkeleton />
        ) : groupList.length === 0 ? (
          <div className="animate-in fade-in duration-200">
            <GroupEmptyState isMyGroupsTab={activeTab === 'MY_GROUPS'} />
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200 ${
              isFetching ? 'opacity-80 transition-opacity' : 'opacity-100'
            }`}
          >
            {groupList.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
