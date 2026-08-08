import { useGetPostRecommendationsQuery } from '@/core/api/post/postApi';

export const usePostRecommendations = () => {
  const { data, isLoading, error, refetch } = useGetPostRecommendationsQuery();

  return {
    recommendedMentorPosts: data?.recommendedMentorPosts || [],
    recommendedLearnerRequests: data?.recommendedLearnerRequests || [],
    isLoading,
    error,
    refetch,
  };
};
