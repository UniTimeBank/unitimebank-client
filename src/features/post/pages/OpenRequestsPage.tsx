import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  useCreateMentorPostMutation,
  useCreateLearnerRequestMutation,
} from '@/core/api/post/postApi';
import { SessionType, PostScheduleType } from '../types';
import { useMentorSchedule } from '@/features/schedule';
import { useUserSkills } from '@/features/user';
import {
  CreatePostHeader,
  MentorOfferForm,
  MentorPostPreview,
  LearnerRequestForm,
  LearnerRequestSidebar,
} from '../components';

const DAY_MAP_TO_BACKEND: Record<string, string> = {
  MON: 'MONDAY',
  TUE: 'TUESDAY',
  WED: 'WEDNESDAY',
  THU: 'THURSDAY',
  FRI: 'FRIDAY',
  SAT: 'SATURDAY',
  SUN: 'SUNDAY',
};

export const OpenRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  // Post Type: 'MENTOR_OFFER' (Đăng Bài Dạy) vs 'LEARNER_REQUEST' (Đăng Yêu Cầu Học)
  const [postType, setPostType] = useState<'MENTOR_OFFER' | 'LEARNER_REQUEST'>('MENTOR_OFFER');

  const [createMentorPost, { isLoading: isCreatingMentor }] = useCreateMentorPostMutation();
  const [createLearnerRequest, { isLoading: isCreatingLearner }] = useCreateLearnerRequestMutation();

  const { recurringSchedules } = useMentorSchedule();
  const { skills: profileSkills } = useUserSkills();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- 1. Mentor Post Form State ---
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorCoverImage, setMentorCoverImage] = useState(
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600'
  );
  const [mentorSkillsText, setMentorSkillsText] = useState('');
  const [mentorDescription, setMentorDescription] = useState('');
  const [mentorScheduleType, setMentorScheduleType] = useState<'ALWAYS_OPEN' | 'LIMITED_TIME'>('ALWAYS_OPEN');
  const [mentorStartDate, setMentorStartDate] = useState('');
  const [mentorEndDate, setMentorEndDate] = useState('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // --- 2. Learner Request Form State ---
  const [learnerSubject, setLearnerSubject] = useState('');
  const [learnerCoverImage, setLearnerCoverImage] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
  );
  const [learnerGoals, setLearnerGoals] = useState('');
  const [learnerDurationMinutes, setLearnerDurationMinutes] = useState(60);
  const [learnerTimeline, setLearnerTimeline] = useState('Trong 3 ngày');

  const toggleSlotId = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleSelectAllSlots = (allIds: string[]) => {
    setSelectedSlotIds(allIds);
  };

  // Submit Mentor Post
  const handleSubmitMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mentorTitle.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề bài dạy.');
      return;
    }

    if (mentorScheduleType === 'LIMITED_TIME') {
      if (!mentorStartDate || !mentorEndDate) {
        setErrorMessage('Vui lòng chọn đầy đủ Ngày bắt đầu và Ngày kết thúc cho khóa học có thời hạn.');
        return;
      }
      if (mentorStartDate > mentorEndDate) {
        setErrorMessage('Ngày kết thúc phải sau Ngày bắt đầu.');
        return;
      }
    }

    const tags = mentorSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((skillName) => {
        const matched = profileSkills?.find(
          (ps) => ps.skillName.toLowerCase() === skillName.toLowerCase()
        );
        return { skillName, category: matched?.category || 'ACADEMIC' };
      });

    // Map các slot đã chọn từ hồ sơ sang DTO gửi lên Post Service
    const selectedSchedules = recurringSchedules.filter((s) => selectedSlotIds.includes(s.id));
    const availableSlots = selectedSchedules.map((s) => ({
      dayOfWeek: DAY_MAP_TO_BACKEND[s.dayOfWeek] || s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    try {
      await createMentorPost({
        title: mentorTitle,
        description: mentorDescription,
        sessionType: SessionType.BOTH,
        scheduleType: mentorScheduleType as PostScheduleType,
        startDate: mentorScheduleType === 'LIMITED_TIME' ? mentorStartDate : undefined,
        endDate: mentorScheduleType === 'LIMITED_TIME' ? mentorEndDate : undefined,
        tags,
        availableSlots,
      }).unwrap();

      setSuccessMessage('🎉 Đã đăng bài dạy thành công! Bài viết của bạn đã hiển thị trên trang Khám phá.');
      setTimeout(() => {
        navigate('/explore');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create mentor post:', err);
      setErrorMessage(err?.data?.message || 'Có lỗi xảy ra khi tạo bài đăng.');
    }
  };

  // Submit Learner Request
  const handleSubmitLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!learnerSubject.trim()) return;

    try {
      await createLearnerRequest({
        skillNeeded: learnerSubject,
        category: 'HỌC THUẬT',
        description: learnerGoals,
        sessionType: SessionType.ONE_ON_ONE,
        expectedDurationMinutes: Number(learnerDurationMinutes) || 60,
      }).unwrap();

      setSuccessMessage('🚀 Đã phát sóng yêu cầu học thành công! Các Mentor sẽ sớm phản hồi yêu cầu của bạn.');
      setTimeout(() => {
        navigate('/explore');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to broadcast learner request:', err);
      setErrorMessage(err?.data?.message || 'Có lỗi xảy ra khi phát sóng yêu cầu.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner & Post Type Switcher */}
        <CreatePostHeader
          postType={postType}
          onPostTypeChange={setPostType}
        />

        {/* Success Toast Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Toast Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM TYPE 1: ĐĂNG BÀI DẠY (MENTOR OFFER) */}
        {postType === 'MENTOR_OFFER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7">
              <MentorOfferForm
                title={mentorTitle}
                onTitleChange={setMentorTitle}
                coverImage={mentorCoverImage}
                onCoverImageChange={setMentorCoverImage}
                skillsText={mentorSkillsText}
                onSkillsTextChange={setMentorSkillsText}
                description={mentorDescription}
                onDescriptionChange={setMentorDescription}
                scheduleType={mentorScheduleType}
                onScheduleTypeChange={setMentorScheduleType}
                startDate={mentorStartDate}
                onStartDateChange={setMentorStartDate}
                endDate={mentorEndDate}
                onEndDateChange={setMentorEndDate}
                selectedSlotIds={selectedSlotIds}
                onToggleSlotId={toggleSlotId}
                onSelectAllSlots={handleSelectAllSlots}
                onSubmit={handleSubmitMentor}
                isLoading={isCreatingMentor}
              />
            </div>

            {/* Sticky Preview Sidebar */}
            <div className="lg:col-span-5 sticky top-24 self-start">
              <MentorPostPreview
                title={mentorTitle}
                description={mentorDescription}
                coverImage={mentorCoverImage}
                skillsText={mentorSkillsText}
                scheduleType={mentorScheduleType}
                startDate={mentorStartDate}
                endDate={mentorEndDate}
                selectedSlotCount={selectedSlotIds.length}
              />
            </div>
          </div>
        )}

        {/* FORM TYPE 2: ĐĂNG YÊU CẦU HỌC (LEARNER REQUEST) */}
        {postType === 'LEARNER_REQUEST' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7">
              <LearnerRequestForm
                subject={learnerSubject}
                onSubjectChange={setLearnerSubject}
                coverImage={learnerCoverImage}
                onCoverImageChange={setLearnerCoverImage}
                goals={learnerGoals}
                onGoalsChange={setLearnerGoals}
                durationMinutes={learnerDurationMinutes}
                onDurationMinutesChange={setLearnerDurationMinutes}
                timeline={learnerTimeline}
                onTimelineChange={setLearnerTimeline}
                onSubmit={handleSubmitLearner}
                isLoading={isCreatingLearner}
              />
            </div>

            {/* Sticky Preview Sidebar */}
            <div className="lg:col-span-5 sticky top-24 self-start">
              <LearnerRequestSidebar
                subject={learnerSubject}
                coverImage={learnerCoverImage}
                goals={learnerGoals}
                durationMinutes={learnerDurationMinutes}
                timeline={learnerTimeline}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
