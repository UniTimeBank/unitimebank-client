import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, X, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { AddSkillModal } from '@/features/user';
import type { SkillCategoryEnum } from '@/features/user/types';

export interface SkillOption {
  id?: string;
  skillName: string;
  category?: string;
}

interface SkillMultiSelectComboboxProps {
  selectedSkills: string[];
  availableSkills: SkillOption[];
  onToggleSkill: (skillName: string) => void;
  onRemoveSkill: (skillName: string) => void;
  onAddNewSkillToProfile: (skillName: string, category: SkillCategoryEnum, isStrong: boolean) => Promise<void>;
  label?: string;
  placeholder?: string;
}

// Helper lấy key duy nhất cho từng kỹ năng (ưu tiên id từ DB)
const getSkillKey = (item: SkillOption): string => {
  return item.id ? item.id : `${item.skillName.trim().toLowerCase()}`;
};

export const SkillMultiSelectCombobox: React.FC<SkillMultiSelectComboboxProps> = ({
  selectedSkills,
  availableSkills,
  onToggleSkill,
  onRemoveSkill,
  onAddNewSkillToProfile,
  label = 'KỸ NĂNG TRUYỀN ĐẠT CỦA BÀI DẠY *',
  placeholder = 'Chọn kỹ năng từ hồ sơ của bạn...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quản lý danh sách các Key duy nhất được chọn
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const isInitializedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo ban đầu chỉ 1 lần duy nhất khi availableSkills tải xong
  useEffect(() => {
    if (!isInitializedRef.current && availableSkills.length > 0 && selectedSkills.length > 0) {
      const initialKeys: string[] = [];
      selectedSkills.forEach((name) => {
        const match = availableSkills.find(
          (s) => s.skillName.toLowerCase() === name.toLowerCase() && !initialKeys.includes(getSkillKey(s))
        );
        if (match) {
          initialKeys.push(getSkillKey(match));
        }
      });
      setSelectedKeys(initialKeys);
      isInitializedRef.current = true;
    }
  }, [availableSkills, selectedSkills]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredSkills = availableSkills.filter((s) =>
    s.skillName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleToggleItem = (item: SkillOption) => {
    const key = getSkillKey(item);
    const isCurrentlySelected = selectedKeys.includes(key);

    if (isCurrentlySelected) {
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
      onRemoveSkill(item.skillName);
    } else {
      setSelectedKeys((prev) => [...prev, key]);
      onToggleSkill(item.skillName);
    }
  };

  const handleRemoveByKey = (key: string, skillName: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    onRemoveSkill(skillName);
  };

  const handleModalAddSuccess = async (name: string, cat: SkillCategoryEnum, isStrong: boolean) => {
    await onAddNewSkillToProfile(name, cat, isStrong);
    if (!selectedSkills.includes(name)) {
      onToggleSkill(name);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredSkills.length === 1) {
        handleToggleItem(filteredSkills[0]);
        setSearchQuery('');
      }
    }
  };

  // Danh sách các item thực tế đang được chọn dựa trên selectedKeys
  const selectedItemsList = availableSkills.filter((s) => selectedKeys.includes(getSkillKey(s)));

  return (
    <div className="relative w-full space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-gray-400 font-medium">
          Đã chọn {selectedKeys.length} kỹ năng
        </span>
      </div>

      {/* Main Combobox Trigger Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] px-3.5 py-2 rounded-xl border text-sm flex items-center justify-between gap-2 bg-white transition-all duration-150 cursor-pointer ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-100 shadow-xs'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedItemsList.length > 0 ? (
            selectedItemsList.map((item) => {
              const key = getSkillKey(item);

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#005F4F] text-white text-xs font-bold rounded-lg shadow-2xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{item.skillName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveByKey(key, item.skillName)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5"
                    title={`Gỡ bỏ ${item.skillName}`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 text-xs font-medium">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box inside dropdown */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kỹ năng từ hồ sơ..."
              className="w-full pl-8.5 pr-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary-500 font-medium"
            />
          </div>

          {/* Skills List */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((item) => {
                const key = getSkillKey(item);
                const isSelected = selectedKeys.includes(key);

                return (
                  <div
                    key={key}
                    onClick={() => handleToggleItem(item)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 border border-teal-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#005F4F] border-[#005F4F] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{item.skillName}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-gray-400 font-medium">
                Không tìm thấy kỹ năng phù hợp. Bấm "+ Thêm kỹ năng mới" bên dưới để thêm vào hồ sơ.
              </div>
            )}
          </div>

          {/* Bottom Action to Open Full Add Skill Modal */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setIsAddModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-bold rounded-xl py-1.5 px-3 h-auto text-primary-700 hover:bg-primary-50"
            >
              Thêm kỹ năng mới
            </Button>
          </div>
        </div>
      )}

      {/* Add Skill Modal from User Feature */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Kỹ Năng Mới Vào Hồ Sơ"
        onAddSkill={handleModalAddSuccess}
      />
    </div>
  );
};
