import { baseApi } from '../baseApi';
import type {
  NotificationItem,
  GetMyNotificationsResponse,
  UnreadCountResponse,
} from '@/features/notification';

export type { NotificationItem, GetMyNotificationsResponse, UnreadCountResponse };

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      GetMyNotificationsResponse,
      { limit?: number; unreadOnly?: boolean } | void
    >({
      query: (params) => {
        const limit = params?.limit || 20;
        const unreadOnly = params?.unreadOnly ? 'true' : 'false';
        return {
          url: `/notifications/my?limit=${limit}&unreadOnly=${unreadOnly}`,
          method: 'GET',
        };
      },
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    markAsRead: builder.mutation<NotificationItem, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
