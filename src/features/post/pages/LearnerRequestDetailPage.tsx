import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetLearnerRequestByIdQuery } from '@/core/api/post/postApi';
import { useGetPublicProfileQuery } from '@/core/api/user/userApi';
import {
  PostHero,
  PostAuthorCard,
  PostDescriptionCard,
  LearnerRequestDetailSidebar,
  RelatedPostsSection,
} from '../components/details';
import { SKILL_CATEGORY_LABELS } from '../constants';
import { toast } from '@/shared/utils';

export const LearnerRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const { data: request, isLoading, error } = useGetLearnerRequestByIdQuery(id || '', {
    skip: !id,
  });

  const { data: learnerProfile } = useGetPublicProfileQuery(request?.learnerId || '', {
    skip: !request?.learnerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải thông tin yêu cầu học...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 max-w-md">
          <h3 className="text-lg font-black text-gray-900">Không tìm thấy yêu cầu</h3>
          <p className="text-xs text-gray-500 font-medium">
            Yêu cầu học này không tồn tại hoặc đã được nhận bởi gia sư khác.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Khám phá yêu cầu khác
          </Link>
        </div>
      </div>
    );
  }

  const learnerName = request.learnerName || learnerProfile?.displayName || 'Học viên UniTimeBank';
  const categoryCode = request.category || 'OTHER';
  const categoryLabel = SKILL_CATEGORY_LABELS[categoryCode] || request.category || 'YÊU CẦU HỌC TẬP';
  const trustScore = (learnerProfile as any)?.trustScoreSnapshot || (learnerProfile as any)?.trustScore || 85;
  const ratingValue = 5.0;
  const durationMinutes = request.expectedDurationMinutes || 60;
  const creditBudget = request.expectedCreditAmount || durationMinutes;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách yêu cầu</span>
        </Link>

        {/* Main Content Layout Grid (7:3 ratio with compact gap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (8 Cols - 70%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Hero Banner, Title, Badges, Metrics */}
            <PostHero
              title={`Cần tìm Mentor kèm: ${request.skillNeeded}`}
              categoryCode={categoryCode}
              skills={[request.skillNeeded]}
              coverImage={request.coverImage}
              shortDescription={request.shortDescription}
              ratingValue={ratingValue.toFixed(1)}
              reviewsCount={56}
              durationMinutes={durationMinutes}
            />

            {/* Card 2: Learner Profile Card */}
            <PostAuthorCard
              authorName={learnerName}
              authorAvatar={learnerProfile?.avatarUrl || request.learnerAvatar}
              trustScore={trustScore}
              badgeText="HỌC VIÊN TÍCH CỰC"
              roleSubtitle={learnerProfile?.bio || 'Học viên tìm kiếm người hướng dẫn 1-1 trên UniTimeBank'}
              tags={[request.skillNeeded]}
            />

            {/* Card 3: Detailed Description Card */}
            <PostDescriptionCard
              title="Chi tiết bài tập & thắc mắc cần giải đáp"
              description={request.description}
              shortDescription={request.shortDescription}
            />
          </div>

          {/* Right Column (4 Cols - 30%) */}
          <div className="lg:col-span-4">
            {/* Learner Desired Schedule & Action Sidebar */}
            <LearnerRequestDetailSidebar
              title="Khung giờ học viên rảnh"
              slots={request.desiredSlots}
              expectedCreditAmount={request.expectedCreditAmount || durationMinutes}
              expectedDurationMinutes={durationMinutes}
              learnerName={learnerName}
              primaryButtonText="Nhận dạy yêu cầu này"
              onPrimaryAction={(slot) => {
                toast.success(
                  'Đã gửi đề nghị nhận dạy!',
                  `Khung giờ: ${slot.dayOfWeek} (${slot.startTime} - ${slot.endTime}) cho ${learnerName}`,
                );
              }}
            />
          </div>
        </div>

        {/* Bottom Section: Related/Suggested Posts */}
        <RelatedPostsSection currentPostId={request._id} title="Các bài đăng gợi ý khác" />

        {/* Page Footer */}
        <footer className="pt-8 pb-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div>© 2024 UniTimeBank. Nền tảng trao đổi tri thức học thuật.</div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-gray-800 transition-colors">
              Chính sách
            </a>
            <a href="#terms" className="hover:text-gray-800 transition-colors">
              Điều khoản
            </a>
            <a href="#help" className="hover:text-gray-800 transition-colors">
              Trợ giúp
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};
