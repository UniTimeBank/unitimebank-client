export enum BookingOrigin {
  MENTOR_POST = 'MENTOR_POST',
  LEARNER_REQUEST = 'LEARNER_REQUEST',
}

export enum BookingStatus {
  PENDING_MENTOR_APPROVAL = 'PENDING_MENTOR_APPROVAL',
  PENDING_LEARNER_APPROVAL = 'PENDING_LEARNER_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  EXPIRED = 'EXPIRED',
}

export interface BookingItem {
  id: string;
  origin: BookingOrigin;
  sourcePostId?: string;
  mentorId: string;
  mentorName?: string;
  mentorAvatar?: string;
  mentorTrustScore?: number;
  learnerId: string;
  learnerName?: string;
  learnerAvatar?: string;
  learnerTrustScore?: number;
  title?: string;

  category?: string;
  note?: string;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  totalCreditEscrowed: number;
  status: BookingStatus;
  acceptedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface GetBookingsParams {
  role?: 'AS_LEARNER' | 'AS_MENTOR' | 'ALL';
  status?: BookingStatus | string;
  page?: number;
  limit?: number;
}

export interface GetBookingsResponse {
  items: BookingItem[];
  total: number;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}

export interface SendBookingMessagePayload {
  bookingId: string;
  content: string;
  attachmentUrl?: string;
}

