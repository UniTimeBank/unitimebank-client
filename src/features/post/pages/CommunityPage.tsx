import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Bookmark,
  Calendar,
  Share2,
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'WORKSHOPS'>('GROUPS');
  const [searchQuery, setSearchQuery] = useState('');

  const groups = [
    {
      id: 'g-1',
      name: 'Cộng đồng Lập trình Frontend (ReactJS / Vue / Next.js)',
      description:
        'Nơi trao đổi kinh nghiệm, giải đáp thắc mắc và chia sẻ dự án thực tế ngành Web Development.',
      membersCount: 1420,
      activeDiscussions: 48,
      category: 'Công nghệ thông tin',
      isJoined: false,
    },
    {
      id: 'g-2',
      name: 'Ôn thi & Luyện giải đề Toán Cao Cấp / Giải Tích 1-2',
      description:
        'Nhóm học tập tương trợ lẫn nhau, cùng làm bài tập lớn và chuẩn bị cho các kỳ thi giữa kỳ, cuối kỳ.',
      membersCount: 890,
      activeDiscussions: 32,
      category: 'Toán học',
      isJoined: true,
    },
    {
      id: 'g-3',
      name: 'Góc Tiếng Anh Giao Tiếp & Luyện Thi IELTS 7.0+',
      description:
        'Luyện nói Speaking hàng tuần qua phòng học ảo UniTime, chia sẻ tài liệu ôn thi chất lượng.',
      membersCount: 2150,
      activeDiscussions: 95,
      category: 'Ngoại ngữ',
      isJoined: false,
    },
  ];

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cộng đồng học tập & chia sẻ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kết nối Nhóm học tập & Workshop
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 font-medium leading-relaxed">
            Tham gia các nhóm chuyên môn cùng ngành học, đăng ký tham gia các buổi Workshop học thuật do sinh viên xuất sắc hướng dẫn.
          </p>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'GROUPS'
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Nhóm học thuật ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('WORKSHOPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'WORKSHOPS'
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Workshop nổi bật
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhóm hoặc chủ đề..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'GROUPS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-[10px] font-black rounded-lg border border-primary-100">
                      {group.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                    {group.name}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {group.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary-500" />
                      {group.membersCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {group.activeDiscussions} Thảo luận
                    </span>
                  </div>

                  <button
                    onClick={() => toast.success(`Đã tham gia nhóm: ${group.name}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-all cursor-pointer"
                  >
                    Tham gia nhóm
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Workshop Học Thuật Sắp Diễn Ra</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-gray-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
                    Miễn phí tham gia
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  Luyện Tập Phỏng Vấn Mock Interview & Tối Ưu CV Ngành IT / Design
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Buổi chia sẻ trực tiếp về quy trình nghiên cứu người dùng, thiết kế wireframe và hoàn thiện hồ sơ xin việc ngành UX.
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>Thứ 4, 18:00 (11 Thg 9)</span>
                  </div>
                  <button
                    onClick={() => toast.success('Đã đăng ký tham gia Workshop thành công!')}
                    className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors cursor-pointer"
                  >
                    Đăng ký tham gia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
