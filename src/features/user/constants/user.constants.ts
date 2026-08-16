import type { SkillCategoryEnum } from '../types/user-skill.type.ts';

export const SKILL_CATEGORIES: { label: string; value: SkillCategoryEnum }[] = [
  { label: 'Lập trình', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế', value: 'DESIGN' },
  { label: 'Học thuật', value: 'ACADEMIC' },
  { label: 'Kinh doanh', value: 'BUSINESS' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc', value: 'MUSIC' },
  { label: 'Thể thao', value: 'SPORTS' },
  { label: 'Khác', value: 'OTHER' },
];

export const TRUST_SCORE_TIERS = {
  EXCELLENT: { min: 90, label: 'XUẤT SẮC', color: 'emerald' },
  GOOD: { min: 70, label: 'TỐT', color: 'blue' },
  AVERAGE: { min: 50, label: 'TRUNG BÌNH', color: 'amber' },
  WARNING: { min: 20, label: 'CẢNH BÁO', color: 'orange' },
  LOCKED: { min: 0, label: 'BỊ KHÓA', color: 'red' },
};

export const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
