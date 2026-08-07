import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sprout } from 'lucide-react';
import { TrustScoreGauge } from '@/shared/components';

interface MyselfStatsGridProps {
  credits: number;
  trustScore: number;
}

export const MyselfStatsGrid: React.FC<MyselfStatsGridProps> = ({
  credits,
  trustScore,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {/* Card 1: Current Balance */}
      <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Số dư hiện tại
            </span>
            <TrendingUp className="w-4 h-4 text-primary-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900 tracking-tight">{credits}</span>
            <span className="text-sm font-medium text-gray-500">Credit</span>
          </div>
          <p className="text-xs text-primary-600 font-semibold mt-2 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-primary-500" />
            <span>Tích lũy thêm 15 credit tuần này</span>
          </p>
        </div>

        <Link
          to="/ledger"
          className="mt-6 w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors"
        >
          Xem lịch sử chi tiết
        </Link>
      </div>

      {/* Card 2: Reputation Score */}
      <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start">
          Điểm uy tín
        </span>
        <div className="my-auto py-2">
          <TrustScoreGauge score={trustScore} maxScore={10} label="XUẤT SẮC" subtitle="Dựa trên 24 lượt đánh giá từ bạn học" />
        </div>
      </div>

      {/* Card 3: Upcoming Sessions */}
      <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Buổi học sắp tới</h3>
            <Link to="/classes" className="text-xs font-semibold text-primary-500 hover:text-primary-600">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {/* Session Item 1 */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                alt="Sarah Chen"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">Advanced React Hooks</h4>
                <p className="text-[11px] text-gray-500">Người dạy: Sarah Chen • 45 phút</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-800 uppercase block">HÔM NAY</span>
                <span className="text-[10px] text-gray-500">14:00 - 14:45</span>
              </div>
            </div>

            {/* Session Item 2 */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                alt="James Miller"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">Ôn tập Kinh tế Vĩ mô</h4>
                <p className="text-[11px] text-gray-500">Người học: James Miller • 60 phút</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-800 uppercase block">NGÀY MAI</span>
                <span className="text-[10px] text-gray-500">10:30 - 11:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
