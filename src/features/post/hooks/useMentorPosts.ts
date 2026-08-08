import {
  useGetMentorPostsQuery,
  useGetMyMentorPostsQuery,
  useCreateMentorPostMutation,
  useUpdateMentorPostMutation,
  useCloseMentorPostMutation,
  useDeleteMentorPostMutation,
} from '@/core/api/post/postApi';
import type {
  GetMentorPostsParams,
  CreateMentorPostDto,
  UpdateMentorPostDto,
} from '../types';

export const useMentorPosts = (params?: GetMentorPostsParams) => {
  const {
    data: mentorPostsData,
    isLoading,
    error,
    refetch,
  } = useGetMentorPostsQuery(params);

  const [createMentorPostMutation, { isLoading: isCreating }] =
    useCreateMentorPostMutation();

  const [updateMentorPostMutation, { isLoading: isUpdating }] =
    useUpdateMentorPostMutation();

  const [closeMentorPostMutation, { isLoading: isClosing }] =
    useCloseMentorPostMutation();

  const [deleteMentorPostMutation, { isLoading: isDeleting }] =
    useDeleteMentorPostMutation();

  const handleCreatePost = async (dto: CreateMentorPostDto) => {
    try {
      const created = await createMentorPostMutation(dto).unwrap();
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUpdatePost = async (id: string, dto: UpdateMentorPostDto) => {
    try {
      const updated = await updateMentorPostMutation({ id, data: dto }).unwrap();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleClosePost = async (id: string) => {
    try {
      const closed = await closeMentorPostMutation(id).unwrap();
      return { success: true, data: closed };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const deleted = await deleteMentorPostMutation(id).unwrap();
      return { success: true, data: deleted };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    posts: mentorPostsData?.items || [],
    total: mentorPostsData?.total || 0,
    totalPages: mentorPostsData?.totalPages || 1,
    page: mentorPostsData?.page || 1,
    isLoading,
    error,
    refetch,
    createPost: handleCreatePost,
    isCreating,
    updatePost: handleUpdatePost,
    isUpdating,
    closePost: handleClosePost,
    isClosing,
    deletePost: handleDeletePost,
    isDeleting,
  };
};

export const useMyMentorPosts = (params?: { page?: number; limit?: number; status?: string }) => {
  const { data, isLoading, error, refetch } = useGetMyMentorPostsQuery(params);

  return {
    myPosts: data?.items || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
  };
};
