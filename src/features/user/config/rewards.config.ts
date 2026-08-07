import type { RewardDayItem } from '../types';

export const DAYS_REWARDS: RewardDayItem[] = [
  { day: 1, amount: 15 },
  { day: 2, amount: 5 },
  { day: 3, amount: 5 },
  { day: 4, amount: 5 },
  { day: 5, amount: 5 },
  { day: 6, amount: 5 },
  { day: 7, amount: 20 },
];

export const ONBOARDING_CREDITS = {
  REGISTER_BONUS: 30,
  PROFILE_COMPLETE_BONUS: 30,
  LOGIN_STREAK_7_DAYS_BONUS: 60,
  TOTAL_MAX_ONBOARDING: 120,
  MIN_ROOM_BALANCE: 5,
};
