import { useState, useEffect, useRef } from 'react';
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
  const { data: walletData, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const userBalance = walletData?.availableBalance ?? (walletData as any)?.balance ?? 0;
  const isInsufficientBalance = !isWalletLoading && walletData !== undefined && userBalance < 30;

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

  // Tự động chọn mốc thời lượng phù hợp khi ví tải xong:
  // - Nếu ví >= 60: chọn 60 phút
  // - Nếu 30 <= ví < 60: chọn 30 phút
  // - Nếu ví < 30: chọn 30 phút (và đánh dấu isInsufficientBalance để block)
  const hasAutoSelectedRef = useRef(false);
  useEffect(() => {
    if (walletData !== undefined && !hasAutoSelectedRef.current) {
      if (userBalance >= 60) {
        setDurationMinutes(60);
      } else {
        setDurationMinutes(30);
      }
      hasAutoSelectedRef.current = true;
    }
  }, [walletData, userBalance]);

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

  const handleShortDescriptionChange = (val: string) => {
    const trimmed = val.slice(0, 150);
    setShortDescription(trimmed);
    if (trimmed.trim()) setErrors((prev) => ({ ...prev, shortDescription: '' }));
  };

  const handleGoalsChange = (val: string) => {
    setGoals(val);
    if (val.replace(/<[^>]*>/g, '').trim()) setErrors((prev) => ({ ...prev, goals: '' }));
  };

  const handleDurationChange = (val: number) => {
    let sanitized = val;
    if (userBalance > 0 && sanitized > userBalance) {
      sanitized = userBalance;
      setDurationMinutes(sanitized);
      setErrors((prev) => ({
        ...prev,
        duration: `Số dư ví hiện tại của bạn chỉ có ${userBalance} Credit`,
      }));
      toast.error('Vượt số dư ví', `Tối đa ${userBalance} Credit hiện có trong ví`);
      return;
    }

    setDurationMinutes(sanitized);
    if (sanitized >= 30 && sanitized % 15 === 0) {
      setErrors((prev) => ({ ...prev, duration: '' }));
    }
  };

  const handleQuickDurationSelect = (mins: number) => {
    if (userBalance > 0 && mins > userBalance) {
      toast.error('Số dư không đủ', `Cần ${mins} Credit nhưng ví chỉ có ${userBalance} Credit`);
      setErrors((prev) => ({
        ...prev,
        duration: `Số dư ví (${userBalance} Credit) không đủ cho gói ${mins} phút`,
      }));
      return;
    }
    setDurationMinutes(mins);
    setErrors((prev) => ({ ...prev, duration: '' }));
  };

  const handleStepDuration = (delta: number) => {
    setDurationMinutes((prev) => {
      const next = prev + delta;
      if (next < 30) {
        toast.info('Thời lượng tối thiểu', 'Thời lượng buổi học tối thiểu là 30 phút (30 Credit)');
        return 30;
      }
      if (userBalance > 0 && next > userBalance) {
        toast.error('Vượt số dư ví', `Số dư ví hiện tại tối đa ${userBalance} Credit`);
        return prev;
      }
      setErrors((errs) => ({ ...errs, duration: '' }));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tên môn học hoặc kỹ năng cần học.';
    }

    if (!shortDescription.trim()) {
      newErrors.shortDescription = 'Vui lòng nhập mô tả tóm tắt nhu cầu học.';
    }

    const cleanGoals = goals.replace(/<[^>]*>/g, '').trim();
    if (!cleanGoals) {
      newErrors.goals = 'Vui lòng nhập chi tiết nội dung hoặc bài tập cần giải đáp.';
    }

    if (durationMinutes < 30) {
      newErrors.duration = 'Thời lượng buổi học tối thiểu là 30 phút (30 Credit).';
    } else if (durationMinutes % 15 !== 0) {
      newErrors.duration = 'Thời lượng phải là bội số của 15 phút (30, 45, 60, 75, 90...).';
    } else if (userBalance > 0 && durationMinutes > userBalance) {
      newErrors.duration = `Ngân sách Credit không được vượt quá số dư ví (${userBalance} Credit).`;
    }

    if (!desiredSlots || desiredSlots.length === 0) {
      newErrors.slots = 'Vui lòng chọn và thêm ít nhất một khung giờ rảnh mong muốn học.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = ['subject', 'shortDescription', 'goals', 'duration', 'slots'].find((key) => newErrors[key]);
      if (firstErrorKey) {
        const el = document.getElementById(`field-learner-${firstErrorKey}`);
        if (el) {
          const yOffset = -120;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          setTimeout(() => {
            const inputEl = el.querySelector('input, textarea, button') || el;
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

  const handleDesiredSlotsChange = (slots: TimeSlot[]) => {
    setDesiredSlots(slots);
    if (slots && slots.length > 0) {
      setErrors((prev) => ({ ...prev, slots: '' }));
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
    isInsufficientBalance,
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
    handleQuickDurationSelect,
    handleStepDuration,
    setTimeline,
    setDesiredSlots: handleDesiredSlotsChange,
    handleSubjectChange,
    handleShortDescriptionChange,
    handleGoalsChange,
    handleSubmit,
  };
};
