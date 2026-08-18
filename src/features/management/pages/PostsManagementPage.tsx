import React from 'react';
import {
  FileText,
  Plus,
  BookOpen,
  GraduationCap,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Tabs } from '@/shared/components/ui';
import { ManagePostCard, DeletePostModal } from '../components';
import { useManagePosts } from '../hooks';

export const PostsManagementPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    deleteModal,
    mentorPosts,
    learnerRequests,
    currentList,
    isLoading,
    isToggling,
    isDeleting,
    handleToggleStatus,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
  } = useManagePosts();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Quản lý Bài đăng
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý, chỉnh sửa, đóng/mở và theo dõi các bài dạy kèm cũng như yêu cầu học của bạn.
          </p>
        </div>

        <Link to="/requests">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo bài đăng mới</span>
          </Button>
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. TABS & SEARCH BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
        <Tabs<'MENTOR' | 'LEARNER'>
          value={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="border-b-0"
          options={[
            {
              value: 'MENTOR',
              label: 'Lớp dạy của tôi',
              count: mentorPosts.length,
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              value: 'LEARNER',
              label: 'Yêu cầu học của tôi',
              count: learnerRequests.length,
              icon: <BookOpen className="w-4 h-4" />,
            },
          ]}
        />

        {/* Quick Search */}
        <div className="w-full sm:w-80 pb-3 sm:pb-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, kỹ năng, danh mục..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50/90 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium placeholder:text-gray-400 placeholder:text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. DYNAMIC LIST OF POSTS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách bài đăng...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-xs">
            {activeTab === 'MENTOR' ? (
              <FileText className="w-6 h-6" />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-gray-900">
              {searchQuery.trim()
                ? 'Không tìm thấy bài đăng phù hợp'
                : activeTab === 'MENTOR'
                ? 'Chưa có bài đăng mở lớp dạy nào'
                : 'Chưa có yêu cầu tìm gia sư nào'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {searchQuery.trim()
                ? 'Hãy thử tìm kiếm với từ khóa kỹ năng hoặc tiêu đề khác.'
                : activeTab === 'MENTOR'
                ? 'Hãy tạo một bài đăng chia sẻ tri thức để nhận thêm nhiều đề nghị đặt lịch từ học viên.'
                : 'Khi bạn đăng bài tìm người hướng dẫn 1-1, bài đăng sẽ xuất hiện tại đây.'}
            </p>
          </div>
          {!searchQuery.trim() && (
            <Link to="/requests" className="inline-block pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-5 shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tạo bài đăng ngay</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeTab === 'MENTOR'
            ? (currentList as typeof mentorPosts).map((post) => (
                <ManagePostCard
                  key={post._id}
                  type="MENTOR"
                  mentorPost={post}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleOpenDeleteModal}
                  isToggling={isToggling}
                  isDeleting={isDeleting}
                />
              ))
            : (currentList as typeof learnerRequests).map((req) => (
                <ManagePostCard
                  key={req._id}
                  type="LEARNER"
                  learnerRequest={req}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleOpenDeleteModal}
                  isToggling={isToggling}
                  isDeleting={isDeleting}
                />
              ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <DeletePostModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'MENTOR' ? 'Xác nhận xóa bài dạy' : 'Xác nhận xóa yêu cầu học'}
        postTitle={deleteModal.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

