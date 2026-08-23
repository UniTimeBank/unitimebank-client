import { baseApi } from '../baseApi';
import type {
  LiveKitTokenResponse,
  CreateGroupRoomPayload,
  GetActiveGroupRoomsResponse,
  InRoomChatMessage,
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
      { roomId: string; status: string; closedAt: string; creditsTransferred: number },
      { bookingId: string; closeReason?: string }
    >({
      query: ({ bookingId, closeReason }) => ({
        url: `/rooms/one-on-one/${bookingId}/close`,
        method: 'POST',
        body: { bookingId, closeReason },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        { type: 'Wallet', id: 'ME' },
      ],
    }),

    // 4. Tạo phòng học nhóm
    createGroupRoom: builder.mutation<LiveKitTokenResponse, CreateGroupRoomPayload>({
      query: (body) => ({
        url: '/rooms/group',
        method: 'POST',
        body,
      }),
    }),

    // 5. Tham gia phòng học nhóm
    joinGroupRoom: builder.mutation<LiveKitTokenResponse, string>({
      query: (roomId) => ({
        url: `/rooms/group/${roomId}/join`,
        method: 'POST',
      }),
    }),

    // 6. Rời phòng học nhóm
    leaveGroupRoom: builder.mutation<
      { roomId: string; leftAt: string; minutesParticipated: number; creditsCharged: number },
      string
    >({
      query: (roomId) => ({
        url: `/rooms/group/${roomId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Wallet', id: 'ME' }],
    }),

    // 7. Lấy danh sách phòng nhóm đang mở
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
    }),

    // 8. Lấy lịch sử chat trong phòng
    getRoomChatMessages: builder.query<InRoomChatMessage[], string>({
      query: (roomId) => `/rooms/${roomId}/chat`,
    }),

    // 9. Gửi tin nhắn chat trong phòng qua HTTP REST (fallback)
    sendRoomChatMessage: builder.mutation<InRoomChatMessage, { roomId: string; content: string }>({
      query: ({ roomId, content }) => ({
        url: `/rooms/${roomId}/chat`,
        method: 'POST',
        body: { content },
      }),
    }),

    // 10. Mute thành viên (Host)
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

    // 11. Kick thành viên (Host)
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
  useGetActiveGroupRoomsQuery,
  useGetRoomChatMessagesQuery,
  useSendRoomChatMessageMutation,
  useMuteParticipantMutation,
  useKickParticipantMutation,
} = sessionApi;
