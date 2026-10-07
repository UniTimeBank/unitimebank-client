import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Plus,
  Compass,
  Code2,
  Languages,
  Palette,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { useGetGroupsQuery } from '@/core/api/community/communityApi';
import type { CommunityGroup } from '@/features/post/types';
import { ROUTES } from '@/routes/paths';
import { UserAvatar } from '@/shared/components/ui';

// Danh sách cộng đồng mẫu phong phú khi cơ sở dữ liệu chưa có đủ dữ liệu
const CURATED_COMMUNITIES: Partial<CommunityGroup>[] = [
  {
    _id: 'default-tech-group',
    name: 'CLB Thuật toán & Lập trình Ứng dụng',
    description: 'Không gian trao đổi thuật toán LeetCode, kiến trúc phần mềm, Web/Mobile dev và giải đáp thắc mắc đồ án công nghệ thông tin.',
    category: 'Công nghệ thông tin',
    membersCount: 385,
    postsCount: 52,
    creatorName: 'Ban Học Thuật IT',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
  },
  {
    _id: 'default-ielts-group',
    name: 'Cộng đồng Luyện Nói IELTS 7.5+ & Academic English',
    description: 'Thực hành Speaking hàng tuần, chấm bài Writing miễn phí và chia sẻ tài liệu ôn luyện thi chứng chỉ quốc tế.',
    category: 'Ngoại ngữ & IELTS',
    membersCount: 290,
    postsCount: 38,
    creatorName: 'CLB Ngoại Ngữ',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
  },
  {
    _id: 'default-design-group',
    name: 'Hội Sinh viên Thiết kế UI/UX & Đồ Họa Sáng Tạo',
    description: 'Chia sẻ case study Figma, thiết kế portfolio chuyên nghiệp và nhận feedback thiết kế từ các mentor có kinh nghiệm.',
    category: 'Thiết kế & Đồ họa',
    membersCount: 215,
    postsCount: 29,
    creatorName: 'Design Hub',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800',
  },
  {
    _id: 'default-fintech-group',
    name: 'Diễn đàn Kinh tế, Tài chính & Phân tích Dữ liệu',
    description: 'Thảo luận kinh tế lượng, phân tích báo cáo tài chính và ứng dụng AI/Python trong tài chính hiện đại.',
    category: 'Kinh tế & Marketing',
    membersCount: 198,
    postsCount: 24,
    creatorName: 'Khoa Kinh Tế',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
  },
];

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('lập trình') || cat.includes('công nghệ') || cat.includes('it')) {
    return Code2;
  }
  if (cat.includes('ngoại ngữ') || cat.includes('ielts') || cat.includes('anh')) {
    return Languages;
  }
  if (cat.includes('thiết kế') || cat.includes('đồ họa') || cat.includes('ui/ux')) {
    return Palette;
  }
  if (cat.includes('kinh tế') || cat.includes('tài chính') || cat.includes('marketing')) {
    return TrendingUp;
  }
  return GraduationCap;
};

