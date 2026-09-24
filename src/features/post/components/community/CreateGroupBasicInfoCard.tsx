import React from 'react';
import { Select } from '@/shared/components/ui';

interface CreateGroupBasicInfoCardProps {
  name: string;
  onNameChange: (name: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categoryOptions: { value: string; label: string }[];
  description: string;
  onDescriptionChange: (description: string) => void;
}

export const CreateGroupBasicInfoCard: React.FC<CreateGroupBasicInfoCardProps> = ({
  name,
  onNameChange,
  category,
  onCategoryChange,
  categoryOptions,
  description,
  onDescriptionChange,
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
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          Tên nhóm học tập <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="VD: Hội Ôn Thi Giải Tích 1 - ĐHBK, Lập Trình Frontend ReactJS..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium"
          required
        />
      </div>

      {/* Chuyên ngành / Danh mục */}
      <Select
        label="Lĩnh vực / Chuyên ngành *"
        value={category}
        onChange={onCategoryChange}
        options={categoryOptions}
        placeholder="Chọn lĩnh vực hoặc chuyên ngành..."
      />

      {/* Mô tả nhóm */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          Mô tả mục tiêu nhóm <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="Nhóm dành cho sinh viên muốn cùng nhau giải đề, chia sẻ tài liệu và thảo luận các bài toán khó..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium resize-none"
          required
        />
      </div>
    </div>
  );
};
