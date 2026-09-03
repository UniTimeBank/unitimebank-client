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
  freeSecondsRemaining?: number;
  activeSeconds?: number;
  paidSeconds?: number;
  creditsCharged?: number;
}

export interface ActiveGroupRoomItem {
  roomId: string;
  mentorId: string;
  title: string;
  category?: string;
  currentParticipants: number;
  openedAt: string;
  status: RoomStatus;
  maxParticipants?: number;
  coverImage?: string;
  mentorName?: string;
  participantUserIds?: string[];
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
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface GroupLearnerStat {
  id: string;
  userId: string;
  role: ParticipantRole;
  connectionStatus: ConnectionStatus;
  joinedAt: string;
  leftAt?: string | null;
  activeSeconds: number;
  freeSecondsRemaining: number;
  paidMinutes: number;
  creditsContributed: number;
}

export interface GroupRoomStatsResponse {
  roomId: string;
  title: string;
  mentorId: string;
  status: RoomStatus;
  openedAt: string;
  accumulatedCredits: number;
  totalLearnersCount: number;
  activeLearnersCount: number;
  learners: GroupLearnerStat[];
}
