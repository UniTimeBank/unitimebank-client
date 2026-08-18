import React from 'react';

export const CreatePostHeader: React.FC = () => {
  return (
    <div className="bg-[#1b2a3a] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs border border-slate-800">
      <div className="max-w-2xl space-y-2">
        <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block">
          TRANG ĐĂNG BÀI UNITIMEBANK
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
          Tạo Bài Đăng Mới
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
          Chia sẻ kỹ năng để tích lũy Credit hoặc đăng bài tìm người hướng dẫn kiến thức trong cộng đồng sinh viên.
        </p>
      </div>
    </div>
  );
};
