import React from 'react';
import { CheckCircle2, Clock, Timer, Coins } from 'lucide-react';
import { TrustScoreGauge } from '@/shared/components';

interface PublicStatsGridProps {
  trustScoreMax100: number;
}

export const PublicStatsGrid: React.FC<PublicStatsGridProps> = ({
  trustScoreMax100,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* Trust Score Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start">
          Điểm uy tín
        </span>
        <div className="my-auto py-3">
          <TrustScoreGauge score={trustScoreMax100} maxScore={100} label="XUẤT SẮC" size={130} />
        </div>
        <p className="text-[11px] text-gray-500">
          Dựa trên 52 lượt kiểm duyệt bạn học và 100% tỷ lệ giải quyết khiếu nại.
        </p>
      </div>

      {/* Attendance Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Nhật ký tham gia
        </h3>
        <div className="space-y-3 text-xs flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hoàn thành buổi học</span>
            </span>
            <span className="font-extrabold text-gray-900">100%</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Tỷ lệ đúng giờ</span>
            </span>
            <span className="font-extrabold text-gray-900">96%</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-purple-600" />
              <span>Thời gian phản hồi TB</span>
            </span>
            <span className="font-extrabold text-gray-900">2 giờ</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-primary-500" />
              <span>Tổng Credit kiếm được</span>
            </span>
            <span className="px-2.5 py-1 bg-primary-50 text-primary-500 font-extrabold rounded-lg">
              3,420 phút
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
