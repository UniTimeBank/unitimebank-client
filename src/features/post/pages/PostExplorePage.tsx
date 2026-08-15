import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';
import { useActiveRole } from '@/shared/hooks/useActiveRole';
import { useMentorPosts, useLearnerRequests } from '../hooks';
import {
  TrendingExchanges,
  SidebarWidgets,
  MentorPostCard,
  LearnerRequestCard,
} from '../components';
import { toast } from '@/shared/utils';

export const PostExplorePage: React.FC = () => {
  const { isMentor, activeRole } = useActiveRole();
  const [feedType, setFeedType] = useState<'MENTOR_POSTS' | 'LEARNER_REQUESTS'>(
    isMentor ? 'LEARNER_REQUESTS' : 'MENTOR_POSTS'
  );

  // Tự động đồng bộ feedType khi người dùng chuyển đổi vai trò
  useEffect(() => {
    setFeedType(isMentor ? 'LEARNER_REQUESTS' : 'MENTOR_POSTS');
  }, [isMentor]);

  const [activeTab, setActiveTab] = useState<'Dành cho bạn' | 'Mới nhất' | 'Đang theo dõi'>(
    'Dành cho bạn'
  );

  // Custom Hooks fetching data from DB
  const { posts: mentorPosts, isLoading: isLoadingMentors } = useMentorPosts({ page: 1, limit: 10 });
  const { requests: learnerRequests, isLoading: isLoadingLearners } = useLearnerRequests({ page: 1, limit: 10 });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Top Trending Exchanges Section */}
        <TrendingExchanges />

        {/* 2. Main Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Feed (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Filter Tabs Header */}
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <div className="flex items-center gap-8">
                {(['Dành cho bạn', 'Mới nhất', 'Đang theo dõi'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm transition-all relative pb-3 -mb-3 cursor-pointer ${
                      activeTab === tab
                        ? 'text-gray-900 border-b-2 border-primary-500 font-black'
                        : 'text-gray-400 hover:text-gray-700 font-bold'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: MENTOR POSTS */}
            {feedType === 'MENTOR_POSTS' && (
              <>
                {isLoadingMentors ? (
                  <div className="py-12 text-center text-xs font-bold text-gray-400">
                    Đang tải danh sách bài dạy...
                  </div>
                ) : mentorPosts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-3">
                    <p className="text-xs font-bold text-gray-500">Chưa có bài dạy nào từ Mentor.</p>
                    <Link
                      to="/requests"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Đăng bài dạy đầu tiên</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mentorPosts.map((post) => (
                      <MentorPostCard key={post._id} post={post} variant="vertical" />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: LEARNER REQUESTS */}
            {feedType === 'LEARNER_REQUESTS' && (
              <>
                {isLoadingLearners ? (
                  <div className="py-12 text-center text-xs font-bold text-gray-400">
                    Đang tải danh sách yêu cầu học...
                  </div>
                ) : learnerRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-3">
                    <p className="text-xs font-bold text-gray-500">Chưa có yêu cầu tìm người dạy nào.</p>
                    <Link
                      to="/requests"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Đăng yêu cầu học viên</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {learnerRequests.map((req) => (
                      <LearnerRequestCard
                        key={req._id}
                        request={req}
                        onTeachClick={(r) =>
                          toast.success('Đề nghị dạy môn này', `Bạn đã chọn đề nghị dạy bài "${r.skillNeeded}"!`)
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Widgets (4 Cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <SidebarWidgets trustScore={98} balanceHours={12.5} />
          </div>
        </div>
      </div>
    </div>
  );
};
