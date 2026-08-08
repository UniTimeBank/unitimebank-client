export enum SessionType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  GROUP = 'GROUP',
  BOTH = 'BOTH',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum LearnerRequestStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
}

export interface PostTag {
  skillName: string;
  category?: string;
}

export interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface MentorPost {
  _id: string;
  mentorId: string;
  mentorName?: string;
  mentorAvatar?: string;
  title: string;
  description?: string;
  sessionType: SessionType;
  tags: PostTag[];
  availableSlots: TimeSlot[];
  trustScoreSnapshot: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerRequest {
  _id: string;
  learnerId: string;
  learnerName?: string;
  learnerAvatar?: string;
  skillNeeded: string;
  category: string;
  description?: string;
  sessionType: SessionType;
  expectedDurationMinutes: number;
  expectedCreditAmount: number;
  desiredSlots: TimeSlot[];
  status: LearnerRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetMentorPostsParams {
  search?: string;
  skill?: string;
  category?: string;
  sessionType?: SessionType;
  trustScoreMin?: number;
  dayOfWeek?: string;
  status?: PostStatus;
  page?: number;
  limit?: number;
}

export interface GetMentorPostsResponse {
  items: MentorPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLearnerRequestsParams {
  search?: string;
  category?: string;
  sessionType?: SessionType;
  status?: LearnerRequestStatus;
  page?: number;
  limit?: number;
}

export interface GetLearnerRequestsResponse {
  items: LearnerRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMentorPostDto {
  title: string;
  description?: string;
  sessionType?: SessionType;
  tags: PostTag[];
  availableSlots?: TimeSlot[];
}

export interface UpdateMentorPostDto {
  title?: string;
  description?: string;
  sessionType?: SessionType;
  tags?: PostTag[];
  availableSlots?: TimeSlot[];
  status?: PostStatus;
}

export interface CreateLearnerRequestDto {
  skillNeeded: string;
  category: string;
  description?: string;
  sessionType?: SessionType;
  expectedDurationMinutes: number;
  desiredSlots?: TimeSlot[];
}

export interface UpdateLearnerRequestDto {
  skillNeeded?: string;
  category?: string;
  description?: string;
  sessionType?: SessionType;
  expectedDurationMinutes?: number;
  desiredSlots?: TimeSlot[];
  status?: LearnerRequestStatus;
}

export interface SearchPostsParams {
  q?: string;
  category?: string;
  sessionType?: SessionType;
  trustScoreMin?: number;
  dayOfWeek?: string;
  sortBy?: 'newest' | 'trustScore' | 'relevance';
  page?: number;
  limit?: number;
}

export interface SearchPostsResponse {
  mentorPosts: MentorPost[];
  learnerRequests: LearnerRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface PostSuggestionsResponse {
  skills: string[];
  titles: string[];
  categories: string[];
}

export interface PostRecommendationsResponse {
  recommendedMentorPosts: MentorPost[];
  recommendedLearnerRequests: LearnerRequest[];
}
