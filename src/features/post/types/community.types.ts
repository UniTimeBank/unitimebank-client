export type GroupCategory =
  | 'Tất cả'
  | 'Công nghệ thông tin'
  | 'Toán học & Giải tích'
  | 'Ngoại ngữ & IELTS'
  | 'Kinh tế & Marketing'
  | 'Thiết kế & Đồ họa'
  | 'Khoa học cơ bản'
  | 'Đời sống sinh viên';

export type GroupPostTag = 'QA' | 'DOCUMENT' | 'STUDY_BUDDY' | 'GENERAL';

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  role: 'CREATOR' | 'MEMBER';
}

export interface CommunityGroup {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  coverUrl?: string;
  avatarUrl?: string;
  category: GroupCategory | string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  memberIds?: string[];
  membersCount: number;
  postsCount: number;
  rules?: string[];
  isJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferGroupOwnershipDto {
  newOwnerId: string;
}

export interface CreateCommunityGroupDto {
  name: string;
  description: string;
  coverImage?: string;
  coverUrl?: string;
  avatarUrl?: string;
  category: string;
  rules?: string[];
  isPublic?: boolean;
}

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
  isLiked?: boolean;
  commentsCount: number;
  isPinned?: boolean;
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
  parentId?: string;
  replyToUserName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CreateGroupCommentDto {
  content: string;
  parentId?: string;
  replyToUserName?: string;
}
