import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, ArrowRight, Radio, Users, Loader2 } from 'lucide-react';
import type { RootState } from '@/core/store';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { GroupRoomCard } from './GroupRoomCard';
import { CreateGroupRoomModal } from './CreateGroupRoomModal';

export const LiveGroupRoomsBanner: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data, isLoading } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 15000,
  });

  const activeRooms = data?.rooms || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
      {/* 1. Section Header chuẩn giống Lớp Học Đề Xuất */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/70">
              LIVESTREAM TRỰC TIẾP
            </span>
            {activeRooms.length > 0 && (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {activeRooms.length} phòng đang online
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Phòng Học Nhóm Đang Diễn Ra
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Tham gia phòng học trực tiếp cùng Mentor và các bạn sinh viên (1 Credit/phút - 5 phút đầu học thử miễn phí).
          </p>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mở phòng nhóm</span>
          </button>

          <Link
            to="/rooms/group"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-primary-700 font-bold transition-colors cursor-pointer py-1"
          >
            <span>Xem tất cả sảnh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Grid of Cards (Khớp với Post Cards) */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          <span>Đang kiểm tra các phòng học nhóm đang phát trực tiếp...</span>
        </div>
      ) : activeRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRooms.slice(0, 3).map((room) => (
            <GroupRoomCard
              key={room.roomId}
              room={room}
              currentUserId={authUser?.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 px-6 bg-white border border-dashed border-slate-200/90 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200/60 flex items-center justify-center shrink-0 hidden sm:flex">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Hiện chưa có phòng học nhóm nào đang live</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hãy là người đầu tiên mở phòng để ôn thi, giải bài tập và thảo luận môn học trực tiếp cùng bạn bè!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Mở phòng ngay</span>
          </button>
        </div>
      )}

      {/* Modal Tạo Phòng Nhóm */}
      <CreateGroupRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
};
