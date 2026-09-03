import { baseApi } from '../baseApi';
import type {
  LiveKitTokenResponse,
  CreateGroupRoomPayload,
  GetActiveGroupRoomsResponse,
  InRoomChatMessage,
  GroupRoomStatsResponse,
} from '@/features/session/types';

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Tham gia phòng học 1:1 (Lấy LiveKit Token)
    joinOneOnOneRoom: builder.mutation<LiveKitTokenResponse, string>({
      query: (bookingId) => ({
        url: `/rooms/one-on-one/${bookingId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, bookingId) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // 2. Mở phòng học 1:1 (Dành cho Mentor nếu cần chủ động)
    openOneOnOneRoom: builder.mutation<LiveKitTokenResponse, string>({
      query: (bookingId) => ({
        url: `/rooms/one-on-one/${bookingId}/open`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, bookingId) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
      ],
    }),

    // 3. Đóng phòng học 1:1
    closeOneOnOneRoom: builder.mutation<
      { bookingId: string; status: string; completedAt: string },
      { bookingId: string; closeReason?: string }
    >({
      query: ({ bookingId, closeReason }) => ({
        url: `/rooms/one-on-one/${bookingId}/close`,
        method: 'POST',
        body: { closeReason },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        'Wallet',
      ],
    }),

    // 4. Tạo phòng học nhóm mới
    createGroupRoom: builder.mutation<
      { roomId: string; livekitRoomName: string; title: string },
      CreateGroupRoomPayload
    >({
      query: (payload) => ({
        url: '/rooms/group',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Session'],
    }),

    // 5. Tham gia phòng học nhóm
    joinGroupRoom: builder.mutation<LiveKitTokenResponse, string>({
      query: (roomId) => ({
        url: `/rooms/group/${roomId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Session'],
    }),

    // 6. Học viên rời phòng học nhóm
    leaveGroupRoom: builder.mutation<
      {
        roomId: string;
        leftAt: string;
        minutesParticipated: number;
        creditsCharged: number;
      },
      string
    >({
      query: (roomId) => ({
        url: `/rooms/group/${roomId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Session', 'Wallet'],
    }),

    // 7. Mentor đóng phòng học nhóm
    closeGroupRoom: builder.mutation<{ roomId: string; status: string; closedAt: string }, string>({
      query: (roomId) => ({
        url: `/rooms/group/${roomId}/close`,
        method: 'POST',
      }),
      invalidatesTags: ['Session', 'Wallet'],
    }),

    // 8. Lấy danh sách phòng nhóm đang mở
    getActiveGroupRooms: builder.query<
      GetActiveGroupRoomsResponse,
      { category?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));

        const queryString = queryParams.toString();
        return `/rooms/group/active${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Session'],
    }),

    // 9. Lấy lịch sử các phòng nhóm đã kết thúc
    getGroupRoomsHistory: builder.query<
      { rooms: any[]; total: number; page: number; limit: number },
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        const queryString = queryParams.toString();
        return `/rooms/group/history${queryString ? `?${queryString}` : ''}`;
      },
    }),

    // 10. Lấy thống kê quỹ tạm giữ và chi tiết học viên (Dành cho Host)
    getGroupRoomStats: builder.query<GroupRoomStatsResponse, string>({
      query: (roomId) => `/rooms/group/${roomId}/stats`,
      providesTags: ['Session'],
    }),

    // 11. Lấy lịch sử chat trong phòng
    getRoomChatMessages: builder.query<InRoomChatMessage[], string>({
      query: (roomId) => `/rooms/${roomId}/chat`,
    }),

    // 12. Gửi tin nhắn chat trong phòng qua HTTP REST (fallback)
    sendRoomChatMessage: builder.mutation<InRoomChatMessage, { roomId: string; content: string }>({
      query: ({ roomId, content }) => ({
        url: `/rooms/${roomId}/chat`,
        method: 'POST',
        body: { content },
      }),
    }),

    // 13. Mute thành viên (Host)
    muteParticipant: builder.mutation<
      { participantId: string; userId: string; isMuted: boolean },
      { roomId: string; participantId: string; isMuted?: boolean }
    >({
      query: ({ roomId, participantId, isMuted }) => ({
        url: `/rooms/${roomId}/mute/${participantId}`,
        method: 'POST',
        body: { isMuted },
      }),
    }),

    // 14. Kick thành viên (Host)
    kickParticipant: builder.mutation<
      { participantId: string; userId: string; isKicked: boolean },
      { roomId: string; participantId: string; reason?: string }
    >({
      query: ({ roomId, participantId, reason }) => ({
        url: `/rooms/${roomId}/kick/${participantId}`,
        method: 'POST',
        body: { reason },
      }),
    }),
  }),
});

export const {
  useJoinOneOnOneRoomMutation,
  useOpenOneOnOneRoomMutation,
  useCloseOneOnOneRoomMutation,
  useCreateGroupRoomMutation,
  useJoinGroupRoomMutation,
  useLeaveGroupRoomMutation,
  useCloseGroupRoomMutation,
  useGetActiveGroupRoomsQuery,
  useGetGroupRoomsHistoryQuery,
  useGetGroupRoomStatsQuery,
  useGetRoomChatMessagesQuery,
  useSendRoomChatMessageMutation,
  useMuteParticipantMutation,
  useKickParticipantMutation,
} = sessionApi;
