import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import type { SkillCategoryEnum } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { Modal, Select, Button } from '@/shared/components/ui';
import { useUserSkills } from '../hooks';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  defaultCategory?: SkillCategoryEnum;
  hideCategorySelect?: boolean;
  onAddSkill: (skillName: string, category: SkillCategoryEnum, isStrong: boolean) => Promise<void>;
}

// Preset gợi ý kỹ năng theo từng danh mục
const PRESET_SKILLS_BY_CATEGORY: Record<SkillCategoryEnum, string[]> = {
  PROGRAMMING: [
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Spring Boot',
    'C++',
    'SQL',
    'Flutter',
    'HTML/CSS',
    'Cấu trúc dữ liệu & Giải thuật',
  ],
  LANGUAGE: [
    'Tiếng Anh Giao Tiếp',
    'IELTS Speaking',
    'TOEIC 4 Kỹ năng',
    'Tiếng Nhật N3',
    'Tiếng Trung HSK',
    'Tiếng Hàn Topik',
    'Tiếng Pháp',
    'Tiếng Đức',
  ],
  DESIGN: [
    'Figma UI/UX',
    'Photoshop',
    'Illustrator',
    'Premiere Pro',
    'Canva Pro',
    'Thiết kế 3D Blender',
    'After Effects',
    'Typography',
  ],
  ACADEMIC: [
    'Giải tích 1',
    'Giải tích 2',
    'Đại số tuyến tính',
    'Vật lý đại cương',
    'Xác suất thống kê',
    'Hóa học đại cương',
    'Triết học Mác - Lênin',
    'Nghiên cứu khoa học',
  ],
  BUSINESS: [
    'Kế toán Quản trị',
    'Phân tích Tài chính',
    'Digital Marketing',
    'Quản trị Dự án',
    'Đầu tư Chứng khoán',
    'Kinh tế Vi mô',
    'Excel Nâng cao & Dashboard',
  ],
  SOFT_SKILLS: [
    'Thuyết trình trước đám đông',
    'Quản lý Thời gian',
    'Giao tiếp & Đàm phán',
    'Tư duy Phản biện',
    'Làm việc Nhóm',
    'Kỹ năng Viết CV & Phỏng vấn',
  ],
  MUSIC: [
    'Guitar đệm hát',
    'Piano cơ bản',
    'Thanh nhạc',
    'Sản xuất âm nhạc FL Studio',
    'Ukulele',
    'Thu âm & Mix Vocal',
  ],
  SPORTS: [
    'Cầu lông',
    'Bóng rổ',
    'Yoga',
    'Gym & Fitness',
    'Chạy bộ đường dài',
    'Cờ vua',
    'Bơi lội',
  ],
  OTHER: [
    'Nấu ăn & Làm bánh',
    'Nhiếp ảnh cơ bản',
    'Quản trị cá nhân',
    'Viết lách & Sáng tạo nội dung',
  ],
};

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  title = 'Thêm Kỹ Năng Mới Vào Hồ Sơ',
  defaultCategory = 'PROGRAMMING',
  hideCategorySelect = false,
  onAddSkill,
}) => {
  const { skills: userExistingSkills } = useUserSkills();

  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategoryEnum>(defaultCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync default category when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setSkillName('');
      setIsDropdownOpen(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultCategory]);

  // Click outside to close dropdown suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách các kỹ năng user ĐÃ CÓ trong hồ sơ
  const existingNamesLower = useMemo(() => {
    return (userExistingSkills || []).map((s) => s.skillName.trim().toLowerCase());
  }, [userExistingSkills]);

  // Lọc các kỹ năng gợi ý thuộc category MÀ CHƯA CÓ TRONG HỒ SƠ
  const unaddedCategoryPresets = useMemo(() => {
    const presets = PRESET_SKILLS_BY_CATEGORY[category] || [];
    return presets.filter((name) => !existingNamesLower.includes(name.toLowerCase()));
  }, [category, existingNamesLower]);

  // Lọc theo từ khóa đang gõ trong input
  const filteredSuggestions = useMemo(() => {
    const query = skillName.trim().toLowerCase();
    if (!query) return unaddedCategoryPresets;
    return unaddedCategoryPresets.filter((name) => name.toLowerCase().includes(query));
  }, [unaddedCategoryPresets, skillName]);

  const handleSelectSuggestion = (name: string) => {
    setSkillName(name);
    setIsDropdownOpen(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = skillName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onAddSkill(trimmed, category, false);
      setSkillName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      // Nếu dropdown đang mở và có gợi ý khớp chính xác hoặc đang có gợi ý duy nhất
      if (isDropdownOpen) {
        if (filteredSuggestions.length > 0) {
          const exactOrFirst =
            filteredSuggestions.find((s) => s.toLowerCase() === skillName.trim().toLowerCase()) ||
            filteredSuggestions[0];
          setSkillName(exactOrFirst);
          setIsDropdownOpen(false);
          return;
        }
        setIsDropdownOpen(false);
      }

      handleSave();
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" zIndex={60}>
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* 1. Skill Category Selector (Ẩn đi khi đã có danh mục cố định từ Form Đăng bài) */}
        {!hideCategorySelect && (
          <div>
            <Select
              label="DANH MỤC LĨNH VỰC *"
              options={SKILL_CATEGORIES}
              value={category}
              onChange={(val) => {
                setCategory(val as SkillCategoryEnum);
                setIsDropdownOpen(false);
              }}
            />
          </div>
        )}

        {/* 2. Skill Name Input với Design Đồng Bộ 100% với Select Trigger */}
        <div className="relative" ref={inputContainerRef}>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
            TÊN KỸ NĂNG <span className="text-red-500">*</span>
          </label>

          <div
            onClick={() => {
              inputRef.current?.focus();
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between bg-white transition-all duration-200 cursor-text ${
              isDropdownOpen
                ? 'border-primary-500 ring-2 ring-primary-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={skillName}
              onClick={() => {
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              onChange={(e) => {
                setSkillName(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              placeholder="VD: Python, Figma, Giải tích 1, Tiếng Nhật..."
              className="w-full text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal font-normal bg-transparent focus:outline-hidden pr-2"
            />

            {/* Clear Button or Toggle Dropdown Arrow */}
            <div className="flex items-center gap-1 shrink-0">
              {skillName ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSkillName('');
                    inputRef.current?.focus();
                  }}
                  className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
                title="Gợi ý kỹ năng"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-primary-500' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dropdown Gợi Ý Sổ Xuống Đồng Bộ với Custom Select Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100">
                <span>Gợi ý kỹ năng chưa tạo</span>
                <span>{filteredSuggestions.length} gợi ý</span>
              </div>

              <div className="p-1.5 max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((name) => {
                    const isSelected = skillName.trim().toLowerCase() === name.toLowerCase();

                    return (
                      <div
                        key={name}
                        onClick={() => handleSelectSuggestion(name)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                        }`}
                      >
                        <span>{name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary-500" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-400 font-medium">
                    {skillName.trim()
                      ? `Nhấn Enter để thêm kỹ năng "${skillName.trim()}"`
                      : 'Đã thêm tất cả kỹ năng gợi ý của danh mục này.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-4.5 py-2 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleSave()}
            disabled={!skillName.trim() || isSubmitting}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white text-xs font-bold px-5 py-2 shadow-xs transition-all cursor-pointer"
          >
            Thêm kỹ năng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
