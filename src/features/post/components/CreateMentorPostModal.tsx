import React, { useState } from 'react';
import { Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useCreateMentorPostMutation } from '@/core/api/post/postApi';
import { POST_CATEGORIES, DIFFICULTY_LEVELS } from '../constants';
import { SessionType } from '../types';

interface CreateMentorPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMentorPostModal: React.FC<CreateMentorPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createPost, { isLoading }] = useCreateMentorPostMutation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LẬP TRÌNH');
  const [difficulty, setDifficulty] = useState<string>('Intro');
  const [skillsText, setSkillsText] = useState('Python, Đại số cơ bản, Pandas');
  const [description, setDescription] = useState('');
  const [sessionType] = useState<SessionType>(SessionType.BOTH);

  // Selected available dates
  const [selectedDates, setSelectedDates] = useState<number[]>([3, 5, 9]);

  const toggleDate = (d: number) => {
    if (selectedDates.includes(d)) {
      setSelectedDates(selectedDates.filter((item) => item !== d));
    } else {
      setSelectedDates([...selectedDates, d]);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return;

    const tags = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((skillName) => ({ skillName, category }));

    try {
      await createPost({
        title,
        description,
        sessionType,
        tags,
        availableSlots: [
          { dayOfWeek: 'THỨ HAI', startTime: '18:00', endTime: '20:00' },
          { dayOfWeek: 'THỨ TƯ', startTime: '19:00', endTime: '21:00' },
        ],
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create mentor post:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Đăng Bài Dạy Mới"
      description="Chia sẻ chuyên môn và cùng phát triển kho tri thức của cộng đồng sinh viên UniTime Bank."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Class Title */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
              TIÊU ĐỀ BÀI DẠY
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hướng dẫn Lập trình Python & Phân tích Dữ liệu Thực chiến"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Category & Difficulty Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                DANH MỤC
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {POST_CATEGORIES.filter((c) => c.value !== 'All').map((c) => (
                  <option key={c.value} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                MỨC ĐỘ YÊU CẦU
              </label>
              <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl text-xs font-bold text-center">
                {DIFFICULTY_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setDifficulty(lvl.value)}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      difficulty === lvl.value
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
              KỸ NĂNG TRUYỀN ĐẠT (PHÂN TÁCH BẰNG DẤU PHẨY)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, Đại số cơ bản, Pandas"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
              MÔ TẢ LỘ TRÌNH & NỘI DUNG BUỔI HỌC
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể những kiến thức học viên sẽ đạt được..."
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            />
          </div>

          {/* Credit Cost Box */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border-2 border-teal-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-teal-900">Mức quy đổi Credit</h4>
              <p className="text-3xs text-teal-700">Chuẩn hóa theo Mentor Level (1 phút = 1 Credit)</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-teal-200 shadow-2xs text-teal-800 font-extrabold text-xs">
              60 credit/giờ
            </div>
          </div>

          {/* Availability Calendar */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">
              LỊCH RẢNH KHẢ DỤNG TRONG THÁNG
            </label>
            <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-200/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-900">Tháng 9, 2024</h4>
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-3xs font-bold text-gray-400 mb-1.5 uppercase">
                <div>CN</div>
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div>T7</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
                {[25, 26, 27, 28, 29, 30].map((d) => (
                  <div key={`prev-${d}`} className="py-1.5 text-gray-300">
                    {d}
                  </div>
                ))}
                <div>1</div>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((d) => {
                  const isAvail = selectedDates.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDate(d)}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                        isAvail
                          ? 'bg-[#4ef1c5] text-teal-950 font-black shadow-2xs'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={onClose}>
              Lưu bản nháp
            </Button>
            <Button
              variant="primary"
              disabled={isLoading}
              onClick={handlePublish}
            >
              {isLoading ? 'Đang xuất bản...' : 'Đăng bài dạy'}
            </Button>
          </div>
        </div>

        {/* Right Live Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-900 flex items-center justify-between">
            <span>Xem trước trên Sàn</span>
            <span className="text-3xs text-emerald-600 font-extrabold uppercase">• TRỰC TIẾP</span>
          </h3>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="relative h-40 bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-3xs font-extrabold uppercase bg-white/90 text-gray-900 shadow-xs">
                {category}
              </span>
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-primary-600 text-white font-bold text-xs">
                60 credit
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="Alex Johnson"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">Alex Johnson</div>
                  <div className="flex items-center gap-1 text-3xs font-semibold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.9 Điểm uy tín</span>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1.5">
                {title || 'Hướng dẫn Lập trình Python Phân tích Dữ liệu'}
              </h4>

              <p className="text-3xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                {description || 'Nắm bắt chuyên sâu các kỹ thuật xử lý dữ liệu với Pandas, NumPy...'}
              </p>

              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-3xs font-bold text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Lịch gần nhất: 3 Th9</span>
                </div>
                <span className="text-primary-600 font-bold">XEM CHI TIẾT &rarr;</span>
              </div>
            </div>
          </div>

          <div className="bg-[#16202c] text-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-teal-400 flex items-center justify-center font-black text-xs shrink-0">
              88%
            </div>
            <div>
              <h5 className="text-xs font-bold leading-tight">Tăng Độ Tiếp Cận Bài Đăng</h5>
              <p className="text-3xs text-gray-400 mt-0.5">
                Danh mục có nhu cầu cao. Tiếp cận gấp đôi sinh viên trong 48h tới.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
