import React, { useState } from 'react';
import { Plus, CalendarCheck, Search, X, GraduationCap, BookOpen } from 'lucide-react';
import { BookingCard, CancelBookingModal } from '../components';
import { BookingDetailModal } from '@/features/booking';
import { PostSessionRatingModal } from '@/features/moderation';
import { Button, Tabs, Pagination } from '@/shared/components/ui';
import { useManageBookings, type BookingRoleType, type BookingTabType } from '../hooks';
import type { BookingItem } from '../types';

export const BookingManagementPage: React.FC = () => {
  const [ratingBooking, setRatingBooking] = useState<BookingItem | null>(null);

  const {
    currentUserId,
    roleTab,
    setRoleTab,
    teachingBookings,
    learningBookings,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    cancelModalBooking,
    detailModalBooking,
    pendingBookings,
    upcomingBookings,
    historyBookings,
    currentTabBookings,
    paginatedBookings,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    isLoading,
    isAccepting,
    isRejecting,
    isCancelling,
    handleAccept,
    handleReject,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    handleOpenChat,
    handleOpenDetail,
    handleCloseDetail,
    handleJoinRoom,
    navigate,
  } = useManageBookings();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Quản lý Buổi học 1:1
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý toàn diện lịch hẹn 1:1, duyệt yêu cầu ký quỹ và lịch sử các buổi học cá nhân.
          </p>
        </div>

        {/* Action Button: Tạo lịch trống mới */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/manage/schedule')}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo lịch trống mới</span>
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. PRIMARY ROLE TABS (Lớp tôi dạy vs Lớp tôi học) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200">
        <Tabs<BookingRoleType>
          value={roleTab}
          onChange={setRoleTab}
          variant="underline"
          options={[
            {
              value: 'TEACHING',
              label: 'Lớp tôi dạy',
              count: teachingBookings.length,
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              value: 'LEARNING',
              label: 'Lớp tôi học',
              count: learningBookings.length,
              icon: <BookOpen className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. SUB-STATUS FILTER PILLS & SEARCH BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { value: 'PENDING', label: 'Đang chờ', count: pendingBookings.length },
              { value: 'UPCOMING', label: 'Sắp tới', count: upcomingBookings.length },
              { value: 'HISTORY', label: 'Lịch sử', count: historyBookings.length },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-primary-50 text-primary-800 border-primary-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-primary-200/80 text-primary-900' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo bài đăng, gia sư, học viên..."
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
      {/* 4. BOOKINGS LIST */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách buổi học...</p>
        </div>
      ) : currentTabBookings.length === 0 ? (
        <div className="bg-gray-50/50 rounded-3xl p-12 border border-dashed border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-xs">
            {roleTab === 'TEACHING' ? (
              <GraduationCap className="w-6 h-6" />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-gray-900">
              {searchQuery.trim()
                ? 'Không tìm thấy buổi học phù hợp'
                : roleTab === 'TEACHING'
                ? activeTab === 'PENDING'
                  ? 'Không có yêu cầu dạy nào đang chờ'
                  : activeTab === 'UPCOMING'
                  ? 'Chưa có lịch dạy nào sắp tới'
                  : 'Chưa có lịch sử lớp dạy'
                : activeTab === 'PENDING'
                ? 'Không có yêu cầu học nào đang chờ'
                : activeTab === 'UPCOMING'
                ? 'Chưa có lịch học nào sắp tới'
                : 'Chưa có lịch sử buổi học'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {searchQuery.trim()
                ? 'Hãy thử tìm kiếm với từ khóa kỹ năng, tên môn học hoặc tên đối tác khác.'
                : roleTab === 'TEACHING'
                ? activeTab === 'PENDING'
                  ? 'Các yêu cầu đặt lịch học từ học viên sẽ xuất hiện tại đây để bạn duyệt và xác nhận.'
                  : activeTab === 'UPCOMING'
                  ? 'Khi bạn đồng ý lịch dạy hoặc học viên nhận đề nghị, buổi dạy sẽ chuyển sang đây.'
                  : 'Lịch sử các buổi học bạn đã giảng dạy cho học viên sẽ hiển thị tại đây.'
                : activeTab === 'PENDING'
                ? 'Các yêu cầu học bạn đã gửi tới Mentor đang chờ phản hồi sẽ xuất hiện tại đây.'
                : activeTab === 'UPCOMING'
                ? 'Khám phá thêm các bài dạy của Mentor hoặc gửi yêu cầu học để bắt đầu.'
                : 'Lịch sử các buổi học bạn đã tham gia cùng Mentor sẽ hiển thị tại đây.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate(roleTab === 'TEACHING' ? '/manage/schedule' : '/explore')}
              className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-5 shadow-xs cursor-pointer"
            >
              {roleTab === 'TEACHING' ? 'Cập nhật lịch rảnh' : 'Khám phá bài dạy ngay'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {paginatedBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                currentUserId={currentUserId}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleOpenCancelModal}
                onMessage={handleOpenChat}
                onOpenDetail={handleOpenDetail}
                onJoinRoom={handleJoinRoom}
                onRate={(booking) => setRatingBooking(booking)}
                isAccepting={isAccepting}
                isRejecting={isRejecting}
                isCancelling={isCancelling}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="buổi học"
              />
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <CancelBookingModal
        booking={cancelModalBooking}
        isOpen={Boolean(cancelModalBooking)}
        onClose={handleCloseCancelModal}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
        currentUserId={currentUserId}
      />

      {ratingBooking && (
        <PostSessionRatingModal
          isOpen={Boolean(ratingBooking)}
          onClose={() => setRatingBooking(null)}
          bookingId={ratingBooking.id}
          mentorId={ratingBooking.mentorId}
          mentorName={ratingBooking.mentorName}
          mentorAvatar={ratingBooking.mentorAvatar}
          onSuccess={() => {
            setRatingBooking(null);
          }}
        />
      )}

      <BookingDetailModal
        booking={detailModalBooking}
        isOpen={Boolean(detailModalBooking)}
        onClose={handleCloseDetail}
        currentUserId={currentUserId}
        onOpenChat={handleOpenChat}
        onJoinRoom={handleJoinRoom}
        onOpenCancel={handleOpenCancelModal}
        onAccept={handleAccept}
        onReject={handleReject}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
      />
    </div>
  );
};
