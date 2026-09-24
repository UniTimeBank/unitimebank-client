import { useState, useMemo } from 'react';
import {
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
} from '@/core/api/community/communityApi';
import type { GroupPostTag } from '../types';
import { toast } from 'react-hot-toast';

export const useGroupPosts = (groupId: string, isMember?: boolean) => {
  const { data: rawPosts, isLoading, isFetching, refetch } = useGetGroupPostsQuery(groupId, {
    skip: !groupId,
  });

  const posts: GroupPost[] = useMemo(() => {
    if (Array.isArray(rawPosts)) return rawPosts;
    if (Array.isArray((rawPosts as any)?.posts)) return (rawPosts as any).posts;
    if (Array.isArray((rawPosts as any)?.data?.posts)) return (rawPosts as any).data.posts;
    if (Array.isArray((rawPosts as any)?.data)) return (rawPosts as any).data;
    return [];
  }, [rawPosts]);

  const [createPost, { isLoading: isPosting }] = useCreateGroupPostMutation();
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeGroupPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteGroupPostMutation();

  // Filter state
  const [filterTag, setFilterTag] = useState<string>('ALL');

  // Form state for creating post
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<GroupPostTag>('GENERAL');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    if (filterTag === 'ALL') return list;
    return list.filter((p) => p.tag === filterTag);
  }, [posts, filterTag]);

  const handleCreatePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết!');
      return;
    }
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm trước khi đăng bài!');
      return;
    }

    try {
      const images = imageUrl.trim() ? [imageUrl.trim()] : [];
      await createPost({
        groupId,
        data: {
          content: postContent.trim(),
          tag: selectedTag,
          images,
        },
      }).unwrap();

      toast.success('Đăng bài thành công!');
      setPostContent('');
      setImageUrl('');
      setShowImageInput(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể đăng bài viết. Vui lòng thử lại!');
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm để tương tác thả tim!');
      return;
    }
    try {
      await toggleLike({ groupId, postId }).unwrap();
    } catch (err: any) {
      toast.error('Không thể thực hiện tương tác thả tim');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deletePost({ groupId, postId }).unwrap();
      toast.success('Đã xóa bài viết thành công');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bài viết');
    }
  };

  return {
    posts,
    filteredPosts,
    isLoading,
    isFetching,
    filterTag,
    setFilterTag,
    // Form state
    postContent,
    setPostContent,
    selectedTag,
    setSelectedTag,
    imageUrl,
    setImageUrl,
    showImageInput,
    setShowImageInput,
    isPosting,
    isLiking,
    isDeleting,
    handleCreatePost,
    handleToggleLike,
    handleDeletePost,
    refetch,
  };
};
