import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select } from '@/shared/components/ui';
import { useCreateLearnerRequestMutation } from '@/core/api/post/postApi';
import { SessionType, SkillCategoryName } from '../../types';
import { TIMELINE_OPTIONS, PRESET_COVER_IMAGES } from '../../constants';
import { RichTextEditor } from './RichTextEditor';

export interface LearnerRequestFormState {
  subject: string;
  coverImage: string;
  shortDescription: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
}

interface LearnerRequestFormProps {
  onPreviewChange?: (state: LearnerRequestFormState) => void;
}

export const LearnerRequestForm: React.FC<LearnerRequestFormProps> = ({ onPreviewChange }) => {
  const navigate = useNavigate();
  const [createLearnerRequest, { isLoading }] = useCreateLearnerRequestMutation();

  // Internal Form State
  const [subject, setSubject] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
  );
  const [shortDescription, setShortDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeline, setTimeline] = useState('Trong 3 ngày');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync preview data to parent sidebar
  useEffect(() => {
    onPreviewChange?.({
      subject,
      coverImage,
      shortDescription,
      goals,
      durationMinutes,
      timeline,
    });
  }, [subject, coverImage, shortDescription, goals, durationMinutes, timeline, onPreviewChange]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    if (val.trim()) {
      setErrors((prev) => ({ ...prev, subject: '' }));
    }
  };

  const handleGoalsChange = (val: string) => {
    setGoals(val);
    if (val.replace(/<[^>]*>/g, '').trim()) {
      setErrors((prev) => ({ ...prev, goals: '' }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = 'Vui lòng nhập tên môn học hoặc kỹ năng cần học.';
    }

    const cleanGoals = goals.replace(/<[^>]*>/g, '').trim();
    if (!cleanGoals) {
      newErrors.goals = 'Vui lòng nhập chi tiết nội dung hoặc bài tập cần giải đáp.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = ['subject', 'goals'].find((key) => newErrors[key]);
      if (firstErrorKey) {
        const el = document.getElementById(`field-learner-${firstErrorKey}`);
        if (el) {
          const yOffset = -120;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          setTimeout(() => {
            const inputEl = el.querySelector('input, textarea') || el;
            (inputEl as HTMLElement).focus?.({ preventScroll: true });
          }, 350);
        }
      }
      return;
    }

    try {
      await createLearnerRequest({
        skillNeeded: subject,
        category: SkillCategoryName.OTHER,
        shortDescription,
        description: goals,
        sessionType: SessionType.ONE_ON_ONE,
        expectedDurationMinutes: Number(durationMinutes) || 60,
      }).unwrap();

      setSuccessMessage('Đã phát sóng yêu cầu học thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/explore');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to broadcast learner request:', err);
      const rawMessages: string[] = Array.isArray(err?.data?.message)
        ? err.data.message
        : [err?.data?.message || err?.message || ''];

      const fieldErrors: Record<string, string> = {};
      const unhandledMessages: string[] = [];

      for (const m of rawMessages) {
        if (!m) continue;
        const low = m.toLowerCase();
        if (low.includes('skillneeded') || low.includes('subject')) {
          fieldErrors.subject = 'Tên môn học/kỹ năng phải có ít nhất 3 ký tự.';
        } else if (low.includes('description') || low.includes('goals')) {
          fieldErrors.goals = 'Chi tiết nội dung cần học phải có ít nhất 10 ký tự.';
        } else {
          unhandledMessages.push(m);
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        const firstErrorKey = Object.keys(fieldErrors)[0];
        const el = document.getElementById(`field-learner-${firstErrorKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      if (unhandledMessages.length > 0) {
        setErrorMessage(unhandledMessages.join('. '));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

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

      {/* Subject Name - Dùng Input Shared Component */}
      <div id="field-learner-subject">
        <Input
          label="TÊN MÔN HỌC / KỸ NĂNG CẦN HỌC *"
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          placeholder="Ví dụ: Giải tích 1, Thiết kế UI/UX, Guitar cơ bản"
          error={errors.subject}
        />
      </div>

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

      {/* Short Summary Description for Card Feed */}
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

      {/* Budget & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-2">
          <h4 className="text-xs font-extrabold text-gray-900">Ngân sách Credit</h4>
          <div className="flex items-center justify-between border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
            onChange={setTimeline}
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

        {successMessage && (
          <p className="text-center text-xs text-emerald-600 font-semibold mt-2 animate-in fade-in">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="text-center text-xs text-red-500 font-semibold mt-2 animate-in fade-in">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
};
