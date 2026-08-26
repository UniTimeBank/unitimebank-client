import { baseApi } from "../baseApi";
import type {
  BookingItem,
  BookingMessage,
  GetBookingsParams,
  GetBookingsResponse,
  SendBookingMessagePayload,
  BusySlotItem,
} from "@/features/management/types";
import {
  connectBookingSocket,
  emitBookingSocketEvent,
} from "@/features/booking/utils/bookingSocket";

export * from "@/features/management/types";

const getRealtimeErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách bookings của người dùng
    getMyBookings: builder.query<GetBookingsResponse, GetBookingsParams | void>(
      {
        query: (params) => {
          const queryParams = new URLSearchParams();
          if (params?.role) queryParams.append("role", params.role);
          if (params?.status) queryParams.append("status", params.status);
          if (params?.page) queryParams.append("page", String(params.page));
          if (params?.limit) queryParams.append("limit", String(params.limit));

          const queryString = queryParams.toString();
          return `/bookings${queryString ? `?${queryString}` : ""}`;
        },
        providesTags: (result) =>
          result
            ? [
                ...result.items.map(({ id }) => ({
                  type: "Booking" as const,
                  id,
                })),
                { type: "Booking", id: "LIST" },
              ]
            : [{ type: "Booking", id: "LIST" }],
      },
    ),

    // 2. Lấy chi tiết 1 booking
    getBookingById: builder.query<BookingItem, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Booking", id }],
    }),

    // 3. Tạo booking trên Mentor Post
    createMentorPostBooking: builder.mutation<
      BookingItem,
      {
        mentorPostId: string;
        scheduledStart: string;
        scheduledEnd: string;
        note?: string;
      }
    >({
      query: (body) => ({
        url: "/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Booking", id: "LIST" }, "Wallet"],
    }),

    // 4. Mentor gửi đề nghị dạy trên Learner Request
    applyLearnerRequest: builder.mutation<
      BookingItem,
      {
        learnerRequestId: string;
        scheduledStart: string;
        scheduledEnd: string;
        note?: string;
      }
    >({
      query: (body) => ({
        url: "/bookings/apply-learner-request",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Booking", id: "LIST" }, "Wallet"],
    }),

    // 5. Chấp nhận booking (+ Ký quỹ Credit)
    acceptBooking: builder.mutation<BookingItem, string>({
      query: (id) => ({
        url: `/bookings/${id}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Booking", id },
        { type: "Booking", id: "LIST" },
        "Wallet",
      ],
    }),

    // 6. Hoàn thành buổi học (+ Giải phóng Credit ký quỹ sang Mentor)
    completeBooking: builder.mutation<BookingItem, string>({
      query: (id) => ({
        url: `/bookings/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Booking", id },
        { type: "Booking", id: "LIST" },
        "Wallet",
      ],
    }),

    // 7. Từ chối booking
    rejectBooking: builder.mutation<
      BookingItem,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Booking", id },
        { type: "Booking", id: "LIST" },
      ],
    }),

    // 8. Hủy booking
    cancelBooking: builder.mutation<
      BookingItem,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Booking", id },
        { type: "Booking", id: "LIST" },
        "Wallet",
      ],
    }),

    // 9. Đánh dấu không đến
    markNoShow: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bookings/${id}/no-show`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Booking", id },
        { type: "Booking", id: "LIST" },
      ],
    }),

    // 10. REST tải lịch sử một lần; Socket.IO cập nhật cache realtime.
    getBookingMessages: builder.query<
      { items: BookingMessage[]; isPartnerTyping: boolean },
      string
    >({
      query: (bookingId) => `/bookings/${bookingId}/messages`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) {
          return { items: response as BookingMessage[], isPartnerTyping: false };
        }
        const payload =
          response && typeof response === 'object'
            ? (response as { items?: BookingMessage[]; isPartnerTyping?: boolean })
            : {};
        return {
          items: payload.items || [],
          isPartnerTyping: Boolean(payload.isPartnerTyping),
        };
      },
      providesTags: (_result, _error, bookingId) => [
        { type: "Booking", id: `MESSAGES_${bookingId}` },
      ],
      async onCacheEntryAdded(
        bookingId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!bookingId) return;
        try {
          // 1. Chờ dữ liệu ban đầu nạp xong
          await cacheDataLoaded;

          const socket = await connectBookingSocket();
          let typingTimeout: ReturnType<typeof setTimeout> | null = null;
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const currentUserId = currentUser?.id || currentUser?.userId;
          const myClientId = sessionStorage.getItem("unitime_client_id");

          const joinRoom = () => {
            socket.emit("booking-chat:join", { bookingId });
          };
          const handleMessage = (message: BookingMessage) => {
            if (message.bookingId !== bookingId) return;
            updateCachedData((draft) => {
              if (!draft.items.some((item) => item.id === message.id)) {
                draft.items.push(message);
              }
              draft.isPartnerTyping = false;
            });
          };
          const handleTyping = (payload: {
            bookingId: string;
            userId?: string;
            clientId?: string;
            typing: boolean;
          }) => {
            if (payload.bookingId !== bookingId) return;
            const isFromSelf =
              Boolean(
                payload.userId &&
                currentUserId &&
                payload.userId === currentUserId,
              ) ||
              Boolean(
                payload.clientId &&
                myClientId &&
                payload.clientId === myClientId,
              );
            if (isFromSelf) return;

            updateCachedData((draft) => {
              draft.isPartnerTyping = payload.typing;
            });
            if (typingTimeout) clearTimeout(typingTimeout);
            if (payload.typing) {
              typingTimeout = setTimeout(() => {
                updateCachedData((draft) => {
                  draft.isPartnerTyping = false;
                });
              }, 3500);
            }
          };

          socket.on("connect", joinRoom);
          socket.on("booking-message:new", handleMessage);
          socket.on("booking-typing:changed", handleTyping);
          joinRoom();

          await cacheEntryRemoved;
          if (typingTimeout) clearTimeout(typingTimeout);
          socket.emit("booking-chat:leave", { bookingId });
          socket.off("connect", joinRoom);
          socket.off("booking-message:new", handleMessage);
          socket.off("booking-typing:changed", handleTyping);
        } catch {
          return;
        }
      },
    }),

    // 11. Gửi tin nhắn trao đổi trong buổi học
    sendBookingMessage: builder.mutation<
      BookingMessage,
      SendBookingMessagePayload
    >({
      queryFn: async ({ bookingId, ...body }) => {
        try {
          const data = await emitBookingSocketEvent<BookingMessage>(
            "booking-message:send",
            {
              bookingId,
              ...body,
            },
          );
          return { data };
        } catch (error: unknown) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: getRealtimeErrorMessage(error, "Lỗi chat realtime"),
            },
          };
        }
      },
      async onQueryStarted({ bookingId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            bookingApi.util.updateQueryData(
              "getBookingMessages",
              bookingId,
              (draft) => {
                if (!draft.items.some((item) => item.id === data.id))
                  draft.items.push(data);
                draft.isPartnerTyping = false;
              },
            ),
          );
        } catch {
          return;
        }
      },
    }),

    // 12. Báo hiệu trạng thái đang soạn tin nhắn
    setBookingTyping: builder.mutation<
      void,
      { bookingId: string; typing: boolean; clientId?: string }
    >({
      queryFn: async ({ bookingId, typing, clientId }) => {
        try {
          await emitBookingSocketEvent("booking-typing:set", {
            bookingId,
            typing,
            clientId,
          });
          return { data: undefined };
        } catch (error: unknown) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: getRealtimeErrorMessage(error, "Lỗi typing realtime"),
            },
          };
        }
      },
    }),

    // 14. Lấy danh sách khung giờ đã có lịch (CONFIRMED / STARTED) của Mentor
    getMentorBusySlots: builder.query<
      { data: BusySlotItem[] },
      { mentorId: string; from?: string; to?: string }
    >({
      query: ({ mentorId, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const qs = params.toString();
        return `/bookings/mentor/${mentorId}/busy-slots${qs ? `?${qs}` : ""}`;
      },
      providesTags: (_result, _error, { mentorId }) => [
        { type: "Booking", id: `BUSY_${mentorId}` },
        { type: "Booking", id: "LIST" },
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
  useSetBookingTypingMutation,
  useGetMentorBusySlotsQuery,
} = bookingApi;
