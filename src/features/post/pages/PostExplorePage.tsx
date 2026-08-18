import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Compass,
  TrendingUp,
  X,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { useActiveRole } from '@/shared/hooks/useActiveRole';
import { useMentorPosts, useLearnerRequests } from '../hooks';
import { UnifiedPostCard } from '../components/cards';
import { type ExploreCardItem } from '../types';
import { SKILL_CATEGORY_LABELS } from '../constants';

// Danh mục filter pills theo đúng mockup
const FILTER_PILLS = [
  { label: 'Tất cả lĩnh vực', value: 'ALL' },
  { label: 'Quản trị Kinh doanh', value: 'BUSINESS' },
  { label: 'Khoa học Máy tính', value: 'PROGRAMMING' },
  { label: 'Ngôn ngữ học', value: 'LANGUAGE' },
  { label: 'Thiết kế & Đồ họa', value: 'DESIGN' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
];

export const PostExplorePage: React.FC = () => {
  const { isMentor } = useActiveRole();

  // Custom Hooks fetching data from DB
  const { posts: mentorPosts, isLoading: isLoadingMentors } = useMentorPosts({ page: 1, limit: 30 });
  const { requests: learnerRequests, isLoading: isLoadingLearners } = useLearnerRequests({ page: 1, limit: 30 });

  // State tìm kiếm & bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Bộ lọc nâng cao
  const [advancedFilter, setAdvancedFilter] = useState({
    sessionType: 'ALL' as 'ALL' | 'ONE_ON_ONE' | 'GROUP',
    minTrustScore: 0,
    sortBy: 'relevance' as 'relevance' | 'newest' | 'trustScore',
  });

  // Chuyển đổi dữ liệu từ API sang định dạng ExploreCardItem
  const rawItems: ExploreCardItem[] = useMemo(() => {
    if (isMentor) {
      // Khi là Mentor: Hiển thị các bài yêu cầu tìm người dạy của học viên
      return learnerRequests.map((req) => ({
        id: req._id,
        type: 'LEARNER' as const,
        title: req.skillNeeded,
        description: req.shortDescription || req.description || '',
        category: req.category || 'PROGRAMMING',
        coverImage: (req as any).coverImage,
        tagSkill: req.skillNeeded?.toUpperCase().slice(0, 16) || 'HỌC TẬP',
        secondaryTag: 'Cần hỗ trợ',
        authorName: req.learnerName || 'Học viên UniTime',
        authorAvatar: req.learnerAvatar,
        authorUniversity: 'Sinh viên UniTime',
        rateCreditText: `${req.expectedCreditAmount || req.expectedDurationMinutes || 60} credit`,
        trustScore: 100,
        sessionType: req.sessionType || 'ONE_ON_ONE',
        detailUrl: `/posts/learner/${req._id}`,
      }));
    } else {
      // Hiển thị các bài dạy của Mentor
      return mentorPosts.map((post) => {
        const cat = post.tags?.[0]?.category || 'PROGRAMMING';
        const categoryLabel = (SKILL_CATEGORY_LABELS[cat.toUpperCase()] || cat).toUpperCase();
        const allSkills = post.tags?.map((t) => t.skillName).filter(Boolean) || [];

        const totalSlots = post.availableSlots?.length || 0;
        const rateText = totalSlots > 0 ? `${totalSlots} khung giờ` : 'Lịch mở';

        return {
          id: post._id,
          type: 'MENTOR' as const,
          title: post.title,
          description: post.shortDescription || post.description || '',
          category: cat,
          coverImage: (post as any).coverImage || (post as any).thumbnail,
          tagSkill: categoryLabel,
          secondaryTag: allSkills.join(', '),
          allSkills,
          authorName: post.mentorName || 'Mentor UniTime',
          authorAvatar: post.mentorAvatar,
          authorUniversity: 'Mentor UniTime',
          rateCreditText: rateText,
          trustScore: post.trustScoreSnapshot || 100,
          sessionType: post.sessionType || 'BOTH',
          scheduleType: (post.scheduleType as 'ALWAYS_OPEN' | 'LIMITED_TIME') || 'ALWAYS_OPEN',
          detailUrl: `/posts/mentor/${post._id}`,
        };
      });
    }
  }, [isMentor, mentorPosts, learnerRequests]);

  // Lọc dữ liệu theo từ khóa, danh mục & bộ lọc nâng cao
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // 1. Tìm kiếm từ khóa
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(kw);
        const matchDesc = item.description.toLowerCase().includes(kw);
        const matchAuthor = item.authorName.toLowerCase().includes(kw);
        if (!matchTitle && !matchDesc && !matchAuthor) return false;
      }

      // 2. Lọc danh mục
      if (selectedCategory !== 'ALL') {
        const itemCat = item.category?.toUpperCase();
        if (itemCat !== selectedCategory) return false;
      }

      // 3. Lọc hình thức buổi học
      if (advancedFilter.sessionType !== 'ALL') {
        if (item.sessionType !== advancedFilter.sessionType && item.sessionType !== 'BOTH') {
          return false;
        }
      }

      // 4. Lọc điểm uy tín tối thiểu
      if (advancedFilter.minTrustScore > 0) {
        if ((item.trustScore || 0) < advancedFilter.minTrustScore) return false;
      }

      return true;
    });
  }, [rawItems, searchKeyword, selectedCategory, advancedFilter]);

  const hasActiveFilters =
    searchKeyword !== '' ||
    selectedCategory !== 'ALL' ||
    advancedFilter.sessionType !== 'ALL' ||
    advancedFilter.minTrustScore > 0;

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('ALL');
    setAdvancedFilter({
      sessionType: 'ALL',
      minTrustScore: 0,
      sortBy: 'relevance',
    });
  };

  const isLoading = isMentor ? isLoadingLearners : isLoadingMentors;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Hero Section (Header trung tâm theo mockup) */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
          Khám phá Không gian<br />
          Tri thức Học thuật
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
          Trải nghiệm môi trường học tập rộng mở. Tìm kiếm hàng ngàn lớp học, bài giảng và tài nguyên được chia sẻ bởi cộng đồng sinh viên xuất sắc.
        </p>

        {/* Thanh Tìm Kiếm Tròn Lớn */}
        <div className="max-w-2xl mx-auto mt-8 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm môn học, giảng viên, hoặc chủ đề..."
            className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-3 focus:ring-primary-100 outline-none transition-all"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dải Pills Lĩnh Vực & Nút Lọc Thêm */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mt-5">
          {FILTER_PILLS.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                    : 'bg-white text-slate-700 hover:border-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              advancedFilter.sessionType !== 'ALL' || advancedFilter.minTrustScore > 0
                ? 'bg-primary-50 text-primary-800 border-primary-300 font-bold'
                : 'bg-white text-slate-700 hover:border-slate-300 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Lọc thêm</span>
            {(advancedFilter.sessionType !== 'ALL' || advancedFilter.minTrustScore > 0) && (
              <span className="w-2 h-2 rounded-full bg-primary-600" />
            )}
          </button>
        </div>
      </section>

      {/* 2. Section: Lớp học Đề xuất (Grid 3 Cột sạch sẽ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-end justify-between gap-4 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isMentor ? 'Yêu cầu Học tập Đề xuất' : 'Lớp học Đề xuất'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {isMentor
                ? 'Các môn học và kỹ năng sinh viên đang cần tìm Mentor hỗ trợ.'
                : 'Dựa trên lịch sử học tập và chuyên ngành của bạn.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
            <Link
              to="/requests"
              className="text-xs font-bold text-slate-800 hover:text-primary-700 flex items-center gap-1 transition-colors group"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Danh Sách Cards 3 Cột Đúng Theo Yêu Cầu */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-100 rounded-2xl w-full" />
                <div className="space-y-3 pt-3">
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-full" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-3 max-w-lg mx-auto mt-6">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy bài đăng phù hợp</h3>
            <p className="text-xs text-slate-500 font-normal">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredItems.slice(0, 9).map((item) => (
              <UnifiedPostCard
                key={item.id}
                data={{
                  id: item.id,
                  type: item.type,
                  title: item.title,
                  description: item.description,
                  category: item.category,
                  coverImage: item.coverImage,
                  primaryTag: item.tagSkill,
                  secondaryTags:
                    (item as any).allSkills && (item as any).allSkills.length > 0
                      ? (item as any).allSkills
                      : item.secondaryTag
                      ? [item.secondaryTag]
                      : [],
                  authorName: item.authorName,
                  authorAvatar: item.authorAvatar,
                  authorSubtitle: item.authorUniversity,
                  trustScore: item.trustScore,
                  creditText: item.rateCreditText,
                  detailUrl: item.detailUrl,
                  sessionTypeText:
                    item.sessionType === 'GROUP'
                      ? 'Lớp nhóm'
                      : item.sessionType === 'BOTH'
                      ? '1:1 & Nhóm'
                      : 'Lớp 1:1',
                  scheduleType: (item as any).scheduleType,
                  timelineText: 'Trong 3 ngày',
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Section: Chủ đề Khám phá (Bento Grid Học Thuật theo mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Chủ đề Khám phá
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Các tài liệu học thuật nổi bật được tổng hợp trong tuần.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          {/* Cột Trái: Card Lớn Tuyển Tập (6 Cols) */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[320px] bg-slate-900 group cursor-pointer border border-slate-200/80 shadow-xs flex flex-col justify-end p-6 sm:p-8">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200"
              alt="Học thuật"
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 group-hover:opacity-45 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-white font-semibold text-[11px] uppercase tracking-wider border border-white/30">
                Tuyển tập
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Phương pháp Nghiên cứu Khoa học Hiện đại
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-lg">
                Bộ tài liệu tổng hợp các phương pháp luận và kỹ năng thu thập dữ liệu tiên tiến dành cho sinh viên năm cuối.
              </p>
            </div>
          </div>

          {/* Cột Phải: 2 Card Vuông Nhỏ + 1 Banner Sự Kiện (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4 justify-between">
            {/* 2 Card Vuông Nhỏ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Tư duy Thiết kế */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Compass className="w-5 h-5 text-slate-700 group-hover:text-primary-700" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Tư duy Thiết kế
                  </h4>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">12 Tài liệu</p>
                </div>
              </div>

              {/* Card 2: Phân tích Dữ liệu */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[160px] group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-slate-700 group-hover:text-primary-700" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Phân tích Dữ liệu
                  </h4>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">8 Bài giảng</p>
                </div>
              </div>
            </div>

            {/* Banner Sự Kiện Sắp Tới */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 block">
                  SỰ KIỆN SẮP TỚI
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                  Hội thảo: Tương lai của Fintech & AI trong Giáo dục
                </h4>
                <p className="text-xs text-slate-400 font-normal">
                  Trực tuyến • Thứ 7, 24 Tháng 10, 2026
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-primary-600 group-hover:text-white text-slate-700 flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 5. Modal Bộ Lọc Thêm */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Bộ Lọc Nâng Cao</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hình thức buổi học */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                HÌNH THỨC BUỔI HỌC
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Tất cả', value: 'ALL' },
                  { label: 'Lớp 1:1', value: 'ONE_ON_ONE' },
                  { label: 'Lớp nhóm', value: 'GROUP' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setAdvancedFilter((prev) => ({
                        ...prev,
                        sessionType: opt.value as any,
                      }))
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      advancedFilter.sessionType === opt.value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Điểm uy tín tối thiểu */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                ĐIỂM UY TÍN TỐI THIỂU
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Tất cả', value: 0 },
                  { label: '≥ 90 điểm', value: 90 },
                  { label: '100 điểm', value: 100 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setAdvancedFilter((prev) => ({
                        ...prev,
                        minTrustScore: opt.value,
                      }))
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      advancedFilter.minTrustScore === opt.value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAdvancedFilter({
                    sessionType: 'ALL',
                    minTrustScore: 0,
                    sortBy: 'relevance',
                  });
                }}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-2xs cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};