import { baseApi } from '../baseApi';
import type {
  RatingItem,
  CreateRatingPayload,
  UserReviewsSummary,
  TrustScore,
  TrustScoreHistoryResponse,
  CreateViolationReportPayload,
  ViolationReportItem,
} from '@/features/moderation/types';

export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Gửi đánh giá sau buổi học
    submitRating: builder.mutation<RatingItem, CreateRatingPayload>({
      query: (body) => ({
        url: '/moderation/ratings',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { mentorId, bookingId }) => [
        { type: 'Moderation', id: `USER_${mentorId}` },
        { type: 'Moderation', id: `BOOKING_${bookingId}` },
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        'User',
      ],
    }),

    // 2. Lấy danh sách đánh giá của 1 người dùng
    getReviewsByUser: builder.query<UserReviewsSummary, { userId: string; page?: number; limit?: number }>({
      query: ({ userId, page = 1, limit = 10 }) =>
        `/moderation/ratings/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { userId }) => [
        { type: 'Moderation', id: `USER_${userId}` },
      ],
    }),

    // 3. Lấy đánh giá của một booking cụ thể
    getRatingByBooking: builder.query<RatingItem | null, string>({
      query: (bookingId) => `/moderation/ratings/booking/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [
        { type: 'Moderation', id: `BOOKING_${bookingId}` },
      ],
    }),

    // 4. Lấy điểm uy tín
    getTrustScore: builder.query<TrustScore, string>({
      query: (userId) => `/moderation/trust-score/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: 'Moderation', id: `TRUST_${userId}` },
      ],
    }),

    // 5. Lấy lịch sử biến động điểm uy tín
    getTrustScoreHistory: builder.query<TrustScoreHistoryResponse, string>({
      query: (userId) => `/moderation/trust-score/${userId}/history`,
      providesTags: (_result, _error, userId) => [
        { type: 'Moderation', id: `TRUST_HISTORY_${userId}` },
      ],
    }),

    // 6. Gửi báo cáo vi phạm
    reportViolation: builder.mutation<ViolationReportItem, CreateViolationReportPayload>({
      query: (body) => ({
        url: '/moderation/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Moderation'],
    }),

    // 7. Lấy danh sách báo cáo vi phạm do mình gửi
    getMyReports: builder.query<ViolationReportItem[], void>({
      query: () => '/moderation/reports/my',
      providesTags: ['Moderation'],
    }),
  }),
});

export const {
  useSubmitRatingMutation,
  useGetReviewsByUserQuery,
  useGetRatingByBookingQuery,
  useGetTrustScoreQuery,
  useGetTrustScoreHistoryQuery,
  useReportViolationMutation,
  useGetMyReportsQuery,
} = moderationApi;
