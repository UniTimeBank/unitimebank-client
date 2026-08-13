import React from 'react';
import { Upload, ImageIcon, AlertCircle, Wallet } from 'lucide-react';
import { Button, Input, Select } from '@/shared/components/ui';
import { SkillCategoryName } from '../../types';
import { TIMELINE_OPTIONS, PRESET_COVER_IMAGES, SKILL_CATEGORY_LABELS } from '../../constants';
import { RichTextEditor } from './RichTextEditor';
import { DesiredSlotsSelector } from './DesiredSlotsSelector';
import { useLearnerRequestForm, type LearnerRequestFormState } from '../../hooks';

export type { LearnerRequestFormState };

interface LearnerRequestFormProps {
  onPreviewChange?: (state: LearnerRequestFormState) => void;
}

const CATEGORY_OPTIONS = Object.entries(SKILL_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const LearnerRequestForm: React.FC<LearnerRequestFormProps> = ({ onPreviewChange }) => {
  const {
    subject,
    category,
    coverImage,
    shortDescription,
    goals,
    durationMinutes,
    userBalance,
    timeline,
    desiredSlots,
    errors,
    errorMessage,
    isLoading,
    setCategory,
    setCoverImage,
    setShortDescription,
    setDurationMinutes,
    setTimeline,
    setDesiredSlots,
    handleSubjectChange,
    handleGoalsChange,
    handleSubmit,
  } = useLearnerRequestForm(onPreviewChange);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
    }
  };

  const timelineOptions = TIMELINE_OPTIONS.map((opt) => ({
    value: opt.label,
    label: opt.label,
  }));

  return (
    <form noValidate onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900">
          Thông Tin Yêu Cầu Tìm Mentor
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Phát sóng môn học hoặc thắc mắc của bạn để các Mentor giỏi trong cộng đồng hỗ trợ.
        </p>
      </div>

      {/* Subject Name */}
      <div id="field-learner-subject">
        <Input
          label="TÊN MÔN HỌC / KỸ NĂNG CẦN HỌC *"
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          placeholder="Ví dụ: Giải tích 1, Thiết kế UI/UX, Guitar cơ bản"
          error={errors.subject}
        />
      </div>

      {/* Skill Category */}
      <div>
        <Select
          label="DANH MỤC KỸ NĂNG *"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(val) => setCategory(val as SkillCategoryName)}
        />
      </div>

      {/* Cover Image Selector */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          ẢNH BÌA BÀI ĐĂNG
        </label>
        <div className="space-y-3">
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

          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              HOẶC CHỌN ẢNH MẪU CÓ SẴN:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COVER_IMAGES.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(imgUrl)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    coverImage === imgUrl
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-102'
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

      {/* Short Summary Description */}
      <Input
        label="MÔ TẢ TÓM TẮT"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        placeholder="Tóm tắt ngắn 1-2 câu vướng mắc hoặc nhu cầu cần hỗ trợ (tối đa 150 ký tự)..."
      />

      {/* Learning Goals Rich Text Editor */}
      <div id="field-learner-goals">
        <RichTextEditor
          label="NỘI DUNG CHI TIẾT & BÀI TẬP CẦN GIẢI ĐÁP *"
          value={goals}
          onChange={handleGoalsChange}
          placeholder="Mô tả cụ thể những bài tập vướng mắc hoặc kỹ năng bạn cần người hướng dẫn giải đáp..."
          minHeight="140px"
        />
        {errors.goals && (
          <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{errors.goals}</span>
          </p>
        )}
      </div>

      {/* Budget & Timeline (Capped by user wallet balance, spin arrows removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget */}
        <div id="field-learner-duration" className="bg-primary-50/40 rounded-2xl p-4 border border-primary-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-gray-900">Ngân sách Credit</h4>
            <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Wallet className="w-3 h-3 text-primary-600" />
              Ví: {userBalance} Credit
            </span>
          </div>

          <div
            className={`flex items-center justify-between rounded-xl border px-3.5 py-2 bg-white transition-all duration-200 ${
              errors.duration
                ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100'
            }`}
          >
            <input
              type="number"
              min={1}
              max={userBalance || 9999}
              value={durationMinutes || ''}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              placeholder="Nhập số..."
              className="w-full font-black text-sm bg-transparent outline-none text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs font-extrabold text-primary-600 shrink-0 ml-2">CREDIT</span>
          </div>

          {errors.duration ? (
            <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-500" />
              {errors.duration}
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 italic">1 Credit = 1 Phút học 1-1 (Tối đa {userBalance} Credit)</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-1">
          <Select
            label="THỜI HẠN CẦN HỌC"
            options={timelineOptions}
            value={timeline}
            onChange={setTimeline}
          />
        </div>
      </div>

      {/* Desired Slots Selector (Auto calculated based on durationMinutes & timeline) */}
      <DesiredSlotsSelector
        value={desiredSlots}
        onChange={setDesiredSlots}
        durationMinutes={durationMinutes}
        timeline={timeline}
      />

      {/* Policy Banner */}
      <div className="bg-primary-50/80 border border-primary-200/90 rounded-2xl p-4 space-y-1">
        <h5 className="text-xs font-bold text-primary-900">Chính sách Ký quỹ & Bảo vệ an toàn</h5>
        <p className="text-xs text-primary-800 leading-relaxed">
          Credit chỉ được tạm giữ ký quỹ khi bạn và Mentor xác nhận lịch dạy. Số dư được bảo toàn tuyệt đối cho đến khi bắt đầu buổi học.
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
        >
          <span>{isLoading ? 'Đang phát sóng...' : 'Phát Sóng Yêu Cầu Học'}</span>
        </Button>
      </div>
    </form>
  );
};
