import { useState, useMemo } from 'react';
import {
  useGetGroupPostsQuery,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
} from '@/core/api/community/communityApi';
import type { GroupPost } from '../types';
import { toast } from 'react-hot-toast';

export const useGroupPosts = (groupId: string, isMember?: boolean) => {
  const { data: rawPosts, isLoading, isFetching, refetch } = useGetGroupPostsQuery(groupId, {
    skip: !groupId,
  });

  const posts: GroupPost[] = useMemo(() => {
    if (Array.isArray(rawPosts)) return rawPosts;
    const obj = rawPosts as { posts?: GroupPost[]; data?: { posts?: GroupPost[] } | GroupPost[] };
    if (Array.isArray(obj?.posts)) return obj.posts;
    if (Array.isArray(obj?.data)) return obj.data;
    if (obj?.data && typeof obj.data === 'object' && 'posts' in obj.data && Array.isArray(obj.data.posts)) {
      return obj.data.posts;
    }
    return [];
  }, [rawPosts]);

  const [toggleLike, { isLoading: isLiking }] = useToggleLikeGroupPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteGroupPostMutation();

  // Filter state
  const [filterTag, setFilterTag] = useState<string>('ALL');

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    if (filterTag === 'ALL') return list;
    return list.filter((p) => p.tag === filterTag);
  }, [posts, filterTag]);

  const handleToggleLike = async (postId: string) => {
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm để tương tác thả tim!');
      return;
    }
    try {
      await toggleLike({ groupId, postId }).unwrap();
    } catch {
      toast.error('Không thể thực hiện tương tác thả tim');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deletePost({ groupId, postId }).unwrap();
      toast.success('Đã xóa bài viết thành công');
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Không thể xóa bài viết';
      toast.error(errorMsg);
    }
  };

  return {
    posts,
    filteredPosts,
    isLoading,
    isFetching,
    filterTag,
    setFilterTag,
    isLiking,
    isDeleting,
    handleToggleLike,
    handleDeletePost,
    refetch,
  };
};
