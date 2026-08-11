export interface RewardDayItem {
  day: number;
  amount: number;
  granted?: boolean;
}

export interface LoginStreakResponse {
  currentStreak: number;
  isCheckedInToday?: boolean;
  lastCheckInDate?: string | null;
  history?: Array<{
    date: string;
    streakDay: number;
    rewardGranted: boolean;
  }>;
  totalLoginDays?: number;
  totalReward?: number;
  rewardsReceived?: RewardDayItem[];
}

export interface CheckinResult {
  message?: string;
  streakDay?: number;
  creditReward?: number;
  rewardCredits?: number;
  totalReward?: number;
  nextReward?: number;
  remainingDays?: number;
}
