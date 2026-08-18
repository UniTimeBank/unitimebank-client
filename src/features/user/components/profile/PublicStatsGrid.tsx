import React from 'react';
import { CheckCircle2, Clock, Timer, Coins, ShieldCheck, Zap } from 'lucide-react';
import { TrustScoreGauge } from '@/shared/components';

interface PublicStatsGridProps {
  trustScoreMax100: number;
  persona?: 'MENTOR' | 'LEARNER';
}

export const PublicStatsGrid: React.FC<PublicStatsGridProps> = ({
  trustScoreMax100,
  persona = 'MENTOR',
}) => {
  const isMentor = persona === 'MENTOR';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* Trust Score Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider self-start flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
          <span>{isMentor ? 'Điểm uy tín Người dạy (Mentor)' : 'Điểm uy tín Người học (Learner)'}</span>
        </span>
        <div className="my-auto py-3">
          <TrustScoreGauge
            score={isMentor ? trustScoreMax100 : 100}
            maxScore={100}
            label={isMentor ? 'XUẤT SẮC' : 'GƯƠNG MẪU'}
            size={130}
          />
        </div>
        <p className="text-[11px] text-gray-500">
          {isMentor
            ? 'Dựa trên 52 buổi hướng dẫn và đánh giá tích cực từ học viên.'
            : 'Dựa trên 14 buổi học thực tế, 0 lần bùng lịch và thái độ hợp tác tốt.'}
        </p>
      </div>

      {/* Attendance Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary-600" />
          <span>{isMentor ? 'Nhật ký giảng dạy' : 'Nhật ký tham gia học tập'}</span>
        </h3>
        <div className="space-y-3 text-xs flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isMentor ? 'Hoàn thành buổi dạy' : 'Tham gia đầy đủ các buổi'}</span>
            </span>
            <span className="font-extrabold text-gray-900">100%</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Tỷ lệ đúng giờ</span>
            </span>
            <span className="font-extrabold text-gray-900">{isMentor ? '96%' : '98%'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-purple-600" />
              <span>{isMentor ? 'Thời gian phản hồi TB' : 'Bùng lịch / No-show'}</span>
            </span>
            <span className="font-extrabold text-gray-900">{isMentor ? '2 giờ' : '0 lần'}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-600 flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-primary-500" />
              <span>{isMentor ? 'Tổng Credit nhận được' : 'Tổng thời gian đã học'}</span>
            </span>
            <span className="px-2.5 py-1 bg-primary-50 text-primary-600 font-extrabold rounded-lg">
              {isMentor ? '3,420 phút' : '1,860 phút'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

