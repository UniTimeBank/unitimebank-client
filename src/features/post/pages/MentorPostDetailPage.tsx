import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetMentorPostByIdQuery } from '@/core/api/post/postApi';
import { useGetPublicProfileQuery } from '@/core/api/user/userApi';
import {
  PostHero,
  PostAuthorCard,
  PostDescriptionCard,
  PostScheduleSidebar,
  RelatedPostsSection,
} from '../components/details';
import { SKILL_CATEGORY_LABELS } from '../constants';
import { toast } from '@/shared/utils';

export const MentorPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const { data: post, isLoading, error } = useGetMentorPostByIdQuery(id || '', {
    skip: !id,
  });

  const { data: mentorProfile } = useGetPublicProfileQuery(post?.mentorId || '', {
    skip: !post?.mentorId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải thông tin bài dạy...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 max-w-md">
          <h3 className="text-lg font-black text-gray-900">Không tìm thấy bài dạy</h3>
          <p className="text-xs text-gray-500 font-medium">
            Bài đăng này không tồn tại hoặc đã bị ẩn bởi tác giả.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Khám phá</span>
          </Link>
        </div>
      </div>
    );
  }

  const mentorName = mentorProfile?.displayName || post.mentorName || 'Mentor';
  const categoryCode = post.tags?.[0]?.category || 'PROGRAMMING';
  const categoryLabel = SKILL_CATEGORY_LABELS[categoryCode] || post.tags?.[0]?.skillName || 'CÔNG NGHỆ THÔNG TIN';
  const trustScore = mentorProfile?.trustScore || post.trustScoreSnapshot || 98;
  const ratingValue = (trustScore / 20).toFixed(1);
  const skillTags = post.tags?.map((t) => t.skillName) || ['ReactJS', 'TypeScript'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Back */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách bài dạy</span>
        </Link>

        {/* Main Content Layout Grid (7:3 ratio with compact gap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (8 Cols - 70%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Hero Banner, Title, Badges, Metrics */}
            <PostHero
              title={post.title}
              categoryCode={categoryCode}
              skills={skillTags}
              coverImage={post.coverImage}
              shortDescription={post.shortDescription}
              ratingValue={ratingValue}
              reviewsCount={128}
              durationMinutes={60}
            />

            {/* Card 2: Mentor Profile Card */}
            <PostAuthorCard
              authorName={mentorName}
              authorAvatar={mentorProfile?.avatarUrl || post.mentorAvatar}
              trustScore={trustScore}
              badgeText="TOP 5% MENTOR"
              roleSubtitle={mentorProfile?.bio || 'Người hướng dẫn chuyên môn @ UniTimeBank'}
              tags={skillTags}
            />

            {/* Card 3: Detailed Description Card */}
            <PostDescriptionCard
              title="Mô tả chi tiết"
              description={post.description}
              shortDescription={post.shortDescription}
            />
          </div>

          {/* Right Column (4 Cols - 30%) */}
          <div className="lg:col-span-4">
            {/* Mentor Available Schedule & Action Sidebar */}
            <PostScheduleSidebar
              title="Lịch rảnh"
              mentorId={post.mentorId}
              slots={post.availableSlots}
              scheduleType={post.scheduleType}
              startDate={post.startDate}
              endDate={post.endDate}
              creditCost="1"
              creditRateText="credit / phút"
              freeTrialText="Miễn phí 5 phút đầu"
              authorName={mentorName}
              primaryButtonText="Đặt lịch ngay"
              onPrimaryAction={(date, slot) => {
                toast.success(
                  'Đã gửi yêu cầu đặt lịch học!',
                  `Ngày ${date} (${slot.startTime} - ${slot.endTime}) với ${mentorName}`,
                );
              }}
            />
          </div>
        </div>

        {/* Bottom Section: Related/Suggested Posts */}
        <RelatedPostsSection currentPostId={post._id} title="Các lớp học gợi ý khác" />

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
      </div>
    </div>
  );
};
