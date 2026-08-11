import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface OnboardingData {
  profileCompleted?: boolean;
  scheduleCreated?: boolean;
  skillAdded?: boolean;
  tasks?: Array<{
    taskKey: string;
    title: string;
    completed: boolean;
    rewardCredits: number;
  }>;
}

export const useOnboardingTaskToastNotifier = (onboardingData?: OnboardingData) => {
  const prevCompletedRef = useRef<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (!onboardingData) return;

    const currentState: Record<string, boolean> = {
      PROFILE_COMPLETE: Boolean(onboardingData.profileCompleted),
      PROFILE_SCHEDULE: Boolean(onboardingData.scheduleCreated),
      PROFILE_SKILL: Boolean(onboardingData.skillAdded),
    };

    // Chỉ phản ứng khi không phải lần khởi tạo đầu tiên
    if (prevCompletedRef.current !== null) {
      const taskTitles: Record<string, string> = {
        PROFILE_COMPLETE: 'Cập nhật thông tin cá nhân',
        PROFILE_SCHEDULE: 'Tạo lịch rảnh khả dụng',
        PROFILE_SKILL: 'Khai báo kỹ năng chuyên môn',
      };

      for (const [key, isCompletedNow] of Object.entries(currentState)) {
        const wasCompletedBefore = prevCompletedRef.current[key];
        if (isCompletedNow && !wasCompletedBefore) {
          const title = taskTitles[key] || 'Nhiệm vụ mới';
          toast.success(` Chúc mừng! Bạn đã hoàn thành nhiệm vụ "${title}" và nhận +10 Credit vào ví!`, {
            duration: 5000,
            style: {
              borderRadius: '16px',
              background: '#0B654D',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              padding: '12px 18px',
            },
          });
        }
      }
    }

    prevCompletedRef.current = currentState;
  }, [onboardingData]);
};
