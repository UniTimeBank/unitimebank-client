import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Plus,
  CalendarCheck,
  Search,
} from 'lucide-react';
import {
  useGetMyBookingsQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  BookingStatus,
} from '@/core/api/booking/bookingApi';
import { useUserProfile } from '@/features/user/hooks';
import { BookingCard } from '../components/BookingCard';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';

type TabType = 'PENDING' | 'UPCOMING' | 'HISTORY';

export const BookingManagementPage: React.FC = () => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'AS_MENTOR' | 'AS_LEARNER'>('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // 100% Dynamic RTK Query API
  const { data: apiResponse, isLoading, refetch } = useGetMyBookingsQuery({
    role: roleFilter === 'ALL' ? undefined : roleFilter,
  });

  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const allBookings = useMemo(() => {
    return apiResponse?.items || [];
  }, [apiResponse]);

  // Group bookings by Tab dynamically
  const pendingBookings = useMemo(() => {
    return allBookings.filter(
      (b) =>
        b.status === BookingStatus.PENDING_MENTOR_APPROVAL ||
        b.status === BookingStatus.PENDING_LEARNER_APPROVAL,
    );
  }, [allBookings]);

  const upcomingBookings = useMemo(() => {
    return allBookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED,
    );
  }, [allBookings]);

  const historyBookings = useMemo(() => {
    return allBookings.filter(
      (b) =>
        b.status === BookingStatus.COMPLETED ||
        b.status === BookingStatus.CANCELLED ||
        b.status === BookingStatus.REJECTED ||
        b.status === BookingStatus.NO_SHOW,
    );
  }, [allBookings]);

  // Filter current tab items by search query
  const currentTabBookings = useMemo(() => {
    let list =
      activeTab === 'PENDING'
        ? pendingBookings
        : activeTab === 'UPCOMING'
        ? upcomingBookings
        : historyBookings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.mentorName?.toLowerCase().includes(q) ||
          b.learnerName?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [activeTab, pendingBookings, upcomingBookings, historyBookings, searchQuery]);

  // Handlers for real mutations
  const handleAccept = async (id: string) => {
    try {
      await acceptBooking(id).unwrap();
      toast.success('Đã chấp nhận buổi học!', 'Khóa học đã được chuyển vào mục Sắp tới.');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể chấp nhận yêu cầu đặt lịch');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectBooking({ id, reason: 'Lịch bận đột xuất' }).unwrap();
      toast.success('Đã từ chối yêu cầu đặt lịch.');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể từ chối yêu cầu đặt lịch');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking({ id, reason: 'Hủy theo yêu cầu người dùng' }).unwrap();
      toast.success('Đã hủy lịch đặt học thành công.');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể hủy lịch học');
    }
  };

  const handleJoinRoom = (id: string) => {
    toast.success('Đang kết nối phòng học 1-1...', `Mã buổi học: ${id}`);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Quản lý Booking
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý các yêu cầu cố vấn và lịch trình sắp tới của bạn.
          </p>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Nút Lọc hiển thị */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2 px-3.5 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>LỌC HIỂN THỊ</span>
          </Button>

          {/* Nút Tạo lịch trống mới */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/manage/schedule')}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo lịch trống mới</span>
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. TABS & SEARCH BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 gap-4 overflow-x-auto pb-0.5">
          <div className="flex items-center gap-6 sm:gap-8 min-w-max">
            {/* Tab 1: Đang chờ */}
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`pb-3 text-xs sm:text-sm transition-all cursor-pointer select-none relative ${
                activeTab === 'PENDING'
                  ? 'font-extrabold text-gray-900'
                  : 'font-semibold text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Đang chờ ({pendingBookings.length})</span>
              {activeTab === 'PENDING' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
              )}
            </button>

            {/* Tab 2: Sắp tới */}
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              className={`pb-3 text-xs sm:text-sm transition-all cursor-pointer select-none relative ${
                activeTab === 'UPCOMING'
                  ? 'font-extrabold text-gray-900'
                  : 'font-semibold text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Sắp tới ({upcomingBookings.length})</span>
              {activeTab === 'UPCOMING' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
              )}
            </button>

            {/* Tab 3: Lịch sử */}
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`pb-3 text-xs sm:text-sm transition-all cursor-pointer select-none relative ${
                activeTab === 'HISTORY'
                  ? 'font-extrabold text-gray-900'
                  : 'font-semibold text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Lịch sử ({historyBookings.length})</span>
              {activeTab === 'HISTORY' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-56 sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, môn học..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50/80 hover:bg-white border border-gray-200 rounded-xl text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Toolbar (if expanded) */}
        {isFilterModalOpen && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">Lọc theo vai trò:</span>
              <div className="flex items-center gap-1.5">
                {(['ALL', 'AS_MENTOR', 'AS_LEARNER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      roleFilter === r
                        ? 'bg-primary-700 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    {r === 'ALL'
                      ? 'Tất cả'
                      : r === 'AS_MENTOR'
                      ? 'Tôi là Người dạy'
                      : 'Tôi là Người học'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRoleFilter('ALL');
                setSearchQuery('');
                setIsFilterModalOpen(false);
              }}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. LIST OF BOOKING CARDS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách booking...</p>
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
                : 'Chưa có lịch sử booking'}
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
              className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
            >
              Khám phá lớp học ngay
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTabBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              currentUserId={profile?.userId}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
              onJoinRoom={handleJoinRoom}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
              isCancelling={isCancelling}
            />
          ))}
        </div>
      )}
    </div>
  );
};
