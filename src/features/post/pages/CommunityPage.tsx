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
      <div>
        {isLoading ? (
          <GroupCardSkeleton />
        ) : groupList.length === 0 ? (
          <GroupEmptyState isMyGroupsTab={activeTab === 'MY_GROUPS'} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupList.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
