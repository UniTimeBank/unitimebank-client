import React from 'react';
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
    <div className="bg-[#0B654D] text-white rounded-2xl p-6 shadow-sm mb-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-600/40">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/15 text-emerald-100 font-bold text-xs rounded-full border border-white/20">
              Ngày {currentStreak} / 7
            </span>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Điểm danh nhận thưởng hàng ngày
            </h3>
          </div>
          <p className="text-xs text-emerald-100/90 font-medium mt-1">
            Đăng nhập đủ 7 ngày tích lũy để nhận trọn vẹn 60 credit thưởng (= 1 giờ học miễn phí)!
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckin}
          disabled={hasCheckedInToday || isCheckinLoading}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            hasCheckedInToday
              ? 'bg-white/15 text-emerald-100 border border-white/20 font-bold'
              : 'bg-white hover:bg-emerald-50 text-[#0B654D] active:scale-95'
          } disabled:opacity-90 disabled:cursor-not-allowed`}
        >
          {isCheckinLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-[#0B654D]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Đang xử lý...</span>
            </>
          ) : hasCheckedInToday ? (
            '✓ Đã điểm danh hôm nay'
          ) : (
            'Điểm danh hôm nay'
          )}
        </button>
      </div>

      {/* Success Notification Banner */}
      {rewardMessage && (
        <div className="mb-5 px-4 py-2.5 bg-white/15 border border-white/20 rounded-xl text-xs font-semibold text-emerald-100 flex items-center gap-2 animate-in fade-in duration-200">
          <svg className="w-4 h-4 text-emerald-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{rewardMessage}</span>
        </div>
      )}

      {/* 7 Days Progress Grid - Light & Clean Upcoming Days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {DAYS_REWARDS.map((item) => {
          const isDone = item.day <= currentStreak;
          const isToday = item.day === currentStreak + 1 && !hasCheckedInToday;

          return (
            <div
              key={item.day}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all ${
                isDone
                  ? 'bg-[#128B6B] border border-emerald-300/40 text-white font-bold shadow-2xs'
                  : isToday
                  ? 'bg-[#128B6B] border-2 border-amber-300 text-amber-200 shadow-xs ring-2 ring-amber-400/30'
                  : 'bg-white/10 border border-white/20 text-emerald-100/70 font-medium'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-white/90' : 'text-emerald-100/70'}`}>
                NGÀY {item.day}
              </span>

              <span className={`text-xs font-extrabold my-1 ${isDone ? 'text-white' : 'text-emerald-100'}`}>
                +{item.amount}m
              </span>

              <div className="text-[10px] font-bold">
                {isDone ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-200 font-extrabold">
                    ✓
                  </span>
                ) : isToday ? (
                  <span className="text-amber-300 font-extrabold uppercase text-[9px] tracking-wider">
                    HÔM NAY
                  </span>
                ) : (
                  <span className="text-emerald-100/60 font-medium">Chờ nhận</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
