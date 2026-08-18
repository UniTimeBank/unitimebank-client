import { baseApi } from '../baseApi';
import type {
  BookingItem,
  GetBookingsParams,
  GetBookingsResponse,
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
} = bookingApi;
