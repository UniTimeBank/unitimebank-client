import React, { useState } from 'react';
import { Plus, CalendarCheck, Search, X, Radio, Video } from 'lucide-react';
import { BookingCard, CancelBookingModal } from '../components';
import { BookingDetailModal } from '@/features/booking';
import { PostSessionRatingModal } from '@/features/moderation';
import { CreateGroupRoomModal, GroupRoomCard } from '@/features/session';
import { Button, Tabs, Pagination } from '@/shared/components/ui';
import { useManageBookings, type BookingTabType } from '../hooks';
import type { BookingItem } from '../types';

export const BookingManagementPage: React.FC = () => {
  const [ratingBooking, setRatingBooking] = useState<BookingItem | null>(null);
  const {
    currentUserId,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    cancelModalBooking,
    detailModalBooking,
    pendingBookings,
    upcomingBookings,
    historyBookings,
    groupRooms,
    filteredGroupRooms,
    isGroupRoomsLoading,
    isCreateGroupModalOpen,
    setIsCreateGroupModalOpen,
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Quản lý Buổi học
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý các yêu cầu cố vấn, lớp học trực tuyến 1:1 và phòng học nhóm cộng đồng.
          </p>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/rooms/group')}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Sảnh học nhóm</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phòng nhóm</span>
          </Button>

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
      {/* 2. TABS & SEARCH BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200">
        <Tabs<BookingTabType>
          value={activeTab}
          onChange={setActiveTab}
          variant="underline"
          options={[
            { value: 'PENDING', label: 'Đang chờ', count: pendingBookings.length },
            { value: 'UPCOMING', label: 'Sắp tới', count: upcomingBookings.length },
            { value: 'GROUP', label: 'Lớp học nhóm', count: groupRooms.length },
            { value: 'HISTORY', label: 'Lịch sử', count: historyBookings.length },
          ]}
        />

        {/* Quick Search */}
        <div className="w-full sm:w-80 pb-2.5 shrink-0">
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
      {/* 3. LIST OF CARDS (GROUP ROOMS OR 1:1 BOOKINGS) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isLoading || (activeTab === 'GROUP' && isGroupRoomsLoading) ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách buổi học...</p>
        </div>
      ) : activeTab === 'GROUP' ? (
        // ── TAB: GROUP ROOMS ──────────────────────────────────────────
        filteredGroupRooms.length === 0 ? (
          <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Chưa có phòng học nhóm nào đang mở</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-sm mx-auto">
                Bạn có thể mở một phòng học nhóm mới để cùng bạn bè trao đổi kiến thức ngay bây giờ.
              </p>
            </div>
            <div className="pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
              >
                Mở phòng học mới
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroupRooms.map((room) => (
              <GroupRoomCard key={room.roomId} room={room} />
            ))}
          </div>
        )
      ) : currentTabBookings.length === 0 ? (
        // ── TAB: 1:1 BOOKINGS EMPTY STATE ─────────────────────────────
        <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {activeTab === 'PENDING'
                ? 'Không có yêu cầu nào đang chờ'
                : activeTab === 'UPCOMING'
                ? 'Chưa có lịch học nào sắp tới'
                : 'Chưa có lịch sử buổi học'}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-sm mx-auto">
              {activeTab === 'PENDING'
                ? 'Các yêu cầu đặt lịch từ học viên hoặc đề nghị dạy sẽ xuất hiện tại đây để bạn xác nhận.'
                : 'Khám phá thêm các bài đăng hoặc tạo lịch trống để nhận thêm nhiều buổi học.'}
            </p>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/explore')}
              className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              Khám phá lớp học ngay
            </Button>
          </div>
        </div>
      ) : (
        // ── TAB: 1:1 BOOKINGS LIST ────────────────────────────────────
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                currentUserId={currentUserId}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleOpenCancelModal}
                onJoinRoom={handleJoinRoom}
                onMessage={handleOpenChat}
                onOpenDetail={handleOpenDetail}
                onRate={setRatingBooking}
                isAccepting={isAccepting}
                isRejecting={isRejecting}
                isCancelling={isCancelling}
              />
            ))}
          </div>

          {/* Reusable Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="buổi học"
            />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. MODAL XÁC NHẬN HỦY BUỔI HỌC VÀ CẢNH BÁO PHÍ / ĐIỂM UY TÍN */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <CancelBookingModal
        booking={cancelModalBooking}
        isOpen={Boolean(cancelModalBooking)}
        onClose={handleCloseCancelModal}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
        currentUserId={currentUserId}
      />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 5. MODAL ĐÁNH GIÁ BUỔI HỌC SAU KHI HOÀN THÀNH */}
      {/* ════════════════════════════════════════════════════════════════ */}
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 6. MODAL XEM CHI TIẾT LỊCH TRÌNH VÀ KÝ QUỸ CREDIT */}
      {/* ════════════════════════════════════════════════════════════════ */}
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 7. MODAL TẠO PHÒNG HỌC NHÓM MỚI */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <CreateGroupRoomModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </div>
  );
};
