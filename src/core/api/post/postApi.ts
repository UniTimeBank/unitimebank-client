import { baseApi } from '@/core/api/baseApi';
import type {
  MentorPost,
  LearnerRequest,
  GetMentorPostsParams,
  GetMentorPostsResponse,
  GetLearnerRequestsParams,
  GetLearnerRequestsResponse,
  CreateMentorPostDto,
  UpdateMentorPostDto,
  CreateLearnerRequestDto,
  UpdateLearnerRequestDto,
  SearchPostsParams,
  SearchPostsResponse,
  PostSuggestionsResponse,
  PostRecommendationsResponse,
} from '@/features/post/types';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách bài dạy công khai kèm filter
    getMentorPosts: builder.query<GetMentorPostsResponse, GetMentorPostsParams | void>({
      query: (params) => {
        if (!params) return '/posts/mentor';
        const q = new URLSearchParams();
        if (params.search) q.append('search', params.search);
        if (params.skill) q.append('skill', params.skill);
        if (params.category) q.append('category', params.category);
        if (params.sessionType) q.append('sessionType', params.sessionType);
        if (params.trustScoreMin) q.append('trustScoreMin', params.trustScoreMin.toString());
        if (params.dayOfWeek) q.append('dayOfWeek', params.dayOfWeek);
        if (params.status) q.append('status', params.status);
        if (params.page) q.append('page', params.page.toString());
        if (params.limit) q.append('limit', params.limit.toString());
        const str = q.toString();
        return `/posts/mentor${str ? `?${str}` : ''}`;
      },
      providesTags: ['Post'],
    }),

    // 2. Lấy danh sách bài dạy của chính tôi
    getMyMentorPosts: builder.query<GetMentorPostsResponse, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page.toString());
        if (params?.limit) q.append('limit', params.limit.toString());
        if (params?.status) q.append('status', params.status);
        const str = q.toString();
        return `/posts/mentor/my${str ? `?${str}` : ''}`;
      },
      providesTags: ['Post'],
    }),

    // 3. Lấy chi tiết bài dạy
    getMentorPostById: builder.query<MentorPost, string>({
      query: (id) => `/posts/mentor/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    // 4. Tạo bài dạy mới
    createMentorPost: builder.mutation<MentorPost, CreateMentorPostDto>({
      query: (body) => ({
        url: '/posts/mentor',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'],
    }),

    // 5. Cập nhật bài dạy
    updateMentorPost: builder.mutation<MentorPost, { id: string; data: UpdateMentorPostDto }>({
      query: ({ id, data }) => ({
        url: `/posts/mentor/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }, 'Post'],
    }),

    // 6. Đóng bài dạy
    closeMentorPost: builder.mutation<MentorPost, string>({
      query: (id) => ({
        url: `/posts/mentor/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }, 'Post'],
    }),

    // 7. Xóa mềm bài dạy
    deleteMentorPost: builder.mutation<MentorPost, string>({
      query: (id) => ({
        url: `/posts/mentor/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    // 8. Lấy danh sách bài tìm người dạy (Learner Requests)
    getLearnerRequests: builder.query<GetLearnerRequestsResponse, GetLearnerRequestsParams | void>({
      query: (params) => {
        if (!params) return '/posts/learner';
        const q = new URLSearchParams();
        if (params.search) q.append('search', params.search);
        if (params.category) q.append('category', params.category);
        if (params.sessionType) q.append('sessionType', params.sessionType);
        if (params.status) q.append('status', params.status);
        if (params.page) q.append('page', params.page.toString());
        if (params.limit) q.append('limit', params.limit.toString());
        const str = q.toString();
        return `/posts/learner${str ? `?${str}` : ''}`;
      },
      providesTags: ['Post'],
    }),

    // 9. Lấy danh sách yêu cầu của chính tôi
    getMyLearnerRequests: builder.query<GetLearnerRequestsResponse, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page.toString());
        if (params?.limit) q.append('limit', params.limit.toString());
        if (params?.status) q.append('status', params.status);
        const str = q.toString();
        return `/posts/learner/my${str ? `?${str}` : ''}`;
      },
      providesTags: ['Post'],
    }),

    // 10. Lấy chi tiết bài yêu cầu
    getLearnerRequestById: builder.query<LearnerRequest, string>({
      query: (id) => `/posts/learner/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    // 11. Tạo bài tìm người dạy mới (tự quy đổi 1p = 1 Credit)
    createLearnerRequest: builder.mutation<LearnerRequest, CreateLearnerRequestDto>({
      query: (body) => ({
        url: '/posts/learner',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'],
    }),

    // 12. Cập nhật bài yêu cầu
    updateLearnerRequest: builder.mutation<LearnerRequest, { id: string; data: UpdateLearnerRequestDto }>({
      query: ({ id, data }) => ({
        url: `/posts/learner/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }, 'Post'],
    }),

    // 13. Hủy bài yêu cầu
    cancelLearnerRequest: builder.mutation<LearnerRequest, string>({
      query: (id) => ({
        url: `/posts/learner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    // 14. Tìm kiếm đa chiều kết hợp
    searchPosts: builder.query<SearchPostsResponse, SearchPostsParams>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.q) q.append('q', params.q);
        if (params.category) q.append('category', params.category);
        if (params.sessionType) q.append('sessionType', params.sessionType);
        if (params.trustScoreMin) q.append('trustScoreMin', params.trustScoreMin.toString());
        if (params.dayOfWeek) q.append('dayOfWeek', params.dayOfWeek);
        if (params.sortBy) q.append('sortBy', params.sortBy);
        if (params.page) q.append('page', params.page.toString());
        if (params.limit) q.append('limit', params.limit.toString());
        const str = q.toString();
        return `/posts/search${str ? `?${str}` : ''}`;
      },
      providesTags: ['Post'],
    }),

    // 15. Gợi ý từ khóa tức thì (Live Instant Suggestions)
    getPostSuggestions: builder.query<PostSuggestionsResponse, string>({
      query: (q) => `/posts/suggestions?q=${encodeURIComponent(q)}`,
    }),

    // 16. Gợi ý bài đăng cá nhân hóa
    getPostRecommendations: builder.query<PostRecommendationsResponse, void>({
      query: () => '/posts/recommendations',
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useGetMentorPostsQuery,
  useGetMyMentorPostsQuery,
  useGetMentorPostByIdQuery,
  useCreateMentorPostMutation,
  useUpdateMentorPostMutation,
  useCloseMentorPostMutation,
  useDeleteMentorPostMutation,
  useGetLearnerRequestsQuery,
  useGetMyLearnerRequestsQuery,
  useGetLearnerRequestByIdQuery,
  useCreateLearnerRequestMutation,
  useUpdateLearnerRequestMutation,
  useCancelLearnerRequestMutation,
  useSearchPostsQuery,
  useGetPostSuggestionsQuery,
  useLazyGetPostSuggestionsQuery,
  useGetPostRecommendationsQuery,
} = postApi;
