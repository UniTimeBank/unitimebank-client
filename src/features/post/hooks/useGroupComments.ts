import { useState, useMemo } from 'react';
import {
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} from '@/core/api/community/communityApi';
import type { GroupComment } from '../types';
import { toast } from 'react-hot-toast';

export const useGroupComments = (groupId: string, postId: string, isMember?: boolean) => {
  const { data: rawComments, isLoading, isFetching } = useGetGroupCommentsQuery(
    { groupId, postId },
    { skip: !groupId || !postId },
  );

  const comments: GroupComment[] = useMemo(() => {
    if (Array.isArray(rawComments)) return rawComments;
    if (Array.isArray((rawComments as any)?.comments)) return (rawComments as any).comments;
    if (Array.isArray((rawComments as any)?.data?.comments)) return (rawComments as any).data.comments;
    if (Array.isArray((rawComments as any)?.data)) return (rawComments as any).data;
    return [];
  }, [rawComments]);

  const [createComment, { isLoading: isSubmitting }] = useCreateGroupCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteGroupCommentMutation();

  const [content, setContent] = useState('');

  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?.id || JSON.parse(userStr)?._id : '';
    } catch {
      return '';
    }
  })();

  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm để bình luận!');
      return;
    }

    try {
      await createComment({
        groupId,
        postId,
        data: { content: content.trim() },
      }).unwrap();
      setContent('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại!');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await deleteComment({ groupId, postId, commentId }).unwrap();
      toast.success('Đã xóa bình luận');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bình luận');
    }
  };

  return {
    comments,
    isLoading,
    isFetching,
    isSubmitting,
    isDeleting,
    content,
    setContent,
    currentUserId,
    handleSendComment,
    handleDeleteComment,
  };
};
