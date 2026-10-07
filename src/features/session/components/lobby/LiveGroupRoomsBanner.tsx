import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Plus, Radio, Video, RotateCcw, Clock, BookOpen, Coins } from 'lucide-react';
import { useGetActiveGroupRoomsQuery } from '@/core/api/session';
import { FeaturedGroupRoomCard, type GroupRoomDisplayItem } from './FeaturedGroupRoomCard';
import { MiniGroupRoomCard } from './MiniGroupRoomCard';
import { CreateGroupRoomModal } from './CreateGroupRoomModal';
import type { SessionType } from '@/features/post/types';

export interface LiveGroupRoomsBannerProps {
  selectedCategory?: string;
  searchKeyword?: string;
  sessionType?: 'ALL' | SessionType;
  minTrustScore?: number;
  onResetFilters?: () => void;
}

export const LiveGroupRoomsBanner: React.FC<LiveGroupRoomsBannerProps> = ({
  selectedCategory = 'ALL',
  searchKeyword = '',
  sessionType = 'ALL',
  minTrustScore = 0,
  onResetFilters,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useGetActiveGroupRoomsQuery(undefined, {
    pollingInterval: 15000,
  });

  const activeRooms = data?.rooms || [];

  // Lọc phòng nhóm theo danh mục, từ khóa và bộ lọc nâng cao từ trang Explore
  const filteredRooms = useMemo(() => {
    return activeRooms.filter((r) => {
      // 1. Lọc theo danh mục
      if (selectedCategory && selectedCategory !== 'ALL') {
        const roomCat = (r.category || '').toUpperCase();
        if (roomCat !== selectedCategory.toUpperCase()) {
          return false;
        }
      }

      // 2. Lọc theo từ khóa tìm kiếm
      if (searchKeyword && searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchTitle = (r.title || '').toLowerCase().includes(kw);
        const mentorName = r.mentorName || (r as any).hostName || (r as any).displayName || '';
        const matchMentor = mentorName.toLowerCase().includes(kw);
        const matchCat = (r.category || '').toLowerCase().includes(kw);
        const skillsArray =
          Array.isArray(r.skills) && r.skills.length > 0
            ? r.skills
            : (r as any).skill
            ? [(r as any).skill]
            : [];
        const matchSkills = skillsArray.some((s: string) => s.toLowerCase().includes(kw));

        if (!matchTitle && !matchMentor && !matchCat && !matchSkills) {
          return false;
        }
      }

      // 3. Lọc theo điểm uy tín tối thiểu
      if (minTrustScore && minTrustScore > 0) {
        const score = r.mentorTrustScore ?? (r as any).trustScore ?? 100;
        if (score < minTrustScore) {
          return false;
        }
      }

      return true;
    });
  }, [activeRooms, selectedCategory, searchKeyword, minTrustScore]);

  const displayRooms: GroupRoomDisplayItem[] = useMemo(() => {
    return filteredRooms.map((r) => {
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
  }, [filteredRooms]);

  // Nếu người dùng chủ động chọn lọc riêng lớp 1:1, ẩn sảnh phòng nhóm
  if (sessionType === 'ONE_ON_ONE') {
    return null;
  }

  const featuredRoom = displayRooms[0];
  const otherRooms = displayRooms.slice(1, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {displayRooms.length > 0 ? (
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
          to={selectedCategory && selectedCategory !== 'ALL' ? `/rooms/group?category=${selectedCategory}` : '/rooms/group'}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-primary-700 font-bold transition-colors cursor-pointer py-1 group shrink-0"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. Content */}
      {isLoading ? (
        <div className="py-10 sm:py-12 flex flex-col items-center justify-center text-center px-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/70 mb-3" />
          <div className="h-4 w-48 bg-slate-200/70 rounded-md mb-2" />
          <div className="h-3 w-64 bg-slate-200/50 rounded-md" />
        </div>
      ) : displayRooms.length === 0 ? (
        activeRooms.length === 0 ? (
          /* Bento Grid Onboarding Layout khi chưa có phòng nào */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Cột Trái: Thẻ Hero Giới Thiệu & Kêu Gọi Mở Phòng (7 Cols) */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[340px] bg-slate-950 group cursor-pointer border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-6 sm:p-8"
            >
              {/* Background Cover Photo with Dark Gradient */}
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                alt="Phòng học nhóm trực tuyến"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />

              {/* Top Status Badge */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 font-bold text-[11px] uppercase tracking-wider border border-emerald-400/30">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sảnh học nhóm WebRTC</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-300 text-xs font-semibold border border-white/15">
                  Sẵn sàng mở phòng
                </span>
              </div>

              {/* Bottom Content & CTA */}
              <div className="relative z-10 space-y-3 mt-8">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-200 transition-colors">
                  Chưa có phòng học nào đang mở
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl">
                  Bạn có thể là người đầu tiên tạo phòng học nhóm trực tuyến để cùng bạn bè ôn thi, giải đề hoặc chia sẻ kiến thức ngay lúc này!
                </p>

                {/* Benefits List */}
                <div className="pt-1 flex items-center gap-4 text-xs text-emerald-300 font-semibold flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Video & Âm thanh HD</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>5 phút đầu học thử miễn phí</span>
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg group-hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                    <span>Mở phòng học nhóm ngay</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cột Phải: 2 Thẻ Giới Thiệu Tính Năng + 1 Banner Nhỏ (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 justify-between">
              {/* Thẻ 1: Tự do chọn chủ đề */}
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Tự do lựa chọn môn học & kỹ năng
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Mở phòng ôn tập chuyên đề Lập trình, Ngoại ngữ, Giải tích hoặc Thuyết trình đồ án.
                  </p>
                </div>
              </div>

              {/* Thẻ 2: Nhận Credit khi mở lớp */}
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Coins className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Tích lũy Credit khi có học viên
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Nhận điểm thưởng và Credit trao đổi để tham gia bất kỳ buổi học nào bạn yêu thích.
                  </p>
                </div>
              </div>

              {/* Banner Sảnh phòng nhóm */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-950 to-emerald-950 p-5 text-white border border-primary-900/40 shadow-xs flex items-center justify-between gap-4">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                    KHÔNG GIAN TƯƠNG TÁC
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Học nhóm trực tuyến thời gian thực
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Video call WebRTC mượt mà, hỗ trợ bảng vẽ & chia sẻ màn hình.
                  </p>
                </div>

                <Link
                  to="/rooms/group"
                  className="relative z-10 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>Xem sảnh</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Có phòng nhưng không khớp bộ lọc đang chọn */
          <div className="py-10 sm:py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3.5">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Không tìm thấy phòng nhóm phù hợp với bộ lọc
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md font-normal leading-relaxed">
              Hiện có {activeRooms.length} phòng học nhóm đang hoạt động ở các chủ đề khác. Hãy thử chọn danh mục khác hoặc xóa bộ lọc.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5 flex-wrap">
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-all shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xem tất cả phòng</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mở phòng học nhóm ngay</span>
              </button>
            </div>
          </div>
        )
      ) : displayRooms.length === 1 ? (
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
