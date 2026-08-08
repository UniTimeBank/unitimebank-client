export interface StudyGroup {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  activeDiscussions: number;
  description: string;
  image: string;
  joined?: boolean;
}

export interface TopContributor {
  id: string;
  name: string;
  major: string;
  hoursShared: number;
  trustScore: number;
  avatar: string;
  rank: number;
}

export type CommunityTabType = 'Nhóm học tập' | 'Bảng xếp hạng' | 'Sự kiện & Workshop';
