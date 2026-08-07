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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Kỹ năng & Bài dạy của tôi</h2>
          <p className="text-xs text-gray-500">Các kỹ năng bạn đã đăng ký để giảng dạy cho bạn học khác</p>
        </div>

        <button
          onClick={onOpenAddSkillModal}
          className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kỹ năng mới</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {skillsList.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-semibold rounded-xl transition-colors group"
          >
            <span>{skill}</span>
            <button
              onClick={() => onDeleteSkill(skill)}
              className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-full hover:bg-gray-300/50 transition-colors cursor-pointer"
              title={`Xóa kỹ năng ${skill}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
