import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Award, AlertTriangle } from 'lucide-react';
import { useGetMentorPostByIdQuery } from '@/core/api/post/postApi';
import { useGetPublicProfileQuery } from '@/core/api/user/userApi';
import { useCreateMentorPostBookingMutation } from '@/core/api/booking/bookingApi';
import { useGetMyWalletQuery } from '@/core/api/wallet/walletApi';
import {
  PostHero,
  PostAuthorCard,
  PostDescriptionCard,
  PostScheduleSidebar,
  RelatedPostsSection,
} from '../components/details';
import { SKILL_CATEGORY_LABELS } from '../constants';
import { Button, Modal } from '@/shared/components/ui';
import { toast } from '@/shared/utils';

export const MentorPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const { data: post, isLoading, error } = useGetMentorPostByIdQuery(id || '', {
    skip: !id,
  });

  const { data: mentorProfile } = useGetPublicProfileQuery(post?.mentorId || '', {
    skip: !post?.mentorId,
  });

  const [createBooking, { isLoading: isBookingLoading }] = useCreateMentorPostBookingMutation();

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    date: string;
    slot: { startTime: string; endTime: string };
    note: string;
  } | null>(null);

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

  const { data: myWallet } = useGetMyWalletQuery();
  const availableBalance = myWallet?.availableBalance ?? 0;

  const durationMinutes = useMemo(() => {
    if (!bookingModal) return 0;
    const [startH, startM] = bookingModal.slot.startTime.split(':').map(Number);
    const [endH, endM] = bookingModal.slot.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff : 60;
  }, [bookingModal]);

  const isInsufficientCredit = Boolean(bookingModal && availableBalance < durationMinutes);

  const mentorName = mentorProfile?.displayName || post.mentorName || 'Mentor';
  const categoryCode = post.tags?.[0]?.category || 'PROGRAMMING';
  const categoryLabel = SKILL_CATEGORY_LABELS[categoryCode] || post.tags?.[0]?.skillName || 'CÔNG NGHỆ THÔNG TIN';
  const trustScore = mentorProfile?.trustScore || post.trustScoreSnapshot || 98;
  const ratingValue = (trustScore / 20).toFixed(1);
  const skillTags = post.tags?.map((t) => t.skillName) || ['ReactJS', 'TypeScript'];

  // Handle Submit Booking
  const handleConfirmBooking = async () => {
    if (!bookingModal || !post) return;

    if (isInsufficientCredit) {
      toast.error(
        'Số dư Credit không đủ!',
        `Buổi học ${durationMinutes} phút cần ký quỹ ${durationMinutes} Credit. Số dư ví khả dụng của bạn hiện có: ${availableBalance} Credit.`,
      );
      return;
    }

    try {
      const { date, slot, note } = bookingModal;
      const scheduledStart = new Date(`${date}T${slot.startTime}:00`).toISOString();
      const scheduledEnd = new Date(`${date}T${slot.endTime}:00`).toISOString();

      await createBooking({
        mentorPostId: post._id,
        scheduledStart,
        scheduledEnd,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success(
        'Đặt lịch và ký quỹ thành công!',
        `Yêu cầu học đã được gửi tới ${mentorName}. ${durationMinutes} Credit đã được tạm giữ an toàn trong Escrow.`,
      );

      setBookingModal(null);
      navigate('/manage/bookings');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể đặt lịch học. Vui lòng thử lại sau.');
    }
  };

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
              authorId={post.mentorId}
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
          <div className="lg:col-span-4 lg:sticky lg:top-20 z-10">
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
                setBookingModal({
                  isOpen: true,
                  date,
                  slot: { startTime: slot.startTime, endTime: slot.endTime },
                  note: '',
                });
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* REUSED SHARED MODAL COMPONENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={Boolean(bookingModal?.isOpen)}
        onClose={() => !isBookingLoading && setBookingModal(null)}
        title="Xác nhận Đặt lịch học 1-1"
        description="Gửi yêu cầu học tập tới Người hướng dẫn chuyên môn"
        size="lg"
      >
        {bookingModal && (
          <div className="space-y-5">
            {/* Session Info Capsule */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <div>
                <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-wider block">
                  BÀI DẠY
                </span>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{post.title}</h4>
                <p className="text-xs text-gray-500 font-medium">Mentor: {mentorName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="font-bold">{bookingModal.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="font-bold">
                    {bookingModal.slot.startTime} - {bookingModal.slot.endTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Lời nhắn gửi Mentor (Nhu cầu, câu hỏi cần giải đáp):
              </label>
              <textarea
                value={bookingModal.note}
                onChange={(e) =>
                  setBookingModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
                }
                placeholder="Ví dụ: Em muốn hỏi kỹ phần setup kiến trúc microservices và xác thực JWT..."
                rows={3}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
              />
            </div>

            {/* Credit Breakdown Box */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-600 font-medium">Chi phí ký quỹ ({durationMinutes} phút):</span>
              <span className="font-extrabold text-slate-900">{durationMinutes} Credit</span>
            </div>

            {/* Insufficient Credit Warning vs Escrow Guarantee Note */}
            {isInsufficientCredit ? (
              <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-800 font-medium animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Số dư ví không đủ ({availableBalance}/{durationMinutes} Credit).</span>
                  <p className="text-[10px] text-rose-600 font-normal mt-0.5">
                    Hệ thống sẽ thực hiện ký quỹ ngay khi gửi yêu cầu. Vui lòng nạp thêm Credit để tiếp tục.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-medium">
                <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Số Credit ({durationMinutes} Credit) sẽ được <strong>tạm giữ ký quỹ an toàn</strong> ngay khi bạn gửi yêu cầu. Nếu Gia sư từ chối hoặc bạn hủy trước buổi học, Credit sẽ được hoàn trả 100%.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setBookingModal(null)}
                disabled={isBookingLoading}
                className="rounded-xl border-gray-200 text-gray-700 font-bold text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmBooking}
                disabled={isBookingLoading || isInsufficientCredit}
                className="rounded-xl bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-6 shadow-xs"
              >
                {isBookingLoading
                  ? 'Đang gửi...'
                  : isInsufficientCredit
                  ? 'Số dư không đủ'
                  : 'Xác nhận Đặt lịch & Ký quỹ'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
