import React, { useState } from 'react';
import { GraduationCap, Target, Wallet, Clock, Info, Rocket } from 'lucide-react';
import { Modal } from '@/shared/components/ui';
import { useCreateLearnerRequestMutation } from '@/core/api/post/postApi';
import { TIMELINE_OPTIONS } from '../constants';
import { SessionType } from '../types';

interface CreateLearnerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userCredits?: number;
}

export const CreateLearnerRequestModal: React.FC<CreateLearnerRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userCredits = 420,
}) => {
  const [createRequest, { isLoading }] = useCreateLearnerRequestMutation();

  const [subjectName, setSubjectName] = useState('');
  const [level, setLevel] = useState<'Người mới' | 'Trung bình' | 'Chuyên sâu'>('Trung bình');
  const [goals, setGoals] = useState('');
  const [category] = useState('HỌC THUẬT');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeline, setTimeline] = useState('Trong 3 ngày');

  const handleBroadcast = async () => {
    if (!subjectName.trim()) return;

    try {
      await createRequest({
        skillNeeded: subjectName,
        category,
        description: goals,
        sessionType: SessionType.ONE_ON_ONE,
        expectedDurationMinutes: Number(durationMinutes) || 60,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to broadcast learner request:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Bạn muốn tìm người hướng dẫn môn gì?"
      description="Tìm Mentor phù hợp và trao đổi thời gian để nâng cao kiến thức bản thân."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Block 1: The Topic */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-gray-900">Chủ đề học tập</h3>
            </div>

            <div className="mb-3">
              <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                TÊN MÔN HỌC / KỸ NĂNG CẦN HỌC
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Ví dụ: Giải tích 1, Thiết kế UI/UX, Guitar cơ bản"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                TRÌNH ĐỘ BẢN THÂN MONG MUỐN
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Người mới', 'Trung bình', 'Chuyên sâu'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      level === lvl
                        ? 'border-teal-400 bg-teal-50/80 text-teal-900 shadow-2xs ring-1 ring-teal-300'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block 2: Learning Goals */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-gray-900">Mục tiêu buổi học</h3>
            </div>

            <div>
              <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                BẠN MUỐN ĐẠT ĐƯỢC KẾT QUẢ GÌ SAU BUỔI HỌC?
              </label>
              <textarea
                rows={3}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Mô tả cụ thể những bài tập vướng mắc hoặc kỹ năng bạn cần người hướng dẫn giải đáp..."
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Block 3: Budget & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Budget */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <h4 className="text-xs font-bold text-gray-900">Ngân sách Credit</h4>
              </div>
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/70">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-16 font-black text-xs bg-transparent focus:outline-hidden text-gray-900"
                />
                <span className="text-xs font-extrabold text-emerald-700">CREDIT</span>
              </div>
              <p className="text-3xs text-gray-400 mt-1.5 italic">1 Credit = 1 Phút học</p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="text-xs font-bold text-gray-900">Thời hạn cần học</h4>
              </div>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50/70 focus:outline-hidden cursor-pointer"
              >
                {TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Block 4: Trust & Safety Policy */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-blue-900 mb-0.5">Chính sách Ký quỹ & Bảo vệ an toàn</h5>
              <p className="text-3xs text-blue-800 leading-relaxed">
                Credit chỉ được tạm giữ ký quỹ khi có Mentor chấp nhận. Số dư được bảo toàn tuyệt đối cho đến khi bạn vào buổi học.
              </p>
            </div>
          </div>

          {/* CTA Broadcast Request */}
          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleBroadcast}
              className="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>{isLoading ? 'Đang phát sóng...' : '🚀 Phát Sóng Yêu Cầu'}</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar Info (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: YOUR BALANCE */}
          <div className="bg-[#1b2a3a] text-white rounded-2xl p-5 shadow-md">
            <div className="text-3xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">
              SỐ DƯ VÍ CỦA BẠN
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-3xl font-black">{userCredits}</span>
              <span className="text-3xs font-bold text-teal-400 uppercase">CREDIT</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1.5">
              <div className="w-4/5 h-full bg-teal-400 rounded-full" />
            </div>
            <p className="text-3xs text-gray-400 font-medium">Ước tính: ~7 giờ học tập</p>
          </div>

          {/* Card 2: REPUTATION SCORE */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs">
            <div className="text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
              ĐIỂM UY TÍN CỦA BẠN
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-3 border-emerald-500 flex items-center justify-center font-black text-sm text-emerald-700 shrink-0">
                9.0
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Xuất Sắc</h4>
                <p className="text-3xs text-gray-500">Top 5% Người học tích cực</p>
              </div>
            </div>
          </div>

          {/* Card 3: Inspiration Photo Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-xs group">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"
              alt="Cảm hứng"
              className="w-full h-48 object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <h4 className="text-xs font-bold text-white mb-0.5">Cần thêm cảm hứng?</h4>
              <p className="text-3xs text-gray-200 leading-relaxed">
                Khám phá các yêu cầu từ bạn học khác để có định hướng rõ ràng hơn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
