import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyBookingsQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  BookingStatus,
  type BookingItem,
} from '@/core/api/booking/bookingApi';
import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { toast } from '@/shared/utils';

export type BookingTabType = 'PENDING' | 'UPCOMING' | 'HISTORY';

export const useManageBookings = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const authUser = useAppSelector(selectCurrentUser);
  const currentUserId = profile?.userId || authUser?.id;

  const [activeTab, setActiveTab] = useState<BookingTabType>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingItem | null>(null);

  // Chat & Detail Modal States
  const [chatModalBooking, setChatModalBooking] = useState<BookingItem | null>(null);
  const [detailModalBooking, setDetailModalBooking] = useState<BookingItem | null>(null);

  // RTK Query API with Smart Targeted Polling (10s) & Window Focus Sync
  const {

    data: apiResponse,
    isLoading,
    refetch,
  } = useGetMyBookingsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
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
        b.status === BookingStatus.NO_SHOW ||
        b.status === BookingStatus.EXPIRED,
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
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const title = (b.title || '').toLowerCase();
        const mentor = (b.mentorName || '').toLowerCase();
        const learner = (b.learnerName || '').toLowerCase();
        const category = (b.category || '').toLowerCase();
        const note = (b.note || '').toLowerCase();

        return (
          title.includes(q) ||
          mentor.includes(q) ||
          learner.includes(q) ||
          category.includes(q) ||
          note.includes(q)
        );
      });
    }

    return list;
  }, [activeTab, pendingBookings, upcomingBookings, historyBookings, searchQuery]);

  // Handlers for mutations
  const handleAccept = async (id: string) => {
    try {
      await acceptBooking(id).unwrap();
      toast.success(
        'Đã chấp nhận và ký quỹ!',
        'Khoản credit đã được ký quỹ an toàn và chuyển vào mục Sắp tới.',
      );
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

  const handleOpenCancelModal = (id: string) => {
    const target = allBookings.find((b) => b.id === id);
    if (target) {
      setCancelModalBooking(target);
    }
  };

  const handleCloseCancelModal = () => {
    setCancelModalBooking(null);
  };

  const handleConfirmCancel = async (bookingId: string, reason: string) => {
    try {
      await cancelBooking({ id: bookingId, reason }).unwrap();
      toast.success(
        'Đã hủy lịch học thành công',
        cancelModalBooking?.status === BookingStatus.CONFIRMED
          ? 'Khoản credit ký quỹ đã được hoàn trả về ví.'
          : undefined,
      );
      handleCloseCancelModal();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể hủy lịch học');
    }
  };

  const handleJoinRoom = (id: string) => {
    toast.success('Đang kết nối phòng học 1-1...', `Mã buổi học: ${id}`);
  };

  const handleOpenChat = (itemOrId: BookingItem | string) => {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    navigate(`/manage/messages?bookingId=${id}`);
  };


  const handleCloseChat = () => {
    setChatModalBooking(null);
  };

  const handleOpenDetail = (booking: BookingItem) => {
    setDetailModalBooking(booking);
  };

  const handleCloseDetail = () => {
    setDetailModalBooking(null);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleTabChange = (tab: BookingTabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const totalPages = Math.ceil(currentTabBookings.length / pageSize);

  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return currentTabBookings.slice(start, start + pageSize);
  }, [currentTabBookings, page, pageSize]);

  return {
    currentUserId,
    activeTab,
    setActiveTab: handleTabChange,
    searchQuery,
    setSearchQuery: handleSearchChange,
    cancelModalBooking,
    chatModalBooking,
    detailModalBooking,
    allBookings,
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
    totalItems: currentTabBookings.length,
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
    handleCloseChat,
    handleOpenDetail,
    handleCloseDetail,
    handleJoinRoom,
    refetch,
    navigate,
  };
};

