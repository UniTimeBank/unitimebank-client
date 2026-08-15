import React, { useState } from 'react';
import {
  CreatePostHeader,
  MentorOfferForm,
  MentorPostPreview,
  LearnerRequestForm,
  LearnerRequestSidebar,
} from '../components';
import type { MentorOfferFormState } from '../components/create-post/MentorOfferForm';
import type { LearnerRequestFormState } from '../components/create-post/LearnerRequestForm';

export const OpenRequestsPage: React.FC = () => {
  // Post Type: 'MENTOR_OFFER' (Đăng Bài Dạy) vs 'LEARNER_REQUEST' (Đăng Yêu Cầu Học)
  const [postType, setPostType] = useState<'MENTOR_OFFER' | 'LEARNER_REQUEST'>('MENTOR_OFFER');

  const [mentorPreview, setMentorPreview] = useState<MentorOfferFormState>({
    title: '',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    skillsText: '',
    shortDescription: '',
    description: '',
    scheduleType: 'ALWAYS_OPEN',
    startDate: '',
    endDate: '',
    selectedSlotCount: 0,
  });

  const [learnerPreview, setLearnerPreview] = useState<LearnerRequestFormState>({
    subject: '',
    category: 'PROGRAMMING' as any,
    sessionType: 'ONE_ON_ONE' as any,
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
    shortDescription: '',
    goals: '',
    durationMinutes: 60,
    timeline: 'Trong 3 ngày',
    desiredSlots: [],
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner & Post Type Switcher */}
        <CreatePostHeader
          postType={postType}
          onPostTypeChange={setPostType}
        />

        {/* FORM TYPE 1: ĐĂNG BÀI DẠY (MENTOR OFFER) */}
        {postType === 'MENTOR_OFFER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7">
              <MentorOfferForm onPreviewChange={setMentorPreview} />
            </div>

            {/* Sticky Right Preview Sidebar */}
            <div className="lg:col-span-5 sticky top-20">
              <MentorPostPreview
                title={mentorPreview.title}
                shortDescription={mentorPreview.shortDescription}
                description={mentorPreview.description}
                coverImage={mentorPreview.coverImage}
                skillsText={mentorPreview.skillsText}
                scheduleType={mentorPreview.scheduleType}
                startDate={mentorPreview.startDate}
                endDate={mentorPreview.endDate}
                selectedSlotCount={mentorPreview.selectedSlotCount}
              />
            </div>
          </div>
        )}

        {/* FORM TYPE 2: BÀI TÌM MENTOR (LEARNER REQUEST) */}
        {postType === 'LEARNER_REQUEST' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-7">
              <LearnerRequestForm onPreviewChange={setLearnerPreview} />
            </div>

            {/* Sticky Right Preview Sidebar */}
            <div className="lg:col-span-5 sticky top-20">
              <LearnerRequestSidebar
                subject={learnerPreview.subject}
                coverImage={learnerPreview.coverImage}
                shortDescription={learnerPreview.shortDescription}
                goals={learnerPreview.goals}
                durationMinutes={learnerPreview.durationMinutes}
                timeline={learnerPreview.timeline}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
