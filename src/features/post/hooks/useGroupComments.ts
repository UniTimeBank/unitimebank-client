import { useState, useMemo } from 'react';
import {
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} from '@/core/api/community/communityApi';
import type { GroupComment } from '../types';
import { toast } from 'react-hot-toast';

export interface ReplyTarget {
  commentId: string;
  rootParentId: string;
  authorName: string;
}

export const useGroupComments = (groupId: string, postId: string, isMember?: boolean) => {
  const { data: rawComments, isLoading, isFetching } = useGetGroupCommentsQuery(
    { groupId, postId },
    { skip: !groupId || !postId },
  );

  const comments: GroupComment[] = useMemo(() => {
    if (Array.isArray(rawComments)) return rawComments;
    return [];
  }, [rawComments]);

  // Group comments into 2 levels: Root comments and Level-2 replies
  const { rootComments, repliesMap } = useMemo(() => {
    const roots: GroupComment[] = [];
    const replies: Record<string, GroupComment[]> = {};

    comments.forEach((c) => {
      if (!c.parentId) {
        roots.push(c);
      } else {
        if (!replies[c.parentId]) {
          replies[c.parentId] = [];
        }
        replies[c.parentId].push(c);
      }
    });

    return { rootComments: roots, repliesMap: replies };
  }, [comments]);

  const [createComment, { isLoading: isSubmitting }] = useCreateGroupCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteGroupCommentMutation();

  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);

  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?.id || JSON.parse(userStr)?._id : '';
    } catch {
      return '';
    }
  })();

  const handleStartReply = (comment: GroupComment) => {
    // 2-level constraint: If replying to a reply, target the root parent
    const rootParentId = comment.parentId || comment._id;
    setReplyingTo({
      commentId: comment._id,
      rootParentId,
      authorName: comment.authorName,
    });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

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
        data: {
          content: content.trim(),
          parentId: replyingTo?.rootParentId,
          replyToUserName: replyingTo?.authorName,
        },
      }).unwrap();
      setContent('');
      setReplyingTo(null);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể gửi bình luận. Vui lòng thử lại!';
      toast.error(msg);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await deleteComment({ groupId, postId, commentId }).unwrap();
      toast.success('Đã xóa bình luận');
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể xóa bình luận';
      toast.error(msg);
    }
  };

  return {
    comments,
    rootComments,
    repliesMap,
    isLoading,
    isFetching,
    isSubmitting,
    isDeleting,
    content,
    setContent,
    replyingTo,
    handleStartReply,
    handleCancelReply,
    currentUserId,
    handleSendComment,
    handleDeleteComment,
  };
};
