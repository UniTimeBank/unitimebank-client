export interface CommunityGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  coverUrl?: string;
  avatarUrl?: string;
  creatorId: string;
  creatorName: string;
  membersCount: number;
  postsCount: number;
  isPublic: boolean;
  rules?: string[];
  isJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityGroupDto {
  name: string;
  description: string;
  category: string;
  coverUrl?: string;
  avatarUrl?: string;
  isPublic?: boolean;
  rules?: string[];
}

export type GroupPostTag = 'QA' | 'DOCUMENT' | 'STUDY_BUDDY' | 'GENERAL';

export interface GroupPost {
  _id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorHeadline?: string;
  content: string;
  images?: string[];
  tag: GroupPostTag | string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPostDto {
  content: string;
  images?: string[];
  tag?: string;
}

export interface GroupComment {
  _id: string;
  postId: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CreateGroupCommentDto {
  content: string;
}
