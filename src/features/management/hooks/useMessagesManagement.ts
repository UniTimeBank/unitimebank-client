import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  useGetMyBookingsQuery,
  useGetBookingMessagesQuery,
  useSendBookingMessageMutation,
  useSetBookingTypingMutation,
  useCancelBookingMutation,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  type BookingItem,
  BookingStatus,
} from '@/core/api/booking/bookingApi';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import LogoImage from '@/assets/images/Logo.png';
import { toast } from '@/shared/utils';

export type MessageFilterType = 'ACTIVE' | 'ALL' | 'CANCELLED' | 'COMPLETED' | 'MENTORS' | 'LEARNERS';

export interface PartnerInfo {
  id?: string;
  name: string;
  avatar: string;
  role: string;
  trustScore: number;
}

export const useMessagesManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');

  const { profile } = useUserProfile();
  const authUser = useAppSelector(selectCurrentUser);
  const currentUserId = profile?.userId || authUser?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MessageFilterType>('ACTIVE');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(urlBookingId);
  const [inputText, setInputText] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingItem | null>(null);

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch user's bookings
  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
  } = useGetMyBookingsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
  });

  const allBookings = useMemo(() => bookingsResponse?.items || [], [bookingsResponse]);

  const isMentor = (booking: BookingItem) =>
    currentUserId ? booking.mentorId === currentUserId : false;

  const getPartnerInfo = (booking: BookingItem): PartnerInfo => {
    const mentor = isMentor(booking);
    return {
      id: mentor ? booking.learnerId : booking.mentorId,
      name: mentor ? booking.learnerName || 'Học viên' : booking.mentorName || 'Gia sư',
      avatar: mentor ? booking.learnerAvatar || LogoImage : booking.mentorAvatar || LogoImage,
      role: mentor ? 'Học viên' : 'Gia sư',
      trustScore: mentor ? booking.learnerTrustScore ?? 100 : booking.mentorTrustScore ?? 100,
    };
  };

  // Gom nhóm các booking theo đối tác (partnerId) và bài post (sourcePostId)
  const baseConversations = useMemo(() => {
    const groups = new Map<string, BookingItem[]>();

    allBookings.forEach((b) => {
      const partnerId = isMentor(b) ? b.learnerId : b.mentorId;
      if (!partnerId) return;

      const groupKey = `${partnerId}_${b.sourcePostId || 'direct'}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(b);
    });

    const conversationList: BookingItem[] = [];

    groups.forEach((items) => {
      const sorted = [...items].sort((a, b) => {
        const isActiveA = a.status === BookingStatus.CONFIRMED || a.status === BookingStatus.STARTED;
        const isActiveB = b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED;
        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;
        return (
          new Date(b.createdAt || b.scheduledStart).getTime() -
          new Date(a.createdAt || a.scheduledStart).getTime()
        );
      });

      conversationList.push(sorted[0]);
    });

    return conversationList;
  }, [allBookings, currentUserId]);

  // Đếm số lượng cuộc hội thoại theo từng bộ lọc (rà quét toàn bộ 9 trạng thái)
  const filterCounts = useMemo(() => {
    return {
      ACTIVE: baseConversations.filter(
        (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED,
      ).length,
      ALL: baseConversations.length,
      COMPLETED: baseConversations.filter((b) => b.status === BookingStatus.COMPLETED).length,
      CANCELLED: baseConversations.filter(
        (b) =>
          b.status === BookingStatus.CANCELLED ||
          b.status === BookingStatus.REJECTED ||
          b.status === BookingStatus.EXPIRED ||
          b.status === BookingStatus.NO_SHOW,
      ).length,
      MENTORS: baseConversations.filter((b) => !isMentor(b)).length,
      LEARNERS: baseConversations.filter((b) => isMentor(b)).length,
    };
  }, [baseConversations, currentUserId]);

  // Lọc danh sách hội thoại theo filterType và search
  const conversations = useMemo(() => {
    let filtered = baseConversations;

    // Filter theo trạng thái / vai trò
    if (filterType === 'ACTIVE') {
      filtered = filtered.filter(
        (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED,
      );
    } else if (filterType === 'COMPLETED') {
      filtered = filtered.filter((b) => b.status === BookingStatus.COMPLETED);
    } else if (filterType === 'CANCELLED') {
      filtered = filtered.filter(
        (b) =>
          b.status === BookingStatus.CANCELLED ||
          b.status === BookingStatus.REJECTED ||
          b.status === BookingStatus.EXPIRED ||
          b.status === BookingStatus.NO_SHOW,
      );
    } else if (filterType === 'MENTORS') {
      filtered = filtered.filter((b) => !isMentor(b));
    } else if (filterType === 'LEARNERS') {
      filtered = filtered.filter((b) => isMentor(b));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((b) => {
        const title = (b.title || '').toLowerCase();
        const mentor = (b.mentorName || '').toLowerCase();
        const learner = (b.learnerName || '').toLowerCase();
        return title.includes(q) || mentor.includes(q) || learner.includes(q);
      });
    }

    return filtered;
  }, [baseConversations, filterType, searchQuery, currentUserId]);

  // Handler khi người dùng bấm chọn một cuộc hội thoại bên trái
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setSearchParams({ bookingId }, { replace: true });
  };

  // Auto-select conversation on initial load if none selected
  useEffect(() => {
    if (urlBookingId) {
      setSelectedBookingId(urlBookingId);
    } else if (!selectedBookingId && conversations.length > 0) {
      setSelectedBookingId(conversations[0].id);
    }
  }, [urlBookingId, conversations.length]);

  const activeBooking = useMemo(
    () => allBookings.find((b) => b.id === selectedBookingId) || null,
    [allBookings, selectedBookingId],
  );

  // Active chatting is only allowed when CONFIRMED or STARTED
  const isActiveChat =
    activeBooking?.status === BookingStatus.CONFIRMED ||
    activeBooking?.status === BookingStatus.STARTED;
  const isReadOnly = Boolean(activeBooking && !isActiveChat);

  const readOnlyNotice = useMemo(() => {
    if (!activeBooking) return '';
    switch (activeBooking.status) {
      case BookingStatus.CANCELLED:
        return 'Buổi học đã bị hủy. Cuộc trò chuyện đã đóng và chuyển sang chế độ chỉ đọc.';
      case BookingStatus.REJECTED:
        return 'Yêu cầu đặt lịch đã bị từ chối. Cuộc trò chuyện chuyển sang chế độ chỉ đọc.';
      case BookingStatus.COMPLETED:
        return 'Buổi học đã hoàn thành. Lịch sử trao đổi được lưu trữ ở chế độ chỉ đọc.';
      case BookingStatus.EXPIRED:
      case BookingStatus.NO_SHOW:
        return 'Buổi học đã kết thúc. Cuộc trò chuyện chuyển sang chế độ chỉ đọc.';
      case BookingStatus.PENDING_MENTOR_APPROVAL:
      case BookingStatus.PENDING_LEARNER_APPROVAL:
        return 'Buổi học đang chờ phê duyệt. Tính năng nhắn tin sẽ mở sau khi được chấp nhận.';
      default:
        return 'Cuộc trò chuyện đang ở chế độ chỉ đọc.';
    }
  }, [activeBooking]);

  // 2. REST loads history once; RTK Query cache is updated by Booking Socket.IO.
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
    isFetching: isMessagesFetching,
  } = useGetBookingMessagesQuery(selectedBookingId || '', {
    skip: !selectedBookingId,
    refetchOnFocus: true,
  });

  const messages = useMemo(() => messagesData?.items || [], [messagesData]);
  const isPartnerTyping = Boolean(messagesData?.isPartnerTyping);

  const [sendMessage, { isLoading: isSending }] = useSendBookingMessageMutation();
  const [uploadFileDirect, { isLoading: isUploading }] = useUploadFileDirectMutation();
  const [setBookingTyping] = useSetBookingTypingMutation();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    previewUrl?: string;
    type: 'IMAGE' | 'FILE';
    name: string;
    size: number;
  } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Scroll strictly inside the container
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
    inputRef.current?.focus();
  }, [selectedBookingId]);

  useEffect(() => {
    if (messages.length > 0 || isPartnerTyping) {
      setTimeout(() => scrollToBottom(true), 60);
    }
  }, [messages.length, isPartnerTyping]);

  const clientId = useRef(
    sessionStorage.getItem('unitime_client_id') || Math.random().toString(36).substring(2),
  ).current;

  useEffect(() => {
    sessionStorage.setItem('unitime_client_id', clientId);
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (selectedBookingId && !isReadOnly) {
      const isTypingNow = val.trim().length > 0;
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        setBookingTyping({
          bookingId: selectedBookingId,
          typing: isTypingNow,
          clientId,
        }).catch(() => {});
      }, 150);
    }
  };

  const handleSelectFile = (file: File) => {
    if (!file) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB (Cloudinary Free limit)
    if (file.size > maxFileSize) {
      toast.error('Dung lượng tệp vượt quá giới hạn 10MB (giới hạn Cloudinary). Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    const forbiddenExtensions = [
      '.exe',
      '.bat',
      '.cmd',
      '.sh',
      '.vbs',
      '.apk',
      '.msi',
    ];
    const fileName = file.name.toLowerCase();
    if (forbiddenExtensions.some((ext) => fileName.endsWith(ext))) {
      toast.error('Định dạng tệp này không được phép gửi vì lý do bảo mật.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    setPendingAttachment({
      file,
      previewUrl,
      type: isImage ? 'IMAGE' : 'FILE',
      name: file.name,
      size: file.size,
    });
  };

  const handleRemoveAttachment = () => {
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
    inputRef.current?.focus();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedBookingId || isSending || isUploading || isReadOnly) return;

    const hasText = Boolean(inputText.trim());
    const hasAttachment = Boolean(pendingAttachment);

    if (!hasText && !hasAttachment) return;

    const textContent = inputText.trim();
    setInputText('');
    setIsEmojiPickerOpen(false);

    if (selectedBookingId) {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      setBookingTyping({
        bookingId: selectedBookingId,
        typing: false,
        clientId,
      }).catch(() => {});
    }

    try {
      if (pendingAttachment) {
        // 1. Xin chữ ký rồi upload thẳng từ browser lên Cloudinary.
        const uploadRes = await uploadFileDirect({
          bookingId: selectedBookingId,
          file: pendingAttachment.file,
          purpose: 'CHAT_ATTACHMENT',
        }).unwrap();

        // 2. Send message with attachment metadata (prioritize pendingAttachment.name for UTF-8 integrity)
        await sendMessage({
          bookingId: selectedBookingId,
          content:
            textContent ||
            (pendingAttachment.type === 'IMAGE' ? 'Hình ảnh đính kèm' : pendingAttachment.name),
          type: pendingAttachment.type,
          attachmentUrl: uploadRes.secureUrl,
          attachmentName: pendingAttachment.name || uploadRes.originalFilename,
          attachmentSize: uploadRes.bytes,
          attachmentMime: pendingAttachment.file.type,
          attachmentPublicId: uploadRes.publicId,
          attachmentResourceType: uploadRes.resourceType,
        }).unwrap();

        handleRemoveAttachment();
      } else {
        // 3. Send text / link message
        const isUrl =
          /^https?:\/\/[^\s]+$/i.test(textContent) ||
          /^(meet\.google\.com|zoom\.us|github\.com|figma\.com|drive\.google\.com)/i.test(
            textContent,
          );

        await sendMessage({
          bookingId: selectedBookingId,
          content: textContent,
          type: isUrl ? 'LINK' : 'TEXT',
        }).unwrap();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleOpenCancelModal = (id: string) => {
    const target = allBookings.find((b) => b.id === id);
    if (target) {
      setIsDetailModalOpen(false);
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
        'Đã hủy lịch học thành công!',
        'Khoản ký quỹ (nếu có) đã được hoàn trả theo quy định.',
      );
      handleCloseCancelModal();
      refetchBookings();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể hủy lịch học');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptBooking(id).unwrap();
      toast.success('Đã chấp nhận và ký quỹ!', 'Khoản credit đã được ký quỹ an toàn.');
      setIsDetailModalOpen(false);
      refetchBookings();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể chấp nhận yêu cầu đặt lịch');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectBooking({ id, reason: 'Lịch bận đột xuất' }).unwrap();
      toast.success('Đã từ chối yêu cầu đặt lịch.');
      setIsDetailModalOpen(false);
      refetchBookings();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể từ chối yêu cầu đặt lịch');
    }
  };

  const handleJoinRoom = (bookingId: string) => {
    navigate(`/session/${bookingId}`);
  };

  return {
    navigate,
    currentUserId,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterCounts,
    selectedBookingId,
    setSelectedBookingId,
    handleSelectBooking,
    inputText,
    handleInputChange,
    handleSend,
    isDetailModalOpen,
    setIsDetailModalOpen,
    cancelModalBooking,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    handleAccept,
    handleReject,
    handleJoinRoom,
    isBookingsLoading,
    allBookings,
    conversations,
    activeBooking,
    getPartnerInfo,
    messages,
    isMessagesLoading,
    isMessagesFetching,
    refetchMessages,
    isPartnerTyping,
    isSending,
    isUploading,
    pendingAttachment,
    handleSelectFile,
    handleRemoveAttachment,
    isEmojiPickerOpen,
    setIsEmojiPickerOpen,
    handleEmojiSelect,
    isCancelling,
    isAccepting,
    isRejecting,
    isActiveChat,
    isReadOnly,
    readOnlyNotice,
    messagesContainerRef,
    inputRef,
  };
};
