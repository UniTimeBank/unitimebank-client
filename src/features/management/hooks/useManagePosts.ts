import { useState, useMemo } from 'react';
import {
  useGetMyMentorPostsQuery,
  useGetMyLearnerRequestsQuery,
  useUpdateMentorPostMutation,
  useDeleteMentorPostMutation,
  useCloseMentorPostMutation,
  useUpdateLearnerRequestMutation,
  useCancelLearnerRequestMutation,
} from '@/core/api/post';
import { PostStatus, LearnerRequestStatus } from '@/features/post/types';
import { toast } from '@/shared/utils';

export type PostTabType = 'MENTOR' | 'LEARNER';

export interface DeleteModalState {
  isOpen: boolean;
  id: string;
  title: string;
  type: PostTabType;
}

export const useManagePosts = () => {
  const [activeTab, setActiveTab] = useState<PostTabType>('MENTOR');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    id: '',
    title: '',
    type: 'MENTOR',
  });

  // Queries
  const {
    data: mentorPostsData,
    isLoading: isMentorLoading,
    refetch: refetchMentorPosts,
  } = useGetMyMentorPostsQuery();

  const {
    data: learnerRequestsData,
    isLoading: isLearnerLoading,
    refetch: refetchLearnerRequests,
  } = useGetMyLearnerRequestsQuery();

  // Mutations
  const [updateMentorPost, { isLoading: isUpdatingMentor }] = useUpdateMentorPostMutation();
  const [deleteMentorPost, { isLoading: isDeletingMentor }] = useDeleteMentorPostMutation();
  const [closeMentorPost, { isLoading: isClosingMentor }] = useCloseMentorPostMutation();

  const [updateLearnerRequest, { isLoading: isUpdatingLearner }] = useUpdateLearnerRequestMutation();
  const [cancelLearnerRequest, { isLoading: isCancellingLearner }] = useCancelLearnerRequestMutation();

  const mentorPosts = useMemo(() => {
    return (mentorPostsData?.items || []).filter(
      (p) => p.status !== ('ARCHIVED' as any) && !(p as any).removedAt,
    );
  }, [mentorPostsData]);

  const learnerRequests = useMemo(() => {
    return (learnerRequestsData?.items || []).filter(
      (r) => !(r as any).removedAt,
    );
  }, [learnerRequestsData]);

  // Filter items by search query
  const filteredMentorPosts = useMemo(() => {
    if (!searchQuery.trim()) return mentorPosts;
    const q = searchQuery.toLowerCase().trim();
    return mentorPosts.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const desc = (p.description || p.shortDescription || '').toLowerCase();
      const tags = (p.tags || []).map((t) => (t.skillName || '').toLowerCase()).join(' ');
      const cat = (p.tags?.[0]?.category || '').toLowerCase();
      return title.includes(q) || desc.includes(q) || tags.includes(q) || cat.includes(q);
    });
  }, [mentorPosts, searchQuery]);

  const filteredLearnerRequests = useMemo(() => {
    if (!searchQuery.trim()) return learnerRequests;
    const q = searchQuery.toLowerCase().trim();
    return learnerRequests.filter((r) => {
      const skill = (r.skillNeeded || '').toLowerCase();
      const desc = (r.description || r.shortDescription || '').toLowerCase();
      const cat = (r.category || '').toLowerCase();
      return skill.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [learnerRequests, searchQuery]);

  // Handlers
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      if (activeTab === 'MENTOR') {
        if (currentStatus === 'OPEN') {
          await closeMentorPost(id).unwrap();
          toast.success('Đã đóng bài dạy', 'Bài đăng đã ngừng nhận thêm yêu cầu mới.');
        } else {
          await updateMentorPost({ id, data: { status: PostStatus.PUBLISHED } }).unwrap();
          toast.success('Đã mở lại bài dạy', 'Học viên có thể tiếp tục tìm kiếm và đặt lịch.');
        }
        refetchMentorPosts();
      } else {
        if (currentStatus === 'OPEN') {
          await updateLearnerRequest({ id, data: { status: LearnerRequestStatus.CANCELLED } }).unwrap();
          toast.success('Đã đóng yêu cầu học', 'Yêu cầu của bạn đã được tạm ẩn.');
        } else {
          await updateLearnerRequest({ id, data: { status: LearnerRequestStatus.OPEN } }).unwrap();
          toast.success('Đã mở lại yêu cầu học', 'Gia sư có thể tiếp tục gửi đề nghị kết nối.');
        }
        refetchLearnerRequests();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể thay đổi trạng thái bài đăng');
    }
  };

  const handleOpenDeleteModal = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      title,
      type: activeTab,
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: '', title: '', type: 'MENTOR' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      if (deleteModal.type === 'MENTOR') {
        await deleteMentorPost(deleteModal.id).unwrap();
        toast.success('Đã xóa bài đăng thành công');
        refetchMentorPosts();
      } else {
        await cancelLearnerRequest(deleteModal.id).unwrap();
        toast.success('Đã xóa yêu cầu học thành công');
        refetchLearnerRequests();
      }
      handleCloseDeleteModal();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bài đăng');
    }
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Reset page to 1 when changing tab or search query
  const handleTabChange = (tab: PostTabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const isLoading = activeTab === 'MENTOR' ? isMentorLoading : isLearnerLoading;
  const currentList = activeTab === 'MENTOR' ? filteredMentorPosts : filteredLearnerRequests;
  const totalPages = Math.ceil(currentList.length / pageSize);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, page, pageSize]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    searchQuery,
    setSearchQuery: handleSearchChange,
    deleteModal,
    mentorPosts,
    learnerRequests,
    filteredMentorPosts,
    filteredLearnerRequests,
    currentList,
    paginatedList,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: currentList.length,
    isLoading,
    isMentorLoading,
    isLearnerLoading,
    isToggling: isUpdatingMentor || isClosingMentor || isUpdatingLearner,
    isDeleting: isDeletingMentor || isCancellingLearner,
    handleToggleStatus,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    refetchMentorPosts,
    refetchLearnerRequests,
  };
};
