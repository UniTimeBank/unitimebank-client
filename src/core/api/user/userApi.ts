import { baseApi } from '@/core/api/baseApi';
import type {
  UserProfile,
  PublicUserProfile,
  UpdateProfileDto,
  UserSkill,
  AddSkillDto,
  SkillCategory,
  FollowListResponse,
  CheckinResult,
  LoginStreakResponse,
  RecurringSchedule,
  CreateRecurringScheduleDto,
  UpdateRecurringScheduleDto,
  ScheduleException,
  CreateScheduleExceptionDto,
  DayAvailability,
  GetAvailabilityParams,
} from '@/features/user/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy thông tin cá nhân hiện tại
    getMe: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    // 2. Cập nhật hồ sơ
    updateMe: builder.mutation<UserProfile, UpdateProfileDto>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 3. Upload ảnh đại diện
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: '/users/me/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // 4. Lấy danh sách kỹ năng của tôi
    getMySkills: builder.query<{ skills: UserSkill[] }, void>({
      query: () => '/users/me/skills',
      providesTags: ['User'],
    }),

    // 5. Thêm kỹ năng mới
    addSkill: builder.mutation<UserSkill, AddSkillDto>({
      query: (body) => ({
        url: '/users/me/skills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 6. Xóa kỹ năng
    deleteSkill: builder.mutation<{ message: string }, string>({
      query: (skillId) => ({
        url: `/users/me/skills/${skillId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // 7. Lấy danh mục kỹ năng
    getSkillCategories: builder.query<{ categories: SkillCategory[] }, void>({
      query: () => '/skills/categories',
    }),

    // 8. Lấy hồ sơ công khai của 1 người dùng (Mentor/Learner)
    getPublicProfile: builder.query<PublicUserProfile, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),

    // 9. Theo dõi người dùng
    followUser: builder.mutation<{ message: string; followeeId: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'User', id: userId }, 'User'],
    }),

    // 10. Bỏ theo dõi người dùng
    unfollowUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'User', id: userId }, 'User'],
    }),

    // 11. Danh sách người theo dõi
    getFollowers: builder.query<FollowListResponse, string>({
      query: (userId) => `/users/${userId}/followers`,
    }),

    // 12. Danh sách người đang theo dõi
    getFollowing: builder.query<FollowListResponse, string>({
      query: (userId) => `/users/${userId}/following`,
    }),

    // 13. Điểm danh 7 ngày tích lũy
    dailyCheckin: builder.mutation<CheckinResult, void>({
      query: () => ({
        url: '/users/me/checkin',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Wallet'],
    }),

    // 14. Thông tin chuỗi điểm danh
    getLoginStreak: builder.query<LoginStreakResponse, void>({
      query: () => '/users/me/streak',
      providesTags: ['User'],
    }),

    // 15. Kiểm tra trạng thái online
    getOnlineStatus: builder.query<{ statuses: Record<string, 'ONLINE' | 'OFFLINE' | 'IN_ROOM'> }, string[]>({
      query: (userIds) => `/users/online-status?userIds=${userIds.join(',')}`,
    }),

    // ==================== QUẢN LÝ LỊCH RẢNH (SCHEDULE) ====================

    // 16. Lấy danh sách lịch lặp lại hàng tuần của tôi
    getMyRecurringSchedules: builder.query<{ data: RecurringSchedule[] }, void>({
      query: () => '/users/me/schedule/recurring',
      providesTags: ['User'],
    }),

    // 17. Tạo lịch rảnh lặp lại hàng tuần mới
    createRecurringSchedule: builder.mutation<RecurringSchedule, CreateRecurringScheduleDto>({
      query: (body) => ({
        url: '/users/me/schedule/recurring',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 18. Cập nhật lịch rảnh lặp lại
    updateRecurringSchedule: builder.mutation<
      RecurringSchedule,
      { scheduleId: string; data: UpdateRecurringScheduleDto }
    >({
      query: ({ scheduleId, data }) => ({
        url: `/users/me/schedule/recurring/${scheduleId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // 19. Xóa lịch rảnh lặp lại
    deleteRecurringSchedule: builder.mutation<void, string>({
      query: (scheduleId) => ({
        url: `/users/me/schedule/recurring/${scheduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // 20. Lấy danh sách lịch đặc biệt (EXTRA / BLOCKED) của tôi
    getMyScheduleExceptions: builder.query<
      { data: ScheduleException[] },
      { from?: string; to?: string } | void
    >({
      query: (params) => {
        if (!params) return '/users/me/schedule/exceptions';
        const queryParams = new URLSearchParams();
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);
        const q = queryParams.toString();
        return `/users/me/schedule/exceptions${q ? `?${q}` : ''}`;
      },
      providesTags: ['User'],
    }),

    // 21. Tạo lịch đặc biệt (thêm giờ EXTRA hoặc chặn giờ BLOCKED)
    createScheduleException: builder.mutation<ScheduleException, CreateScheduleExceptionDto>({
      query: (body) => ({
        url: '/users/me/schedule/exceptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 22. Xóa lịch đặc biệt
    deleteScheduleException: builder.mutation<void, string>({
      query: (exceptionId) => ({
        url: `/users/me/schedule/exceptions/${exceptionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // 23. Lấy lịch rảnh khả dụng của Người dạy theo khoảng ngày (from -> to)
    getAvailability: builder.query<{ data: DayAvailability[] }, GetAvailabilityParams>({
      query: ({ userId, from, to }) =>
        `/users/${userId}/schedule/availability?from=${from}&to=${to}`,
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadAvatarMutation,
  useGetMySkillsQuery,
  useAddSkillMutation,
  useDeleteSkillMutation,
  useGetSkillCategoriesQuery,
  useGetPublicProfileQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useDailyCheckinMutation,
  useGetLoginStreakQuery,
  useGetOnlineStatusQuery,
  useGetMyRecurringSchedulesQuery,
  useCreateRecurringScheduleMutation,
  useUpdateRecurringScheduleMutation,
  useDeleteRecurringScheduleMutation,
  useGetMyScheduleExceptionsQuery,
  useCreateScheduleExceptionMutation,
  useDeleteScheduleExceptionMutation,
  useGetAvailabilityQuery,
} = userApi;
