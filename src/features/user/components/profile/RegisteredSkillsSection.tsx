import React from 'react';
import { Plus, X } from 'lucide-react';

interface RegisteredSkillsSectionProps {
  skillsList: string[];
  onOpenAddSkillModal: () => void;
  onDeleteSkill: (skillName: string) => void;
}

export const RegisteredSkillsSection: React.FC<RegisteredSkillsSectionProps> = ({
  skillsList,
  onOpenAddSkillModal,
  onDeleteSkill,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary-100/80 shadow-xs space-y-4">
      <div className="pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-gray-900">Kỹ năng & Bài dạy của tôi</h2>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-50 text-primary-700 rounded-full">
            {skillsList.length} kỹ năng
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Các kỹ năng bạn đã đăng ký để sẵn sàng nhận học viên và giảng dạy
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {skillsList.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100/90 hover:bg-primary-50 hover:text-primary-800 text-gray-800 text-xs font-semibold rounded-xl transition-colors border border-transparent hover:border-primary-200 group"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => onDeleteSkill(skill)}
              className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
              title={`Xóa kỹ năng ${skill}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Nút bấm nhanh thêm kỹ năng dạng chip nét đứt */}
        <button
          type="button"
          onClick={onOpenAddSkillModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50/80 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Thêm</span>
        </button>
      </div>
    </div>
  );
};
