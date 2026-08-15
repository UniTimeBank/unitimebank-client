import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ImageIcon, AlertCircle, Wallet, Sparkles, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Button, Input, Select } from '@/shared/components/ui';
import { SkillCategoryName } from '../../types';
import { TIMELINE_OPTIONS, PRESET_COVER_IMAGES, SKILL_CATEGORY_LABELS } from '../../constants';
import { RichTextEditor } from './RichTextEditor';
import { DesiredSlotsSelector } from './DesiredSlotsSelector';
import { useLearnerRequestForm, type LearnerRequestFormState } from '../../hooks';
import { useGetOnboardingTasksQuery, useGetLoginStreakQuery } from '@/core/api/user/userApi';

export type { LearnerRequestFormState };

interface LearnerRequestFormProps {
  onPreviewChange?: (state: LearnerRequestFormState) => void;
}

const CATEGORY_OPTIONS = Object.entries(SKILL_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const LearnerRequestForm: React.FC<LearnerRequestFormProps> = ({ onPreviewChange }) => {
  const navigate = useNavigate();
  const { data: onboardingData } = useGetOnboardingTasksQuery();
  const { data: streakData } = useGetLoginStreakQuery();

  const {
    subject,
    category,
    coverImage,
    shortDescription,
    goals,
    durationMinutes,
    userBalance,
    isInsufficientBalance,
    timeline,
    desiredSlots,
    errors,
    errorMessage,
    isLoading,
    setCategory,
    setCoverImage,
    setShortDescription,
    setDurationMinutes,
    handleQuickDurationSelect,
    handleStepDuration,
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

  if (isInsufficientBalance) {
    const isCompleted7DaysCheckin = Boolean(
      streakData?.currentStreak && streakData.currentStreak >= 7,
    );
    const isCheckinDone = Boolean(streakData?.isCheckedInToday || isCompleted7DaysCheckin);

    const allTasks = [
      {
        id: 'profile',
        title: 'Cập nhật thông tin cá nhân (Avatar + Bio)',
        reward: '+10 Credit',
        isDone: Boolean(onboardingData?.profileCompleted),
        actionLabel: 'Cập nhật',
        onAction: () => navigate('/profile', { state: { action: 'EDIT_PROFILE' } }),
      },
      {
        id: 'schedule',
        title: 'Thiết lập lịch rảnh khả dụng',
        reward: '+10 Credit',
        isDone: Boolean(onboardingData?.scheduleCreated),
        actionLabel: 'Tạo lịch',
        onAction: () => navigate('/profile', { state: { action: 'CREATE_SCHEDULE' } }),
      },
      {
        id: 'skills',
        title: 'Khai báo kỹ năng thế mạnh',
        reward: '+10 Credit',
        isDone: Boolean(onboardingData?.skillAdded),
        actionLabel: 'Thêm kỹ năng',
        onAction: () => navigate('/profile', { state: { action: 'ADD_SKILL' } }),
      },
      {
        id: 'checkin',
        title: 'Điểm danh hằng ngày nhận thưởng',
        reward: '+60 Credit',
        isDone: isCheckinDone,
        actionLabel: 'Điểm danh',
        onAction: () => navigate('/profile'),
      },
    ];

    const pendingTasks = allTasks.filter((t) => !t.isDone);

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900">
            Thông Tin Yêu Cầu Tìm Mentor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phát sóng môn học hoặc thắc mắc của bạn để các Mentor giỏi trong cộng đồng hỗ trợ.
          </p>
        </div>

        {/* Minimal Clean Notice Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Cần tối thiểu 30 Credit để phát sóng yêu cầu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ví hiện có: <strong className="text-slate-800 font-semibold">{userBalance} Credit</strong> (cần thêm <strong className="text-slate-800 font-semibold">{Math.max(0, 30 - userBalance)} Credit</strong>)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 self-start sm:self-auto">
            Chưa đủ số dư
          </span>
        </div>

        {/* Tasks Section or Completed Notice */}
        {pendingTasks.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800">
                Nhiệm vụ nhận thêm Credit
              </span>
              <span className="text-[11px] text-slate-400">
                Hoàn thành để nhận Credit miễn phí
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/70 divide-y divide-slate-100 overflow-hidden bg-white">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {task.title}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                      {task.reward}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={task.onAction}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 transition-colors cursor-pointer py-0.5 px-2 rounded-lg hover:bg-slate-100"
                    >
                      <span>{task.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-200/70 bg-slate-50/60 text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-700 mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              {isCompleted7DaysCheckin
                ? 'Đã nhận trọn vẹn phần thưởng khởi tạo'
                : 'Đã hoàn thành các nhiệm vụ hôm nay'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isCompleted7DaysCheckin
                ? 'Bạn đã hoàn tất tất cả nhiệm vụ nhận Credit miễn phí.'
                : 'Bạn đã hoàn tất các nhiệm vụ hôm nay. Hãy quay lại vào ngày mai để tiếp tục chuỗi điểm danh.'}
            </p>
          </div>
        )}
      </div>
    );
  }

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

      {/* Budget & Timeline (Hybrid: Presets + 15-min Stepper) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Budget & Duration */}
        <div id="field-learner-duration" className="bg-primary-50/40 rounded-2xl p-4 border border-primary-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-gray-900">THỜI LƯỢNG & NGÂN SÁCH *</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">1 Phút = 1 Credit (Tối thiểu 30p)</p>
            </div>
            <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <Wallet className="w-3 h-3 text-primary-600" />
              Ví: {userBalance} Credit
            </span>
          </div>

          {/* Quick Presets Pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { mins: 30, label: '30p', desc: 'Hỏi đáp' },
              { mins: 45, label: '45p', desc: 'Review' },
              { mins: 60, label: '60p ⭐', desc: 'Chuẩn' },
              { mins: 90, label: '90p', desc: 'Sâu' },
            ].map((p) => {
              const isSelected = durationMinutes === p.mins;
              const isOverBalance = userBalance > 0 && p.mins > userBalance;

              return (
                <button
                  key={p.mins}
                  type="button"
                  onClick={() => handleQuickDurationSelect(p.mins)}
                  disabled={isOverBalance}
                  className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer border text-xs ${
                    isSelected
                      ? 'bg-primary-500 text-white font-black border-primary-600 shadow-2xs scale-[1.02]'
                      : isOverBalance
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:border-primary-300 border-gray-200 font-bold hover:bg-primary-50/50'
                  }`}
                >
                  <div className="font-extrabold">{p.label}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-primary-100' : 'text-gray-400 font-medium'}`}>
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 15-min Stepper Input Box */}
          <div
            className={`flex items-center justify-between rounded-xl border p-1 bg-white transition-all duration-200 ${
              errors.duration
                ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100'
            }`}
          >
            <button
              type="button"
              onClick={() => handleStepDuration(-15)}
              disabled={durationMinutes <= 30}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-black text-xs transition-colors cursor-pointer"
            >
              - 15p
            </button>

            <div className="flex items-baseline justify-center gap-1.5 flex-1 text-center">
              <span className="font-black text-base text-primary-700 tracking-tight">{durationMinutes}</span>
              <span className="text-xs font-extrabold text-gray-500">PHÚT</span>
              <span className="text-[11px] font-bold text-primary-600">({durationMinutes} Credit)</span>
            </div>

            <button
              type="button"
              onClick={() => handleStepDuration(15)}
              disabled={userBalance > 0 && durationMinutes + 15 > userBalance}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-black text-xs transition-colors cursor-pointer"
            >
              + 15p
            </button>
          </div>

          {errors.duration ? (
            <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
              <span>{errors.duration}</span>
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 italic text-center">
              Bước nhảy 15 phút (30, 45, 60, 75, 90, 120p...). Tối đa {userBalance} Credit.
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200 space-y-1 flex flex-col justify-between">
          <div>
            <Select
              label="THỜI HẠN CẦN HỌC *"
              options={timelineOptions}
              value={timeline}
              onChange={setTimeline}
            />
            <p className="text-[11px] text-gray-500 font-medium mt-2">
              Khung giờ mong muốn sẽ được hệ thống gợi ý phù hợp theo thời hạn này.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 text-[11px] text-gray-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Thời lượng học sẽ tự động khóa và chia đều vào các khung giờ bạn chọn.</span>
          </div>
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
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="md"
          disabled={isLoading || isInsufficientBalance}
          isLoading={isLoading}
          className={
            isInsufficientBalance
              ? 'opacity-60 cursor-not-allowed bg-slate-300 hover:bg-slate-300 border-slate-300 text-slate-700 shadow-none'
              : ''
          }
        >
          <span>
            {isInsufficientBalance
              ? `Không Đủ Credit Để Tạo Yêu Cầu (Cần Tối Thiểu 30 Credit)`
              : isLoading
              ? 'Đang phát sóng...'
              : 'Phát Sóng Yêu Cầu Học'}
          </span>
        </Button>

        {isInsufficientBalance && (
          <p className="text-center text-xs text-amber-700 font-bold flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ví chỉ còn {userBalance} Credit. Vui lòng nạp thêm hoặc điểm danh nhận thêm Credit để tiếp tục.</span>
          </p>
        )}
      </div>
    </form>
  );
};
