import React from 'react';
import { ChevronLeft, ChevronRight, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { POST_CATEGORIES, DIFFICULTY_LEVELS } from '../../constants';

export const PRESET_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
];

interface MentorOfferFormProps {
  title: string;
  onTitleChange: (val: string) => void;
  coverImage: string;
  onCoverImageChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
  skillsText: string;
  onSkillsTextChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  selectedDates: number[];
  onToggleDate: (day: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const MentorOfferForm: React.FC<MentorOfferFormProps> = ({
  title,
  onTitleChange,
  coverImage,
  onCoverImageChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  skillsText,
  onSkillsTextChange,
  description,
  onDescriptionChange,
  selectedDates,
  onToggleDate,
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
          Thông Tin Bài Dạy Mới
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Mô tả bài giảng và lịch rảnh để học viên có thể chủ động đặt lịch 1-1 với bạn.
        </p>
      </div>

      {/* Class Title */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          TIÊU ĐỀ BÀI DẠY <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ví dụ: Hướng dẫn Lập trình Python & Phân tích Dữ liệu Thực chiến"
          className="w-full px-4 py-3 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
        />
      </div>

      {/* Cover Image Selector */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          ẢNH BÌA BÀI ĐĂNG
        </label>
        <div className="space-y-3">
          {/* Upload Box / Active Preview */}
          <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary-400 transition-all flex flex-col items-center justify-center group cursor-pointer">
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
                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
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
                      ? 'border-primary-600 ring-2 ring-primary-200 scale-102'
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

      {/* Category & Difficulty Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
            DANH MỤC MÔN HỌC
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 text-xs font-semibold bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {POST_CATEGORIES.filter((c) => c.value !== 'All').map((c) => (
              <option key={c.value} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
            MỨC ĐỘ YÊU CẦU
          </label>
          <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl text-xs font-bold text-center">
            {DIFFICULTY_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                type="button"
                onClick={() => onDifficultyChange(lvl.value)}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
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
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          KỸ NĂNG TRUYỀN ĐẠT (PHÂN TÁCH BẰNG DẤU PHẨY)
        </label>
        <input
          type="text"
          value={skillsText}
          onChange={(e) => onSkillsTextChange(e.target.value)}
          placeholder="Python, Đại số cơ bản, Pandas"
          className="w-full px-4 py-3 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
          MÔ TẢ LỘ TRÌNH & NỘI DUNG BUỔI HỌC
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Mô tả cụ thể những kiến thức học viên sẽ đạt được sau buổi học..."
          className="w-full px-4 py-3 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all resize-none font-medium"
        />
      </div>

      {/* Credit Cost Box */}
      <div className="p-4 rounded-2xl bg-teal-50/80 border-2 border-teal-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-teal-900">Mức quy đổi Credit chuẩn</h4>
          <p className="text-[11px] text-teal-700 mt-0.5">Chuẩn hóa hệ thống (1 phút học = 1 Credit)</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-teal-200 shadow-2xs text-teal-800 font-extrabold text-xs">
          60 credit/giờ
        </div>
      </div>

      {/* Availability Calendar Selector */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">
          LỊCH RẢNH KHẢ DỤNG TRONG THÁNG
        </label>
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold text-gray-900">Tháng 9, 2024</h4>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-gray-400 mb-1.5 uppercase">
            <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
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
                  onClick={() => onToggleDate(d)}
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

      {/* Submit CTA */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          isLoading={isLoading}
        >
          <span>{isLoading ? 'Đang xuất bản bài dạy...' : 'Xuất Bản Bài Dạy Mới'}</span>
        </Button>
      </div>
    </form>
  );
};
