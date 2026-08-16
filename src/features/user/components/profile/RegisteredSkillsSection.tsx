import React, { useMemo } from 'react';
import {
  Plus,
  X,
  Code2,
  Languages,
  Palette,
  GraduationCap,
  Briefcase,
  Users,
  Music,
  Activity,
  Folder,
} from 'lucide-react';
import type { UserSkill } from '../../types';

interface RegisteredSkillsSectionProps {
  skills: UserSkill[];
  onOpenAddSkillModal: () => void;
  onDeleteSkill: (skillId: string) => void;
  isReadOnly?: boolean;
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PROGRAMMING: {
    label: 'Lập trình',
    icon: Code2,
  },
  LANGUAGE: {
    label: 'Ngoại ngữ',
    icon: Languages,
  },
  DESIGN: {
    label: 'Thiết kế',
    icon: Palette,
  },
  ACADEMIC: {
    label: 'Học thuật',
    icon: GraduationCap,
  },
  BUSINESS: {
    label: 'Kinh doanh',
    icon: Briefcase,
  },
  SOFT_SKILLS: {
    label: 'Kỹ năng mềm',
    icon: Users,
  },
  MUSIC: {
    label: 'Âm nhạc',
    icon: Music,
  },
  SPORTS: {
    label: 'Thể thao',
    icon: Activity,
  },
  OTHER: {
    label: 'Khác',
    icon: Folder,
  },
};

export const RegisteredSkillsSection: React.FC<RegisteredSkillsSectionProps> = ({
  skills,
  onOpenAddSkillModal,
  onDeleteSkill,
  isReadOnly = false,
}) => {
  // Phân nhóm kỹ năng theo danh mục
  const groupedSkills = useMemo(() => {
    const map: Record<string, UserSkill[]> = {};

    skills.forEach((skill) => {
      const cat = (skill.category || 'PROGRAMMING').toUpperCase();
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push(skill);
    });

    return Object.entries(map).map(([catKey, items]) => {
      const meta = CATEGORY_META[catKey] || {
        label: catKey,
        icon: Folder,
      };

      return {
        categoryKey: catKey,
        label: meta.label,
        Icon: meta.icon,
        items,
      };
    });
  }, [skills]);

  return (
    <div className="space-y-4">
      {/* 1. Header: Tiêu đề + Badge đếm tổng + Nút Thêm */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
            KỸ NĂNG & BÀI DẠY CỦA TÔI
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
            {skills.length} kỹ năng
          </span>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={onOpenAddSkillModal}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Thêm</span>
          </button>
        )}
      </div>

      {/* 2. Danh sách kỹ năng theo Danh Mục (Clean List với Icon Đen Đồng Bộ) */}
      {groupedSkills.length > 0 ? (
        <div className="space-y-3 pt-1">
          {groupedSkills.map(({ categoryKey, label, Icon, items }) => (
            <div
              key={categoryKey}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
            >
              {/* Category Header: Icon Đen + Tên Danh Mục Đen + Badge Số Lượng Clean */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {items.length}
                </span>
              </div>

              {/* Skills Chips Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {items.map((skill) => (
                  <span
                    key={skill.id || skill.skillName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-all group"
                  >
                    <span className="leading-none">{skill.skillName}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => onDeleteSkill(skill.id)}
                        className="inline-flex items-center justify-center w-4 h-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0 -mr-0.5"
                        title={`Xóa ${skill.skillName}`}
                      >
                        <X className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-400 font-medium">
          Bạn chưa có kỹ năng nào. Hãy bấm nút "+ Thêm" để đăng ký kỹ năng thế mạnh của mình.
        </div>
      )}
    </div>
  );
};
