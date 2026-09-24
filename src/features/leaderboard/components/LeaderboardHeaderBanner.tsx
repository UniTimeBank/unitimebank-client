import React from 'react';
import { Trophy, HelpCircle, Award, Flame } from 'lucide-react';

export interface LeaderboardHeaderBannerProps {
  activeTab: 'mentors' | 'learners';
  onTabChange: (tab: 'mentors' | 'learners') => void;
  timeframe: 'all' | 'month' | 'quarter' | 'year';
  onTimeframeChange: (tf: 'all' | 'month' | 'quarter' | 'year') => void;
  onOpenFormula: () => void;
}

export const LeaderboardHeaderBanner: React.FC<LeaderboardHeaderBannerProps> = ({
  activeTab,
  onTabChange,
  timeframe,
  onTimeframeChange,
  onOpenFormula,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#134434] to-[#1A5743] border border-emerald-900/40 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xs text-white">
      {/* Decorative Background Glows */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* Top row: Title + Formula CTA */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2.5 backdrop-blur-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Bảng Vinh Danh UniTimeBank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Bảng Xếp Hạng Thành Tích
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-2xl font-normal leading-relaxed">
            Vinh danh những Gia sư / Người dạy tận tâm nhất và Học viên tích cực nhất trong cộng đồng trao đổi tri thức UniTimeBank.
          </p>
        </div>

        {/* Formula Explanation Button */}
        <button
          type="button"
          onClick={onOpenFormula}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition-all backdrop-blur-md cursor-pointer self-start md:self-center shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span>Cách tính điểm xếp hạng</span>
        </button>
      </div>

      {/* Bottom row: Tabs & Timeframe Filter */}
      <div className="relative z-10 flex items-center justify-between mt-8 flex-wrap gap-4 pt-6 border-t border-emerald-800/60">
        <div className="flex items-center gap-2 bg-[#0B2E22]/70 p-1.5 rounded-2xl border border-emerald-800/60 backdrop-blur-md">
          <button
            type="button"
            onClick={() => onTabChange('mentors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mentors'
                ? 'bg-white text-[#0B2E22] shadow-md font-black'
                : 'text-emerald-100/80 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Người Dạy Tiêu Biểu</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('learners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'learners'
                ? 'bg-white text-[#0B2E22] shadow-md font-black'
                : 'text-emerald-100/80 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-blue-500" />
            <span>Top Học Viên Tích Cực</span>
          </button>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B2E22]/70 p-1.5 rounded-2xl border border-emerald-800/60 text-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => onTimeframeChange('month')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              timeframe === 'month'
                ? 'bg-white/20 text-white font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('quarter')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              timeframe === 'quarter'
                ? 'bg-white/20 text-white font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            Quý này
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('year')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              timeframe === 'year'
                ? 'bg-white/20 text-white font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            Năm nay
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-white/20 text-white font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            Toàn thời gian
          </button>
        </div>
      </div>
    </div>
  );
};
