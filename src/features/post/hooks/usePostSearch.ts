import { useState } from 'react';
import {
  useSearchPostsQuery,
  useLazyGetPostSuggestionsQuery,
} from '@/core/api/post/postApi';
import type { SearchPostsParams } from '../types';

export const usePostSearch = (initialParams?: SearchPostsParams) => {
  const [params, setParams] = useState<SearchPostsParams>(initialParams || {});

  const { data, isLoading, isFetching, error, refetch } = useSearchPostsQuery(params);

  const [triggerSuggestions, { data: suggestions, isFetching: isFetchingSuggestions }] =
    useLazyGetPostSuggestionsQuery();

  const handleSearch = (newParams: Partial<SearchPostsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleGetSuggestions = (q: string) => {
    if (q.trim().length >= 2) {
      triggerSuggestions(q.trim());
    }
  };

  return {
    mentorPosts: data?.mentorPosts || [],
    learnerRequests: data?.learnerRequests || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    searchParams: params,
    setSearchParams: handleSearch,
    suggestions,
    isFetchingSuggestions,
    getSuggestions: handleGetSuggestions,
  };
};
