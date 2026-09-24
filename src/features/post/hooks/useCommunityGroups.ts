import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetGroupsQuery } from '@/core/api/community/communityApi';

export const useCommunityGroups = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_GROUPS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch groups based on filters
  const { data: groups = [], isLoading, isFetching, refetch } = useGetGroupsQuery({
    search: searchQuery.trim() || undefined,
    category: selectedCategory === 'Tất cả' ? undefined : selectedCategory,
    myGroupsOnly: activeTab === 'MY_GROUPS',
  });

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
