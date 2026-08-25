export interface RatingItem {
  id: string;
  bookingId: string;
  sessionId?: string;
  learnerId: string;
  mentorId: string;
  stars: number;
  comment?: string;
  submittedAt: string;
  reviewerName?: string;
  reviewerAvatar?: string;
}

export interface CreateRatingPayload {
  bookingId: string;
  sessionId?: string;
  mentorId: string;
  stars: number;
  comment?: string;
  reviewerName?: string;
  reviewerAvatar?: string;
}

export interface UserReviewsSummary {
  userId: string;
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviews: RatingItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrustScore {
  id: string;
  userId: string;
  score: number;
  tier: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'WARNING' | 'LOCKED';
  lastUpdatedAt: string;
}

export interface TrustScoreChange {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  scoreBefore: number;
  scoreAfter: number;
  sourceEventId?: string;
  sourceEventKind?: string;
  occurredAt: string;
}

export interface TrustScoreHistoryResponse {
  trustScore: TrustScore;
  history: TrustScoreChange[];
}

export type ReportCategory =
  | 'TOXIC_LANGUAGE'
  | 'FRAUD'
  | 'INAPPROPRIATE_CONTENT'
  | 'SPAM'
  | 'AFK_ABUSE'
  | 'OTHER';

export interface CreateViolationReportPayload {
  targetUserId: string;
  targetType?: string;
  targetId?: string;
  category: ReportCategory;
  description?: string;
  evidenceUrls?: Array<{
    url: string;
    kind: string;
    metadata?: Record<string, any>;
  }>;
}

export interface ViolationReportItem {
  id: string;
  reporterId: string;
  targetUserId: string;
  targetType: string;
  targetId: string;
  category: ReportCategory;
  description?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  submittedAt: string;
  closedAt?: string;
  evidences?: Array<{
    id: string;
    fileUrl: string;
    evidenceKind: string;
  }>;
}
