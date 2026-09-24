import { useState, useMemo } from 'react';
import { useGetGroupsQuery } from '@/core/api/community/communityApi';
import type { CommunityGroup } from '../types';

export const useCommunityGroups = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_GROUPS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch groups based on filters
  const { data: rawData, isLoading, isFetching, refetch } = useGetGroupsQuery({
    search: searchQuery.trim() || undefined,
    category: selectedCategory === 'Tất cả' ? undefined : selectedCategory,
    myGroupsOnly: activeTab === 'MY_GROUPS',
  });

  const allFetchedGroups: CommunityGroup[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray((rawData as any)?.groups)) return (rawData as any).groups;
    if (Array.isArray((rawData as any)?.data?.groups)) return (rawData as any).data.groups;
    if (Array.isArray((rawData as any)?.data)) return (rawData as any).data;
    return [];
  }, [rawData]);

  // Client-side filtering guarantee (instant response, zero lag or state mismatch)
  const groups: CommunityGroup[] = useMemo(() => {
    return allFetchedGroups.filter((group) => {
      // 1. Tab filter
      if (activeTab === 'MY_GROUPS' && !group.isJoined) {
        return false;
      }

      // 2. Category filter
      if (
        selectedCategory &&
        selectedCategory !== 'Tất cả' &&
        selectedCategory !== 'ALL'
      ) {
        const groupCat = (group.category || '').trim().toLowerCase();
        const selectedCat = selectedCategory.trim().toLowerCase();
        if (groupCat !== selectedCat) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = (group.name || '').toLowerCase().includes(query);
        const descMatch = (group.description || '').toLowerCase().includes(query);
        const catMatch = (group.category || '').toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allFetchedGroups, selectedCategory, searchQuery, activeTab]);

  return {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    groups,
    isLoading,
    isFetching,
    refetch,
  };
};
