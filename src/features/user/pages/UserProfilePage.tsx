import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, Pencil, Share2, Plus, TrendingUp, Sprout, ArrowLeft, Loader2, GraduationCap, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

import { SidebarBookingCard } from '@/features/schedule';

import {
  EditProfileModal,
  AddSkillModal,
  DailyCheckinWidget,
  CreditTasksModal,
  CreditLedgerTable,
  RecommendedSkillsSection,
  PublicProfileHeader,
  PublicStatsGrid,
  PeerReviewsSection,
  ExpertiseTrackCard,
  RegisteredSkillsSection,
  LearnerSidebarCard,
} from '../components';
import { useUserProfile, useUserSkills, useDailyCheckin } from '../hooks';
import { useGetPublicProfileQuery } from '@/core/api/user/userApi';

import LogoImage from '@/assets/images/Logo.png';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();

  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const { skills, addSkill, deleteSkill } = useUserSkills();
  const { currentStreak, hasCheckedInToday, rewardMessage, checkin, isCheckinLoading } = useDailyCheckin();

  // Detect if viewing another user's public profile
  const isOtherUser = Boolean(
    userId && userId !== profile?.userId && userId !== profile?.id,
  );

  const { data: targetPublicProfile, isLoading: isTargetLoading } = useGetPublicProfileQuery(
    userId || '',
    { skip: !isOtherUser },
  );

  // 2 View Modes: 'MYSELF' (Student Dashboard / My Profile) vs 'PUBLIC' (Mentor Profile / How Others See Me)
  const [viewMode, setViewMode] = useState<'MYSELF' | 'PUBLIC'>(
    isOtherUser ? 'PUBLIC' : 'MYSELF',
  );

  // Persona for Guest Mode: 'MENTOR' vs 'LEARNER'
  const [guestPersona, setGuestPersona] = useState<'MENTOR' | 'LEARNER'>('MENTOR');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isCreditTasksOpen, setIsCreditTasksOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isOtherUser) {
      setViewMode('PUBLIC');
    }
  }, [isOtherUser]);

  const handleProfileAction = (actionType: 'EDIT_PROFILE' | 'CREATE_SCHEDULE' | 'ADD_SKILL') => {
    if (actionType === 'EDIT_PROFILE') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsEditModalOpen(true);
    } else if (actionType === 'CREATE_SCHEDULE') {
      const scheduleElem = document.getElementById('schedule-section');
      if (scheduleElem) {
        scheduleElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (actionType === 'ADD_SKILL') {
      const skillsElem = document.getElementById('skills-section');
      if (skillsElem) {
        skillsElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsAddSkillModalOpen(true);
    }
  };

  useEffect(() => {
    if (location.state && (location.state as any).action) {
      const action = (location.state as any).action;
      setTimeout(() => {
        handleProfileAction(action);
      }, 250);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const userName = isOtherUser
    ? targetPublicProfile?.displayName || 'Thành viên UniTime'
    : profile?.displayName || 'Sinh viên UniTime';

  const bio = isOtherUser
    ? targetPublicProfile?.bio || 'Chưa cập nhật phần giới thiệu bản thân.'
    : profile?.bio || 'Chưa cập nhật phần giới thiệu bản thân.';

  const avatarUrl = isOtherUser
    ? targetPublicProfile?.avatarUrl || LogoImage
    : profile?.avatarUrl || LogoImage;

  const displaySkills = isOtherUser
    ? (targetPublicProfile?.skills as any) || []
    : skills;

  const credits = 120;
  const trustScoreMax100 = isOtherUser
    ? targetPublicProfile?.trustScore || 100
    : profile?.trustScore || 100;

  const handleDeleteSkill = async (skillId: string) => {
    await deleteSkill(skillId);
  };

  const handleAddSkillSuccess = async (name: string, category: any, isStrong: boolean) => {
    await addSkill({ skillName: name, category, isStrong });
  };

  const recommendedSkills = [
    {
      id: '1',
      title: 'Nhập môn Python cho Khoa học Dữ liệu',
      category: 'LẬP TRÌNH',
      categoryBg: 'bg-primary-50 text-primary-700 border border-primary-100',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      rate: '1 phút = 1 credit',
    },
    {
      id: '2',
      title: 'Tư duy Component trong Figma',
      category: 'THIẾT KẾ',
      categoryBg: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=600',
      rating: 5.0,
      rate: '1 phút = 1 credit',
    },
    {
      id: '3',
      title: 'Tiếng Nhật Giao tiếp Thực chiến',
      category: 'NGOẠI NGỮ',
      categoryBg: 'bg-teal-50 text-teal-800 border border-teal-100',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      rate: '1 phút = 1 credit',
    },
    {
      id: '4',
      title: 'Bí quyết Thuyết trình Đám đông',
      category: 'KỸ NĂNG MỀM',
      categoryBg: 'bg-amber-50 text-amber-800 border border-amber-100',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      rate: '1 phút = 1 credit',
    },
  ];

  const ledgerTransactions = [
    {
      id: 'tx-1',
      title: 'Buổi học: Cơ bản UI Motion',
      subtitle: 'Người dạy: Elena Kovac',
      type: 'Học tập',
      typeBg: 'bg-gray-100 text-gray-700',
      status: 'Đã hoàn thành',
      date: '24 thg 11, 2024',
      amount: '-45m',
      amountColor: 'text-red-500 font-bold',
    },
    {
      id: 'tx-2',
      title: 'Buổi học: Ôn tập Giải tích 1',
      subtitle: 'Người học: Tom H.',
      type: 'Dạy học',
      typeBg: 'bg-primary-50 text-primary-700',
      status: 'Đã hoàn thành',
      date: '22 thg 11, 2024',
      amount: '+60m',
      amountColor: 'text-primary-600 font-bold',
    },
    {
      id: 'tx-3',
      title: 'Thưởng đăng nhập hàng ngày',
      subtitle: 'Hoàn thành chuỗi 7 ngày',
      type: 'Thưởng',
      typeBg: 'bg-emerald-50 text-emerald-700',
      status: 'Đã xử lý',
      date: '22 thg 11, 2024',
      amount: '+5m',
      amountColor: 'text-primary-600 font-bold',
    },
  ];

  const reviews = [
    {
      id: 'rev-1',
      author: 'James Miller',
      initials: 'JM',
      avatarBg: 'bg-amber-100 text-amber-800',
      date: '2 ngày trước',
      content:
        'Bạn hướng dẫn rất thực tế và dễ hiểu. Chuẩn bị tài liệu kỹ càng!',
    },
    {
      id: 'rev-2',
      author: 'Anita Lee',
      initials: 'AL',
      avatarBg: 'bg-primary-100 text-primary-800',
      date: '1 tuần trước',
      content:
        'Buổi hướng dẫn rất bổ ích, giải đáp đúng trọng tâm vướng mắc. Cảm ơn bạn!',
    },
  ];

  const isCompleted7Days = currentStreak >= 7 && hasCheckedInToday;

  if (isOtherUser && isTargetLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-xs font-bold text-gray-500">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP BANNER: DAILY CHECKIN (Khi xem profile cá nhân) HOẶC STUDENT MILESTONE BANNER */}
      {!isOtherUser && (
        <>
          {!isCompleted7Days ? (
            <DailyCheckinWidget
              currentStreak={currentStreak}
              hasCheckedInToday={hasCheckedInToday}
              rewardMessage={rewardMessage}
              onCheckin={checkin}
              isCheckinLoading={isCheckinLoading}
            />
          ) : (
            <div className="bg-[#0B654D] text-white rounded-2xl py-7 sm:py-8 px-7 sm:px-9 shadow-xs border border-emerald-700/30 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center px-3 py-1 bg-white/10 text-emerald-100/90 font-medium text-xs rounded-full border border-white/15">
                    Thành viên UniTime
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Xin chào, {userName}!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl">
                    Bạn đã hoàn thành xuất sắc chuỗi 7 ngày điểm danh liên tiếp. Hãy tiếp tục chia sẻ tri thức và tham gia các buổi học mới!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 1: MYSELF (Student Dashboard - Clean Unified Profile Section) */}
      {!isOtherUser && viewMode === 'MYSELF' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 2. UNIFIED PROFILE & SKILLS HERO CARD */}
          <div className="bg-white rounded-3xl border border-primary-100/80 shadow-xs p-6 sm:p-8 relative">
            {/* Top row: Avatar + Identity + Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left: Avatar + Names + Bio */}
              <div className="flex items-start gap-5 min-w-0">
                <div
                  className="relative shrink-0 group cursor-pointer"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-primary-50 shadow-sm transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate">
                    {userName}
                  </h1>

                  {/* Refined Statement Bio with Left Primary Accent */}
                  <div className="mt-2 pl-3.5 border-l-2 border-primary-500/70 py-0.5 max-w-3xl">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Sleek Compact Icon Actions at the top right */}
              <div className="flex items-center gap-2 shrink-0 self-start">
                <Link
                  to="/requests"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Đăng bài dạy mới"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Đăng bài</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary-700 bg-gray-50 hover:bg-primary-50/70 border border-gray-200/80 hover:border-primary-200 rounded-xl transition-all cursor-pointer"
                  title="Chỉnh sửa hồ sơ"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Đã sao chép liên kết hồ sơ của bạn!');
                    }
                  }}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl transition-all cursor-pointer"
                  title="Chia sẻ hồ sơ"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('PUBLIC')}
                  className="w-9 h-9 flex items-center justify-center text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 rounded-xl transition-all cursor-pointer"
                  title="Xem giao diện Chế độ khách"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom section: Real Skills Tags categorized seamlessly */}
            <div id="skills-section" className="mt-6 pt-5 border-t border-gray-100">
              <RegisteredSkillsSection
                skills={skills}
                onOpenAddSkillModal={() => setIsAddSkillModalOpen(true)}
                onDeleteSkill={handleDeleteSkill}
              />
            </div>
          </div>

          {/* 3. BỘ 3 THẺ STATS CÂN XỨNG TIẾP THEO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Số dư hiện tại */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Số dư hiện tại
                  </span>
                  <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    {credits}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">Credit</span>
                </div>
                <p className="text-xs text-primary-700 font-semibold mt-3 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-primary-600 shrink-0" />
                  <span>Chuẩn hóa: 1 phút = 1 Credit</span>
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Link
                  to="/manage/wallet"
                  className="flex-1 text-center py-2.5 bg-primary-50/60 hover:bg-primary-100/80 text-primary-700 text-xs font-bold rounded-xl transition-colors block border border-primary-200/50"
                >
                  Xem ví credit & sổ cái
                </Link>
              </div>
            </div>

            {/* Card 2: Điểm Uy Tín 2 Chiều (Dual Trust Score) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs flex flex-col justify-between">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                  <span>Điểm Uy Tín 2 Chiều</span>
                </span>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  Chuẩn 360°
                </span>
              </div>

              {/* 2 Cột Điểm: Người Dạy & Người Học */}
              <div className="grid grid-cols-2 gap-2 my-auto py-2 divide-x divide-slate-100">
                {/* Cột 1: Người Dạy */}
                <div className="text-center pr-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    🧑‍🏫 Người Dạy
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {trustScoreMax100}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">/100</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mt-1">
                    Chất lượng dạy
                  </span>
                </div>

                {/* Cột 2: Người Học */}
                <div className="text-center pl-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    🎓 Người Học
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      100
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">/100</span>
                  </div>
                  <span className="text-[10px] text-primary-700 font-bold bg-primary-50 px-1.5 py-0.5 rounded-md inline-block mt-1">
                    Đúng giờ & Cam kết
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 font-medium text-center pt-2 border-t border-slate-100">
                Đánh giá tách biệt giúp bạn giữ trọn uy tín ở cả 2 vai trò
              </p>
            </div>

            {/* Card 3: Nhiệm vụ Onboarding */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Nhiệm vụ nhận thưởng
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +40 CR
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-3 leading-relaxed">
                  Hoàn thành các nhiệm vụ khởi đầu để nhận ngay Credit học tập miễn phí.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreditTasksOpen(true)}
                className="mt-6 w-full py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs text-center"
              >
                Xem danh sách nhiệm vụ
              </button>
            </div>
          </div>

          {/* 4. GỢI Ý KỸ NĂNG NỔI BẬT TRONG CỘNG ĐỒNG */}
          <RecommendedSkillsSection recommendedSkills={recommendedSkills} />

          {/* 5. SỔ CÁI GIAO DỊCH VÍ CREDIT */}
          <CreditLedgerTable ledgerTransactions={ledgerTransactions} />
        </div>
      )}

      {/* VIEW MODE 2: PUBLIC (Guest / Mentor Public View) */}
      {(isOtherUser || viewMode === 'PUBLIC') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar for Guest Status - Modern Clean Block */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 px-5 py-3.5 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-none">
                  {isOtherUser ? `Hồ sơ công khai của ${userName}` : 'Chế độ xem trước hồ sơ'}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                  {isOtherUser ? 'Đang xem thông tin công khai' : 'Giao diện hiển thị với các thành viên khác trên hệ thống'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isOtherUser) {
                  navigate(-1);
                } else {
                  setViewMode('MYSELF');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isOtherUser ? 'Quay lại' : 'Quay lại chỉnh sửa'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (Wide 8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Profile Header Card */}
              <PublicProfileHeader
                userName={userName}
                avatarUrl={avatarUrl}
                bio={bio}
                skills={displaySkills}
                isLiked={isLiked}
                onToggleLike={() => setIsLiked(!isLiked)}
                persona={guestPersona}
              />

              {/* 2. Stats Grid (2 Cards) */}
              <PublicStatsGrid
                trustScoreMax100={trustScoreMax100}
                persona={guestPersona}
              />

              {/* 3. Peer Reviews Section */}
              <PeerReviewsSection
                userId={userId || profile?.userId || profile?.id}
                persona={guestPersona}
              />
            </div>

            {/* RIGHT COLUMN (Sidebar 4 cols) - Sticky with Tab Switcher on Top */}
            <div className="lg:col-span-4 space-y-4 sticky top-20">
              {/* Tab Switcher - Clean Segmented Control */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl gap-1 border border-slate-200/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setGuestPersona('MENTOR')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    guestPersona === 'MENTOR'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5 font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 stroke-[2.25] ${guestPersona === 'MENTOR' ? 'text-primary-700' : 'text-slate-400'}`} />
                  <span>Người Dạy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuestPersona('LEARNER')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    guestPersona === 'LEARNER'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5 font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 stroke-[2.25] ${guestPersona === 'LEARNER' ? 'text-primary-700' : 'text-slate-400'}`} />
                  <span>Người Học</span>
                </button>
              </div>

              {guestPersona === 'MENTOR' ? (
                <>
                  {/* Mentorship Cost & Booking Card */}
                  <SidebarBookingCard
                    mentorId={isOtherUser ? userId : profile?.userId || profile?.id || 'sample-id'}
                    mentorName={userName}
                  />

                  {/* Expertise Track Card */}
                  <ExpertiseTrackCard />
                </>
              ) : (
                /* Learner Persona Sidebar Card */
                <LearnerSidebarCard learnerName={userName} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialDisplayName={profile?.displayName || ''}
        initialBio={profile?.bio || ''}
        initialAvatarUrl={profile?.avatarUrl || ''}
        onSave={async (displayName: string, newBio: string, avatarFile?: File) => {
          let hasAvatar = Boolean(avatarFile || profile?.avatarUrl);
          if (avatarFile) {
            await uploadAvatar(avatarFile);
            hasAvatar = true;
          }
          await updateProfile({ displayName, bio: newBio });
          if (hasAvatar && newBio.trim().length > 0) {
            toast.success(' Đã cập nhật hồ sơ cá nhân thành công! (+10 Credit thưởng nếu là lần đầu)');
          } else {
            toast.success('Đã cập nhật thông tin cá nhân!');
          }
        }}
      />

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={handleAddSkillSuccess}
      />

      {/* Credit Tasks Modal */}
      <CreditTasksModal
        isOpen={isCreditTasksOpen}
        onClose={() => setIsCreditTasksOpen(false)}
        onActionClick={handleProfileAction}
      />
    </div>
  );
};
