import { useGetMentorPostByIdQuery } from '@/core/api/post/postApi';

export const useMentorPostDetail = (id?: string) => {
  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useGetMentorPostByIdQuery(id || '', {
    skip: !id,
  });

  return {
    post,
    isLoading,
    error,
    refetch,
  };
};
