export type RoomType = 'ONE_ON_ONE' | 'GROUP';

export type RoomStatus =
  | 'SCHEDULED'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipantRole = 'MENTOR' | 'LEARNER';

export type ConnectionStatus =
  | 'ONLINE'
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'KICKED';

export interface LiveKitTokenResponse {
  roomId: string;
  roomType: RoomType;
  livekitRoomName: string;
  livekitToken: string;
  livekitWsUrl: string;
  status: RoomStatus;
  role: ParticipantRole;
  bookingId?: string;
  mentorId: string;
  learnerId?: string;
  escrowedCredit?: number;
  availableBalance?: number;
  canJoin: boolean;
}

export interface ActiveGroupRoomItem {
  roomId: string;
  mentorId: string;
  title: string;
  category?: string;
  currentParticipants: number;
  openedAt: string;
  status: RoomStatus;
}

export interface GetActiveGroupRoomsResponse {
  rooms: ActiveGroupRoomItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateGroupRoomPayload {
  title: string;
  category?: string;
  maxParticipants?: number;
  postId?: string;
}

export interface InRoomChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  sentAt: string;
  senderName?: string;
  senderAvatar?: string;
}
