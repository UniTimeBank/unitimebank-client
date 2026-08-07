import React, { useState } from 'react';
import type { SkillCategoryEnum } from '../types';
import { SKILL_CATEGORIES } from '../constants';
import { Modal, Input, Select, Button } from '@/shared/components/ui';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onAddSkill: (skillName: string, category: SkillCategoryEnum, isStrong: boolean) => Promise<void>;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  title = 'Thêm kỹ năng mới',
  onAddSkill,
}) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategoryEnum>('PROGRAMMING');
  const [isStrong, setIsStrong] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddSkill(skillName.trim(), category, isStrong);
      setSkillName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill Name */}
        <Input
          label="Tên kỹ năng"
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="VD: Python, Thuyết trình đám đông, Figma, Tiếng Nhật"
          required
        />

        {/* Skill Category - Modern Custom Select Component */}
        <Select
          label="Danh mục kỹ năng"
          options={SKILL_CATEGORIES}
          value={category}
          onChange={(val) => setCategory(val as SkillCategoryEnum)}
        />

        {/* Is Strong Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isStrong"
            checked={isStrong}
            onChange={(e) => setIsStrong(e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded-sm border-gray-300 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="isStrong" className="text-xs font-semibold text-gray-700 cursor-pointer">
            Đặt làm Kỹ năng cốt lõi / Thế mạnh nhất của tôi
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Thêm kỹ năng
          </Button>
        </div>
      </form>
    </Modal>
  );
};
