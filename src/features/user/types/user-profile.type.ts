import type { UserSkill } from './user-skill.type.ts';


export interface UserStats {
  followersCount: number;
  followingCount: number;
  totalSessionsCompleted?: number;
  totalSessions?: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  trustScore: number;
  trustTier?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'WARNING' | 'LOCKED';
  onboardingCompleted?: boolean;
  skills?: UserSkill[];
  stats?: UserStats;
  isFollowing?: boolean;
  lastUpdatedAt?: string;
}

export interface PublicUserProfile extends UserProfile {
  trustTier: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'WARNING' | 'LOCKED';
  attendanceStats?: {
    sessionCompletionRate: number; // e.g. 100
    punctualityRate: number; // e.g. 96
    avgResponseTimeHours: number; // e.g. 2
    creditsEarnedMinutes: number; // e.g. 3420
  };
  expertiseTrack?: {
    technicalProficiency: string; // 'Advanced'
    communication: string; // 'Expert'
  };
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
}
