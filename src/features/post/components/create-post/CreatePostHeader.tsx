import React from 'react';
import { useActiveRole } from '@/shared/hooks/useActiveRole';

interface CreatePostHeaderProps {
  postType: 'MENTOR_OFFER' | 'LEARNER_REQUEST';
  onPostTypeChange?: (type: 'MENTOR_OFFER' | 'LEARNER_REQUEST') => void;
}

export const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({
  postType,
}) => {
  const { isMentor } = useActiveRole();

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-[#1b2a3a] text-white rounded-3xl p-8 md:p-10 shadow-xs border border-slate-800">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            TRANG ĐĂNG BÀI UNITIMEBANK
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {isMentor ? 'Đăng Bài Nhận Dạy Kèm' : 'Đăng Yêu Cầu Tìm Người Dạy Học'}
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal">
            {isMentor
              ? 'Thiết lập nội dung bài dạy, kỹ năng chia sẻ và khung giờ để học viên đăng ký học 1:1.'
              : 'Nêu rõ môn học cần hướng dẫn và thời lượng mong muốn để các Người dạy phù hợp liên hệ hỗ trợ.'}
          </p>
        </div>
      </div>
    </div>
  );
};
