import React, { useState } from 'react';
import { Modal, Button } from '@/shared/components/ui';

export interface LeaderboardFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardFormulaModal: React.FC<LeaderboardFormulaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mentor' | 'learner'>('mentor');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Cách tính điểm xếp hạng"
    >
      <div className="space-y-4">
        {/* Clean Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('mentor')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'mentor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Người dạy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('learner')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'learner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Học viên
          </button>
        </div>

        {/* Clean Minimalist List */}
        {activeTab === 'mentor' ? (
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Đánh giá trung bình</p>
                <p className="text-[11px] text-slate-400">Số sao nhận được từ học viên</p>
              </div>
              <span className="font-bold text-slate-700">Sao × 200 điểm</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Thời gian hướng dẫn</p>
                <p className="text-[11px] text-slate-400">Thời lượng dạy trực tuyến</p>
              </div>
              <span className="font-bold text-slate-700">+0.5 điểm / phút</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Số lượng học viên</p>
                <p className="text-[11px] text-slate-400">Mỗi học viên đã kèm cặp</p>
              </div>
              <span className="font-bold text-slate-700">+10 điểm / bạn</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Đánh giá 5 sao</p>
                <p className="text-[11px] text-slate-400">Thưởng cho mỗi đánh giá tối đa</p>
              </div>
              <span className="font-bold text-slate-700">+15 điểm / lượt</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Thời gian học tập</p>
                <p className="text-[11px] text-slate-400">Thời lượng tham gia học hỏi</p>
              </div>
              <span className="font-bold text-slate-700">+1.0 điểm / phút</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Buổi học hoàn thành</p>
                <p className="text-[11px] text-slate-400">Kết thúc trọn vẹn 1 buổi học</p>
              </div>
              <span className="font-bold text-slate-700">+25 điểm / buổi</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Gửi đánh giá</p>
                <p className="text-[11px] text-slate-400">Nhận xét đóng góp sau buổi học</p>
              </div>
              <span className="font-bold text-slate-700">+15 điểm / lượt</span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-400 pt-1">
          Điểm xếp hạng được cập nhật tự động sau mỗi buổi học và đánh giá hoàn tất.
        </p>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
