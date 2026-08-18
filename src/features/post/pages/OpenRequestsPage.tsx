import React, { useState } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
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
  const [postType, setPostType] = useState<'MENTOR_OFFER' | 'LEARNER_REQUEST'>('MENTOR_OFFER');

  const [mentorPreview, setMentorPreview] = useState<MentorOfferFormState>({
    title: '',
    category: 'PROGRAMMING' as any,
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 1. Header Banner */}
        <CreatePostHeader />

        {/* 2. Main 2-Column Content: Left Form, Right Preview with Tab on Top */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* LEFT COLUMN: Active Form */}
          <div className="lg:col-span-7">
            {/* FORM 1: MENTOR OFFER */}
            {postType === 'MENTOR_OFFER' && (
              <MentorOfferForm onPreviewChange={setMentorPreview} />
            )}

            {/* FORM 2: LEARNER REQUEST */}
            {postType === 'LEARNER_REQUEST' && (
              <LearnerRequestForm onPreviewChange={setLearnerPreview} />
            )}
          </div>

          {/* RIGHT COLUMN: Tab Switcher directly on top of Live Preview Card */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            {/* Tab Switcher - Clean Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl gap-1 border border-slate-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setPostType('MENTOR_OFFER')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  postType === 'MENTOR_OFFER'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className={`w-4 h-4 stroke-[2.25] ${postType === 'MENTOR_OFFER' ? 'text-primary-700' : 'text-slate-400'}`} />
                <span>Bài Nhận Dạy</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('LEARNER_REQUEST')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  postType === 'LEARNER_REQUEST'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className={`w-4 h-4 stroke-[2.25] ${postType === 'LEARNER_REQUEST' ? 'text-primary-700' : 'text-slate-400'}`} />
                <span>Yêu Cầu Học</span>
              </button>
            </div>

            {/* Live Preview Card */}
            {postType === 'MENTOR_OFFER' ? (
              <MentorPostPreview
                title={mentorPreview.title}
                category={mentorPreview.category}
                shortDescription={mentorPreview.shortDescription}
                description={mentorPreview.description}
                coverImage={mentorPreview.coverImage}
                skillsText={mentorPreview.skillsText}
                scheduleType={mentorPreview.scheduleType}
                startDate={mentorPreview.startDate}
                endDate={mentorPreview.endDate}
                selectedSlotCount={mentorPreview.selectedSlotCount}
              />
            ) : (
              <LearnerRequestSidebar
                subject={learnerPreview.subject}
                category={learnerPreview.category}
                coverImage={learnerPreview.coverImage}
                shortDescription={learnerPreview.shortDescription}
                goals={learnerPreview.goals}
                durationMinutes={learnerPreview.durationMinutes}
                timeline={learnerPreview.timeline}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
