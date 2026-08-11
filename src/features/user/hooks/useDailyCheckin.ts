import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useGetLoginStreakQuery, useDailyCheckinMutation } from '@/core/api/user';

export const useDailyCheckin = () => {
  const { data: streakInfo, isLoading: isLoadingStreak, refetch } = useGetLoginStreakQuery();
  const [checkinMutation, { isLoading: isCheckinLoading }] = useDailyCheckinMutation();

  const [localStreak, setLocalStreak] = useState<number | null>(null);
  const [localCheckedIn, setLocalCheckedIn] = useState<boolean | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  const currentStreak = localStreak ?? streakInfo?.currentStreak ?? 0;
  const hasCheckedInToday = localCheckedIn ?? streakInfo?.isCheckedInToday ?? false;

  // Auto-hide notification message after 4 seconds
  useEffect(() => {
    if (rewardMessage) {
      const timer = setTimeout(() => {
        setRewardMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [rewardMessage]);

  const handleCheckin = async () => {
    try {
      const res = await checkinMutation().unwrap();
      setLocalCheckedIn(true);
      setLocalStreak(res.streakDay || (streakInfo?.currentStreak || 0) + 1);
      const reward = res.rewardCredits || res.creditReward || 15;
      const successMsg = ` Điểm danh thành công! Đã cộng +${reward} credit thưởng vào ví của bạn.`;
      setRewardMessage(successMsg);
      toast.success(successMsg);
      refetch();
      return { success: true, data: res };
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Bạn đã điểm danh ngày hôm nay rồi!';
      setRewardMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    streakInfo,
    currentStreak,
    hasCheckedInToday,
    rewardMessage,
    isLoadingStreak,
    checkin: handleCheckin,
    isCheckinLoading,
  };
};
