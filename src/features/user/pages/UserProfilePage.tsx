import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const { skills, addSkill, deleteSkill } = useUserSkills();
  const { currentStreak, hasCheckedInToday, rewardMessage, checkin, isCheckinLoading } = useDailyCheckin();

  // 2 View Modes: 'MYSELF' (Student Dashboard / My Profile) vs 'PUBLIC' (Mentor Profile / How Others See Me)
  const [viewMode, setViewMode] = useState<'MYSELF' | 'PUBLIC'>('MYSELF');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const userName = profile?.displayName || 'Sinh viên UniTime';
  const bio = profile?.bio || 'Chưa cập nhật phần giới thiệu bản thân.';
  const avatarUrl =
    profile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

  const credits = 120;
  const trustScoreMax100 = profile?.trustScore || 100;

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

            {/* Bottom section: Real Skills Tags integrated seamlessly */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Kỹ năng & Bài dạy của tôi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-50 text-primary-700 rounded-full">
                  {skills.length} kỹ năng
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill.id || skill.skillName}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-800 hover:text-primary-800 text-xs font-semibold rounded-xl border border-gray-200/70 hover:border-primary-200 group transition-all"
                    >
                      <span className="max-w-[220px] truncate">{skill.skillName}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                        title={`Xóa kỹ năng ${skill.skillName}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    Bạn chưa có kỹ năng nào. Hãy bấm nút "+ Thêm" để đăng ký kỹ năng thế mạnh của mình.
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddSkillModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50/80 text-xs font-semibold rounded-xl transition-all cursor-pointer ml-1"
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
                  <span>Chuẩn hóa: 1 phút = 1 Credit</span>
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
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Điểm uy tín
                </span>
                <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                  XUẤT SẮC
                </span>
              </div>

              <div className="py-2 scale-90 sm:scale-95">
                <TrustScoreGauge score={trustScoreMax100} size={130} />
              </div>

              <span className="text-xs text-gray-500 font-medium">
                Dựa trên đánh giá buổi học và tỷ lệ hoàn thành
              </span>
            </div>

            {/* Card 3: Lộ trình chuyên môn */}
            <ExpertiseTrackCard />
          </div>

          {/* 4. QUẢN LÝ LỊCH RẢNH DẠY HÀNG TUẦN & NGÀY NGHỈ ĐẶC BIỆT */}
          <MentorScheduleManager />

          {/* 5. GỢI Ý KỸ NĂNG NỔI BẬT TRONG CỘNG ĐỒNG */}
          <RecommendedSkillsSection recommendedSkills={recommendedSkills} />

          {/* 6. SỔ CÁI GIAO DỊCH VÍ CREDIT */}
          <CreditLedgerTable ledgerTransactions={ledgerTransactions} />
        </div>
      )}

      {/* VIEW MODE 2: PUBLIC (Guest / Mentor Public View) */}
      {viewMode === 'PUBLIC' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Nút quay lại Chế độ Dashboard của tôi */}
          <div className="flex items-center justify-between bg-primary-50/70 border border-primary-200/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-900">
              <span>Đang xem ở Chế độ Khách (Người khác thấy hồ sơ của bạn như thế này)</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('MYSELF')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white text-primary-700 rounded-xl border border-primary-200 hover:bg-primary-100/50 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Chỉnh sửa</span>
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
                skillsList={skills.map((s) => s.skillName)}
                isLiked={isLiked}
                onToggleLike={() => setIsLiked(!isLiked)}
              />

              {/* 2. Stats Grid (2 Cards) */}
              <PublicStatsGrid trustScoreMax100={trustScoreMax100} />

              {/* 3. Peer Reviews Section */}
              <PeerReviewsSection reviews={reviews} />
            </div>

            {/* RIGHT COLUMN (Sidebar 4 cols) */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
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
        initialDisplayName={profile?.displayName || ''}
        initialBio={profile?.bio || ''}
        initialAvatarUrl={profile?.avatarUrl || ''}
        onSave={async (displayName: string, newBio: string, avatarFile?: File) => {
          if (avatarFile) {
            await uploadAvatar(avatarFile);
          }
          await updateProfile({ displayName, bio: newBio });
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
