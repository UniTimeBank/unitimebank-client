import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageSquare } from 'lucide-react';
import { useGroupDetail, useGroupPosts, useCreateGroupPostForm } from '@/features/post/hooks';
import {
  GroupDetailHeader,
  GroupPostCreator,
  CreateGroupPostModal,
  GroupPostFilterTabs,
  GroupPostItem,
  GroupSidebarInfo,
} from '@/features/post/components/community';

export const GroupDetailPage: React.FC = () => {
  const { groupId = '' } = useParams<{ groupId: string }>();

  // 1. Group Info & Membership Hook
  const {
    group,
    isLoading: isGroupLoading,
    error,
    isMembershipProcessing,
    handleToggleMembership,
    handleShareGroup,
  } = useGroupDetail(groupId);

  // 2. Group Posts & Feed Actions Hook
  const {
    posts,
    filteredPosts,
    isLoading: isPostsLoading,
    filterTag,
    setFilterTag,
    isLiking,
    handleToggleLike,
    handleDeletePost,
  } = useGroupPosts(groupId, group?.isJoined);

  // 3. Create Post Modal Form Hook
  const postForm = useCreateGroupPostForm(groupId, group?.isJoined);

  if (isGroupLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-bold">Đang tải không gian nhóm...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Không tìm thấy nhóm học tập</h2>
        <p className="text-xs text-gray-500">
          Nhóm này có thể không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to="/community"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Cộng đồng</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Community Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá nhóm</span>
        </Link>
      </div>

      {/* Group Hero Banner & Info Header */}
      <GroupDetailHeader
        group={group}
        postCount={posts.length}
        isMembershipProcessing={isMembershipProcessing}
        onToggleMembership={handleToggleMembership}
        onShareGroup={handleShareGroup}
      />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Post Creator Trigger + Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Creator Trigger Bar */}
          <GroupPostCreator
            isMember={group.isJoined}
            onOpenCreateModal={postForm.openModal}
          />

          {/* Create Post Modal */}
          <CreateGroupPostModal
            form={postForm}
            groupName={group.name}
            isMember={group.isJoined}
          />

          {/* Filter Chips by Tag */}
          <GroupPostFilterTabs
            filterTag={filterTag}
            onFilterTagSelect={setFilterTag}
            totalPostsCount={posts.length}
          />

          {/* Posts List Feed */}
          {isPostsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-medium">
              Đang tải bảng tin...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Chưa có bài viết nào</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ tài liệu học tập vào nhóm!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <GroupPostItem
                  key={post._id}
                  post={post}
                  groupId={groupId}
                  isMember={group.isJoined}
                  onToggleLike={handleToggleLike}
                  onDeletePost={handleDeletePost}
                  isLiking={isLiking}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Group Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <GroupSidebarInfo group={group} />
        </div>
      </div>
    </div>
  );
};
