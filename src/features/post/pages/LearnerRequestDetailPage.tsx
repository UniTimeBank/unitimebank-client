import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Award } from 'lucide-react';
import { useGetLearnerRequestByIdQuery } from '@/core/api/post/postApi';
import { useGetPublicProfileQuery } from '@/core/api/user/userApi';
import { useApplyLearnerRequestMutation } from '@/core/api/booking/bookingApi';
import {
  PostHero,
  PostAuthorCard,
  PostDescriptionCard,
  LearnerRequestDetailSidebar,
  RelatedPostsSection,
} from '../components/details';
import { Button, Modal } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import type { TimeSlot } from '@/features/post/types';

export const LearnerRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const { data: request, isLoading, error } = useGetLearnerRequestByIdQuery(id || '', {
    skip: !id,
  });

  const { data: learnerProfile } = useGetPublicProfileQuery(request?.learnerId || '', {
    skip: !request?.learnerId,
  });

  const [applyLearnerRequest, { isLoading: isApplyingLoading }] = useApplyLearnerRequestMutation();

  // Apply Modal State
  const [applyModal, setApplyModal] = useState<{
    isOpen: boolean;
    slot: TimeSlot;
    date: string;
    note: string;
  } | null>(null);

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
  const trustScore = (learnerProfile as any)?.trustScoreSnapshot || (learnerProfile as any)?.trustScore || 85;
  const ratingValue = 5.0;
  const durationMinutes = request.expectedDurationMinutes || 60;

  // Helper to compute next upcoming date for a weekday string
  const getNextWeekdayDate = (dayName: string): string => {
    const DAY_MAP: Record<string, number> = {
      SUNDAY: 0,
      SUN: 0,
      'CHỦ NHẬT': 0,
      MONDAY: 1,
      MON: 1,
      'THỨ HAI': 1,
      TUESDAY: 2,
      TUE: 2,
      'THỨ BA': 2,
      WEDNESDAY: 3,
      WED: 3,
      'THỨ TƯ': 3,
      THURSDAY: 4,
      THU: 4,
      'THỨ NĂM': 4,
      FRIDAY: 5,
      FRI: 5,
      'THỨ SÁU': 5,
      SATURDAY: 6,
      SAT: 6,
      'THỨ BẢY': 6,
    };

    const targetDay = DAY_MAP[dayName?.toUpperCase().trim()] ?? 1;
    const now = new Date();
    const currentDay = now.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7;

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + diff);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirmApply = async () => {
    if (!applyModal || !request) return;

    try {
      const { date, slot, note } = applyModal;
      const scheduledStart = new Date(`${date}T${slot.startTime}:00`).toISOString();
      const scheduledEnd = new Date(`${date}T${slot.endTime}:00`).toISOString();

      await applyLearnerRequest({
        learnerRequestId: request._id,
        scheduledStart,
        scheduledEnd,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success(
        'Gửi đề nghị thành công!',
        `Đã gửi đề nghị nhận dạy bài "${request.skillNeeded}" tới ${learnerName}.`,
      );

      setApplyModal(null);
      navigate('/manage/bookings');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể gửi đề nghị dạy. Vui lòng thử lại sau.');
    }
  };

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
                const autoDate = getNextWeekdayDate(slot.dayOfWeek);
                setApplyModal({
                  isOpen: true,
                  slot,
                  date: autoDate,
                  note: '',
                });
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* REUSED SHARED MODAL COMPONENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={Boolean(applyModal?.isOpen)}
        onClose={() => !isApplyingLoading && setApplyModal(null)}
        title="Gửi Đề nghị Hướng dẫn"
        description="Xác nhận nhận dạy bài yêu cầu học 1-1 của học viên"
        size="lg"
      >
        {applyModal && (
          <div className="space-y-5">
            {/* Session Info Capsule */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wider block">
                  YÊU CẦU HỌC
                </span>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{request.skillNeeded}</h4>
                <p className="text-xs text-gray-500 font-medium">Học viên: {learnerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="font-bold">{applyModal.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="font-bold">
                    {applyModal.slot.startTime} - {applyModal.slot.endTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Lời nhắn đề nghị tới Học viên (Kinh nghiệm, phương pháp giảng dạy):
              </label>
              <textarea
                value={applyModal.note}
                onChange={(e) =>
                  setApplyModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
                }
                placeholder="Ví dụ: Mình có 2 năm làm việc với React/NodeJS và có thể hỗ trợ bạn debug và hoàn thiện đồ án..."
                rows={3}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
              />
            </div>

            {/* Escrow Guarantee Note */}
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-medium">
              <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Sau khi Học viên chấp nhận đề nghị này, bạn sẽ nhận được{' '}
                {request.expectedCreditAmount || durationMinutes} CR sau khi buổi học hoàn thành.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setApplyModal(null)}
                disabled={isApplyingLoading}
                className="rounded-xl border-gray-200 text-gray-700 font-bold text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmApply}
                disabled={isApplyingLoading}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs px-6 shadow-xs"
              >
                {isApplyingLoading ? 'Đang gửi...' : 'Gửi Đề nghị Dạy'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
