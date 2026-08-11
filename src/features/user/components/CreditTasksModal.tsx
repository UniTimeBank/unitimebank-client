import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Gift,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui';
import { useGetOnboardingTasksQuery } from '@/core/api/user/userApi';

interface CreditTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (actionType: 'EDIT_PROFILE' | 'CREATE_SCHEDULE' | 'ADD_SKILL') => void;
}

export const CreditTasksModal: React.FC<CreditTasksModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: onboardingData, isLoading } = useGetOnboardingTasksQuery(undefined, {
    skip: !isOpen,
  });

  const handleTaskAction = (actionType: 'EDIT_PROFILE' | 'CREATE_SCHEDULE' | 'ADD_SKILL') => {
    onClose();
    if (location.pathname === '/profile') {
      if (onActionClick) {
        onActionClick(actionType);
      } else {
        // Fallback for profile page direct action
        if (actionType === 'EDIT_PROFILE') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (actionType === 'CREATE_SCHEDULE') {
          document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (actionType === 'ADD_SKILL') {
          document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      navigate('/profile', { state: { action: actionType } });
    }
  };

  const tasks = onboardingData?.tasks || [
    {
      taskKey: 'PROFILE_COMPLETE',
      title: 'Hoàn thành thông tin cá nhân',
      description: 'Cập nhật ảnh đại diện & tiểu sử cá nhân',
      rewardCredits: 10,
      completed: onboardingData?.profileCompleted || false,
    },
    {
      taskKey: 'PROFILE_SCHEDULE',
      title: 'Tạo lịch rảnh khả dụng',
      description: 'Thiết lập khung giờ rảnh để kết nối',
      rewardCredits: 10,
      completed: onboardingData?.scheduleCreated || false,
    },
    {
      taskKey: 'PROFILE_SKILL',
      title: 'Khai báo kỹ năng cá nhân',
      description: 'Thêm ít nhất 1 kỹ năng chuyên môn',
      rewardCredits: 10,
      completed: onboardingData?.skillAdded || false,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-500 text-white rounded-xl shadow-xs">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">
                Nhiệm Vụ Khởi Tạo (Nhận +30 Credit)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Hoàn thành các mốc nhập liệu thông tin để nhận thêm Credit thưởng
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Progress Bar & Bonus counter */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Tiến độ hoàn thành: {completedCount}/3 nhiệm vụ</span>
            <span className="text-primary-600 font-black">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
            <span>Đã nhận thưởng:</span>
            <span className="font-black text-primary-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              +{onboardingData?.totalBonusEarned || 0} Credit
            </span>
          </div>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-14 bg-slate-100 rounded-2xl" />
            <div className="h-14 bg-slate-100 rounded-2xl" />
            <div className="h-14 bg-slate-100 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {/* Task 1: Hồ sơ cơ bản */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                onboardingData?.profileCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {onboardingData?.profileCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      1. Thông tin cá nhân (Avatar + Bio)
                    </span>
                    <span className="px-2 py-0.2 bg-primary-50 text-primary-600 text-[10px] font-extrabold rounded-full border border-primary-100 shrink-0">
                      +10 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Cập nhật Ảnh đại diện & Tiểu sử mô tả bản thân
                  </p>
                </div>
              </div>
              {!onboardingData?.profileCompleted && (
                <button
                  type="button"
                  onClick={() => handleTaskAction('EDIT_PROFILE')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Cập nhật <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Task 2: Tạo lịch rảnh */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                onboardingData?.scheduleCreated
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {onboardingData?.scheduleCreated ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      2. Tạo lịch rảnh khả dụng
                    </span>
                    <span className="px-2 py-0.2 bg-primary-50 text-primary-600 text-[10px] font-extrabold rounded-full border border-primary-100 shrink-0">
                      +10 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Thiết lập khung giờ rảnh để nhận hướng dẫn/dạy học
                  </p>
                </div>
              </div>
              {!onboardingData?.scheduleCreated && (
                <button
                  type="button"
                  onClick={() => handleTaskAction('CREATE_SCHEDULE')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Tạo lịch <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Task 3: Thêm kỹ năng */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                onboardingData?.skillAdded
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {onboardingData?.skillAdded ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      3. Khai báo kỹ năng
                    </span>
                    <span className="px-2 py-0.2 bg-primary-50 text-primary-600 text-[10px] font-extrabold rounded-full border border-primary-100 shrink-0">
                      +10 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Thêm ít nhất 1 kỹ năng thế mạnh vào hồ sơ
                  </p>
                </div>
              </div>
              {!onboardingData?.skillAdded && (
                <button
                  type="button"
                  onClick={() => handleTaskAction('ADD_SKILL')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Thêm skill <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
