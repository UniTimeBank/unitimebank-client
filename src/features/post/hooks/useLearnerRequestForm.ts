import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateLearnerRequestMutation } from '@/core/api/post/postApi';
import { useGetMyWalletQuery } from '@/core/api/wallet/walletApi';
import { SessionType, SkillCategoryName, type TimeSlot } from '../types';
import { toast } from '@/shared/utils';

export interface LearnerRequestFormState {
  subject: string;
  category: SkillCategoryName;
  sessionType: SessionType;
  coverImage: string;
  shortDescription: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
  desiredSlots: TimeSlot[];
}

export const useLearnerRequestForm = (
  onPreviewChange?: (state: LearnerRequestFormState) => void,
) => {
  const navigate = useNavigate();
  const [createLearnerRequest, { isLoading }] = useCreateLearnerRequestMutation();
  const { data: walletData } = useGetMyWalletQuery();
  const userBalance = walletData?.availableBalance ?? (walletData as any)?.balance ?? 0;

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SkillCategoryName>(SkillCategoryName.PROGRAMMING);
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.ONE_ON_ONE);
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  );
  const [shortDescription, setShortDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeline, setTimeline] = useState('Trong 3 ngày');
  const [desiredSlots, setDesiredSlots] = useState<TimeSlot[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to parent sidebar preview
  useEffect(() => {
    onPreviewChange?.({
      subject,
      category,
      sessionType,
      coverImage,
      shortDescription,
      goals,
      durationMinutes,
      timeline,
      desiredSlots,
    });
  }, [
    subject,
    category,
    sessionType,
    coverImage,
    shortDescription,
    goals,
    durationMinutes,
    timeline,
    desiredSlots,
    onPreviewChange,
  ]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    if (val.trim()) setErrors((prev) => ({ ...prev, subject: '' }));
  };

  const handleGoalsChange = (val: string) => {
    setGoals(val);
    if (val.replace(/<[^>]*>/g, '').trim()) setErrors((prev) => ({ ...prev, goals: '' }));
  };

  const handleDurationChange = (val: number) => {
    if (userBalance > 0 && val > userBalance) {
      setDurationMinutes(userBalance);
      setErrors((prev) => ({
        ...prev,
        duration: `Số dư ví hiện tại của bạn chỉ có ${userBalance} Credit`,
      }));
      toast.error('Vượt số dư ví', `Tối đa ${userBalance} Credit hiện có trong ví`);
    } else {
      setDurationMinutes(val);
      setErrors((prev) => ({ ...prev, duration: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tên môn học hoặc kỹ năng cần học.';
    }

    const cleanGoals = goals.replace(/<[^>]*>/g, '').trim();
    if (!cleanGoals) {
      newErrors.goals = 'Vui lòng nhập chi tiết nội dung hoặc bài tập cần giải đáp.';
    }

    if (durationMinutes <= 0) {
      newErrors.duration = 'Ngân sách Credit phải lớn hơn 0.';
    } else if (userBalance > 0 && durationMinutes > userBalance) {
      newErrors.duration = `Ngân sách Credit không được vượt quá số dư ví (${userBalance} Credit).`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = ['subject', 'goals', 'duration'].find((key) => newErrors[key]);
      if (firstErrorKey) {
        const el = document.getElementById(`field-learner-${firstErrorKey}`);
        if (el) {
          const yOffset = -120;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          setTimeout(() => {
            const inputEl = el.querySelector('input, textarea') || el;
            (inputEl as HTMLElement).focus?.({ preventScroll: true });
          }, 350);
        }
      }
      return;
    }

    try {
      await createLearnerRequest({
        skillNeeded: subject,
        category,
        shortDescription,
        description: goals,
        sessionType,
        expectedDurationMinutes: Number(durationMinutes) || 60,
        desiredSlots,
      }).unwrap();

      toast.success('Phát sóng yêu cầu học thành công!', 'Bài đăng của bạn đã được xuất bản tới các Mentor');

      setTimeout(() => {
        navigate('/explore');
      }, 1200);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Không thể tạo yêu cầu học';
      setErrorMessage(Array.isArray(msg) ? msg.join('. ') : msg);
      toast.error('Lỗi phát sóng bài đăng', Array.isArray(msg) ? msg.join('. ') : msg);
    }
  };

  return {
    subject,
    category,
    sessionType,
    coverImage,
    shortDescription,
    goals,
    durationMinutes,
    userBalance,
    timeline,
    desiredSlots,
    errors,
    errorMessage,
    isLoading,
    setCategory,
    setSessionType,
    setCoverImage,
    setShortDescription,
    setDurationMinutes: handleDurationChange,
    setTimeline,
    setDesiredSlots,
    handleSubjectChange,
    handleGoalsChange,
    handleSubmit,
  };
};
