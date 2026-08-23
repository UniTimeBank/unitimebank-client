import React, { useState } from 'react';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { GroupRoomCard, CreateGroupRoomModal } from '../components';
import { Users, Plus, Search, Radio, Loader2 } from 'lucide-react';

export const GroupLobbyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Phòng học trực tuyến cộng đồng</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
              Lớp học & Thảo luận Nhóm
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Tham gia học cùng bạn bè, luyện tập kiến thức trực tiếp với chi phí chỉ 1 Credit / phút.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả chủ đề' : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm phòng học..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Room Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Đang tải danh sách phòng học nhóm...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Hiện chưa có phòng học nhóm nào mở</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Bạn có thể là người đầu tiên tạo phòng học nhóm để cùng trao đổi kiến thức với mọi người!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Mở phòng ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <GroupRoomCard key={room.roomId} room={room} />
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
