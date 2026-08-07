import React from 'react';
import { Flame, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { DAYS_REWARDS } from '../config';

interface DailyCheckinWidgetProps {
  currentStreak?: number;
  hasCheckedInToday?: boolean;
  rewardMessage?: string | null;
  onCheckin?: () => void;
  isCheckinLoading?: boolean;
}

export const DailyCheckinWidget: React.FC<DailyCheckinWidgetProps> = ({
  currentStreak = 3,
  hasCheckedInToday = false,
  rewardMessage,
  onCheckin,
  isCheckinLoading = false,
}) => {
  return (
    <div className="bg-[#0B654D] text-white rounded-2xl p-6 shadow-xs border border-emerald-700/30">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-600/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-emerald-100 font-extrabold text-xs rounded-full border border-white/20">
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Ngày {currentStreak} / 7</span>
            </span>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Điểm danh nhận thưởng hàng ngày
            </h3>
          </div>
          <p className="text-xs text-emerald-100/90 font-medium">
            Đăng nhập đủ 7 ngày tích lũy để nhận trọn vẹn 60 credit thưởng (= 1 giờ học miễn phí)!
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckin}
          disabled={hasCheckedInToday || isCheckinLoading}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            hasCheckedInToday
              ? 'bg-white/15 text-emerald-100 border border-white/20 cursor-default'
              : 'bg-white hover:bg-emerald-50 text-[#0B654D] active:scale-95'
          } disabled:opacity-90 disabled:cursor-not-allowed flex-shrink-0 self-stretch sm:self-auto`}
        >
          {isCheckinLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#0B654D]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Đang xử lý...</span>
            </>
          ) : hasCheckedInToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Đã điểm danh hôm nay</span>
            </>
          ) : (
            <>
              <span>Điểm danh hôm nay</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification Banner */}
      {rewardMessage && (
        <div className="mb-5 px-4 py-3 bg-white/15 border border-white/20 rounded-xl text-xs font-semibold text-emerald-100 flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{rewardMessage}</span>
        </div>
      )}

      {/* 7 Days Progress Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {DAYS_REWARDS.map((item) => {
          const isDone = item.day <= currentStreak;
          const isToday = item.day === currentStreak + 1 && !hasCheckedInToday;

          return (
            <div
              key={item.day}
              className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all ${
                isDone
                  ? 'bg-[#128B6B] border-emerald-400/30 text-white font-bold shadow-2xs'
                  : isToday
                  ? 'bg-[#128B6B] border-2 border-amber-300 text-amber-200 shadow-xs ring-2 ring-amber-400/30'
                  : 'bg-white/10 border-white/15 text-emerald-100/70'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDone
                    ? 'text-white/90'
                    : isToday
                    ? 'text-amber-200'
                    : 'text-emerald-100/60'
                }`}
              >
                NGÀY {item.day}
              </span>

              <span
                className={`text-sm font-black my-1.5 ${
                  isDone
                    ? 'text-white'
                    : isToday
                    ? 'text-amber-200'
                    : 'text-emerald-100'
                }`}
              >
                +{item.amount}m
              </span>

              <div className="text-[10px] font-bold h-4 flex items-center justify-center">
                {isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-300/30 text-emerald-100 flex items-center justify-center font-black">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : isToday ? (
                  <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded uppercase tracking-wider">
                    HÔM NAY
                  </span>
                ) : (
                  <span className="text-emerald-100/50 font-medium">Chờ nhận</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
