import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMentorPosts, usePostRecommendations } from '../hooks';
import {
  TrendingExchanges,
  SidebarWidgets,
  MentorPostCard,
} from '../components';
import type { MentorPost } from '../types';

export const PostExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Dành cho bạn' | 'Mới nhất' | 'Đang theo dõi'>(
    'Dành cho bạn'
  );

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
                <Link
                  to="/requests"
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng bài mới</span>
                </Link>
              </div>
            </div>

            {/* Feed Grid - Vertical Post Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayedPosts.map((post) => (
                <MentorPostCard
                  key={post._id}
                  post={post}
                  variant="vertical"
                  onSelect={(p) => toast.success(`Xem chi tiết bài dạy: ${p.title}`)}
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
    </div>
  );
};
