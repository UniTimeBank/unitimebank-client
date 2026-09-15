import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';

export const AllPostsHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#134434] to-[#1A5743] border border-emerald-900/40 p-6 sm:p-8 rounded-3xl shadow-xs text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative Background Glows */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-60 h-60 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2.5 backdrop-blur-xs">
          <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
          <span>Sàn Tri Thức & Kết Nối Học Tập</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Tất Cả Lớp Học & Yêu Cầu Học Tập
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-xl font-normal leading-relaxed">
          Khám phá danh sách đầy đủ các lớp dạy kèm từ Mentor và các yêu cầu trợ giúp học tập từ sinh viên UniTimeBank.
        </p>
      </div>

      {/* Right CTA Button */}
      <div className="relative z-10 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="px-5 py-2.5 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-[#0B2E22] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#0B2E22]" />
          <span>Đăng bài mới</span>
        </button>
      </div>
    </div>
  );
};
