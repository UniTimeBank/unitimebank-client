export interface FollowUserItem {
  id: string;
  displayName: string;
  avatarUrl?: string;
  trustScore: number;
}

export interface FollowListResponse {
  followers?: FollowUserItem[];
  following?: FollowUserItem[];
  total: number;
}
