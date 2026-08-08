import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Share2, Plus, TrendingUp, Sprout, X, ArrowLeft } from 'lucide-react';

import { TrustScoreGauge } from '@/shared/components';
import { SidebarBookingCard, MentorScheduleManager } from '@/features/schedule';

import {
  EditProfileModal,
  AddSkillModal,
  DailyCheckinWidget,
  CreditLedgerTable,
  RecommendedSkillsSection,
  PublicProfileHeader,
  PublicStatsGrid,
  PeerReviewsSection,
  ExpertiseTrackCard,
} from '../components';
import { useUserProfile, useUserSkills, useDailyCheckin } from '../hooks';

export const UserProfilePage: React.FC = () => {
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const { addSkill, deleteSkill } = useUserSkills();
  const { currentStreak, hasCheckedInToday, rewardMessage, checkin, isCheckinLoading } = useDailyCheckin();

  // 2 View Modes: 'MYSELF' (Student Dashboard / My Profile) vs 'PUBLIC' (Mentor Profile / How Others See Me)
  const [viewMode, setViewMode] = useState<'MYSELF' | 'PUBLIC'>('MYSELF');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const userName = profile?.displayName || 'Nguyễn Hoàng Sang';
  const bio =
    profile?.bio ||
    'Sinh viên năm cuối ngành kĩ thuật phần mềm. Chuyên Java Spring Boot, AWS, Docker, React, Tailwind.';
  const avatarUrl =
    profile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  const [skillsList, setSkillsList] = useState<string[]>(
    profile?.skills?.map((s) => s.skillName) || ['Java Spring Boot', 'AWS', 'Docker', 'React', 'Tailwind']
  );

  React.useEffect(() => {
    if (profile?.skills && profile.skills.length > 0) {
      setSkillsList(profile.skills.map((s) => s.skillName));
    }
  }, [profile]);

  const credits = 120;
  const trustScore = profile?.trustScore ? profile.trustScore / 10 : 10;
  const trustScoreMax100 = profile?.trustScore || 98;

  const handleDeleteSkill = async (skillToRemove: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
    await deleteSkill(skillToRemove);
  };

  const handleAddSkillSuccess = async (name: string, category: any, isStrong: boolean) => {
    if (!skillsList.includes(name)) {
      setSkillsList((prev) => [...prev, name]);
    }
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

  const upcomingSessions = [
    {
      id: 's-1',
      title: 'Advanced React Hooks',
      role: 'Người dạy: Sarah Chen • 45 phút',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      tag: 'HÔM NAY',
      time: '14:00 - 14:45',
    },
    {
      id: 's-2',
      title: 'Ôn tập Kinh tế Vi mô',
      role: 'Người học: David Miller • 60 phút',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      tag: 'NGÀY MAI',
      time: '10:30 - 11:30',
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
        'Bạn Sang giảng giải về Spring Boot & Microservices rất thực tế và dễ hiểu. Chuẩn bị tài liệu kỹ càng!',
    },
    {
      id: 'rev-2',
      author: 'Anita Lee',
      initials: 'AL',
      avatarBg: 'bg-primary-100 text-primary-800',
      date: '1 tuần trước',
      content:
        'Buổi hướng dẫn Docker rất bổ ích, giúp mình sửa được lỗi container chập chờn. Cảm ơn bạn!',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. DAILY CHECKIN BONUS BANNER TRÊN CÙNG */}
      <DailyCheckinWidget
        currentStreak={currentStreak}
        hasCheckedInToday={hasCheckedInToday}
        rewardMessage={rewardMessage}
        onCheckin={checkin}
        isCheckinLoading={isCheckinLoading}
      />

      {/* VIEW MODE 1: MYSELF (Student Dashboard - Clean Unified Profile Section) */}
      {viewMode === 'MYSELF' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 2. UNIFIED PROFILE & SKILLS HERO CARD — ĐẦY ĐẶN, SANG TRỌNG, KHÔNG KHOẢNG TRỐNG THỪA */}
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
                <button
                  type="button"
                  onClick={() => setIsAddSkillModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Đăng bài dạy mới"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Đăng bài</span>
                </button>

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
                      alert('Đã sao chép liên kết hồ sơ của bạn!');
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

            {/* Bottom section: Skills Tags integrated seamlessly */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Kỹ năng & Bài dạy của tôi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-50 text-primary-700 rounded-full">
                  {skillsList.length} kỹ năng
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-800 hover:text-primary-800 text-xs font-semibold rounded-xl border border-gray-200/70 hover:border-primary-200 group transition-all"
                  >
                    <span className="max-w-[220px] truncate">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill)}
                      className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                      title={`Xóa kỹ năng ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddSkillModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50/80 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
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
                  <span>Tích lũy thêm 15 credit tuần này</span>
                </p>
              </div>

              <Link
                to="/ledger"
                className="mt-6 w-full text-center py-2.5 bg-primary-50/60 hover:bg-primary-100/80 text-primary-700 text-xs font-bold rounded-xl transition-colors block border border-primary-200/50"
              >
                Xem lịch sử chi tiết
              </Link>
            </div>

            {/* Card 2: Điểm uy tín */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs flex flex-col items-center justify-between text-center">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider self-start">
                Điểm uy tín
              </span>
              <div className="my-auto py-2">
                <TrustScoreGauge
                  score={trustScore}
                  maxScore={10}
                  label="XUẤT SẮC"
                  subtitle="Dựa trên 24 lượt đánh giá từ bạn học"
                />
              </div>
            </div>

            {/* Card 3: Buổi học sắp tới */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-900">Buổi học sắp tới</h3>
                  <Link
                    to="/classes"
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    Xem tất cả
                  </Link>
                </div>

                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/90 hover:bg-primary-50/40 border border-transparent hover:border-primary-100 transition-all"
                    >
                      <img
                        src={session.avatar}
                        alt={session.title}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{session.title}</h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{session.role}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md uppercase block mb-0.5">
                          {session.tag}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{session.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. MENTOR SCHEDULE MANAGER (FULL-WIDTH 100%) */}
          <div className="w-full">
            <MentorScheduleManager />
          </div>

          {/* 5. GỢI Ý DÀNH CHO BẠN */}
          <RecommendedSkillsSection recommendedSkills={recommendedSkills} />

          {/* 6. CREDIT LEDGER TABLE (FULL-WIDTH 100%) */}
          <CreditLedgerTable ledgerTransactions={ledgerTransactions} />
        </div>
      )}

      {/* VIEW MODE 2: PUBLIC (Mentor Profile / How Others See Me) */}
      {viewMode === 'PUBLIC' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Banner thông báo góc nhìn khách + nút quay lại */}
          <div className="bg-primary-50 border border-primary-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary-600 text-white shrink-0">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-primary-900">
                  Bạn đang xem hồ sơ ở Chế độ khách
                </h3>
                <p className="text-[11px] text-primary-700 mt-0.5">
                  Đây là giao diện công khai khi các bạn học hoặc mentor khác truy cập vào trang cá nhân của bạn.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('MYSELF')}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Chính tôi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN (Wide 8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Profile Header Card */}
              <PublicProfileHeader
                userName={userName}
                avatarUrl={avatarUrl}
                bio={bio}
                skillsList={skillsList}
                isLiked={isLiked}
                onToggleLike={() => setIsLiked(!isLiked)}
              />

              {/* 2. Stats Grid (2 Cards) */}
              <PublicStatsGrid trustScoreMax100={trustScoreMax100} />

              {/* 3. Peer Reviews Section */}
              <PeerReviewsSection reviews={reviews} />
            </div>

            {/* RIGHT COLUMN (Sidebar 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Mentorship Cost & Booking Card */}
              <SidebarBookingCard
                mentorId={profile?.userId || profile?.id || 'sample-id'}
                mentorName={userName}
              />

              {/* Expertise Track Card */}
              <ExpertiseTrackCard />
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialDisplayName={userName}
        initialBio={bio}
        initialAvatarUrl={avatarUrl}
        onSave={async (newDisplayName, newBio, avatarFile) => {
          await updateProfile({ displayName: newDisplayName, bio: newBio });
          if (avatarFile) {
            await uploadAvatar(avatarFile);
          }
        }}
      />

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={handleAddSkillSuccess}
      />
    </div>
  );
};
