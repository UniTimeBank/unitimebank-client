import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, MessageSquare, RefreshCw, Lock } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import {
  useGetBookingMessagesQuery,
  useSendBookingMessageMutation,
} from '@/core/api/booking/bookingApi';
import { type BookingItem, BookingStatus } from '@/features/management/types';
import LogoImage from '@/assets/images/Logo.png';
import { toast } from '@/shared/utils';

export interface BookingChatModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({
  booking,
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active chatting is only allowed when CONFIRMED or STARTED
  const isActiveChat =
    booking?.status === BookingStatus.CONFIRMED || booking?.status === BookingStatus.STARTED;
  const isReadOnly = Boolean(booking && !isActiveChat);

  const isPending =
    booking?.status === BookingStatus.PENDING_MENTOR_APPROVAL ||
    booking?.status === BookingStatus.PENDING_LEARNER_APPROVAL;
  const isCompleted = booking?.status === BookingStatus.COMPLETED;
  const isCancelled = booking?.status === BookingStatus.CANCELLED;
  const isRejected = booking?.status === BookingStatus.REJECTED;

  const {
    data: messagesData,
    isLoading,
    refetch,
    isFetching,
  } = useGetBookingMessagesQuery(booking?.id || '', {
    skip: !booking?.id || !isOpen,
  });

  const messages = messagesData?.items || [];


  const [sendMessage, { isLoading: isSending }] = useSendBookingMessageMutation();

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!booking) return null;

  const isMentor = currentUserId ? booking.mentorId === currentUserId : false;
  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Người hướng dẫn';
  const partnerAvatar = isMentor
    ? booking.learnerAvatar || LogoImage
    : booking.mentorAvatar || LogoImage;
  const partnerRole = isMentor ? 'Học viên' : 'Gia sư';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    try {
      setInputText('');
      await sendMessage({
        bookingId: booking.id,
        content: trimmed,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trao đổi trước buổi học"
      description={`Phòng chat riêng với ${partnerName} (${partnerRole})`}
      size="lg"
    >
      <div className="flex flex-col h-[520px] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
        {/* Booking Snapshot Header Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={partnerAvatar}
              alt={partnerName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = LogoImage;
              }}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 truncate text-xs">{booking.title || 'Buổi học 1-1'}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                {partnerRole}: <span className="font-semibold text-slate-700">{partnerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => refetch()}
              title="Làm mới tin nhắn"
              className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary-600' : ''}`} />
            </button>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100">
              {booking.durationMinutes} phút ({booking.totalCreditEscrowed} CR)
            </span>
          </div>
        </div>

        {/* Message Bubble List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F8FAFC]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Đang tải cuộc trò chuyện...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">Chưa có tin nhắn nào</h4>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Hãy gửi tin nhắn đầu tiên để chào hỏi, trao đổi nội dung hoặc tài liệu chuẩn bị cho buổi học.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = currentUserId ? msg.senderId === currentUserId : false;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={msg.senderAvatar || partnerAvatar}
                      alt={msg.senderName || partnerName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = LogoImage;
                      }}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                    />
                  )}

                  <div
                    className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${isMine
                        ? 'bg-primary-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                  >
                    {!isMine && (
                      <p className="text-[10px] font-bold text-primary-700 mb-0.5">
                        {msg.senderName || partnerName}
                      </p>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMine ? 'text-primary-100' : 'text-slate-400'
                        }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatMessageTime(msg.sentAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Area: Input Bar or Read-only Notice */}
        {isReadOnly ? (
          <div className="p-3.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium text-center">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {isPending && 'Buổi học đang chờ duyệt. Tính năng nhắn tin sẽ mở sau khi được chấp nhận.'}
              {isCompleted && 'Buổi học đã hoàn thành. Lịch sử trao đổi được lưu trữ ở chế độ chỉ đọc.'}
              {isCancelled && 'Buổi học đã bị hủy. Đoạn chat đã đóng và chuyển sang chế độ chỉ đọc.'}
              {isRejected && 'Yêu cầu đặt lịch đã bị từ chối. Đoạn chat đã đóng.'}
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn trao đổi với đối tác..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isSending}
              className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-4 shadow-xs disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gửi</span>
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};

