import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Plus, Radio, Video } from 'lucide-react';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { FeaturedGroupRoomCard, type GroupRoomDisplayItem } from './FeaturedGroupRoomCard';
import { MiniGroupRoomCard } from './MiniGroupRoomCard';
import { CreateGroupRoomModal } from './CreateGroupRoomModal';

export const LiveGroupRoomsBanner: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 15000,
  });

  const activeRooms = data?.rooms || [];

  const displayRooms: GroupRoomDisplayItem[] = useMemo(() => {
    return activeRooms.map((r) => {
      const skillsArray =
        Array.isArray(r.skills) && r.skills.length > 0
          ? r.skills
          : (r as any).skill
          ? [(r as any).skill]
          : [];

      return {
        roomId: r.roomId,
        mentorId: r.mentorId,
        mentorName: r.mentorName || (r as any).hostName || (r as any).displayName,
        mentorAvatar: (r as any).mentorAvatar || (r as any).hostAvatar || (r as any).avatarUrl,
        mentorTitle: (r as any).mentorTitle,
        mentorTrustScore: r.mentorTrustScore ?? (r as any).trustScore ?? 100,
        title: r.title,
        category: r.category,
        skills: skillsArray,
        currentParticipants: r.currentParticipants,
        openedAt: r.openedAt,
        status: r.status,
        coverImage: r.coverImage,
      };
    });
  }, [activeRooms]);

  const featuredRoom = displayRooms[0];
  const otherRooms = displayRooms.slice(1, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {activeRooms.length > 0 ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-sm shadow-red-500/50" />
              </span>
            ) : (
              <Radio className="w-4 h-4 text-primary-600" />
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Phòng Nhóm Đang Diễn Ra
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Tham gia ngay các buổi học và thảo luận trực tuyến cùng người hướng dẫn và cộng đồng.
          </p>
        </div>

        {/* Nút Xem tất cả góc phải */}
        <Link
          to="/rooms/group"
          className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-primary-700 font-bold transition-colors cursor-pointer py-1 group shrink-0"
        >
          <span>Xem tất cả ({activeRooms.length})</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. Content */}
      {isLoading ? (
        <div className="py-12 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center p-6 shadow-2xs animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 mb-3" />
          <div className="h-4 w-48 bg-slate-100 rounded-md mb-2" />
          <div className="h-3 w-64 bg-slate-100 rounded-md" />
        </div>
      ) : activeRooms.length === 0 ? (
        /* Empty State chuẩn UI đồng bộ với Sảnh Nhóm */
        <div className="py-12 bg-white border border-dashed border-slate-200/90 rounded-3xl flex flex-col items-center justify-center text-center p-6 sm:p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200/60 flex items-center justify-center mb-3.5 shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Hiện chưa có phòng học nhóm nào mở
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md font-normal leading-relaxed">
            Bạn có thể là người đầu tiên tạo phòng học nhóm để cùng trao đổi kiến thức với mọi người!
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mở phòng học nhóm ngay</span>
            </button>
          </div>
        </div>
      ) : activeRooms.length === 1 ? (
        /* Chỉ có 1 phòng */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <FeaturedGroupRoomCard room={featuredRoom} />
          </div>
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header Icon & Title */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200/70 text-primary-700 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 block">
                    Khởi tạo phòng học
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    Mở không gian học nhóm
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Tổ chức thảo luận trực tuyến, giảng dạy hoặc cùng bạn bè ôn tập môn học ngay tức thì với âm thanh & hình ảnh thời gian thực.
              </p>

              {/* Benefit highlights */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Âm thanh & video WebRTC ổn định</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Tự do lựa chọn chủ đề & kỹ năng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>5 phút đầu học thử miễn phí cho học viên</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2.5 mt-5 rounded-xl bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mở phòng học ngay</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2 phòng trở lên */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <FeaturedGroupRoomCard room={featuredRoom} />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-transparent">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase px-1">
                <span>PHÒNG ĐANG MỞ KHÁC ({displayRooms.length - 1})</span>
              </div>

              <div className="space-y-3">
                {otherRooms.map((room) => (
                  <MiniGroupRoomCard key={room.roomId} room={room} />
                ))}
              </div>
            </div>

            {displayRooms.length > 4 && (
              <Link
                to="/rooms/group"
                className="w-full py-2.5 mt-3 rounded-xl border border-primary-600/80 bg-white hover:bg-primary-50 text-primary-700 font-bold text-xs transition-all text-center block shadow-2xs hover:shadow-xs cursor-pointer"
              >
                Xem thêm {displayRooms.length - 4} phòng khác
              </Link>
            )}
          </div>
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
