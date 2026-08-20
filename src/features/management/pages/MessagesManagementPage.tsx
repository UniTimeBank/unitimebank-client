import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Clock,
  Calendar,
  RefreshCw,
  X,
  User,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  useGetMyBookingsQuery,
  useGetBookingMessagesQuery,
  useSendBookingMessageMutation,
  useSetBookingTypingMutation,
  type BookingItem,
  BookingStatus,
} from '@/core/api/booking/bookingApi';

import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { Button } from '@/shared/components/ui';
import { BookingDetailModal } from '@/features/booking';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LogoImage from '@/assets/images/Logo.png';
import { toast } from '@/shared/utils';

export type RoleFilterType = 'ALL' | 'MENTORS' | 'LEARNERS';

export const MessagesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');

  const { profile } = useUserProfile();
  const authUser = useAppSelector(selectCurrentUser);
  const currentUserId = profile?.userId || authUser?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('ALL');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(urlBookingId);
  const [inputText, setInputText] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch user's bookings
  const { data: bookingsResponse, isLoading: isBookingsLoading } = useGetMyBookingsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
  });

  const allBookings = useMemo(() => bookingsResponse?.items || [], [bookingsResponse]);

  const isMentor = (booking: BookingItem) =>
    currentUserId ? booking.mentorId === currentUserId : false;

  const getPartnerInfo = (booking: BookingItem) => {
    const mentor = isMentor(booking);
    return {
      id: mentor ? booking.learnerId : booking.mentorId,
      name: mentor ? booking.learnerName || 'Học viên' : booking.mentorName || 'Gia sư',
      avatar: mentor ? booking.learnerAvatar || LogoImage : booking.mentorAvatar || LogoImage,
      role: mentor ? 'Học viên' : 'Gia sư',
      trustScore: mentor ? booking.learnerTrustScore ?? 100 : booking.mentorTrustScore ?? 100,
    };
  };

  // Filter conversations (Chỉ cho phép nhắn tin khi lời mời/booking đã được chấp nhận)
  const conversations = useMemo(() => {
    let list = allBookings.filter(
      (b) =>
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.STARTED ||
        b.status === BookingStatus.COMPLETED,
    );

    // Role filter
    if (roleFilter === 'MENTORS') {
      list = list.filter((b) => !isMentor(b));
    } else if (roleFilter === 'LEARNERS') {
      list = list.filter((b) => isMentor(b));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const title = (b.title || '').toLowerCase();
        const mentor = (b.mentorName || '').toLowerCase();
        const learner = (b.learnerName || '').toLowerCase();
        return title.includes(q) || mentor.includes(q) || learner.includes(q);
      });
    }

    return list;
  }, [allBookings, roleFilter, searchQuery, currentUserId]);

  // Auto-select conversation from URL bookingId or first available
  useEffect(() => {
    if (urlBookingId) {
      setSelectedBookingId(urlBookingId);
    } else if (!selectedBookingId && conversations.length > 0) {
      setSelectedBookingId(conversations[0].id);
    }
  }, [conversations, selectedBookingId, urlBookingId]);

  const activeBooking = useMemo(
    () => allBookings.find((b) => b.id === selectedBookingId) || null,
    [allBookings, selectedBookingId],
  );

  // 2. Fetch messages for selected booking (Redux RTK Query Cache & Auto-polling)
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
    isFetching: isMessagesFetching,
  } = useGetBookingMessagesQuery(selectedBookingId || '', {
    skip: !selectedBookingId,
    pollingInterval: 2500,
    refetchOnFocus: true,
  });

  const messages = useMemo(() => messagesData?.items || [], [messagesData]);
  const isPartnerTyping = Boolean(messagesData?.isPartnerTyping);

  const [sendMessage, { isLoading: isSending }] = useSendBookingMessageMutation();
  const [setBookingTyping] = useSetBookingTypingMutation();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    sessionStorage.getItem('unitime_client_id') || Math.random().toString(36).substring(2)
  ).current;

  useEffect(() => {
    sessionStorage.setItem('unitime_client_id', clientId);
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (selectedBookingId) {
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');

    if (selectedBookingId) {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      setBookingTyping({
        bookingId: selectedBookingId,
        typing: false,
        clientId,
      }).catch(() => {});
    }


    try {
      await sendMessage({
        bookingId: selectedBookingId,
        content,
      }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };








  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatBookingDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const isDifferentDay = (d1: string, d2?: string) => {
    if (!d2) return true;
    const date1 = new Date(d1).toDateString();
    const date2 = new Date(d2).toDateString();
    return date1 !== date2;
  };

  const formatDividerDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      if (isToday) return 'Hôm nay';
      if (isYesterday) return 'Hôm qua';

      return `${d.toLocaleDateString('vi-VN', { weekday: 'long' })}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return 'Hôm nay';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MESSENGER 2-COLUMN MAIN SHELL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isBookingsLoading ? (
        <div className="py-28 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách tin nhắn...</p>
        </div>
      ) : allBookings.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Chưa có cuộc trò chuyện nào</h3>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            Khi bạn đặt lịch học hoặc nhận đề nghị dạy, cuộc trò chuyện trao đổi riêng sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-175px)] min-h-[500px] max-h-[660px]">
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: CONVERSATIONS LIST (4 COLS) */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 border-r border-gray-100 flex flex-col bg-white h-full min-h-0">
            {/* Header: Title + Search */}
            <div className="p-4 border-b border-gray-100 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Tin nhắn</h2>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              </div>

              {/* Role Filter Pills */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'ALL'
                      ? 'bg-primary-700 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('MENTORS')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'MENTORS'
                      ? 'bg-primary-700 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Gia sư
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('LEARNERS')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === 'LEARNERS'
                      ? 'bg-primary-700 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Học viên
                </button>
              </div>

              {/* Compact Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm người học hoặc bài dạy..."
                  className="w-full pl-8.5 pr-8 py-1.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-primary-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-50">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                  <p className="font-semibold">Không tìm thấy cuộc trò chuyện</p>
                  <p className="text-[11px]">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                conversations.map((b) => {
                  const partner = getPartnerInfo(b);
                  const isSelected = b.id === selectedBookingId;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer relative ${
                        isSelected
                          ? 'bg-primary-50/70 border-l-4 border-primary-700'
                          : 'hover:bg-gray-50/80'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = LogoImage;
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      </div>


                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-primary-900' : 'text-gray-900'
                            }`}
                          >
                            {partner.name}
                          </h4>
                          <span className="text-[10px] font-medium text-gray-400 shrink-0">
                            {formatBookingDate(b.scheduledStart)}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 font-medium truncate">
                          {b.title || 'Buổi kèm học 1-1'}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              b.status === BookingStatus.CONFIRMED
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {partner.role}
                          </span>
                          <span className="text-[10px] text-gray-400">• {b.durationMinutes}p</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: ACTIVE CHAT WINDOW (8 COLS) */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 flex flex-col bg-white h-full min-h-0">
            {activeBooking ? (
              <>
                {/* 1. Chat Header */}
                {(() => {
                  const partner = getPartnerInfo(activeBooking);
                  return (
                    <div className="p-3.5 sm:px-6 sm:py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white shrink-0">
                      {/* Partner Profile snapshot */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={partner.avatar}
                            alt={partner.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = LogoImage;
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        </div>


                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {partner.name}
                            </h3>
                            <span className="text-[9px] px-2 py-0.2 rounded-md bg-sky-50 text-sky-700 font-extrabold uppercase tracking-wide border border-sky-200/60">
                              {partner.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            Buổi học: <strong className="text-gray-700">{activeBooking.title || '1-1 Session'}</strong> ({activeBooking.durationMinutes} phút)
                          </p>
                        </div>
                      </div>

                      {/* Header Action Buttons (Đồng bộ chuẩn 100% kích thước & bo góc) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => partner.id && navigate(`/profile/${partner.id}`)}
                          className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Xem hồ sơ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsDetailModalOpen(true)}
                          className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary-200/80 bg-primary-50/90 hover:bg-primary-100 text-primary-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary-700" />
                          <span>Chi tiết lịch học</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => refetchMessages()}
                          title="Làm mới tin nhắn"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-2xs cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isMessagesFetching ? 'animate-spin text-primary-700' : ''}`} />
                        </button>


                      </div>

                    </div>
                  );
                })()}

                {/* 2. Messages Feed (Smart Message Cluster & Delivery Status) */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 bg-[#F8FAFC] flex flex-col"
                >
                  {isMessagesLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-2 text-gray-400 py-16">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold">Đang tải tin nhắn...</p>
                    </div>
                  ) : (
                    <>
                      {/* Top spacer to anchor messages at the bottom when there are few messages */}
                      <div className="flex-1 min-h-0" />

                      {messages.length === 0 ? (
                        <div className="min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 my-auto">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mx-auto shadow-2xs">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <h4 className="text-xs font-bold text-gray-800">Bắt đầu cuộc trò chuyện</h4>
                          <p className="text-[11px] text-gray-500 max-w-sm">
                            Gửi lời chào và thống nhất nội dung hoặc câu hỏi cần giải đáp trước buổi học.
                          </p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isMine = currentUserId ? msg.senderId === currentUserId : false;
                          const partner = getPartnerInfo(activeBooking);

                          const prevMsg = idx > 0 ? messages[idx - 1] : null;
                          const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                          // Check if different day for centered divider
                          const showDateDivider = isDifferentDay(msg.sentAt, prevMsg?.sentAt);

                          // Clustering: check if consecutive messages within 5 mins from the same sender
                          const isSameSenderAsPrev =
                            prevMsg &&
                            prevMsg.senderId === msg.senderId &&
                            Math.abs(new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime()) <
                              5 * 60 * 1000 &&
                            !showDateDivider;

                          const isSameSenderAsNext =
                            nextMsg &&
                            nextMsg.senderId === msg.senderId &&
                            Math.abs(new Date(nextMsg.sentAt).getTime() - new Date(msg.sentAt).getTime()) <
                              5 * 60 * 1000 &&
                            !isDifferentDay(nextMsg.sentAt, msg.sentAt);

                          const isFirstInCluster = !isSameSenderAsPrev;
                          const isLastInCluster = !isSameSenderAsNext;

                          return (
                            <React.Fragment key={msg.id}>
                              {/* Centered Date Separator with Subtle Line */}
                              {showDateDivider && (
                                <div className="relative flex items-center justify-center my-4">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200/70" />
                                  </div>
                                  <span className="relative bg-[#F8FAFC] px-3.5 text-[11px] font-semibold text-slate-400">
                                    {formatDividerDate(msg.sentAt)}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${
                                  isFirstInCluster ? 'mt-3.5' : 'mt-1'
                                }`}
                              >
                                {/* Partner Avatar column (Only visible on last message of cluster) */}
                                {!isMine && (
                                  <div className="w-7 shrink-0 flex items-end">
                                    {isLastInCluster ? (
                                      <img
                                        src={msg.senderAvatar || partner.avatar}
                                        alt={msg.senderName || partner.name}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = LogoImage;
                                        }}
                                        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-7" />
                                    )}
                                  </div>
                                )}

                                <div className={`max-w-[78%] sm:max-w-[65%] space-y-0.5`}>
                                  {/* Bubble with responsive cluster borders */}
                                  <div
                                    className={`px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                                      isMine
                                        ? `bg-primary-700 text-white ${
                                            isFirstInCluster && isLastInCluster
                                              ? 'rounded-2xl rounded-br-xs'
                                              : isFirstInCluster
                                              ? 'rounded-2xl rounded-br-md'
                                              : isLastInCluster
                                              ? 'rounded-2xl rounded-tr-md rounded-br-xs'
                                              : 'rounded-2xl rounded-r-md'
                                          }`
                                        : `bg-white text-gray-800 border border-gray-200/80 ${
                                            isFirstInCluster && isLastInCluster
                                              ? 'rounded-2xl rounded-bl-xs'
                                              : isFirstInCluster
                                              ? 'rounded-2xl rounded-bl-md'
                                              : isLastInCluster
                                              ? 'rounded-2xl rounded-tl-md rounded-bl-xs'
                                              : 'rounded-2xl rounded-l-md'
                                          }`
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  </div>

                                  {/* Timestamp & 3-Tier Delivery Status (1 tick: Đã gửi, 2 tick xám: Đã nhận, 2 tick xanh: Đã xem) */}
                                  {isLastInCluster && (
                                    <div
                                      className={`flex items-center gap-1 text-[10px] pt-0.5 ${
                                        isMine ? 'justify-end text-slate-400' : 'justify-start text-gray-400 pl-1'
                                      }`}
                                    >
                                      <span>{formatMessageTime(msg.sentAt)}</span>
                                      {isMine && (
                                        <span
                                          className="inline-flex items-center ml-0.5"
                                          title={
                                            msg.readAt
                                              ? `Đã xem lúc ${formatMessageTime(msg.readAt)}`
                                              : Date.now() - new Date(msg.sentAt).getTime() < 4000
                                              ? 'Đã gửi'
                                              : 'Đã nhận'
                                          }
                                        >
                                          {msg.readAt ? (
                                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : Date.now() - new Date(msg.sentAt).getTime() < 4000 ? (
                                            <Check className="w-3.5 h-3.5 text-slate-400" />
                                          ) : (
                                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                              </div>

                            </React.Fragment>
                          );
                        })
                      )}

                      {/* Partner Typing Indicator Bubble (RTK Query onCacheEntryAdded Stream) */}
                      {isPartnerTyping && (

                        <div className="flex items-end gap-2 mt-2 mb-1.5 shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
                          <img
                            src={getPartnerInfo(activeBooking).avatar}
                            alt={getPartnerInfo(activeBooking).name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = LogoImage;
                            }}
                            className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0 mb-0.5"
                          />
                          <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
                            <span className="text-[11px] font-medium text-slate-500">
                              {getPartnerInfo(activeBooking).name} đang soạn tin
                            </span>
                            <div className="flex items-center gap-1 ml-0.5">
                              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}



                </div>

                {/* 3. Floating Modern Message Input Bar (Căn chỉnh cân đối, font-normal thanh thoát) */}
                <div className="p-3 sm:px-5 sm:py-3 bg-white border-t border-gray-100 shrink-0">
                  <form
                    onSubmit={handleSend}
                    className="h-11 flex items-center gap-2 bg-gray-50 border border-gray-200/90 rounded-2xl px-3 focus-within:bg-white focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100 transition-all shadow-2xs"
                  >
                    {/* Media Action Icons */}
                    <div className="flex items-center gap-0.5 text-gray-400 shrink-0">
                      <button
                        type="button"
                        onClick={() => toast.info('Tính năng đính kèm tệp sẽ sớm được cập nhật')}
                        className="p-1 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
                        title="Đính kèm tệp"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info('Tính năng gửi ảnh sẽ sớm được cập nhật')}
                        className="p-1 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
                        title="Gửi hình ảnh"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info('Tính năng emoji sẽ sớm được cập nhật')}
                        className="p-1 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
                        title="Biểu tượng cảm xúc"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Text Input (font-normal nhẹ nhàng, canh giữa chuẩn) */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder={`Nhập tin nhắn gửi đến ${getPartnerInfo(activeBooking).name}...`}
                      className="h-full flex-1 bg-transparent border-0 text-xs sm:text-sm font-normal placeholder:text-gray-400 focus:outline-none px-1 text-gray-800"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-primary-700 hover:bg-primary-800 text-white shadow-xs disabled:opacity-30 shrink-0 cursor-pointer transition-all"
                      title="Gửi tin nhắn"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Booking Detail Modal */}
                <BookingDetailModal
                  booking={activeBooking}
                  isOpen={isDetailModalOpen}
                  onClose={() => setIsDetailModalOpen(false)}
                  currentUserId={currentUserId}
                />

              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-2">
                <MessageSquare className="w-10 h-10 mb-1 opacity-30 text-primary-700" />
                <h4 className="text-sm font-bold text-gray-700">Chưa chọn cuộc trò chuyện</h4>
                <p className="text-xs">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
