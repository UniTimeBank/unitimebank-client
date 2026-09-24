import React, { useMemo } from 'react';
import { Trophy, HelpCircle, Award, Flame, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/shared/components/ui';

export interface LeaderboardHeaderBannerProps {
  activeTab: 'mentors' | 'learners';
  onTabChange: (tab: 'mentors' | 'learners') => void;
  timeframe: 'all' | 'month' | 'quarter' | 'year';
  onTimeframeChange: (tf: 'all' | 'month' | 'quarter' | 'year') => void;
  period: string;
  onPeriodChange: (period: string) => void;
  onOpenFormula: () => void;
}

export const LeaderboardHeaderBanner: React.FC<LeaderboardHeaderBannerProps> = ({
  activeTab,
  onTabChange,
  timeframe,
  onTimeframeChange,
  period,
  onPeriodChange,
  onOpenFormula,
}) => {
  // 1. Tạo danh sách các tháng gần nhất (12 tháng)
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const val = `${y}-${m}`;
      const label = i === 0 ? `Tháng ${d.getMonth() + 1}/${y} (Hiện tại)` : `Tháng ${d.getMonth() + 1}/${y}`;
      options.push({ value: val, label });
    }
    return options;
  }, []);

  // 2. Tạo danh sách các quý gần nhất (8 quý)
  const quarterOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    const curYear = now.getFullYear();
    const curQ = Math.floor(now.getMonth() / 3) + 1;
    let y = curYear;
    let q = curQ;
    for (let i = 0; i < 8; i++) {
      const val = `${y}-Q${q}`;
      const label = i === 0 ? `Quý ${q}/${y} (Hiện tại)` : `Quý ${q}/${y}`;
      options.push({ value: val, label });
      q--;
      if (q === 0) {
        q = 4;
        y--;
      }
    }
    return options;
  }, []);

  // 3. Tạo danh sách các năm gần nhất (5 năm)
  const yearOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const curYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const y = curYear - i;
      const val = `${y}`;
      const label = i === 0 ? `Năm ${y} (Hiện tại)` : `Năm ${y}`;
      options.push({ value: val, label });
    }
    return options;
  }, []);

  // Lựa chọn danh sách options theo timeframe hiện tại
  const currentOptions = useMemo(() => {
    if (timeframe === 'month') return monthOptions;
    if (timeframe === 'quarter') return quarterOptions;
    if (timeframe === 'year') return yearOptions;
    return [];
  }, [timeframe, monthOptions, quarterOptions, yearOptions]);

  const currentIndex = currentOptions.findIndex((opt) => opt.value === period);
  const canGoNext = currentIndex > 0;
  const canGoPrev = currentIndex >= 0 && currentIndex < currentOptions.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onPeriodChange(currentOptions[currentIndex + 1].value);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPeriodChange(currentOptions[currentIndex - 1].value);
    }
  };

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
        {/* Tab Selector */}
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

        {/* Timeframe Filter + Period Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1. Timeframe Mode Buttons */}
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
              Theo Tháng
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
              Theo Quý
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
              Theo Năm
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

          {/* 2. Specific Period Selector Dropdown & Stepper (When not 'all') */}
          {timeframe !== 'all' && currentOptions.length > 0 && (
            <div className="flex items-center gap-1 bg-[#0B2E22]/85 p-1 rounded-2xl border border-emerald-700/60 text-xs backdrop-blur-md shadow-inner">
              {/* Prev Button (Lùi về quá khứ) */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canGoPrev}
                title="Kỳ trước đó"
                className={`p-1.5 rounded-xl transition-all ${
                  canGoPrev
                    ? 'text-emerald-200 hover:text-white hover:bg-white/10 cursor-pointer active:scale-90'
                    : 'text-emerald-500/30 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dropdown Select from shared */}
              <div className="flex items-center">
                <Select
                  variant="glass"
                  value={period}
                  onChange={onPeriodChange}
                  options={currentOptions}
                  icon={<Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                  align="right"
                  className="w-auto"
                  triggerClassName="border-none py-1 px-2.5 hover:bg-white/10"
                />
              </div>

              {/* Next Button (Tiến về hiện tại) */}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                title="Kỳ sau đó"
                className={`p-1.5 rounded-xl transition-all ${
                  canGoNext
                    ? 'text-emerald-200 hover:text-white hover:bg-white/10 cursor-pointer active:scale-90'
                    : 'text-emerald-500/30 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
