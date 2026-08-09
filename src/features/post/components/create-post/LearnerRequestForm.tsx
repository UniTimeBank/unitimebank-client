import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button, Input, Select } from '@/shared/components/ui';
import { TIMELINE_OPTIONS, PRESET_COVER_IMAGES } from '../../constants';

interface LearnerRequestFormProps {
  subject: string;
  onSubjectChange: (val: string) => void;
  coverImage: string;
  onCoverImageChange: (val: string) => void;
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

  const timelineOptions = TIMELINE_OPTIONS.map((opt) => ({
    value: opt.label,
    label: opt.label,
  }));

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

      {/* Subject Name - Dùng Input Shared Component */}
      <Input
        label="TÊN MÔN HỌC / KỸ NĂNG CẦN HỌC *"
        required
        value={subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        placeholder="Ví dụ: Giải tích 1, Thiết kế UI/UX, Guitar cơ bản"
      />

      {/* Cover Image Selector */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
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

      {/* Learning Goals */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
          BẠN MUỐN ĐẠT ĐƯỢC KẾT QUẢ GÌ SAU BUỔI HỌC?
        </label>
        <textarea
          rows={4}
          value={goals}
          onChange={(e) => onGoalsChange(e.target.value)}
          placeholder="Mô tả cụ thể những bài tập vướng mắc hoặc kỹ năng bạn cần người hướng dẫn giải đáp..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none font-normal outline-none placeholder:text-gray-400"
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

        {/* Timeline - Dùng Select Shared Component */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-1">
          <Select
            label="THỜI HẠN CẦN HỌC"
            options={timelineOptions}
            value={timeline}
            onChange={onTimelineChange}
          />
        </div>
      </div>

      {/* Policy Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 space-y-1">
        <h5 className="text-xs font-bold text-blue-900">Chính sách Ký quỹ & Bảo vệ an toàn</h5>
        <p className="text-xs text-blue-800 leading-relaxed">
          Credit chỉ được tạm giữ ký quỹ khi có Mentor nhận lịch dạy. Số dư được bảo toàn tuyệt đối cho đến khi bạn bắt đầu buổi học.
        </p>
      </div>

      {/* Submit CTA - Dùng Button Shared Component */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          isLoading={isLoading}
        >
          <span>{isLoading ? 'Đang phát sóng...' : 'Phát Sóng Yêu Cầu Học'}</span>
        </Button>
      </div>
    </form>
  );
};
