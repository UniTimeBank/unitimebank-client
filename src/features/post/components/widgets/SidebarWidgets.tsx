import React from 'react';
import { ShieldCheck, Video, Clock, Plus, Minus, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_ACTIVE_SESSIONS, SAMPLE_LEDGER_TRANSACTIONS } from '../../constants';

interface SidebarWidgetsProps {
  trustScore?: number;
  balanceHours?: number;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  trustScore = 98,
  balanceHours = 12.5,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Widget 1: ĐIỂM UY TÍN CỦA BẠN */}
      <div className="bg-[#1b2a3a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="text-3xs font-extrabold uppercase tracking-widest text-gray-400 mb-2">
          ĐIỂM UY TÍN CỦA BẠN
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-black tracking-tight">{trustScore}</span>
          <span className="text-sm font-semibold text-gray-300">Điểm uy tín</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, trustScore)}%` }}
          />
        </div>

        <p className="text-xs text-gray-300 leading-relaxed flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Bạn nằm trong Top 5% sinh viên dạy tích cực tuần này!</span>
        </p>

        {/* Background Accent Watermark */}
        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 pointer-events-none" />
      </div>

      {/* Widget 2: Buổi học đang diễn ra */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Buổi học đang diễn ra</h3>
          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
            {SAMPLE_ACTIVE_SESSIONS.length} PHÒNG
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {SAMPLE_ACTIVE_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  session.color === 'teal' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {session.type === 'video' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{session.title}</div>
                <div
                  className={`text-3xs font-semibold flex items-center gap-1 ${
                    session.color === 'teal' ? 'text-teal-600' : 'text-gray-500'
                  }`}
                >
                  {session.color === 'teal' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  )}
                  <span>{session.subtitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors py-1 cursor-pointer">
          Quản lý tất cả phòng học
        </button>
      </div>

      {/* Widget 3: Sổ cái thời gian */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Sổ cái Thời gian</h3>
          <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-gray-100 text-gray-700">
            Dư: {balanceHours}h
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {SAMPLE_LEDGER_TRANSACTIONS.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    item.type === 'plus'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {item.type === 'plus' ? (
                    <Plus className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">{item.title}</div>
                  <div className="text-3xs text-gray-400">{item.time}</div>
                </div>
              </div>
              <span
                className={`text-xs font-black ${
                  item.type === 'plus' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {item.amount}
              </span>
            </div>
          ))}
        </div>

        <Link
          to="/profile"
          className="flex items-center justify-center gap-1 w-full text-center text-xs font-bold text-gray-700 hover:text-primary-600 transition-colors pt-2 border-t border-gray-100"
        >
          <span>Xem sao kê chi tiết</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Widget 4: Workshop Event Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs group cursor-pointer">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"
          alt="Workshop"
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end">
          <span className="w-fit px-2 py-0.5 rounded-md text-3xs font-extrabold bg-teal-400 text-gray-900 uppercase tracking-wider mb-1.5">
            SỰ KIỆN
          </span>
          <h4 className="text-sm font-bold text-white leading-tight">
            Workshop Tư Duy Thiết Kế: Thứ 4, 18:00
          </h4>
        </div>
      </div>
    </div>
  );
};
