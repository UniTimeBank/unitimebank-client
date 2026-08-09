import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import {
  useCreateMentorPostMutation,
  useCreateLearnerRequestMutation,
} from '@/core/api/post/postApi';
import { SessionType } from '../types';
import {
  CreatePostHeader,
  MentorOfferForm,
  MentorPostPreview,
  LearnerRequestForm,
  LearnerRequestSidebar,
} from '../components';

export const OpenRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  // Post Type: 'MENTOR_OFFER' (Đăng Bài Dạy) vs 'LEARNER_REQUEST' (Đăng Yêu Cầu Học)
  const [postType, setPostType] = useState<'MENTOR_OFFER' | 'LEARNER_REQUEST'>('MENTOR_OFFER');

  const [createMentorPost, { isLoading: isCreatingMentor }] = useCreateMentorPostMutation();
  const [createLearnerRequest, { isLoading: isCreatingLearner }] = useCreateLearnerRequestMutation();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- 1. Mentor Post Form State ---
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorCoverImage, setMentorCoverImage] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600');
  const [mentorCategory, setMentorCategory] = useState('STEM');
  const [mentorDifficulty, setMentorDifficulty] = useState<string>('Intro');
  const [mentorSkillsText, setMentorSkillsText] = useState('Python, Đại số cơ bản, Pandas');
  const [mentorDescription, setMentorDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<number[]>([3, 5, 9]);

  // --- 2. Learner Request Form State ---
  const [learnerSubject, setLearnerSubject] = useState('');
  const [learnerCoverImage, setLearnerCoverImage] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600');
  const [learnerLevel, setLearnerLevel] = useState<'Người mới' | 'Trung bình' | 'Chuyên sâu'>('Trung bình');
  const [learnerGoals, setLearnerGoals] = useState('');
  const [learnerDurationMinutes, setLearnerDurationMinutes] = useState(60);
  const [learnerTimeline, setLearnerTimeline] = useState('Trong 3 ngày');

  const toggleDate = (d: number) => {
    if (selectedDates.includes(d)) {
      setSelectedDates(selectedDates.filter((item) => item !== d));
    } else {
      setSelectedDates([...selectedDates, d]);
    }
  };

  // Submit Mentor Post
  const handleSubmitMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorTitle.trim()) return;

    const tags = mentorSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((skillName) => ({ skillName, category: mentorCategory }));

    try {
      await createMentorPost({
        title: mentorTitle,
        description: mentorDescription,
        sessionType: SessionType.BOTH,
        tags,
        availableSlots: [
          { dayOfWeek: 'THỨ HAI', startTime: '18:00', endTime: '20:00' },
          { dayOfWeek: 'THỨ TƯ', startTime: '19:00', endTime: '21:00' },
        ],
      }).unwrap();

      setSuccessMessage('🎉 Đã đăng bài dạy thành công! Bài viết của bạn đã hiển thị trên trang Khám phá.');
      setTimeout(() => {
        navigate('/explore');
      }, 1500);
    } catch (err) {
      console.error('Failed to create mentor post:', err);
    }
  };

  // Submit Learner Request
  const handleSubmitLearner = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      console.error('Failed to broadcast learner request:', err);
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

        {/* FORM TYPE 1: ĐĂNG BÀI DẠY (MENTOR OFFER) */}
        {postType === 'MENTOR_OFFER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7">
              <MentorOfferForm
                title={mentorTitle}
                onTitleChange={setMentorTitle}
                coverImage={mentorCoverImage}
                onCoverImageChange={setMentorCoverImage}
                category={mentorCategory}
                onCategoryChange={setMentorCategory}
                difficulty={mentorDifficulty}
                onDifficultyChange={setMentorDifficulty}
                skillsText={mentorSkillsText}
                onSkillsTextChange={setMentorSkillsText}
                description={mentorDescription}
                onDescriptionChange={setMentorDescription}
                selectedDates={selectedDates}
                onToggleDate={toggleDate}
                onSubmit={handleSubmitMentor}
                isLoading={isCreatingMentor}
              />
            </div>

            <div className="lg:col-span-5">
              <MentorPostPreview
                category={mentorCategory}
                title={mentorTitle}
                description={mentorDescription}
                coverImage={mentorCoverImage}
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
                level={learnerLevel}
                onLevelChange={setLearnerLevel}
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

            <div className="lg:col-span-5">
              <LearnerRequestSidebar
                subject={learnerSubject}
                coverImage={learnerCoverImage}
                level={learnerLevel}
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
