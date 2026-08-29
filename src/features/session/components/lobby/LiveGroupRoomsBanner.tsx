import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { FeaturedGroupRoomCard, type GroupRoomDisplayItem } from './FeaturedGroupRoomCard';
import { MiniGroupRoomCard } from './MiniGroupRoomCard';
import { CreateGroupRoomModal } from './CreateGroupRoomModal';

// Dữ liệu mẫu showcase chuẩn theo thiết kế mockup khi hệ thống chưa có phòng live
const SHOWCASE_GROUP_ROOMS: GroupRoomDisplayItem[] = [
  {
    roomId: 'showcase-kinh-te',
    title: 'Phân tích Chính sách Tiền tệ Quý 4/2024: Tác động và Dự báo',
    category: 'BUSINESS',
    currentParticipants: 1200,
    startTimeText: 'Bắt đầu từ 2 giờ trước',
    mentorName: 'PGS. Nguyễn Văn A',
    mentorTitle: 'Chuyên gia Tài chính • 15 năm kinh nghiệm',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000',
  },
  {
    roomId: 'showcase-cntt',
    title: 'Giải đề thi: Cấu trúc Dữ liệu Nâng cao',
    category: 'PROGRAMMING',
    currentParticipants: 85,
    startTimeText: 'Bắt đầu từ 45 phút trước',
    mentorName: 'ThS. Trần Thị B',
    mentorTitle: 'Giảng viên Khoa CNTT',
    mentorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  },
  {
    roomId: 'showcase-ngon-ngu',
    title: 'Luyện IELTS Speaking: Topic Education',
    category: 'LANGUAGE',
    currentParticipants: 42,
    startTimeText: 'Bắt đầu từ 30 phút trước',
    mentorName: 'TS. Lê Hoàng C',
    mentorTitle: 'IELTS 8.5 • Giảng viên Ngôn ngữ',
    mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  },
  {
    roomId: 'showcase-ai-ml',
    title: 'Workshop: Xây dựng Chatbot với LLM',
    category: 'PROGRAMMING',
    currentParticipants: 156,
    startTimeText: 'Bắt đầu từ 1 giờ trước',
    mentorName: 'PGS. Phạm Văn D',
    mentorTitle: 'AI Researcher & Tech Lead',
    mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
  },
];

export const LiveGroupRoomsBanner: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 15000,
  });

  const activeRooms = data?.rooms || [];

  // Chuẩn hóa và kết hợp dữ liệu phòng học trực tiếp
  const displayRooms: GroupRoomDisplayItem[] = useMemo(() => {
    if (activeRooms.length > 0) {
      const mapped = activeRooms.map((r) => ({
        roomId: r.roomId,
        mentorId: r.mentorId,
        title: r.title,
        category: r.category,
        currentParticipants: r.currentParticipants,
        openedAt: r.openedAt,
        status: r.status,
      }));

      // Nếu ít hơn 4 phòng, bổ sung phòng showcase để bố cục luôn cân đối
      if (mapped.length < 4) {
        const remainingShowcase = SHOWCASE_GROUP_ROOMS.slice(mapped.length);
        return [...mapped, ...remainingShowcase];
      }
      return mapped;
    }
    return SHOWCASE_GROUP_ROOMS;
  }, [activeRooms]);

  const featuredRoom = displayRooms[0];
  const otherRooms = displayRooms.slice(1, 4);
  const totalOtherCount = activeRooms.length > 4 ? activeRooms.length - 1 : 12;
  const remainingCount = totalOtherCount > 3 ? totalOtherCount - 3 : 9;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
      {/* 1. Header Section chuẩn thiết kế mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Dấu chấm đỏ phát sáng */}
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-sm shadow-red-500/50" />
            </span>
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
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. Bố cục 2 Cột (Trái: Hero Featured Room | Phải: Danh sách phòng chờ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Cột Trái: Phòng Nổi Bật Lớn */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <FeaturedGroupRoomCard room={featuredRoom} />
        </div>

        {/* Cột Phải: Danh Sách Phòng Chờ Khác */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-transparent">
          {/* Header Cột Phải */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase px-1">
              <span>PHÒNG CHỜ KHÁC ({totalOtherCount})</span>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="w-5 h-1 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1 rounded-full bg-slate-200" />
              </div>
            </div>

            {/* Danh Sách 3 Thẻ Mini Xếp Dọc */}
            <div className="space-y-3">
              {otherRooms.map((room) => (
                <MiniGroupRoomCard key={room.roomId} room={room} />
              ))}
            </div>
          </div>

          {/* Nút Xem Thêm Phía Dưới giống nút Xem chi tiết ở card dưới */}
          <Link
            to="/rooms/group"
            className="w-full py-2.5 mt-3 rounded-xl border border-primary-600/80 bg-white hover:bg-primary-50 text-primary-700 font-bold text-xs transition-all text-center block shadow-2xs hover:shadow-xs cursor-pointer"
          >
            Xem thêm {remainingCount} phòng khác
          </Link>
        </div>
      </div>

      {/* Modal Tạo Phòng Nhóm khi cần */}
      <CreateGroupRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
};
