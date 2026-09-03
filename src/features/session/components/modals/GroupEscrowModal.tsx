import React, { useMemo } from 'react';
import {
  Coins,
  Users,
  Clock,
  RotateCw,
  Info,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui';
import type { GroupRoomStatsResponse } from '../../types';

interface GroupEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: GroupRoomStatsResponse | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const GroupEscrowModal: React.FC<GroupEscrowModalProps> = ({
  isOpen,
  onClose,
  stats,
  isLoading,
  onRefresh,
}) => {
  const totalCredits = stats?.accumulatedCredits ?? 0;
  const rawLearners = stats?.learners ?? [];

  // Khử trùng lặp học viên theo userId
  const learners = useMemo(() => {
    const map = new Map<string, (typeof rawLearners)[0]>();
    for (const l of rawLearners) {
      if (!map.has(l.userId)) {
        map.set(l.userId, l);
      }
    }
    return Array.from(map.values());
  }, [rawLearners]);

  const activeCount = learners.filter((l) => l.connectionStatus === 'ONLINE').length;
  const totalCount = learners.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Quỹ tạm giữ buổi học"
      description="Tổng hợp số Credit tích lũy từ các học viên trong phòng"
    >
      <div className="space-y-5">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Escrow */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>Tạm thu</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-900">+{totalCredits}</span>
              <span className="text-xs font-semibold text-amber-700">Credit</span>
            </div>
          </div>

          {/* Card 2: Learners Count */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Học viên</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{activeCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalCount} người</span>
            </div>
          </div>

          {/* Card 3: Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Cơ chế tính</span>
            </div>
            <div className="mt-1.5 text-xs text-slate-700 font-medium leading-relaxed">
              1 Credit / phút <span className="text-slate-400 font-normal">(5p đầu free)</span>
            </div>
          </div>
        </div>

        {/* Participant Breakdown List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Danh sách đóng góp</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                {learners.length}
              </span>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Cập nhật</span>
              </button>
            )}
          </div>

          {learners.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs text-slate-500">Chưa có học viên nào tham gia</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white">
              {learners.map((learner, idx) => {
                const isOnline = learner.connectionStatus === 'ONLINE';
                const activeMinutes = Math.floor(learner.activeSeconds / 60);
                const activeSecondsMod = learner.activeSeconds % 60;
                const isFreeTrial = learner.freeSecondsRemaining > 0;

                return (
                  <div
                    key={learner.id || learner.userId || idx}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Left: User info + Status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {learner.userId?.slice(0, 2).toUpperCase() || 'HV'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            Học viên #{learner.userId?.slice(0, 8)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                              isOnline
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {isOnline ? 'Đang học' : 'Đã rời'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>
                            Thời gian: {activeMinutes.toString().padStart(2, '0')}:
                            {activeSecondsMod.toString().padStart(2, '0')}
                          </span>
                          <span>•</span>
                          {isFreeTrial ? (
                            <span className="text-slate-500">
                              Học thử (còn {learner.freeSecondsRemaining}s)
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              Tính phí: {learner.paidMinutes} phút
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Credit contribution */}
                    <div className="text-right shrink-0 pl-3">
                      <span
                        className={`text-xs font-bold ${
                          learner.creditsContributed > 0
                            ? 'text-amber-700'
                            : 'text-slate-400 font-normal'
                        }`}
                      >
                        +{learner.creditsContributed} Credit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Explanatory Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Số Credit tạm thu sẽ được tự động cộng vào ví của bạn sau khi bạn nhấn{' '}
            <strong className="text-slate-800 font-semibold">"Kết thúc"</strong> buổi học.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
