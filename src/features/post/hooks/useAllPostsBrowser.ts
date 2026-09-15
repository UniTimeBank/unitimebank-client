import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMentorPosts, useLearnerRequests } from './';
import { mapMentorPostToCardItem, mapLearnerRequestToCardItem } from '../utils';
import type { ExploreCardItem } from '../types';

export type PostTabType = 'ALL' | 'MENTOR_POSTS' | 'LEARNER_REQUESTS';

export interface UseAllPostsBrowserOptions {
  pageSize?: number;
}

export const useAllPostsBrowser = (options: UseAllPostsBrowserOptions = {}) => {
  const { pageSize = 9 } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params Parsing
  const tabParam = searchParams.get('tab') as PostTabType | null;
  const activeTab: PostTabType =
    tabParam === 'LEARNER_REQUESTS' || tabParam === 'MENTOR_POSTS' || tabParam === 'ALL'
      ? tabParam
      : 'ALL';

  const categoryParam = searchParams.get('category') || 'ALL';
  const sortParam = (searchParams.get('sortBy') as 'newest' | 'trustScore' | 'relevance') || 'newest';
  const searchKeywordParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local state for instant input feedback
  const [searchKeyword, setSearchKeyword] = useState(searchKeywordParam);
  const [currentPage, setCurrentPage] = useState(pageParam > 0 ? pageParam : 1);

  // Sync internal state when URL query changes
  useEffect(() => {
    setSearchKeyword(searchKeywordParam);
  }, [searchKeywordParam]);

  useEffect(() => {
    setCurrentPage(pageParam > 0 ? pageParam : 1);
  }, [pageParam]);

  // Update URL helper
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'ALL') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset page to 1 unless page itself was explicitly updated
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleTabChange = (newTab: PostTabType) => {
    updateQueryParams({ tab: newTab === 'ALL' ? null : newTab, page: '1' });
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    updateQueryParams({ category: category === 'ALL' ? null : category, page: '1' });
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    updateQueryParams({ sortBy: sortBy === 'newest' ? null : sortBy, page: '1' });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateQueryParams({ q: searchKeyword.trim() || null, page: '1' });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSearchParams(new URLSearchParams(), { replace: true });
    setCurrentPage(1);
  };

  // 2. Fetch Data from API hooks
  const { posts: mentorPosts, isLoading: isLoadingMentors } = useMentorPosts({ page: 1, limit: 100 });
  const { requests: learnerRequests, isLoading: isLoadingLearners } = useLearnerRequests({ page: 1, limit: 100 });

  const isLoading = isLoadingMentors || isLoadingLearners;

  // 3. Transform and Normalize Data
  const allCardItems: ExploreCardItem[] = useMemo(() => {
    const mentorItems: ExploreCardItem[] = mentorPosts.map(mapMentorPostToCardItem);
    const learnerItems: ExploreCardItem[] = learnerRequests.map(mapLearnerRequestToCardItem);

    if (activeTab === 'MENTOR_POSTS') return mentorItems;
    if (activeTab === 'LEARNER_REQUESTS') return learnerItems;

    // Default 'ALL': Combine both
    return [...mentorItems, ...learnerItems];
  }, [mentorPosts, learnerRequests, activeTab]);

  // 4. Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    const result = allCardItems.filter((item) => {
      // Search keyword filter
      if (searchKeywordParam.trim()) {
        const kw = searchKeywordParam.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(kw);
        const matchDesc = item.description?.toLowerCase().includes(kw);
        const matchAuthor = item.authorName?.toLowerCase().includes(kw);
        const matchCategory = item.category?.toLowerCase().includes(kw);
        if (!matchTitle && !matchDesc && !matchAuthor && !matchCategory) return false;
      }

      // Category filter
      if (categoryParam !== 'ALL') {
        const itemCat = item.category?.toUpperCase();
        if (itemCat !== categoryParam.toUpperCase()) return false;
      }

      return true;
    });

    // Sort items
    result.sort((a, b) => {
      if (sortParam === 'trustScore') {
        return (b.trustScore || 0) - (a.trustScore || 0);
      }
      if (sortParam === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [allCardItems, searchKeywordParam, categoryParam, sortParam]);

  // 5. Pagination
  const totalItems = filteredAndSortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateQueryParams({ page: newPage.toString() });
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const hasActiveFilters =
    searchKeywordParam !== '' ||
    categoryParam !== 'ALL' ||
    sortParam !== 'newest' ||
    activeTab !== 'ALL';

  return {
    activeTab,
    category: categoryParam,
    sortBy: sortParam,
    searchKeyword,
    setSearchKeyword,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    isLoading,
    hasActiveFilters,
    mentorCount: mentorPosts.length,
    learnerCount: learnerRequests.length,
    allCount: mentorPosts.length + learnerRequests.length,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
    handleSearchSubmit,
    handleResetFilters,
    handlePageChange,
  };
};
