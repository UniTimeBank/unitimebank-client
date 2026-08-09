import React from 'react';

interface CreatePostHeaderProps {
  postType: 'MENTOR_OFFER' | 'LEARNER_REQUEST';
  onPostTypeChange: (type: 'MENTOR_OFFER' | 'LEARNER_REQUEST') => void;
}

export const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({
  postType,
  onPostTypeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-[#1b2a3a] text-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-800">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            TRANG ĐĂNG BÀI UNITIMEBANK
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Tạo Bài Đăng Mới
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Đăng bài dạy kỹ năng để chia sẻ kiến thức (nhận Credit) hoặc đăng bài tìm Mentor hướng dẫn môn học (trả Credit).
          </p>
        </div>
      </div>

      {/* POST TYPE SWITCHER (Nút chuyển loại bài đăng) */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider px-3">
          CHỌN LOẠI BÀI ĐĂNG:
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          {/* Button 1: Bài Dạy */}
          <button
            type="button"
            onClick={() => onPostTypeChange('MENTOR_OFFER')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
              postType === 'MENTOR_OFFER'
                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            ĐĂNG BÀI DẠY (Tích lũy Credit)
          </button>

          {/* Button 2: Yêu Cầu Học */}
          <button
            type="button"
            onClick={() => onPostTypeChange('LEARNER_REQUEST')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
              postType === 'LEARNER_REQUEST'
                ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            ĐĂNG YÊU CẦU HỌC (Sử dụng Credit)
          </button>
        </div>
      </div>
    </div>
  );
};
