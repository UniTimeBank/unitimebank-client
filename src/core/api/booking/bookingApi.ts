import { baseApi } from '../baseApi';
import type {
  BookingItem,
  BookingMessage,
  GetBookingsParams,
  GetBookingsResponse,
  SendBookingMessagePayload,
  UploadChatAttachmentResponse,
  BusySlotItem,
} from '@/features/management/types';


export * from '@/features/management/types';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách bookings của người dùng
    getMyBookings: builder.query<GetBookingsResponse, GetBookingsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));

        const queryString = queryParams.toString();
        return `/bookings${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    // 2. Lấy chi tiết 1 booking
    getBookingById: builder.query<BookingItem, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    // 3. Tạo booking trên Mentor Post
    createMentorPostBooking: builder.mutation<
      BookingItem,
      { mentorPostId: string; scheduledStart: string; scheduledEnd: string; note?: string }
    >({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }, 'Wallet'],
    }),

    // 4. Mentor gửi đề nghị dạy trên Learner Request
    applyLearnerRequest: builder.mutation<
      BookingItem,
      { learnerRequestId: string; scheduledStart: string; scheduledEnd: string; note?: string }
    >({
      query: (body) => ({
        url: '/bookings/apply-learner-request',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }, 'Wallet'],
    }),

    // 5. Chấp nhận booking (+ Ký quỹ Credit)
    acceptBooking: builder.mutation<BookingItem, string>({
      query: (id) => ({
        url: `/bookings/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        'Wallet',
      ],
    }),

    // 6. Hoàn thành buổi học (+ Giải phóng Credit ký quỹ sang Mentor)
    completeBooking: builder.mutation<BookingItem, string>({
      query: (id) => ({
        url: `/bookings/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        'Wallet',
      ],
    }),

    // 7. Từ chối booking
    rejectBooking: builder.mutation<BookingItem, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // 8. Hủy booking
    cancelBooking: builder.mutation<BookingItem, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
        'Wallet',
      ],
    }),

    // 9. Đánh dấu không đến
    markNoShow: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bookings/${id}/no-show`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // 10. Lấy tin nhắn trao đổi của buổi học (kèm Streaming Cache Updates qua onCacheEntryAdded)
    getBookingMessages: builder.query<{ items: BookingMessage[]; isPartnerTyping: boolean }, string>({
      query: (bookingId) => `/bookings/${bookingId}/messages`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return { items: response, isPartnerTyping: false };
        }
        return {
          items: response?.items || [],
          isPartnerTyping: Boolean(response?.isPartnerTyping),
        };
      },
      providesTags: (_result, _error, bookingId) => [
        { type: 'Booking', id: `MESSAGES_${bookingId}` },
      ],
      async onCacheEntryAdded(
        bookingId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!bookingId) return;
        try {
          // 1. Chờ dữ liệu ban đầu nạp xong
          await cacheDataLoaded;

          // 2. Mở Server-Sent Events (SSE) stream HTTP thuần túy
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const eventSource = new EventSource(`${baseUrl}/bookings/${bookingId}/events`);

          let typingTimeout: any = null;

          eventSource.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              const currentUserId = currentUser?.id || currentUser?.userId;
              const myClientId = sessionStorage.getItem('unitime_client_id');

              if (payload.type === 'typing') {
                // 🛑 BỎ QUA nếu sự kiện typing phát ra từ chính mình (theo userId hoặc clientId)
                const isFromSelf =
                  Boolean(payload.userId && currentUserId && payload.userId === currentUserId) ||
                  Boolean(payload.clientId && myClientId && payload.clientId === myClientId);


                if (!isFromSelf) {
                  updateCachedData((draft) => {
                    draft.isPartnerTyping = Boolean(payload.typing);
                  });

                  if (payload.typing) {
                    if (typingTimeout) clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                      updateCachedData((draft) => {
                        draft.isPartnerTyping = false;
                      });
                    }, 3500);
                  }
                }
              } else if (payload.type === 'new_message' && payload.message) {
                updateCachedData((draft) => {
                  const exists = draft.items.some((m) => m.id === payload.message.id);
                  if (!exists) {
                    draft.items.push(payload.message);
                  }
                  draft.isPartnerTyping = false;
                });
              }
            } catch {}
          };

          // 3. Tự động đóng EventSource stream khi component unmount / cache bị xóa
          await cacheEntryRemoved;
          if (typingTimeout) clearTimeout(typingTimeout);
          eventSource.close();
        } catch {}
      },
    }),

    // 11. Gửi tin nhắn trao đổi trong buổi học
    sendBookingMessage: builder.mutation<
      BookingMessage,
      SendBookingMessagePayload
    >({
      query: ({ bookingId, ...body }) => ({
        url: `/bookings/${bookingId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'Booking', id: `MESSAGES_${bookingId}` },
      ],
    }),

    // 12. Tải lên tệp đính kèm hoặc hình ảnh trong phòng chat
    uploadChatAttachment: builder.mutation<
      UploadChatAttachmentResponse,
      { bookingId: string; file: File }
    >({
      query: ({ bookingId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/bookings/${bookingId}/attachments`,
          method: 'POST',
          body: formData,
        };
      },
    }),

    // 13. Báo hiệu trạng thái đang soạn tin nhắn
    setBookingTyping: builder.mutation<void, { bookingId: string; typing: boolean; clientId?: string }>({
      query: ({ bookingId, typing, clientId }) => ({
        url: `/bookings/${bookingId}/typing`,
        method: 'POST',
        body: { typing, clientId },
      }),
    }),

    // 14. Lấy danh sách khung giờ đã có lịch (CONFIRMED / STARTED) của Mentor
    getMentorBusySlots: builder.query<
      { data: BusySlotItem[] },
      { mentorId: string; from?: string; to?: string }
    >({
      query: ({ mentorId, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const qs = params.toString();
        return `/bookings/mentor/${mentorId}/busy-slots${qs ? `?${qs}` : ''}`;
      },
      providesTags: (_result, _error, { mentorId }) => [
        { type: 'Booking', id: `BUSY_${mentorId}` },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateMentorPostBookingMutation,
  useApplyLearnerRequestMutation,
  useAcceptBookingMutation,
  useCompleteBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useMarkNoShowMutation,
  useGetBookingMessagesQuery,
  useSendBookingMessageMutation,
  useUploadChatAttachmentMutation,
  useSetBookingTypingMutation,
  useGetMentorBusySlotsQuery,
} = bookingApi;


