export interface RewardDayItem {
  day: number;
  amount: number;
  granted?: boolean;
}

export interface LoginStreakResponse {
  currentStreak: number;
  totalLoginDays: number;
  totalReward: number;
  rewardsReceived: RewardDayItem[];
}

export interface CheckinResult {
  streakDay: number;
  creditReward: number;
  totalReward: number;
  nextReward: number;
  remainingDays: number;
}
