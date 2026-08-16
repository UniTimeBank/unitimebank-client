import React, { useState, useMemo } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { AddSkillModal } from '@/features/user';
import type { SkillCategoryEnum } from '@/features/user/types';

export interface SkillOption {
  id?: string;
  skillName: string;
  category?: string;
}

interface SkillMultiSelectComboboxProps {
  category: string;
  selectedSkills: string[];
  availableSkills: SkillOption[];
  onToggleSkill: (skillName: string) => void;
  onRemoveSkill: (skillName: string) => void;
  onAddNewSkillToProfile: (skillName: string, category: SkillCategoryEnum, isStrong: boolean) => Promise<void>;
  label?: string;
  placeholder?: string;
  error?: string;
}

export const SkillMultiSelectCombobox: React.FC<SkillMultiSelectComboboxProps> = ({
  category,
  selectedSkills,
  availableSkills,
  onToggleSkill,
  onRemoveSkill,
  onAddNewSkillToProfile,
  label = 'KỸ NĂNG & BÀI DẠY CỦA TÔI *',
  error,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Lọc danh sách kỹ năng trong hồ sơ thuộc đúng danh mục đang chọn
  const profileSkillsForCategory = useMemo(() => {
    const normCat = category?.toUpperCase();
    return availableSkills.filter((s) => {
      if (!s.category) return true;
      return s.category?.toUpperCase() === normCat;
    });
  }, [availableSkills, category]);

  const handleToggle = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (selectedSkills.includes(trimmed)) {
      onRemoveSkill(trimmed);
    } else {
      onToggleSkill(trimmed);
    }
  };

  const handleModalAddSuccess = async (name: string, cat: SkillCategoryEnum, isStrong: boolean) => {
    await onAddNewSkillToProfile(name, cat, isStrong);
    if (!selectedSkills.includes(name)) {
      onToggleSkill(name);
    }
  };

  return (
    <div className="w-full">
      {/* 1. Header Label (Đồng bộ 100% với Select và Input UI, căn phải số lượng) */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          {typeof label === 'string' && label.includes('*') ? (
            <>
              {label.replace(/\s*\*/, '')} <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </label>
        {selectedSkills.length > 0 && (
          <span className="text-[11px] font-normal text-gray-400">
            Đã chọn {selectedSkills.length} kỹ năng
          </span>
        )}
      </div>

      {/* 2. Chips Container: Nền trắng clean */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 min-h-[48px] transition-all duration-200">
        {/* Render các kỹ năng thuộc danh mục này trong hồ sơ */}
        {profileSkillsForCategory.map((item) => {
          const isSelected = selectedSkills.includes(item.skillName);

          return isSelected ? (
            // Chip Đã Chọn: có nút X
            <span
              key={item.id || item.skillName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
            >
              <span className="leading-none">{item.skillName}</span>
              <button
                type="button"
                onClick={() => onRemoveSkill(item.skillName)}
                className="inline-flex items-center justify-center w-4 h-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0 -mr-0.5"
                title={`Bỏ chọn ${item.skillName}`}
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </span>
          ) : (
            // Chip Chưa Chọn: bấm vào để chọn
            <button
              key={item.id || item.skillName}
              type="button"
              onClick={() => handleToggle(item.skillName)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-dashed border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 text-xs font-medium transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3 shrink-0" />
              <span className="leading-none">{item.skillName}</span>
            </button>
          );
        })}

        {/* Nút "+ Thêm" viền nét đứt bo tròn */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-dashed border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs font-bold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Thêm</span>
        </button>

        {profileSkillsForCategory.length === 0 && selectedSkills.length === 0 && (
          <span className="text-xs text-gray-400 font-normal pl-1">
            Chưa có kỹ năng nào thuộc danh mục này trong hồ sơ.
          </span>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Add Skill Modal from User Feature */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={category as SkillCategoryEnum}
        hideCategorySelect={true}
        title="Thêm Kỹ Năng Mới Vào Hồ Sơ"
        onAddSkill={handleModalAddSuccess}
      />
    </div>
  );
};