export const CommunityExploreBento: React.FC = () => {
  const navigate = useNavigate();
  const { data: dbGroups, isLoading } = useGetGroupsQuery();

  // Kết hợp dữ liệu từ API và danh sách phong phú mẫu
  const allGroups = React.useMemo(() => {
    const list: Partial<CommunityGroup>[] = [];
    if (Array.isArray(dbGroups) && dbGroups.length > 0) {
      list.push(...dbGroups);
    }
    // Bổ sung các nhóm mẫu nếu thiếu để Bento Grid luôn đủ 3 - 4 nhóm tuyệt đẹp
    CURATED_COMMUNITIES.forEach((curated) => {
      if (!list.some((g) => g.name === curated.name || g._id === curated._id)) {
        list.push(curated);
      }
    });
    return list;
  }, [dbGroups]);

  const featuredGroup = allGroups[0] || CURATED_COMMUNITIES[0];
  const sideGroups = allGroups.slice(1, 3);

  const handleGroupClick = (group: Partial<CommunityGroup>) => {
    if (group._id && !group._id.startsWith('default-')) {
      navigate(`/community/${group._id}`);
    } else {
      navigate(ROUTES.COMMUNITY);
    }
  };

  const featuredCover =
    featuredGroup.coverImage ||
    featuredGroup.coverUrl ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cộng Đồng Sinh Viên & Nhóm Học Thuật
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Không gian trao đổi mở, tìm bạn đồng hành ôn thi và thảo luận chuyên sâu theo từng lĩnh vực.
          </p>
        </div>

        {/* Action Link to Community Page */}
        <Link
          to={ROUTES.COMMUNITY}
          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-primary-700 font-bold transition-colors cursor-pointer py-1 group shrink-0"
        >
          <span>Khám phá tất cả cộng đồng</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cột Trái: Card Lớn Cộng Đồng Nổi Bật (6 hoặc 7 Cols) */}
        <div
          onClick={() => handleGroupClick(featuredGroup)}
          className="lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[380px] bg-slate-950 group cursor-pointer border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-6 sm:p-8"
        >
          {/* Background Cover Image with Zoom Effect */}
          <img
            src={featuredCover}
            alt={featuredGroup.name}
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 group-hover:opacity-55 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

          {/* Top Badges */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 backdrop-blur-md text-emerald-300 font-bold text-[11px] uppercase tracking-wider border border-emerald-400/30">
                <span>Cộng đồng nổi bật</span>
              </span>

              {featuredGroup.category && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-200 text-[11px] font-semibold border border-white/20">
                  {featuredGroup.category}
                </span>
              )}
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 shadow-xs">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{(featuredGroup.membersCount ?? 0).toLocaleString()} thành viên</span>
            </div>
          </div>

          {/* Bottom Content Info */}
          <div className="relative z-10 space-y-3 mt-12">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-200 transition-colors">
              {featuredGroup.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed line-clamp-2 max-w-xl">
              {featuredGroup.description}
            </p>

            {/* Creator and Actions Row */}
            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <UserAvatar
                  src={featuredGroup.creatorAvatar}
                  name={featuredGroup.creatorName || 'Ban học thuật'}
                  size="xs"
                  className="border-emerald-400/50 shrink-0"
                />
                <span>Quản trị: {featuredGroup.creatorName || 'Ban học thuật'}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>{featuredGroup.postsCount ?? 0} thảo luận</span>
                </span>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-900 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md group-hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Vào nhóm thảo luận</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Cột Phải: 2 Card Nhóm Nhỏ + 1 Banner Quảng Bá (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          {/* 2 Card Nhỏ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            {sideGroups.map((group, idx) => {
              const IconComp = getCategoryIcon(group.category || '');
              const cover =
                group.coverImage ||
                group.coverUrl ||
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800';

              return (
                <div
                  key={group._id || idx}
                  onClick={() => handleGroupClick(group)}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-primary-400 shadow-2xs hover:shadow-md transition-all duration-300 flex items-center gap-4 group cursor-pointer"
                >
                  {/* Thumbnail / Icon Box */}
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    <img
                      src={cover}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-primary-700 shadow-2xs">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 block truncate">
                      {group.category || 'Học thuật'}
                    </span>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate mt-0.5">
                      {group.name}
                    </h4>

                    <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-0.5">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>{(group.membersCount ?? 0).toLocaleString()} thành viên</span>
                      </span>
                      <span className="flex items-center gap-1 text-sky-700">
                        <MessageSquare className="w-3 h-3 text-sky-600" />
                        <span>{group.postsCount ?? 0} thảo luận</span>
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary-50 group-hover:text-primary-700 text-slate-400 flex items-center justify-center shrink-0 transition-all">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner Sắp Tới / Tạo Nhóm Mới */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-5 sm:p-6 text-white border border-emerald-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Background Glow */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-1 max-w-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                KHỞI TẠO KHÔNG GIAN
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                Chưa có nhóm cho môn học của bạn?
              </h4>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
                Tạo nhóm mới hoàn toàn miễn phí để tập hợp bạn bè cùng khoa và cùng nhau giải đề.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                to={ROUTES.COMMUNITY_CREATE}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-950" strokeWidth={3} />
                <span>Tạo nhóm mới</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
