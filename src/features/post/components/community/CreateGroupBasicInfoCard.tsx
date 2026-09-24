import React from 'react';
import { Input, Select } from '@/shared/components/ui';

interface CreateGroupBasicInfoCardProps {
  name: string;
  onNameChange: (name: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categoryOptions: { value: string; label: string }[];
  description: string;
  onDescriptionChange: (description: string) => void;
  errors?: Record<string, string>;
}

export const CreateGroupBasicInfoCard: React.FC<CreateGroupBasicInfoCardProps> = ({
  name,
  onNameChange,
  category,
  onCategoryChange,
  categoryOptions,
  description,
  onDescriptionChange,
  errors = {},
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">1. Thông tin cơ bản</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Thiết lập tên gọi và chủ đề trọng tâm cho nhóm của bạn
        </p>
      </div>

      {/* Tên nhóm */}
      <div id="field-group-name">
        <Input
          label="Tên nhóm học tập *"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="VD: Hội Ôn Thi Giải Tích 1 - ĐHBK, Lập Trình Frontend ReactJS..."
          error={errors.name}
          maxLength={80}
        />
      </div>

      {/* Chuyên ngành / Danh mục */}
      <div id="field-group-category">
        <Select
          label="Lĩnh vực / Chuyên ngành *"
          value={category}
          onChange={onCategoryChange}
          options={categoryOptions}
          placeholder="Chọn lĩnh vực hoặc chuyên ngành..."
          error={errors.category}
        />
      </div>

      {/* Mô tả nhóm */}
      <div id="field-group-description" className="space-y-1">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Mô tả mục tiêu nhóm <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400 font-medium">
            {description.length}/1000
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Nhóm dành cho sinh viên muốn cùng nhau giải đề, chia sẻ tài liệu và thảo luận các bài toán khó..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 outline-none transition-all font-medium resize-none ${
            errors.description
              ? 'border-red-500 ring-2 ring-red-100 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>
        )}
      </div>
    </div>
  );
};
