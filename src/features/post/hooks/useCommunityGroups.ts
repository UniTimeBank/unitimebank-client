import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetGroupsQuery } from '@/core/api/community/communityApi';
import type { CommunityGroup } from '../types';

export const useCommunityGroups = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_GROUPS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleGroupCreated = (groupId: string) => {
    setIsCreateModalOpen(false);
    navigate(`/community/${groupId}`);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  return {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    handleGroupCreated,
    groups,
    isLoading,
    isFetching,
    refetch,
  };
};
