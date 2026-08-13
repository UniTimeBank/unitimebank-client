import { useGetLearnerRequestByIdQuery } from '@/core/api/post/postApi';

export const useLearnerRequestDetail = (id?: string) => {
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetLearnerRequestByIdQuery(id || '', {
    skip: !id,
  });

  return {
    request,
    isLoading,
    error,
    refetch,
  };
};
