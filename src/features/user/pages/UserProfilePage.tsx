import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Timer,
  Coins,
  CheckCircle2,
  Share2,
  Heart,
  Star,
  Zap,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
  TrendingUp,
  Download,
  Sprout,
  User,
  Eye,
  Settings,
} from 'lucide-react';
import { TrustScoreGauge } from '@/shared/components';
import { EditProfileModal, AddSkillModal, DailyCheckinWidget } from '../components';
import { useUserProfile, useUserSkills, useDailyCheckin } from '../hooks';

export const UserProfilePage: React.FC = () => {
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const { addSkill, deleteSkill } = useUserSkills();
  const { currentStreak, hasCheckedInToday, rewardMessage, checkin, isCheckinLoading } = useDailyCheckin();

  // 2 View Modes: 'MYSELF' (Student Dashboard / My Profile) vs 'PUBLIC' (Mentor Profile / How Others See Me)
  const [viewMode, setViewMode] = useState<'MYSELF' | 'PUBLIC'>('MYSELF');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('16:30 - 17:30');
  const [isLiked, setIsLiked] = useState(false);

  const userName = profile?.displayName || 'Nguyễn Hoàng Sang';
  const roleTitle = 'Sinh viên năm cuối Khoa CNTT • Trưởng nhóm Nghiên cứu AI';
  const bio = profile?.bio ||
    'Sinh viên năm cuối ngành kỹ thuật phần mềm. Chuyên Java Spring Boot, AWS, Docker, React, Tailwind.';
  const avatarUrl = profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  const [skillsList, setSkillsList] = useState<string[]>(
    profile?.skills?.map((s) => s.skillName) || ['Java Spring Boot', 'AWS', 'Docker', 'React', 'Tailwind']
  );
  const credits = 120;
  const trustScore = profile?.trustScore ? profile.trustScore / 10 : 9.2;
  const trustScoreMax100 = profile?.trustScore || 98;

  const timeSlots = ['14:00 - 15:00', '16:30 - 17:30', '18:00 - 19:00', '20:00 - 21:00'];

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

          {/* Welcome Banner & Top Action (Simple 'Đăng bài dạy' button) */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Chào buổi sáng, {userName} 👋
              </h1>
              <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
                Bạn có 2 buổi học được xếp lịch diễn ra trong ngày hôm nay.
              </p>
            </div>

            <button
              onClick={() => setIsAddSkillModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Đăng bài dạy</span>
            </button>
          </div>

          {/* SECTION: My Registered Skills Management */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Kỹ năng & Bài dạy của tôi</h2>
                <p className="text-xs text-gray-500">Các kỹ năng bạn đã đăng ký để giảng dạy cho bạn học khác</p>
              </div>

              <button
                onClick={() => setIsAddSkillModalOpen(true)}
                className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm kỹ năng mới</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-semibold rounded-xl transition-colors group"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleDeleteSkill(skill)}
                    className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-full hover:bg-gray-300/50 transition-colors cursor-pointer"
                    title={`Xóa kỹ năng ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SECTION: My Teaching Availability Schedule */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Quản lý Lịch rảnh giảng dạy</h2>
                <p className="text-xs text-gray-500">Các khung giờ trống bạn đã cài đặt để học viên có thể đặt lịch 1-1</p>
              </div>

              <button className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto">
                <Settings className="w-4 h-4 text-gray-600" />
                <span>Cập nhật lịch rảnh</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="p-3 bg-primary-50/60 border border-primary-100 rounded-xl flex items-center justify-between text-xs font-bold text-primary-700"
                >
                  <span>{slot}</span>
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Current Balance */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Số dư hiện tại
                  </span>
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">{credits}</span>
                  <span className="text-sm font-medium text-gray-500">Credit</span>
                </div>
                <p className="text-xs text-primary-600 font-semibold mt-2 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-primary-500" />
                  <span>Tích lũy thêm 15 credit tuần này</span>
                </p>
              </div>

              <Link
                to="/ledger"
                className="mt-6 w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Xem lịch sử chi tiết
              </Link>
            </div>

            {/* Card 2: Reputation Score */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start">
                Điểm uy tín
              </span>
              <div className="my-auto py-2">
                <TrustScoreGauge score={trustScore} maxScore={10} label="XUẤT SẮC" subtitle="Dựa trên 24 lượt đánh giá từ bạn học" />
              </div>
            </div>

            {/* Card 3: Upcoming Sessions */}
            <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Buổi học sắp tới</h3>
                  <Link to="/classes" className="text-xs font-semibold text-primary-500 hover:text-primary-600">
                    Xem tất cả
                  </Link>
                </div>

                <div className="space-y-3">
                  {/* Session Item 1 */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                      alt="Sarah Chen"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">Advanced React Hooks</h4>
                      <p className="text-[11px] text-gray-500">Người dạy: Sarah Chen • 45 phút</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-800 uppercase block">HÔM NAY</span>
                      <span className="text-[10px] text-gray-500">14:00 - 14:45</span>
                    </div>
                  </div>

                  {/* Session Item 2 */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                      alt="James Miller"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">Ôn tập Kinh tế Vĩ mô</h4>
                      <p className="text-[11px] text-gray-500">Người học: James Miller • 60 phút</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-800 uppercase block">NGÀY MAI</span>
                      <span className="text-[10px] text-gray-500">10:30 - 11:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended for You Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gợi ý dành cho bạn</h2>
                <p className="text-xs text-gray-500">Dựa trên sở thích Khoa học dữ liệu & Thiết kế UI của bạn</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {recommendedSkills.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="h-36 overflow-hidden relative bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${item.categoryBg}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="font-semibold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </span>
                      <span className="font-bold text-gray-600">{item.rate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Credit Ledger Table Section */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Sổ cái Credit</h2>
              <div className="flex items-center gap-2">
                <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-700">
                  <option>30 ngày qua</option>
                  <option>7 ngày qua</option>
                  <option>Tất cả thời gian</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Chi tiết giao dịch</th>
                    <th className="pb-3">Loại</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3">Ngày</th>
                    <th className="pb-3 pr-2 text-right">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ledgerTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-gray-900">{tx.title}</div>
                        <div className="text-[11px] text-gray-400">{tx.subtitle}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${tx.typeBg}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-500 font-medium">{tx.date}</td>
                      <td className={`py-3.5 pr-2 text-right text-xs ${tx.amountColor}`}>
                        {tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center border-t border-gray-50 pt-4">
              <button className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Tải sao kê (PDF)</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* VIEW MODE 2: PUBLIC (Mentor Profile / How Others See Me - Exact Image 2) */}
      {viewMode === 'PUBLIC' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          {/* LEFT COLUMN (Wide 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs relative">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar Standalone with Subtle Verified Badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100 shadow-2xs"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 p-1 bg-primary-500 text-white rounded-full ring-2 ring-white shadow-xs cursor-pointer"
                    title="Đã xác thực sinh viên (@.edu.vn)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      {/* Name & Minimal Borderless Reputation Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-gray-900">{userName}</h1>
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold rounded-md tracking-wide">
                          Người dạy xuất sắc
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500">{roleTitle}</p>
                    </div>

                    {/* Public Actions ONLY (Share & Heart - NO Edit profile button!) */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                          isLiked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mt-4">{bio}</p>

                  {/* Skills tags - READ ONLY (NO + Thêm kỹ năng button, NO × delete buttons!) */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stats Grid (2 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Trust Score Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start">
                  Điểm uy tín
                </span>
                <div className="my-auto py-3">
                  <TrustScoreGauge score={trustScoreMax100} maxScore={100} label="XUẤT SẮC" size={130} />
                </div>
                <p className="text-[11px] text-gray-500">
                  Dựa trên 52 lượt kiểm duyệt bạn học và 100% tỷ lệ giải quyết khiếu nại.
                </p>
              </div>

              {/* Attendance Ledger Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Nhật ký tham gia
                </h3>
                <div className="space-y-3 text-xs flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Hoàn thành buổi học</span>
                    </span>
                    <span className="font-extrabold text-gray-900">100%</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Tỷ lệ đúng giờ</span>
                    </span>
                    <span className="font-extrabold text-gray-900">96%</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <Timer className="w-4 h-4 text-purple-600" />
                      <span>Thời gian phản hồi TB</span>
                    </span>
                    <span className="font-extrabold text-gray-900">2 giờ</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <Coins className="w-4 h-4 text-primary-500" />
                      <span>Tổng Credit kiếm được</span>
                    </span>
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-500 font-extrabold rounded-lg">
                      3,420 phút
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Peer Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-gray-900">Đánh giá từ người học</h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                  <span className="text-gray-400 font-normal">(48 đánh giá)</span>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rev.avatarBg}`}>
                          {rev.initials}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{rev.author}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{rev.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-9">
                      "{rev.content}"
                    </p>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                Xem tất cả đánh giá
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Mentorship Cost & Booking Card */}
            <div className="bg-[#1E293B] text-white rounded-2xl shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                    Chi phí học
                  </span>
                  <div className="text-xl font-black mt-0.5">
                    1 <span className="text-xs font-normal text-gray-300">credit / phút</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-primary-500/20 text-primary-300 font-bold text-[10px] rounded-full border border-primary-400/30">
                  Miễn phí 5 phút đầu
                </span>
              </div>

              {/* Calendar Picker */}
              <div className="p-5 bg-white text-gray-900">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-900">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Lịch rảnh</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Tháng 10 năm 2024</span>
                    <button className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Days grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2">
                  <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700 mb-4">
                  <span className="text-gray-300 py-1">28</span>
                  <span className="text-gray-300 py-1">29</span>
                  <span className="text-gray-300 py-1">30</span>
                  <span className="text-gray-300 py-1">31</span>
                  <span className="py-1 bg-primary-500 text-white font-bold rounded-lg cursor-pointer">25</span>
                  <span className="py-1 hover:bg-gray-100 rounded-lg cursor-pointer">26</span>
                  <span className="py-1 hover:bg-gray-100 rounded-lg cursor-pointer">27</span>
                </div>

                {/* Time Slots */}
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Khung giờ trống (25 Thg 10)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-500'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Book a 1-1 Session Button */}
                <button className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Đặt lịch học 1-1</span>
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Khi đặt lịch, credit sẽ được tạm giữ (ký quỹ) và trừ tự động 1 credit/phút thực học.
                </p>
              </div>
            </div>

            {/* Expertise Track Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                Theo dõi chuyên môn
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-gray-900 mb-1.5">
                    <span>Trình độ kỹ thuật</span>
                    <span className="text-primary-500">Nâng cao</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full w-[85%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-gray-900 mb-1.5">
                    <span>Kỹ năng giao tiếp</span>
                    <span className="text-primary-500">Chuyên gia</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
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
