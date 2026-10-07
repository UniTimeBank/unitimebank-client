import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { useMentorPosts, useLearnerRequests } from '../hooks';
import { UnifiedPostCard } from '../components/cards';
import { SessionType, type ExploreCardItem } from '../types';
import { mapMentorPostToCardItem, mapLearnerRequestToCardItem } from '../utils';
import { LiveGroupRoomsBanner } from '@/features/session/components';
import { CommunityExploreBento } from '@/features/post/components/community';
import { ExploreSplitHero } from '../components/explore';
import { Modal } from '@/shared/components/ui';

export const PostExplorePage: React.FC = () => {
  // Main Tab on Explore: 'MENTOR_POSTS' vs 'LEARNER_REQUESTS'
  const [exploreTab, setExploreTab] = useState<'MENTOR_POSTS' | 'LEARNER_REQUESTS'>('MENTOR_POSTS');

  // Custom Hooks fetching data from DB
  const { posts: mentorPosts, isLoading: isLoadingMentors } = useMentorPosts({ page: 1, limit: 30 });
  const { requests: learnerRequests, isLoading: isLoadingLearners } = useLearnerRequests({ page: 1, limit: 30 });

  // State tìm kiếm & bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Bộ lọc nâng cao
  const [advancedFilter, setAdvancedFilter] = useState({
    sessionType: 'ALL' as 'ALL' | SessionType,
    minTrustScore: 0,
    sortBy: 'relevance' as 'relevance' | 'newest' | 'trustScore',
  });

  // Chuyển đổi dữ liệu từ API sang định dạng ExploreCardItem
  const rawItems: ExploreCardItem[] = useMemo(() => {
    if (exploreTab === 'LEARNER_REQUESTS') {
      return learnerRequests.map(mapLearnerRequestToCardItem);
    } else {
      return mentorPosts.map(mapMentorPostToCardItem);
    }
  }, [exploreTab, mentorPosts, learnerRequests]);

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

  const isLoading = exploreTab === 'LEARNER_REQUESTS' ? isLoadingLearners : isLoadingMentors;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Split Hero 2 Cột Hiện đại & Sống động */}
      <ExploreSplitHero
        exploreTab={exploreTab}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        advancedFilter={advancedFilter}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
      />

      {/* 2. Banner Live Sảnh Học Nhóm Trực Tuyến */}
      <LiveGroupRoomsBanner
        selectedCategory={selectedCategory}
        searchKeyword={searchKeyword}
        sessionType={advancedFilter.sessionType}
        minTrustScore={advancedFilter.minTrustScore}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Section: Danh Sách Bài Đăng (Header tích hợp 2 Tab Pill Clean & Tinh Tế) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
          {/* Bên Trái: Tiêu đề danh sách chuẩn */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {exploreTab === 'LEARNER_REQUESTS'
                ? 'Yêu Cầu Học Tập Từ Sinh Viên'
                : 'Lớp Học Dạy Kèm Đề Xuất'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {exploreTab === 'LEARNER_REQUESTS'
                ? 'Các môn học sinh viên đang cần tìm Mentor hỗ trợ (Nhận dạy để tích lũy Credit).'
                : 'Tìm kiếm và đặt lịch học 1:1 hoặc tham gia lớp nhóm từ các Mentor xuất sắc.'}
            </p>
          </div>

          {/* Bên Phải: Clean Text Tabs (Không icon, không badge số lượng) + Xem Tất Cả */}
          <div className="flex items-center gap-4 shrink-0 flex-wrap">
            {/* Tab 1: Người Dạy */}
            <button
              type="button"
              onClick={() => setExploreTab('MENTOR_POSTS')}
              className={`text-xs transition-colors cursor-pointer py-1 ${
                exploreTab === 'MENTOR_POSTS'
                  ? 'text-primary-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <span>Người Dạy</span>
            </button>

            {/* Tab 2: Người Học */}
            <button
              type="button"
              onClick={() => setExploreTab('LEARNER_REQUESTS')}
              className={`text-xs transition-colors cursor-pointer py-1 ${
                exploreTab === 'LEARNER_REQUESTS'
                  ? 'text-primary-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <span>Người Học</span>
            </button>

            {/* Vách ngăn dọc mỏng */}
            <div className="h-3.5 w-[1px] bg-slate-200" />

            {/* Xem Tất Cả */}
            <Link
              to={exploreTab === 'LEARNER_REQUESTS' ? '/posts/all?tab=LEARNER_REQUESTS' : '/posts/all?tab=MENTOR_POSTS'}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-primary-700 transition-colors cursor-pointer py-1 group shrink-0"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors px-1 py-0.5"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
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
                    item.allSkills && item.allSkills.length > 0
                      ? item.allSkills
                      : item.secondaryTag
                      ? [item.secondaryTag]
                      : [],
                  authorId: item.authorId,
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
                  scheduleType: item.scheduleType as 'ALWAYS_OPEN' | 'LIMITED_TIME' | undefined,
                  timelineText: 'Trong 3 ngày',
                  createdAt: item.createdAt,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Section: Cộng Đồng Sinh Viên & Nhóm Học Thuật (Bento Grid Thay Thế Dữ Liệu Thực) */}
      <CommunityExploreBento />

      {/* 5. Modal Bộ Lọc Thêm */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Bộ Lọc Nâng Cao"
        size="md"
      >
        <div className="space-y-5 pt-1">
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
                      sessionType: opt.value as SessionType | 'ALL',
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
      </Modal>
    </div>
  );
};