import React from 'react';
import { Users } from 'lucide-react';

export const CreateGroupHeaderBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#134434] to-[#1A5743] border border-emerald-900/40 p-6 sm:p-8 md:p-10 rounded-3xl shadow-xs text-white">
      {/* Decorative Background Glows */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1 backdrop-blur-xs">
          <Users className="w-3.5 h-3.5 text-emerald-300" />
          <span>KHỞI TẠO CỘNG ĐỒNG HỌC TẬP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          Tạo Nhóm Học Tập Mới
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
          Tạo không gian chuyên môn để cùng thảo luận, chia sẻ tài liệu và giải đáp bài tập cùng các bạn sinh viên UniTime.
        </p>
      </div>
    </div>
  );
};
