import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Handshake } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import { useGetLearnerRequestByIdQuery } from '@/core/api/post/postApi';
import { LearnerRequestHeader, LearnerDesiredSlotsTable } from '../components/details';
import { RichTextViewer } from '../components/create-post/RichTextEditor';

export const LearnerRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, error } = useGetLearnerRequestByIdQuery(id || '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Đang tải chi tiết yêu cầu học...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 max-w-md">
          <h3 className="text-lg font-black text-gray-900">Không tìm thấy yêu cầu</h3>
          <p className="text-xs text-gray-500 font-medium">
            Bài đăng tìm người dạy này không tồn tại hoặc đã bị gỡ.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Khám phá</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Back */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách yêu cầu</span>
        </Link>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Component */}
            <LearnerRequestHeader request={request} />

            {/* Content & Problem Explanation Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
                Chi Tiết Bài Tập & Thắc Mắc Cần Giải Đáp
              </h3>
              {request.description ? (
                <RichTextViewer content={request.description} />
              ) : (
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {request.shortDescription || 'Học viên chưa mô tả thêm chi tiết nội dung vướng mắc.'}
                </p>
              )}
            </div>

            {/* Desired Schedule Table Component */}
            <LearnerDesiredSlotsTable slots={request.desiredSlots} />
          </div>

          {/* Right Action Sidebar (4 Cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                {(request.learnerName || 'H').charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">{request.learnerName || 'Học viên UniTime'}</h4>
                <p className="text-xs font-semibold text-gray-500">Đang tìm Mentor hướng dẫn</p>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={() => toast.success('Đã gửi thông báo đề nghị dạy', 'Learner sẽ xem profile của bạn để chốt lịch!')}
                  leftIcon={<Handshake className="w-4 h-4" />}
                  className="rounded-xl font-bold text-xs"
                >
                  <span>Tôi Có Thể Dạy Môn Này</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="md"
                  onClick={() => toast.info('Nhắn tin với Học viên', 'Tính năng trò chuyện trực tiếp đang phát triển')}
                  leftIcon={<MessageSquare className="w-4 h-4 text-gray-500" />}
                  className="rounded-xl font-bold text-xs"
                >
                  <span>Gửi tin nhắn</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
