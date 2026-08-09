import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { TIMELINE_OPTIONS } from '../../constants';

export const PRESET_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
];

interface LearnerRequestFormProps {
  subject: string;
  onSubjectChange: (val: string) => void;
  coverImage: string;
  onCoverImageChange: (val: string) => void;
  level: 'Người mới' | 'Trung bình' | 'Chuyên sâu';
  onLevelChange: (val: 'Người mới' | 'Trung bình' | 'Chuyên sâu') => void;
  goals: string;
  onGoalsChange: (val: string) => void;
  durationMinutes: number;
  onDurationMinutesChange: (val: number) => void;
  timeline: string;
  onTimelineChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const LearnerRequestForm: React.FC<LearnerRequestFormProps> = ({
  subject,
  onSubjectChange,
  coverImage,
  onCoverImageChange,
  level,
  onLevelChange,
  goals,
  onGoalsChange,
  durationMinutes,
  onDurationMinutesChange,
  timeline,
  onTimelineChange,
  onSubmit,
  isLoading,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onCoverImageChange(url);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900">
          Thông Tin Yêu Cầu Tìm Mentor
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Phát sóng môn học hoặc thắc mắc của bạn để các Mentor giỏi trong cộng đồng hỗ trợ.
        </p>
      </div>

      {/* Subject Name */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          TÊN MÔN HỌC / KỸ NĂNG CẦN HỌC <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Ví dụ: Giải tích 1, Thiết kế UI/UX, Guitar cơ bản"
          className="w-full px-4 py-3 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all font-semibold"
        />
      </div>

      {/* Cover Image Selector */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          ẢNH BÌA BÀI ĐĂNG
        </label>
        <div className="space-y-3">
          {/* Upload Box / Active Preview */}
          <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-teal-400 transition-all flex flex-col items-center justify-center group cursor-pointer">
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-3.5 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh khác</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center gap-1.5 cursor-pointer p-4 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-teal-500 transition-colors" />
                <span className="text-xs font-bold text-gray-700">Nhấp để tải ảnh từ máy tính</span>
                <span className="text-[11px] text-gray-400">PNG, JPG tối đa 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>

          {/* Preset Images Quick Selector */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              HOẶC CHỌN ẢNH MẪU CÓ SẴN:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COVER_IMAGES.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onCoverImageChange(imgUrl)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    coverImage === imgUrl
                      ? 'border-teal-500 ring-2 ring-teal-200 scale-102'
                      : 'border-transparent hover:opacity-80'
                  }`}
                >
                  <img src={imgUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Selector */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          TRÌNH ĐỘ BẢN THÂN MONG MUỐN
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['Người mới', 'Trung bình', 'Chuyên sâu'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onLevelChange(lvl)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                level === lvl
                  ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-2xs ring-1 ring-teal-300 font-extrabold'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          BẠN MUỐN ĐẠT ĐƯỢC KẾT QUẢ GÌ SAU BUỔI HỌC?
        </label>
        <textarea
          rows={4}
          value={goals}
          onChange={(e) => onGoalsChange(e.target.value)}
          placeholder="Mô tả cụ thể những bài tập vướng mắc hoặc kỹ năng bạn cần người hướng dẫn giải đáp..."
          className="w-full px-4 py-3 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all resize-none font-medium"
        />
      </div>

      {/* Budget & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-2">
          <h4 className="text-xs font-extrabold text-gray-900">Ngân sách Credit</h4>
          <div className="flex items-center justify-between border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => onDurationMinutesChange(Number(e.target.value))}
              className="w-20 font-black text-sm bg-transparent focus:outline-hidden text-gray-900"
            />
            <span className="text-xs font-extrabold text-emerald-700">CREDIT</span>
          </div>
          <p className="text-[11px] text-gray-400 italic">1 Credit = 1 Phút học 1-1</p>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-2">
          <h4 className="text-xs font-extrabold text-gray-900">Thời hạn cần học</h4>
          <select
            value={timeline}
            onChange={(e) => onTimelineChange(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-gray-300 rounded-xl bg-white focus:outline-hidden cursor-pointer"
          >
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Policy Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 space-y-1">
        <h5 className="text-xs font-bold text-blue-900">Chính sách Ký quỹ & Bảo vệ an toàn</h5>
        <p className="text-xs text-blue-800 leading-relaxed">
          Credit chỉ được tạm giữ ký quỹ khi có Mentor nhận lịch dạy. Số dư được bảo toàn tuyệt đối cho đến khi bạn bắt đầu buổi học.
        </p>
      </div>

      {/* Submit CTA */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          isLoading={isLoading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <span>{isLoading ? 'Đang phát sóng...' : 'Phát Sóng Yêu Cầu Học'}</span>
        </Button>
      </div>
    </form>
  );
};
