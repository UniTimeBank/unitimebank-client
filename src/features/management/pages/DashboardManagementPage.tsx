import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/features/user/hooks';
import { useGetMyWalletQuery } from '@/core/api';
import { useGetMyBookingsQuery } from '@/core/api/booking/bookingApi';
import { useGetMyMentorPostsQuery } from '@/core/api/post';

export const DashboardManagementPage: React.FC = () => {
  const { profile } = useUserProfile();
  const { data: wallet } = useGetMyWalletQuery();
  const { data: bookingsData } = useGetMyBookingsQuery();
  const { data: postsData } = useGetMyMentorPostsQuery();

  const balance = wallet?.availableBalance ?? 0;
  const trustScore = profile?.trustScore ?? 100;
  const myPostsCount = postsData?.total ?? 0;

  const bookings = useMemo(() => bookingsData?.items || [], [bookingsData]);
  const completedCount = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED').length,
    [bookings],
  );
  const pendingCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === 'PENDING_MENTOR_APPROVAL' || b.status === 'PENDING_LEARNER_APPROVAL',
      ).length,
    [bookings],
  );

  const totalMinutesTaught = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((acc, b) => acc + (b.durationMinutes || 60), 0);
  }, [bookings]);

  const totalHoursTaught = (totalMinutesTaught / 60).toFixed(1).replace('.0', '');

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Dashboard Tổng quan
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi tổng quan số giờ dạy, điểm uy tín và hoạt động kết nối gần đây của bạn.
          </p>
        </div>
      </div>

      {/* Stats row - 100% Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>SỐ DƯ CREDIT</span>
            <Award className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{balance} CR</div>
          <span className="text-[11px] text-primary-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Ví hoạt động tốt
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>TỔNG GIỜ CỐ VẤN</span>
            <Clock className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalHoursTaught} Giờ</div>
          <span className="text-[11px] text-gray-400 font-medium">{completedCount} buổi hoàn thành</span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>ĐIỂM UY TÍN</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{trustScore} / 100</div>
          <span className="text-[11px] text-primary-700 font-semibold">
            {trustScore >= 80 ? 'Rất đáng tin cậy' : 'Cần cải thiện'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>BÀI ĐĂNG CỦA TÔI</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{myPostsCount} Bài</div>
          <span className="text-[11px] text-gray-400 font-medium">Đang hoạt động</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Lối tắt thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/manage/bookings"
            className="p-4 rounded-xl bg-white hover:bg-primary-50/60 text-gray-800 hover:text-primary-800 border border-gray-100 transition-all font-bold text-xs flex items-center justify-between group cursor-pointer shadow-2xs"
          >
            <span>Xem yêu cầu Booking ({pendingCount} chờ)</span>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            to="/manage/schedule"
            className="p-4 rounded-xl bg-white hover:bg-primary-50/60 text-gray-800 hover:text-primary-800 border border-gray-100 transition-all font-bold text-xs flex items-center justify-between group cursor-pointer shadow-2xs"
          >
            <span>Mở thêm lịch rảnh tuần này</span>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            to="/explore"
            className="p-4 rounded-xl bg-white hover:bg-primary-50/60 text-gray-800 hover:text-primary-800 border border-gray-100 transition-all font-bold text-xs flex items-center justify-between group cursor-pointer shadow-2xs"
          >
            <span>Khám phá bài học & gia sư</span>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
