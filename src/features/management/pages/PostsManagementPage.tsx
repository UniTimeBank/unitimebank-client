import React, { useState } from 'react';
import {
  FileText,
  Plus,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetMyMentorPostsQuery, useGetMyLearnerRequestsQuery } from '@/core/api/post';
import { Button } from '@/shared/components/ui';

export const PostsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MENTOR' | 'LEARNER'>('MENTOR');

  const { data: mentorPostsData } = useGetMyMentorPostsQuery();
  const { data: learnerRequestsData } = useGetMyLearnerRequestsQuery();

  const mentorPosts = mentorPostsData?.items || [];
  const learnerRequests = learnerRequestsData?.items || [];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Quản lý Bài đăng
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý các bài dạy kèm (Mentor Offer) và yêu cầu tìm gia sư (Learner Request) của bạn.
          </p>
        </div>

        <Link to="/requests">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2 px-4 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo bài đăng mới</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('MENTOR')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none relative flex items-center gap-2 ${
            activeTab === 'MENTOR'
              ? 'text-gray-900 font-extrabold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Lớp dạy của tôi ({mentorPosts.length})</span>
          {activeTab === 'MENTOR' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LEARNER')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none relative flex items-center gap-2 ${
            activeTab === 'LEARNER'
              ? 'text-gray-900 font-extrabold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Yêu cầu học của tôi ({learnerRequests.length})</span>
          {activeTab === 'LEARNER' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700 rounded-full" />
          )}
        </button>
      </div>

      {/* Dynamic List */}
      {activeTab === 'MENTOR' ? (
        mentorPosts.length === 0 ? (
          <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Chưa có bài đăng mở lớp dạy nào</h3>
            <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
              Hãy tạo một bài đăng chia sẻ tri thức để nhận thêm nhiều đề nghị đặt lịch từ học viên.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorPosts.map((post) => (
              <div
                key={post._id}
                className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-extrabold rounded-md uppercase">
                    {post.tags?.[0]?.skillName || 'LỚP HỌC'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Đang hiển thị</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 line-clamp-1">{post.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{post.shortDescription || post.description}</p>
                <div className="pt-2 flex items-center justify-between border-t border-gray-200/60">
                  <span className="text-xs text-gray-400 font-medium">
                    {post.availableSlots?.length || 0} khung giờ rảnh
                  </span>
                  <Link
                    to={`/posts/mentor/${post._id}`}
                    className="text-xs font-bold text-primary-700 hover:text-primary-800"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : learnerRequests.length === 0 ? (
        <div className="bg-gray-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Chưa có yêu cầu tìm gia sư nào</h3>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            Khi bạn đăng bài tìm người hướng dẫn 1-1, bài đăng sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learnerRequests.map((req) => (
            <div
              key={req._id}
              className="bg-gray-50/70 rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-md uppercase">
                  {req.category || 'YÊU CẦU HỌC'}
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {req.expectedCreditAmount || 60} CR
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900 line-clamp-1">{req.skillNeeded}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{req.description}</p>
              <div className="pt-2 flex items-center justify-between border-t border-gray-200/60">
                <span className="text-xs text-gray-400 font-medium">
                  {req.desiredSlots?.length || 0} khung giờ mong muốn
                </span>
                <Link
                  to={`/posts/learner/${req._id}`}
                  className="text-xs font-bold text-primary-700 hover:text-primary-800"
                >
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
