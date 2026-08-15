import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  Sprout,
  Eye,
} from 'lucide-react';
import { TrustScoreGauge } from '@/shared/components';
import { DailyCheckinWidget, AddSkillModal } from '../components';
import { useUserProfile, useDailyCheckin, useUserSkills } from '../hooks';

export const DashboardPage: React.FC = () => {
  const { profile } = useUserProfile();
  const { currentStreak, hasCheckedInToday, rewardMessage, checkin, isCheckinLoading } = useDailyCheckin();
  const { addSkill } = useUserSkills();
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  const userName = profile?.displayName || 'Nguyễn Hoàng Sang';
  const credits = 120;
  const trustScore = profile?.trustScore ? profile.trustScore / 10 : 9.2;

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

  return (
    <div className="space-y-8">
      {/* Daily Checkin Bonus Banner (Ẩn khi đã hoàn thành 7/7 ngày) */}
      {currentStreak < 7 && (
        <DailyCheckinWidget
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          rewardMessage={rewardMessage}
          onCheckin={checkin}
          isCheckinLoading={isCheckinLoading}
        />
      )}

      {/* Welcome Banner & Top Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Chào buổi sáng, {userName} 
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
            Bạn có 2 buổi học được xếp lịch diễn ra trong ngày hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View As Others Button */}
          <Link
            to="/profile"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            title="Xem trang Hồ sơ Mentor của bạn dưới góc nhìn của sinh viên khác"
          >
            <Eye className="w-4 h-4 text-gray-600" />
            <span>Xem góc nhìn người khác</span>
          </Link>

          {/* Add Skill Button */}
          <button
            onClick={() => setIsAddSkillModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Đăng bài dạy / Kỹ năng</span>
          </button>
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

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={async (name, cat, isStrong) => {
          await addSkill({ skillName: name, category: cat, isStrong });
        }}
      />
    </div>
  );
};
