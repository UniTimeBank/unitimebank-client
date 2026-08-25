import React, { useState, useMemo } from 'react';
import { Plus, CalendarCheck, Search, X, UserCheck, Users, Radio } from 'lucide-react';
import { BookingCard, CancelBookingModal } from '../components';
import { BookingDetailModal } from '@/features/booking';
import { PostSessionRatingModal } from '@/features/moderation';
import { CreateGroupRoomModal, GroupRoomCard } from '@/features/session';
import {
  useGetActiveGroupRoomsQuery,
  useGetGroupRoomsHistoryQuery,
  useCloseGroupRoomMutation,
} from '@/core/api/session';
import { toast } from '@/shared/utils';
import { Button, Tabs, Pagination } from '@/shared/components/ui';
import { useManageBookings, type BookingTabType } from '../hooks';
import type { BookingItem } from '../types';

export const BookingManagementPage: React.FC = () => {
  const [sessionMode, setSessionMode] = useState<'ONE_ON_ONE' | 'GROUP'>('ONE_ON_ONE');
  const [groupTab, setGroupTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
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

  // Group Rooms Query for GROUP mode (Luôn fetch để hiển thị badge số lượng ngay lập tức)
  const {
    data: groupRoomsData,
    isLoading: isGroupRoomsLoading,
    refetch: refetchGroupRooms,
  } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 12000,
    refetchOnFocus: true,
  });

  const {
    data: historyRoomsData,
    isLoading: isHistoryRoomsLoading,
    refetch: refetchHistoryRooms,
  } = useGetGroupRoomsHistoryQuery(undefined, {
    skip: sessionMode !== 'GROUP',
    refetchOnFocus: true,
  });

  const [closeGroupRoom, { isLoading: isClosingGroupRoom }] = useCloseGroupRoomMutation();

  const handleCloseGroupRoom = async (roomId: string) => {
    try {
      await closeGroupRoom(roomId).unwrap();
      toast.success('Đã đóng phòng học nhóm.');
      refetchGroupRooms();
      refetchHistoryRooms();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể đóng phòng học nhóm.');
    }
  };

  const groupRooms = useMemo(() => groupRoomsData?.rooms || [], [groupRoomsData]);
  const historyGroupRooms = useMemo(() => historyRoomsData?.rooms || [], [historyRoomsData]);

  const filteredGroupRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groupRooms;
    return groupRooms.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q),
    );
  }, [searchQuery, groupRooms]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 min-h-[580px] animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Quản lý Buổi học
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý toàn diện lịch hẹn 1:1, duyệt yêu cầu ký quỹ và các phòng học nhóm trực tuyến.
          </p>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {sessionMode === 'ONE_ON_ONE' ? (
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
          ) : (
            <>
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
                variant="primary"
                size="sm"
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tạo phòng nhóm mới</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. SEGMENTED SWITCHER: 1:1 VS GROUP SESSIONS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 shadow-2xs w-fit">
          <button
            type="button"
            onClick={() => {
              setSessionMode('ONE_ON_ONE');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sessionMode === 'ONE_ON_ONE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${sessionMode === 'ONE_ON_ONE' ? 'text-primary-600' : 'text-slate-400'}`} />
            <span>Buổi học 1:1</span>
            {pendingBookings.length + upcomingBookings.length > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                  sessionMode === 'ONE_ON_ONE'
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {pendingBookings.length + upcomingBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSessionMode('GROUP');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sessionMode === 'GROUP'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${sessionMode === 'GROUP' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Lớp học nhóm</span>
            {groupRooms.length > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                  sessionMode === 'GROUP'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {groupRooms.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                sessionMode === 'ONE_ON_ONE'
                  ? 'Tìm theo bài đăng, gia sư, học viên...'
                  : 'Tìm theo chủ đề, danh mục phòng nhóm...'
              }
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
      {/* 3. MODE: ONE_ON_ONE CONTENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {sessionMode === 'ONE_ON_ONE' ? (
        <div className="space-y-6">
          {/* Status Tabs for 1:1 */}
          <div className="border-b border-gray-200">
            <Tabs<BookingTabType>
              value={activeTab}
              onChange={setActiveTab}
              variant="underline"
              options={[
                { value: 'PENDING', label: 'Đang chờ', count: pendingBookings.length },
                { value: 'UPCOMING', label: 'Sắp tới', count: upcomingBookings.length },
                { value: 'HISTORY', label: 'Lịch sử', count: historyBookings.length },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Đang tải danh sách buổi học...</p>
            </div>
          ) : currentTabBookings.length === 0 ? (
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
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════ */
        /* 4. MODE: GROUP SESSIONS CONTENT */
        /* ════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Sub-tabs for Group Sessions */}
          <div className="border-b border-gray-200">
            <Tabs<'ACTIVE' | 'HISTORY'>
              value={groupTab}
              onChange={setGroupTab}
              variant="underline"
              options={[
                { value: 'ACTIVE', label: 'Đang mở', count: groupRooms.length },
                { value: 'HISTORY', label: 'Lịch sử đã đóng', count: historyGroupRooms.length },
              ]}
            />
          </div>

          {groupTab === 'ACTIVE' ? (
            isGroupRoomsLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-gray-500">Đang tải phòng học nhóm...</p>
              </div>
            ) : filteredGroupRooms.length === 0 ? (
              <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {searchQuery ? 'Không tìm thấy phòng nhóm phù hợp' : 'Chưa có phòng học nhóm nào đang mở'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-sm mx-auto">
                    Bạn có thể mở một phòng học nhóm mới để cùng các bạn sinh viên khác trao đổi kiến thức ngay bây giờ.
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
                    Mở phòng học nhóm ngay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroupRooms.map((room) => (
                  <GroupRoomCard
                    key={room.roomId}
                    room={room}
                    currentUserId={currentUserId}
                    onCloseRoom={handleCloseGroupRoom}
                    isClosing={isClosingGroupRoom}
                  />
                ))}
              </div>
            )
          ) : (
            /* HISTORY GROUP ROOMS */
            isHistoryRoomsLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-gray-500">Đang tải lịch sử phòng nhóm...</p>
              </div>
            ) : historyGroupRooms.length === 0 ? (
              <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Chưa có lịch sử phòng học nhóm</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-sm mx-auto">
                    Các phòng học nhóm bạn đã mở hoặc từng tham gia sẽ được lưu vết chi tiết tại đây.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyGroupRooms.map((room: any) => (
                  <div
                    key={room.roomId}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 text-[11px] font-semibold">
                          Đã kết thúc
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                          {room.totalParticipants} người tham gia
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                        {room.title}
                      </h3>

                      <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                        <p className="flex items-center gap-1.5">
                          <span>Thời lượng:</span>
                          <strong className="text-slate-800 font-bold">{room.durationMinutes} phút</strong>
                        </p>
                        {room.openedAt && (
                          <p className="text-[11px] text-slate-400">
                            {new Date(room.openedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(room.openedAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {!room.isHost && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          Vai trò: <strong className="text-slate-600">Thành viên tham gia</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
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

      <CreateGroupRoomModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </div>
  );
};
