import React from 'react';
import { ShieldCheck, ShieldAlert, Award, TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useGetTrustScoreHistoryQuery } from '@/core/api/moderation';

export interface TrustScoreHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

const REASON_LABELS: Record<string, string> = {
  SESSION_COMPLETED: 'Hoàn thành buổi học',
  RATING_5_STAR: 'Nhận đánh giá 5 sao',
  RATING_4_STAR: 'Nhận đánh giá 4 sao',
  RATING_2_STAR: 'Nhận đánh giá 2 sao',
  RATING_1_STAR: 'Nhận đánh giá 1 sao',
  LAST_MINUTE_CANCEL: 'Hủy lịch sát giờ (< 2 tiếng)',
  NO_SHOW: 'Vắng mặt không báo trước (No-show)',
  AFK_REPORTED: 'Rời phòng giữa chừng',
  TOXIC_LANGUAGE: 'Vi phạm chuẩn mực giao tiếp',
  FRAUD: 'Gian lận Credit / Lừa đảo',
  ADMIN_ADJUSTMENT: 'Điều chỉnh từ Quản trị viên',
};

export const TrustScoreHistoryModal: React.FC<TrustScoreHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName = 'Thành viên',
}) => {
  const { data, isLoading } = useGetTrustScoreHistoryQuery(userId, { skip: !isOpen });

  const trustScore = data?.trustScore;
  const history = data?.history || [];

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'EXCELLENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Xuất Sắc ⭐</span>;
      case 'GOOD':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Uy Tín Cao 🛡️</span>;
      case 'AVERAGE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Tiêu Chuẩn</span>;
      case 'WARNING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">Cảnh Báo ⚠️</span>;
      case 'LOCKED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Bị Giới Hạn 🔒</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">Tốt</span>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Lịch sử điểm uy tín (Trust Score)">
      <div className="space-y-5 pt-1">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-primary-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-200 font-medium">Điểm uy tín của {userName}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white">
                  {trustScore ? trustScore.score : 100}
                </span>
                <span className="text-xs text-primary-200">/ 200 điểm</span>
              </div>
            </div>
            <div>{getTierBadge(trustScore?.tier)}</div>
          </div>
        </div>

        {/* Explain Rule */}
        <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
          💡 <span className="font-semibold text-gray-700">Cơ chế Trust Score:</span> Mặc định khởi tạo 100 điểm. Mỗi đánh giá 5 sao (+2đ), 4 sao (+1đ). Hủy sát giờ (-10đ), vắng mặt không lý do (-15đ).
        </div>

        {/* History List */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>Biến động gần đây</span>
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Đang tải lịch sử...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              Chưa có biến động điểm uy tín nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => {
                const isPositive = item.delta > 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {REASON_LABELS[item.reason] || item.reason}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(item.occurredAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-extrabold text-xs ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? `+${item.delta}` : item.delta}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
