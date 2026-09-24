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

  const groups: CommunityGroup[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray((rawData as any)?.groups)) return (rawData as any).groups;
    if (Array.isArray((rawData as any)?.data?.groups)) return (rawData as any).data.groups;
    if (Array.isArray((rawData as any)?.data)) return (rawData as any).data;
    return [];
  }, [rawData]);

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
