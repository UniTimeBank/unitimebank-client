import React, { useState } from 'react';
import { User, Eye } from 'lucide-react';

import { SidebarBookingCard, MentorScheduleManager } from '@/features/schedule';

import {
  EditProfileModal,
  AddSkillModal,
  DailyCheckinWidget,
  WelcomeBanner,
  RegisteredSkillsSection,
  MyselfStatsGrid,
  RecommendedSkillsSection,
  CreditLedgerTable,
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
  const roleTitle = 'Sinh viên năm cuối Khoa CNTT • Trưởng nhóm Nghiên cứu AI';
  const bio =
    profile?.bio ||
    'Sinh viên năm cuối ngành kỹ thuật phần mềm. Chuyên Java Spring Boot, AWS, Docker, React, Tailwind.';
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
  const trustScore = profile?.trustScore ? profile.trustScore / 10 : 9.2;
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
      categoryBg: 'bg-blue-100 text-blue-800',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      rate: '1 phút = 1 credit',
    },
    {
      id: '2',
      title: 'Tư duy Component trong Figma',
      category: 'THIẾT KẾ',
      categoryBg: 'bg-primary-50 text-primary-700 border border-primary-100',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=600',
      rating: 5.0,
      rate: '1 phút = 1 credit',
    },
    {
      id: '3',
      title: 'Tiếng Nhật Giao tiếp Thực chiến',
      category: 'NGOẠI NGỮ',
      categoryBg: 'bg-purple-100 text-purple-800',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      rate: '1 phút = 1 credit',
    },
    {
      id: '4',
      title: 'Bí quyết Thuyết trình Đám đông',
      category: 'KỸ NĂNG MỀM',
      categoryBg: 'bg-amber-100 text-amber-800',
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
      subtitle: 'Phần thưởng hệ thống',
      type: 'Thưởng',
      typeBg: 'bg-blue-100 text-blue-800',
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
      avatarBg: 'bg-blue-100 text-blue-800',
      date: '1 tuần trước',
      content:
        'Buổi hướng dẫn Docker rất bổ ích, giúp mình sửa được lỗi container chập chờn. Cảm ơn bạn!',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 2-MODE SEGMENTED TOGGLE SWITCH ON TOP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Giao diện Hồ sơ của tôi</h2>
          <p className="text-xs text-gray-500">
            Chuyển đổi góc nhìn giữa giao diện cá nhân quản lý và giao diện người học khác xem bạn
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setViewMode('MYSELF')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'MYSELF'
                ? 'bg-white text-primary-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Chính tôi</span>
          </button>

          <button
            onClick={() => setViewMode('PUBLIC')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'PUBLIC'
                ? 'bg-white text-primary-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Người khác nhìn tôi</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MYSELF (Student Dashboard & Profile Management - Exact Image 1) */}
      {viewMode === 'MYSELF' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Daily Checkin Bonus Banner */}
          <DailyCheckinWidget
            currentStreak={currentStreak}
            hasCheckedInToday={hasCheckedInToday}
            rewardMessage={rewardMessage}
            onCheckin={checkin}
            isCheckinLoading={isCheckinLoading}
          />

          {/* Welcome Banner & Top Action */}
          <WelcomeBanner
            userName={userName}
            onOpenAddSkillModal={() => setIsAddSkillModalOpen(true)}
          />

          {/* SECTION: My Registered Skills Management */}
          <RegisteredSkillsSection
            skillsList={skillsList}
            onOpenAddSkillModal={() => setIsAddSkillModalOpen(true)}
            onDeleteSkill={handleDeleteSkill}
          />

          {/* SECTION: My Teaching Availability Schedule */}
          <MentorScheduleManager />

          {/* Top 3 Cards Grid */}
          <MyselfStatsGrid credits={credits} trustScore={trustScore} />

          {/* Recommended for You Section */}
          <RecommendedSkillsSection recommendedSkills={recommendedSkills} />

          {/* Credit Ledger Table Section */}
          <CreditLedgerTable ledgerTransactions={ledgerTransactions} />
        </div>
      )}

      {/* VIEW MODE 2: PUBLIC (Mentor Profile / How Others See Me - Exact Image 2) */}
      {viewMode === 'PUBLIC' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          {/* LEFT COLUMN (Wide 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Profile Header Card */}
            <PublicProfileHeader
              userName={userName}
              roleTitle={roleTitle}
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
