import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface CommunityHeaderBannerProps {
  onOpenCreateModal: () => void;
}

export const CommunityHeaderBanner: React.FC<CommunityHeaderBannerProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#134434] to-[#1A5743] border border-emerald-900/40 p-6 sm:p-8 rounded-3xl shadow-xs text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative Background Glows */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-60 h-60 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2.5 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Cộng đồng học tập UniTime</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Nhóm Học Tập & Trao Đổi Chuyên Môn
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 font-normal leading-relaxed">
          Mỗi nhóm là một không gian trao đổi độc lập. Cùng nhau đặt câu hỏi, chia sẻ tài liệu ôn thi và tìm bạn đồng hành cùng tiến bộ!
        </p>
      </div>

      {/* Right CTA Button */}
      <div className="relative z-10 shrink-0">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-[#0B2E22] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#0B2E22]" />
          <span>Tạo Nhóm Mới</span>
        </button>
      </div>
    </div>
  );
};
