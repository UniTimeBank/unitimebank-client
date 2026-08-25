import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { GroupRoomCard, CreateGroupRoomModal } from '../components';
import { Users, Plus, Search, Radio, Loader2 } from 'lucide-react';
import type { RootState } from '@/core/store';

export const GroupLobbyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data, isLoading, refetch } = useGetActiveGroupRoomsQuery(
    selectedCategory !== 'ALL' ? { category: selectedCategory } : undefined,
    {
      pollingInterval: 15000, // auto refresh active rooms every 15s
    },
  );

  const rooms = data?.rooms || [];
  const filteredRooms = rooms.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const CATEGORIES = ['ALL', 'Lập trình', 'Ngoại ngữ', 'Toán học', 'Thiết kế', 'Kinh tế'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-primary-700 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Radio className="w-4 h-4 text-primary-600 animate-pulse" />
              <span>Phòng học trực tuyến cộng đồng</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Sảnh Lớp Học & Thảo Luận Nhóm
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-normal">
              Tham gia học nhóm tức thì cùng bạn bè, trao đổi kiến thức trực tiếp với chi phí chỉ 1 Credit / phút (5 phút đầu học thử miễn phí).
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mở phòng học mới</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-primary-700 text-white border-primary-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả chủ đề' : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm phòng học..."
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 shadow-2xs"
            />
          </div>
        </div>

        {/* Room Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-medium">Đang tải danh sách phòng học nhóm...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="py-16 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200/60 flex items-center justify-center mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Hiện chưa có phòng học nhóm nào mở</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
              Bạn có thể là người đầu tiên tạo phòng học nhóm để cùng trao đổi kiến thức với mọi người!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Mở phòng ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <GroupRoomCard
                key={room.roomId}
                room={room}
                currentUserId={authUser?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateGroupRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};
