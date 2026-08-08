import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMentorPosts, usePostRecommendations } from '../hooks';
import {
  TrendingExchanges,
  SidebarWidgets,
  MentorPostCard,
  CreateMentorPostModal,
  CreateLearnerRequestModal,
} from '../components';
import type { MentorPost } from '../types';

export const PostExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Dành cho bạn' | 'Mới nhất' | 'Đang theo dõi'>(
    'Dành cho bạn'
  );
  const [isCreateMentorOpen, setIsCreateMentorOpen] = useState(false);
  const [isCreateLearnerOpen, setIsCreateLearnerOpen] = useState(false);

  // Custom Hooks
  const { posts, isLoading, refetch } = useMentorPosts({
    page: 1,
    limit: 10,
  });

  const { recommendedMentorPosts } = usePostRecommendations();

  // Mock sample posts nếu chưa có bài
  const sampleMentorPosts: MentorPost[] = [
    {
      _id: 'm1',
      mentorId: 'u101',
      mentorName: 'Markus Webb',
      mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      title: 'Lập trình Python & Phân tích Dữ liệu với Pandas',
      description:
        'Khóa hướng dẫn 1 giờ kèm cặp chi tiết giúp sinh viên ngành kinh tế, xã hội làm quen với thư viện Pandas và Matplotlib.',
      sessionType: 'BOTH' as any,
      tags: [{ skillName: 'PYTHON CƠ BẢN', category: 'LẬP TRÌNH' }],
      availableSlots: [{ dayOfWeek: 'THỨ HAI', startTime: '19:00', endTime: '20:00' }],
      trustScoreSnapshot: 98,
      status: 'PUBLISHED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'm2',
      mentorId: 'u102',
      mentorName: 'James T.',
      mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      title: 'Kỹ Thuật Xử Lý & Dựng Podcast Audio Cơ Bản',
      description:
        'Học cách lọc tạp âm, chèn nhạc chuyển đoạn và master âm thanh chuẩn Spotify bằng Audacity hoặc Logic Pro.',
      sessionType: 'ONE_ON_ONE' as any,
      tags: [{ skillName: 'BIÊN TẬP ÂM THANH', category: 'THIẾT KẾ' }],
      availableSlots: [],
      trustScoreSnapshot: 95,
      status: 'PUBLISHED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayedPosts = posts && posts.length > 0 ? posts : sampleMentorPosts;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 1. Top Trending Exchanges Section */}
        <TrendingExchanges />

        {/* 2. Main Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Feed (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <div className="flex items-center gap-8">
                {(['Dành cho bạn', 'Mới nhất', 'Đang theo dõi'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-black transition-all relative pb-3 -mb-3 cursor-pointer ${
                      activeTab === tab
                        ? 'text-gray-900 border-b-2 border-gray-900 font-black'
                        : 'text-gray-400 hover:text-gray-700 font-bold'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Quick Action Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateMentorOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng bài nhận dạy</span>
                </button>
              </div>
            </div>

            {/* Feed List */}
            <div className="flex flex-col gap-5">
              {/* Post 1: Markus Webb Mentor Post */}
              {displayedPosts[0] && (
                <MentorPostCard
                  post={displayedPosts[0]}
                  onSelect={(p) => alert(`Xem chi tiết bài dạy: ${p.title}`)}
                />
              )}

              {/* Interspersed Learner Request Card (Linda Chen) */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                      alt="Linda Chen"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900">Linda Chen </span>
                      <span className="text-3xs text-gray-400 font-normal">@lindac</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-red-50 text-red-600 border border-red-200">
                    CẦN GẤP
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 cursor-pointer">
                  Cần trợ giúp bài tập Kinh tế Vĩ mô (Mô hình IS-LM)?
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  Đang vướng mắc phần phân tích dịch chuyển mô hình IS-LM. Cần khoảng 45 phút bạn học cùng giải 3 bài tập này. Tặng kèm credit đầy đủ + 1 ly cafe!
                </p>

                <div className="flex items-center justify-between text-3xs font-bold text-gray-500 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <span>↪ 4 Người nhận dạy</span>
                    <span>❤️ 12 Thích</span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-800">
                    <span>Mức credit:</span>
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-extrabold text-xs">
                      45 phút (45 Credit)
                    </span>
                  </div>
                </div>
              </div>

              {/* Post 2: James T. Audio Editing */}
              {displayedPosts[1] && (
                <MentorPostCard
                  post={displayedPosts[1]}
                  onSelect={(p) => alert(`Xem chi tiết bài dạy: ${p.title}`)}
                />
              )}

              {/* Remaining Posts */}
              {displayedPosts.slice(2).map((post) => (
                <MentorPostCard
                  key={post._id}
                  post={post}
                  onSelect={(p) => alert(`Xem chi tiết bài dạy: ${p.title}`)}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar Widgets (4 Cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <SidebarWidgets trustScore={98} balanceHours={12.5} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateMentorPostModal
        isOpen={isCreateMentorOpen}
        onClose={() => setIsCreateMentorOpen(false)}
        onSuccess={() => refetch()}
      />
      <CreateLearnerRequestModal
        isOpen={isCreateLearnerOpen}
        onClose={() => setIsCreateLearnerOpen(false)}
      />
    </div>
  );
};
