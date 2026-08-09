import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  Upload,
  ImageIcon,
  Trash2,
  Repeat,
  CalendarRange,
} from 'lucide-react';
import { Button, Input, DateInput } from '@/shared/components/ui';
import { useMentorSchedule, QuickAddScheduleModal, ALL_DAYS } from '@/features/schedule';
import { useUserSkills } from '@/features/user';
import { SkillMultiSelectCombobox } from './SkillMultiSelectCombobox';
import type { SkillCategoryEnum } from '@/features/user/types';

import { PRESET_COVER_IMAGES } from '../../constants';

const DAY_ORDER: Record<string, number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

interface MentorOfferFormProps {
  title: string;
  onTitleChange: (val: string) => void;
  coverImage: string;
  onCoverImageChange: (val: string) => void;
  skillsText: string;
  onSkillsTextChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  scheduleType: 'ALWAYS_OPEN' | 'LIMITED_TIME';
  onScheduleTypeChange: (type: 'ALWAYS_OPEN' | 'LIMITED_TIME') => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  selectedSlotIds: string[];
  onToggleSlotId: (slotId: string) => void;
  onSelectAllSlots: (allIds: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const MentorOfferForm: React.FC<MentorOfferFormProps> = ({
  title,
  onTitleChange,
  coverImage,
  onCoverImageChange,
  skillsText,
  onSkillsTextChange,
  description,
  onDescriptionChange,
  scheduleType,
  onScheduleTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  selectedSlotIds,
  onToggleSlotId,
  onSelectAllSlots,
  onSubmit,
  isLoading,
}) => {
  const {
    recurringSchedules,
    isRecurringLoading,
    createRecurring,
    deleteRecurring,
    refetchRecurring,
  } = useMentorSchedule();

  const { skills: profileSkills, addSkill } = useUserSkills();

  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  // Danh sách kỹ năng đang được chọn cho bài dạy này
  const selectedSkills = useMemo(() => {
    return skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skillsText]);

  const handleToggleSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      const updated = selectedSkills.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      onSkillsTextChange(updated.join(', '));
    } else {
      const updated = [...selectedSkills, trimmed];
      onSkillsTextChange(updated.join(', '));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    onSkillsTextChange(updated.join(', '));
  };

  const handleAddNewSkillToProfile = async (
    skillName: string,
    cat: SkillCategoryEnum,
    isStrong: boolean
  ) => {
    await addSkill({
      skillName,
      category: cat,
      isStrong,
    });
  };

  // Sắp xếp danh sách lịch rảnh chuẩn xác: Thứ 2 -> Chủ Nhật, và tăng dần theo giờ bắt đầu
  const sortedActiveSchedules = useMemo(() => {
    return [...recurringSchedules]
      .filter((s) => s.isActive)
      .sort((a, b) => {
        const orderA = DAY_ORDER[a.dayOfWeek] || 99;
        const orderB = DAY_ORDER[b.dayOfWeek] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [recurringSchedules]);

  // Gom nhóm danh sách lịch rảnh theo từng ngày trong tuần (Thứ 2 -> Chủ Nhật)
  const groupedSchedulesByDay = useMemo(() => {
    const groups: { dayOfWeek: string; dayLabel: string; slots: typeof recurringSchedules }[] = [];

    ALL_DAYS.forEach((day) => {
      const slotsForDay = sortedActiveSchedules.filter((s) => s.dayOfWeek === day.value);
      if (slotsForDay.length > 0) {
        groups.push({
          dayOfWeek: day.value,
          dayLabel: day.label,
          slots: slotsForDay,
        });
      }
    });

    return groups;
  }, [sortedActiveSchedules]);

  // Mặc định chọn tất cả các slot rảnh đang hoạt động khi danh sách tải xong lần đầu
  useEffect(() => {
    if (sortedActiveSchedules.length > 0 && selectedSlotIds.length === 0) {
      const activeIds = sortedActiveSchedules.map((s) => s.id);
      onSelectAllSlots(activeIds);
    }
  }, [sortedActiveSchedules]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onCoverImageChange(url);
    }
  };

  const isAllSelected =
    sortedActiveSchedules.length > 0 &&
    sortedActiveSchedules.every((s) => selectedSlotIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onSelectAllSlots([]);
    } else {
      onSelectAllSlots(sortedActiveSchedules.map((s) => s.id));
    }
  };

  const handleDeleteSlot = async (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    try {
      if (selectedSlotIds.includes(slotId)) {
        onToggleSlotId(slotId);
      }
      await deleteRecurring(slotId);
      await refetchRecurring();
    } catch (err) {
      console.error('Failed to delete schedule slot:', err);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black text-gray-900">
            Thông Tin Bài Dạy Mới
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mô tả bài giảng và chọn khung giờ rảnh từ hồ sơ để học viên có thể chủ động đặt lịch 1:1 với bạn.
          </p>
        </div>

        {/* Class Title - Dùng Input Shared Component */}
        <Input
          label="TIÊU ĐỀ BÀI DẠY *"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ví dụ: Hướng dẫn Lập trình Python & Phân tích Dữ liệu Thực chiến"
        />

        {/* Cover Image Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
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
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${coverImage === imgUrl
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

        {/* ------------------------------------------------------------- */}
        {/* COMBOBOX CHỌN NHIỀU KỸ NĂNG + ĐỒNG BỘ TRỰC TIẾP VỚI PROFILE */}
        {/* ------------------------------------------------------------- */}
        <div>
          <SkillMultiSelectCombobox
            label="KỸ NĂNG TRUYỀN ĐẠT CỦA BÀI DẠY *"
            placeholder="Nhấp để chọn kỹ năng từ hồ sơ hoặc thêm mới..."
            selectedSkills={selectedSkills}
            availableSkills={profileSkills}
            onToggleSkill={handleToggleSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddNewSkillToProfile={handleAddNewSkillToProfile}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
            MÔ TẢ LỘ TRÌNH & NỘI DUNG BUỔI HỌC
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Mô tả cụ thể những kiến thức học viên sẽ đạt được sau buổi học..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none font-normal outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Credit Cost Box */}
        <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-200/80 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-primary-900">Mức quy đổi Credit chuẩn</h4>
            <p className="text-[11px] text-primary-700 mt-0.5">Chuẩn hóa hệ thống (1 phút học = 1 Credit)</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-primary-200 shadow-2xs text-primary-800 font-extrabold text-xs">
            60 credit/giờ
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2 CƠ CHẾ ĐĂNG BÀI: LUÔN MỞ vs CÓ THỜI HẠN */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-1">
              HÌNH THỨC & THỜI HẠN BÀI ĐĂNG <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-gray-500">
              Chọn cách thức bài dạy được mở cho học viên trên hệ thống.
            </p>
          </div>

          {/* 2-Tab Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/80">
            <button
              type="button"
              onClick={() => onScheduleTypeChange('ALWAYS_OPEN')}
              className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${scheduleType === 'ALWAYS_OPEN'
                ? 'bg-white text-primary-800 shadow-xs border border-primary-200/70 ring-2 ring-primary-100/60'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <Repeat className={`w-4 h-4 shrink-0 ${scheduleType === 'ALWAYS_OPEN' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span>Luôn Mở</span>
            </button>

            <button
              type="button"
              onClick={() => onScheduleTypeChange('LIMITED_TIME')}
              className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${scheduleType === 'LIMITED_TIME'
                ? 'bg-white text-primary-800 shadow-xs border border-primary-200/70 ring-2 ring-primary-100/60'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <CalendarRange className={`w-4 h-4 shrink-0 ${scheduleType === 'LIMITED_TIME' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span>Có Thời Hạn</span>
            </button>
          </div>

          {/* Context Banner For Limited Time Mode */}
          {scheduleType === 'LIMITED_TIME' && (
            <div className="p-4 bg-primary-50/70 border border-primary-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-primary-900 font-extrabold text-xs">
                <CalendarRange className="w-4 h-4 text-primary-600" />
                <span>Thiết lập khoảng thời gian mở lớp:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DateInput
                  label="NGÀY BẮT ĐẦU *"
                  value={startDate}
                  onChange={onStartDateChange}
                />
                <DateInput
                  label="NGÀY KẾT THÚC *"
                  value={endDate}
                  min={startDate}
                  onChange={onEndDateChange}
                />
              </div>

              <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                Khóa học sẽ tự động hiển thị nhận đăng ký trong khoảng ngày này và tự động đóng sau khi kết thúc.
              </p>
            </div>
          )}

          {/* Availability Schedule Slots Picker */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  {scheduleType === 'ALWAYS_OPEN'
                    ? 'LỊCH RẢNH NHẬN DẠY HÀNG TUẦN'
                    : 'CÁC KHUNG GIỜ NHẬN DẠY TRONG ĐỢT NÀY'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Chọn các khung giờ rảnh từ hồ sơ bạn muốn mở cho bài dạy này.
                </p>
              </div>

              {sortedActiveSchedules.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuickAddModalOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                    className="rounded-xl font-bold text-xs border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    Thêm khung giờ
                  </Button>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isRecurringLoading ? (
              <div className="p-8 bg-gray-50/70 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-gray-500 font-medium">Đang tải lịch rảnh của bạn...</p>
              </div>
            ) : sortedActiveSchedules.length > 0 ? (
              /* ĐÃ CÓ LỊCH RẢNH: Hiển thị danh sách khung giờ đã sắp xếp chuẩn */
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary-700 cursor-pointer"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả khung giờ'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200/70">
                    Đã chọn {selectedSlotIds.length}/{sortedActiveSchedules.length} khung giờ
                  </span>
                </div>

                {/* List of Recurring Slots Grouped by Day */}
                <div className="space-y-3.5">
                  {groupedSchedulesByDay.map((group) => (
                    <div key={group.dayOfWeek} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-gray-800 uppercase tracking-wider">
                          {group.dayLabel}
                        </span>
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded-md border border-primary-100">
                          {group.slots.length} khung giờ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {group.slots.map((slot) => {
                          const isSelected = selectedSlotIds.includes(slot.id);

                          return (
                            <div
                              key={slot.id}
                              onClick={() => onToggleSlotId(slot.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500/80 shadow-xs'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 border border-gray-200 text-gray-400'
                                    }`}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                                    <span>{slot.startTime} - {slot.endTime}</span>
                                    <span className="text-[11px] font-medium text-gray-500">
                                      ({slot.durationMinutes} phút)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 pl-2">
                                {/* Nút Xóa khung giờ rảnh */}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSlot(e, slot.id)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                  title="Xóa khung giờ này khỏi hệ thống"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CHƯA CÓ LỊCH RẢNH: Clean Minimalist Empty State */
              <div className="p-6 bg-gray-50/60 border border-dashed border-gray-200/90 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>

                <div className="max-w-sm space-y-1">
                  <h4 className="text-xs font-bold text-gray-900">
                    Chưa có khung giờ rảnh trong hồ sơ
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Học viên sẽ đặt lịch học dựa trên các khung giờ rảnh của bạn. Hãy tạo khung giờ rảnh để mở bài dạy.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickAddModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                  className="rounded-xl font-bold text-xs border-primary-300 text-primary-700 hover:bg-primary-50 shadow-2xs mt-1 px-4 py-2"
                >
                  Thêm khung giờ rảnh
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Submit CTA - Dùng Button Shared Component */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            isLoading={isLoading}
            disabled={isLoading || (sortedActiveSchedules.length > 0 && selectedSlotIds.length === 0)}
          >
            <span>{isLoading ? 'Đang xuất bản bài dạy...' : 'Xuất Bản Bài Dạy Mới'}</span>
          </Button>
          {sortedActiveSchedules.length > 0 && selectedSlotIds.length === 0 && (
            <p className="text-center text-xs text-red-500 font-semibold mt-2">
              Vui lòng chọn ít nhất một khung giờ rảnh để học viên có thể đặt lịch.
            </p>
          )}
        </div>
      </form>

      {/* Quick Add Schedule Modal (Placed outside form to avoid DOM nesting) */}
      <QuickAddScheduleModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        existingSchedules={recurringSchedules}
        onCreateSchedule={createRecurring}
        onSuccessCreated={async () => {
          await refetchRecurring();
        }}
      />
    </>
  );
};
