import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Sparkles,
  Plus,
  BookOpen,
  Filter,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useGetGroupsQuery } from '@/core/api/community/communityApi';
import { GroupCard } from '@/features/post/components/community/GroupCard';
import { CreateGroupModal } from '@/features/post/components/community/CreateGroupModal';

const CATEGORIES = [
  'Tất cả',
  'Công nghệ thông tin',
  'Toán học & Giải tích',
  'Ngoại ngữ & IELTS',
  'Kinh tế & Marketing',
  'Thiết kế & Đồ họa',
  'Khoa học cơ bản',
  'Đời sống sinh viên',
];

export const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_GROUPS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch groups with filters
  const { data: groups = [], isLoading } = useGetGroupsQuery({
    search: searchQuery.trim() || undefined,
    category: selectedCategory === 'Tất cả' ? undefined : selectedCategory,
    myGroupsOnly: activeTab === 'MY_GROUPS',
  });

  const handleGroupCreated = (groupId: string) => {
    navigate(`/community/${groupId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cộng đồng học tập UniTime</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Nhóm Học Tập & Trao Đổi Chuyên Môn
            </h1>
            <p className="text-xs sm:text-sm text-primary-100 font-medium leading-relaxed">
              Mỗi nhóm là một không gian trao đổi độc lập. Cùng nhau đặt câu hỏi, chia sẻ tài liệu ôn thi và tìm bạn đồng hành cùng tiến bộ!
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white text-primary-800 hover:bg-primary-50 font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
            <span>Tạo Nhóm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Khám phá tất cả nhóm
          </button>
          <button
            onClick={() => setActiveTab('MY_GROUPS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MY_GROUPS'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Nhóm của tôi
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên nhóm hoặc mô tả..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-2xs scale-[1.02]'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Groups Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl h-72 border border-gray-100 shadow-2xs animate-pulse p-4 space-y-4"
              >
                <div className="h-32 bg-gray-200 rounded-2xl w-full" />
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-200 rounded-md w-full" />
                <div className="h-8 bg-gray-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-3xl mx-auto flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                {activeTab === 'MY_GROUPS'
                  ? 'Bạn chưa tham gia nhóm nào'
                  : 'Không tìm thấy nhóm học tập phù hợp'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {activeTab === 'MY_GROUPS'
                  ? 'Hãy chuyển sang tab "Khám phá tất cả nhóm" để tham gia hoặc tự tạo nhóm cho riêng mình.'
                  : 'Hãy thử tìm kiếm với từ khóa khác hoặc tạo một nhóm học tập mới ngay hôm nay.'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo nhóm ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGroupCreated}
      />
    </div>
  );
};
