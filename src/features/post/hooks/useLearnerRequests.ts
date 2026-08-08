import {
  useGetLearnerRequestsQuery,
  useGetMyLearnerRequestsQuery,
  useCreateLearnerRequestMutation,
  useUpdateLearnerRequestMutation,
  useCancelLearnerRequestMutation,
} from '@/core/api/post/postApi';
import type {
  GetLearnerRequestsParams,
  CreateLearnerRequestDto,
  UpdateLearnerRequestDto,
} from '../types';

export const useLearnerRequests = (params?: GetLearnerRequestsParams) => {
  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useGetLearnerRequestsQuery(params);

  const [createRequestMutation, { isLoading: isCreating }] =
    useCreateLearnerRequestMutation();

  const [updateRequestMutation, { isLoading: isUpdating }] =
    useUpdateLearnerRequestMutation();

  const [cancelRequestMutation, { isLoading: isCancelling }] =
    useCancelLearnerRequestMutation();

  const handleCreateRequest = async (dto: CreateLearnerRequestDto) => {
    try {
      const created = await createRequestMutation(dto).unwrap();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUpdateRequest = async (id: string, dto: UpdateLearnerRequestDto) => {
    try {
      const updated = await updateRequestMutation({ id, data: dto }).unwrap();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const cancelled = await cancelRequestMutation(id).unwrap();
      return { success: true, data: cancelled };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    requests: requestsData?.items || [],
    total: requestsData?.total || 0,
    totalPages: requestsData?.totalPages || 1,
    page: requestsData?.page || 1,
    isLoading,
    error,
    refetch,
    createRequest: handleCreateRequest,
    isCreating,
    updateRequest: handleUpdateRequest,
    isUpdating,
    cancelRequest: handleCancelRequest,
    isCancelling,
  };
};

export const useMyLearnerRequests = (params?: { page?: number; limit?: number; status?: string }) => {
  const { data, isLoading, error, refetch } = useGetMyLearnerRequestsQuery(params);

  return {
    myRequests: data?.items || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
  };
};
