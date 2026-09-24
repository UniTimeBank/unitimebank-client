import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface CommunityHeaderBannerProps {
  onOpenCreateModal: () => void;
}

export const CommunityHeaderBanner: React.FC<CommunityHeaderBannerProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="bg-gradient-to-r from-primary-600 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cộng đồng học tập UniTime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Nhóm Học Tập & Trao Đổi Chuyên Môn
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 font-medium leading-relaxed">
            Mỗi nhóm là một không gian trao đổi độc lập. Cùng nhau đặt câu hỏi, chia sẻ tài liệu ôn thi và tìm bạn đồng hành cùng tiến bộ!
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-white text-primary-800 hover:bg-primary-50 font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer group"
        >
          <Plus className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
          <span>Tạo Nhóm Mới</span>
        </button>
      </div>
    </div>
  );
};
