import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, DateInput } from '@/shared/components/ui';
import { useMentorSchedule, QuickAddScheduleModal, ALL_DAYS, formatLocalDate } from '@/features/schedule';
import { useUserSkills } from '@/features/user';
import { useCreateMentorPostMutation } from '@/core/api/post/postApi';
import { SessionType, PostScheduleType, SkillCategoryName } from '../../types';
import { SkillMultiSelectCombobox } from './SkillMultiSelectCombobox';
import { RichTextEditor } from './RichTextEditor';
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

const DAY_MAP_TO_BACKEND: Record<string, string> = {
  MON: 'MONDAY',
  TUE: 'TUESDAY',
  WED: 'WEDNESDAY',
  THU: 'THURSDAY',
  FRI: 'FRIDAY',
  SAT: 'SATURDAY',
  SUN: 'SUNDAY',
};

export interface MentorOfferFormState {
  title: string;
  coverImage: string;
  skillsText: string;
  shortDescription: string;
  description: string;
  scheduleType: 'ALWAYS_OPEN' | 'LIMITED_TIME';
  startDate: string;
  endDate: string;
  selectedSlotCount: number;
}

interface MentorOfferFormProps {
  onPreviewChange?: (state: MentorOfferFormState) => void;
}

export const MentorOfferForm: React.FC<MentorOfferFormProps> = ({ onPreviewChange }) => {
  const navigate = useNavigate();
  const [createMentorPost, { isLoading }] = useCreateMentorPostMutation();

  const {
    recurringSchedules,
    isRecurringLoading,
    createRecurring,
    deleteRecurring,
    refetchRecurring,
    exceptions,
  } = useMentorSchedule();

  const { skills: profileSkills, addSkill } = useUserSkills();

  // Internal Form State
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600'
  );
  const [skillsText, setSkillsText] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'ALWAYS_OPEN' | 'LIMITED_TIME'>('ALWAYS_OPEN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  // Sync preview data to parent sidebar
  useEffect(() => {
    onPreviewChange?.({
      title,
      coverImage,
      skillsText,
      shortDescription,
      description,
      scheduleType,
      startDate,
      endDate,
      selectedSlotCount: selectedSlotIds.length,
    });
  }, [
    title,
    coverImage,
    skillsText,
    shortDescription,
    description,
    scheduleType,
    startDate,
    endDate,
    selectedSlotIds,
    onPreviewChange,
  ]);

  // Field change handlers that clear errors dynamically
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (val.trim()) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleSkillsTextChange = (val: string) => {
    setSkillsText(val);
    const skillsList = val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillsList.length > 0) {
      setErrors((prev) => ({ ...prev, skills: '' }));
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val) {
      setErrors((prev) => ({ ...prev, dates: '' }));
      if (endDate && endDate < val) {
        setEndDate(val);
      }
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (val) {
      setErrors((prev) => ({ ...prev, dates: '' }));
    }
  };

  const toggleSlotId = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      const next = prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId];
      if (next.length > 0) {
        setErrors((errs) => ({ ...errs, slots: '' }));
      }
      return next;
    });
  };

  const handleSelectAllSlots = (allIds: string[]) => {
    setSelectedSlotIds(allIds);
    if (allIds.length > 0) {
      setErrors((errs) => ({ ...errs, slots: '' }));
    }
  };

  // Selected skills memo
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
    let updated: string[];
    if (exists) {
      updated = selectedSkills.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
    } else {
      updated = [...selectedSkills, trimmed];
    }
    handleSkillsTextChange(updated.join(', '));
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    handleSkillsTextChange(updated.join(', '));
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

  // Sort active schedules
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

  // Group schedules by day
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

  // Tính toán số buổi học thực tế khả dụng cho học viên đăng ký khi ở chế độ Có Thời Hạn
  const limitedTimeAvailabilityStats = useMemo(() => {
    if (scheduleType !== 'LIMITED_TIME' || !startDate || !endDate || selectedSlotIds.length === 0) {
      return { isLimitedTime: false, totalOccurrences: 0, availableOccurrences: 0, blockedOccurrences: 0 };
    }

    const selectedSchedules = recurringSchedules.filter((s) => selectedSlotIds.includes(s.id));
    if (selectedSchedules.length === 0) {
      return { isLimitedTime: true, totalOccurrences: 0, availableOccurrences: 0, blockedOccurrences: 0 };
    }

    const [startY, startM, startD] = startDate.split('-').map(Number);
    const [endY, endM, endD] = endDate.split('-').map(Number);

    const start = new Date(startY, startM - 1, startD);
    const end = new Date(endY, endM - 1, endD);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { isLimitedTime: true, totalOccurrences: 0, availableOccurrences: 0, blockedOccurrences: 0 };
    }

    const DAY_NUM_TO_CODE: Record<number, string> = {
      0: 'SUN',
      1: 'MON',
      2: 'TUE',
      3: 'WED',
      4: 'THU',
      5: 'FRI',
      6: 'SAT',
    };

    let totalOccurrences = 0;
    let availableOccurrences = 0;
    let blockedOccurrences = 0;

    const blockedExceptions = (exceptions || []).filter((e) => e.type === 'BLOCKED');

    const curr = new Date(start);
    while (curr <= end) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayCode = DAY_NUM_TO_CODE[curr.getDay()];

      const slotsForDay = selectedSchedules.filter((s) => s.dayOfWeek === dayCode);
      const dayBlockedExceptions = blockedExceptions.filter((e) => e.exceptionDate === dateStr);

      for (const slot of slotsForDay) {
        totalOccurrences++;
        const isBlocked = dayBlockedExceptions.some((b) => {
          return (
            (b.startTime <= slot.startTime && b.endTime >= slot.endTime) ||
            (b.startTime === slot.startTime && b.endTime === slot.endTime) ||
            (b.startTime < slot.endTime && b.endTime > slot.startTime)
          );
        });

        if (isBlocked) {
          blockedOccurrences++;
        } else {
          availableOccurrences++;
        }
      }

      curr.setDate(curr.getDate() + 1);
    }

    return {
      isLimitedTime: true,
      totalOccurrences,
      availableOccurrences,
      blockedOccurrences,
    };
  }, [scheduleType, startDate, endDate, selectedSlotIds, recurringSchedules, exceptions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage(url);
    }
  };

  const isAllSelected =
    sortedActiveSchedules.length > 0 &&
    sortedActiveSchedules.every((s) => selectedSlotIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      handleSelectAllSlots([]);
    } else {
      handleSelectAllSlots(sortedActiveSchedules.map((s) => s.id));
    }
  };

  const handleDeleteSlot = async (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    try {
      if (selectedSlotIds.includes(slotId)) {
        toggleSlotId(slotId);
      }
      await deleteRecurring(slotId);
      await refetchRecurring();
    } catch (err) {
      console.error('Failed to delete schedule slot:', err);
    }
  };

  // Form Submission & Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài dạy.';
    }

    const skillsList = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsList.length === 0) {
      newErrors.skills = 'Vui lòng chọn ít nhất 1 kỹ năng truyền đạt.';
    }

    if (scheduleType === 'LIMITED_TIME') {
      if (!startDate || !endDate) {
        newErrors.dates = 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc đợt học.';
      } else if (startDate > endDate) {
        newErrors.dates = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.';
      } else if (selectedSlotIds.length > 0) {
        if (limitedTimeAvailabilityStats.totalOccurrences === 0) {
          newErrors.dates = 'Khoảng ngày bạn chọn không chứa bất kỳ thứ nào trong các khung giờ đã chọn.';
        } else if (limitedTimeAvailabilityStats.availableOccurrences === 0) {
          newErrors.dates = `Toàn bộ ${limitedTimeAvailabilityStats.totalOccurrences} khung giờ trong khoảng ngày này đều trùng với lịch bận trong Hồ sơ. Học viên không thể đặt lịch.`;
        }
      }
    }

    if (selectedSlotIds.length === 0) {
      newErrors.slots = 'Vui lòng chọn ít nhất 1 khung giờ rảnh từ danh sách bên dưới.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = ['title', 'skills', 'dates', 'slots'].find((key) => newErrors[key]);
      if (firstErrorKey) {
        const el = document.getElementById(`field-mentor-${firstErrorKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = el.querySelector('input') || el;
          (inputEl as HTMLElement).focus?.();
        }
      }
      return;
    }

    let tags = skillsList.map((skillName) => {
      const matched = profileSkills?.find(
        (ps) => ps.skillName.toLowerCase() === skillName.toLowerCase()
      );
      const cat = (matched?.category as SkillCategoryName) || SkillCategoryName.PROGRAMMING;
      return {
        skillName,
        category: cat,
      };
    });

    if (tags.length === 0) {
      tags = [
        {
          skillName: title.trim().slice(0, 30),
          category: SkillCategoryName.PROGRAMMING,
        },
      ];
    }

    const selectedSchedules = recurringSchedules.filter((s) => selectedSlotIds.includes(s.id));
    const availableSlots = selectedSchedules.map((s) => ({
      dayOfWeek: DAY_MAP_TO_BACKEND[s.dayOfWeek] || s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    try {
      await createMentorPost({
        title,
        shortDescription,
        description,
        sessionType: SessionType.BOTH,
        scheduleType: scheduleType as PostScheduleType,
        startDate: scheduleType === 'LIMITED_TIME' ? startDate : undefined,
        endDate: scheduleType === 'LIMITED_TIME' ? endDate : undefined,
        tags,
        availableSlots,
      }).unwrap();

      setSuccessMessage(' Đã đăng bài dạy thành công! Bài viết của bạn đã hiển thị trên trang Khám phá.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        navigate('/explore');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create mentor post:', err);
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join('. ')
        : err?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo bài đăng.';
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        {/* Success Toast Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Toast Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black text-gray-900">
            Thông Tin Bài Dạy Mới
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mô tả bài giảng và chọn khung giờ rảnh từ hồ sơ để học viên có thể chủ động đặt lịch 1:1 với bạn.
          </p>
        </div>

        {/* Class Title - Dùng Input Shared Component */}
        <div id="field-mentor-title">
          <Input
            label="TIÊU ĐỀ BÀI DẠY *"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ví dụ: Hướng dẫn Lập trình Python & Phân tích Dữ liệu Thực chiến"
            error={errors.title}
          />
        </div>

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
                    onClick={() => setCoverImage(imgUrl)}
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
        <div id="field-mentor-skills">
          <SkillMultiSelectCombobox
            label="KỸ NĂNG TRUYỀN ĐẠT CỦA BÀI DẠY *"
            placeholder="Nhấp để chọn kỹ năng từ hồ sơ hoặc thêm mới..."
            selectedSkills={selectedSkills}
            availableSkills={profileSkills}
            onToggleSkill={handleToggleSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddNewSkillToProfile={handleAddNewSkillToProfile}
          />
          {errors.skills && (
            <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{errors.skills}</span>
            </p>
          )}
        </div>

        {/* Short Summary Description for Card Feed */}
        <Input
          label="MÔ TẢ TÓM TẮT"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Tóm tắt ngắn 1-2 câu điểm nổi bật của bài dạy (tối đa 150 ký tự)..."
        />

        {/* Description Rich Text Editor */}
        <RichTextEditor
          label="MÔ TẢ LỘ TRÌNH & NỘI DUNG BUỔI HỌC CHI TIẾT"
          value={description}
          onChange={setDescription}
          placeholder="Mô tả cụ thể những kiến thức học viên sẽ đạt được sau buổi học..."
          minHeight="150px"
        />

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
              onClick={() => setScheduleType('ALWAYS_OPEN')}
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
              onClick={() => setScheduleType('LIMITED_TIME')}
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
            <div id="field-mentor-dates" className="p-4 bg-primary-50/70 border border-primary-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-primary-900 font-extrabold text-xs">
                <CalendarRange className="w-4 h-4 text-primary-600" />
                <span>Thiết lập khoảng thời gian mở lớp:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DateInput
                  label="NGÀY BẮT ĐẦU *"
                  value={startDate}
                  min={formatLocalDate(new Date())}
                  onChange={(dateStr) => {
                    handleStartDateChange(dateStr);
                    if (dateStr && (!endDate || endDate < dateStr)) {
                      handleEndDateChange(dateStr);
                    }
                  }}
                />
                <DateInput
                  label="NGÀY KẾT THÚC *"
                  value={endDate}
                  min={startDate || formatLocalDate(new Date())}
                  onChange={handleEndDateChange}
                />
              </div>

              {errors.dates && (
                <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{errors.dates}</span>
                </p>
              )}

              {/* Thống kê tính khả dụng cho chế độ Có Thời Hạn */}
              {startDate && endDate && selectedSlotIds.length > 0 && (
                <div className="pt-1">
                  {limitedTimeAvailabilityStats.totalOccurrences === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Chưa có buổi học nào trong khoảng ngày này</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Các khung giờ bạn tích chọn ở dưới không rơi vào các ngày từ {startDate} đến {endDate}. Vui lòng mở rộng khoảng ngày hoặc chọn thêm khung giờ.
                        </p>
                      </div>
                    </div>
                  ) : limitedTimeAvailabilityStats.availableOccurrences === 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Không có khung giờ khả dụng cho học viên</p>
                        <p className="text-[11px] text-red-600 mt-0.5">
                          Toàn bộ {limitedTimeAvailabilityStats.totalOccurrences} khung giờ trong đợt này đều trùng với Lịch bận trong Hồ sơ cá nhân của bạn. Học viên sẽ không thể đặt lịch hẹn.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Sẵn sàng: <strong>{limitedTimeAvailabilityStats.availableOccurrences} buổi học khả dụng</strong> cho học viên đăng ký
                        {limitedTimeAvailabilityStats.blockedOccurrences > 0 && ` (${limitedTimeAvailabilityStats.blockedOccurrences} buổi bị ẩn do trùng lịch bận Profile)`}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                Khóa học sẽ tự động hiển thị nhận đăng ký trong khoảng ngày này và tự động đóng sau khi kết thúc.
              </p>
            </div>
          )}

          {/* Availability Schedule Slots Picker */}
          <div id="field-mentor-slots" className="space-y-3 pt-1">
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
                              onClick={() => toggleSlotId(slot.id)}
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

            {errors.slots && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{errors.slots}</span>
              </p>
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
            <span>{isLoading ? 'Đang đăng bài mới...' : 'Đăng bài mới'}</span>
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
