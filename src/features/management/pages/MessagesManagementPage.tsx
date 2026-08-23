import React from 'react';
import { MessageSquare } from 'lucide-react';
import { BookingDetailModal } from '@/features/booking';
import { CancelBookingModal } from '../components';
import {
  ConversationSidebar,
  ChatRoomHeader,
  ChatMessageFeed,
  ChatInputBar,
} from '../components/messages';
import { useMessagesManagement } from '../hooks';

export const MessagesManagementPage: React.FC = () => {
  const {
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
    isReadOnly,
    readOnlyNotice,
    messagesContainerRef,
    inputRef,
  } = useMessagesManagement();

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden animate-in fade-in duration-200">
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
          {/* CỘT TRÁI: Danh sách các cuộc hội thoại */}
          <ConversationSidebar
            conversations={conversations}
            selectedBookingId={selectedBookingId}
            onSelectBooking={handleSelectBooking}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            filterCounts={filterCounts}
            getPartnerInfo={getPartnerInfo}
          />

          {/* CỘT PHẢI: Khung chat đang chọn */}
          <div className="lg:col-span-8 flex flex-col bg-white h-full min-h-0">
            {activeBooking ? (
              <>
                {/* 1. Header cuộc trò chuyện */}
                <ChatRoomHeader
                  booking={activeBooking}
                  partner={getPartnerInfo(activeBooking)}
                  onViewProfile={(partnerId) => partnerId && navigate(`/profile/${partnerId}`)}
                  onOpenDetail={() => setIsDetailModalOpen(true)}
                  onRefreshMessages={refetchMessages}
                  isFetching={isMessagesFetching}
                />

                {/* 2. Danh sách tin nhắn */}
                <ChatMessageFeed
                  activeBooking={activeBooking}
                  partner={getPartnerInfo(activeBooking)}
                  currentUserId={currentUserId}
                  messages={messages}
                  isLoading={isMessagesLoading}
                  isPartnerTyping={isPartnerTyping}
                  containerRef={messagesContainerRef}
                />

                {/* 3. Thanh nhập tin nhắn hoặc Thông báo khóa Chỉ đọc */}
                <ChatInputBar
                  inputText={inputText}
                  onInputChange={handleInputChange}
                  onSend={handleSend}
                  isSending={isSending}
                  isUploading={isUploading}
                  isReadOnly={isReadOnly}
                  readOnlyNotice={readOnlyNotice}
                  partnerName={getPartnerInfo(activeBooking).name}
                  inputRef={inputRef}
                  pendingAttachment={pendingAttachment}
                  onSelectFile={handleSelectFile}
                  onRemoveAttachment={handleRemoveAttachment}
                  isEmojiPickerOpen={isEmojiPickerOpen}
                  onToggleEmojiPicker={() => setIsEmojiPickerOpen((prev) => !prev)}
                  onEmojiSelect={handleEmojiSelect}
                />

                {/* Modal Chi tiết lịch học */}
                <BookingDetailModal
                  booking={activeBooking}
                  isOpen={isDetailModalOpen}
                  onClose={() => setIsDetailModalOpen(false)}
                  currentUserId={currentUserId}
                  onOpenCancel={handleOpenCancelModal}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onJoinRoom={handleJoinRoom}
                  isAccepting={isAccepting}
                  isRejecting={isRejecting}
                />

                {/* Modal Xác nhận hủy lịch học */}
                <CancelBookingModal
                  booking={cancelModalBooking}
                  isOpen={Boolean(cancelModalBooking)}
                  onClose={handleCloseCancelModal}
                  onConfirmCancel={handleConfirmCancel}
                  isCancelling={isCancelling}
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
